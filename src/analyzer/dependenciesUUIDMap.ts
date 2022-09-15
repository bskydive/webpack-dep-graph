import { depsConfig } from "../../deps.config"
import { log } from "../utils/logger"
import {
	isModuleIncluded,
	isReasonTypeExcluded,
	resolvePathPlus,
} from "../utils/webpack"
import { v4 } from "uuid"
import {
	IStats,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
	TModulesMapByUUID,
	TModuleByUUID,
	TUUIDByRelativePath as TUuidByRelativePath,
	TUuid,
	STATS_EMPTY,
} from "../models/webpackStats.model"
import { fileNameFromPath } from "../utils/files"

/** Concatenating source and dest modules into Map */
export class DependenciesUUIDMap {
	stats: IStats = STATS_EMPTY

	/** flattened list for parsing {'uuid':{...module}} */
	moduleByUUIDMap: TModuleByUUID = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	uuidByRelativePathMap: TUuidByRelativePath = new Map()

	/** resulting map for filtering: {"uuid_source": ["uuid_dest1", "uuid_dest2"]} */
	modulesMapByUUIDInverted: TModulesMapByUUID = new Map()
	/** resulting map: {"uuid_destination": ["uuid_source1", "uuid_source2"]} */
	modulesMapByUUID: TModulesMapByUUID = new Map()

	constructor(modules: IWebpackModuleShort[]) {
		let filteredDestModules: IWebpackModuleShort[]

		filteredDestModules = modules?.filter((m: IWebpackModuleShort) => {
			// filter target/dest nodes
			const result = isModuleIncluded(m.name, depsConfig.filters)
			if (!result) {
				this.stats.excludedDestNodes.add(m.name)
			}

			return result
		})

		this.stats.rawModules = modules.length
		this.stats.rawDestModulesTypes = this.getModuleTypes(modules)

		this.createUUIDNodes(filteredDestModules)
		this.createDependenciesList(filteredDestModules)
		this.filterByMaxDependenciesCount()
		this.stats.depsSizes = this.getDepsSizes()
	}

	moduleByRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: TUuid = this.uuidByRelativePathMap.get(relativePath)
		const module: IWebpackModuleParsed = this.moduleByUUIDMap.get(uuid)

		if (!uuid || !module?.uuid) return null

		return module
	}

	addDependenciesById(consumerUuid: TUuid, dependencyUuid: TUuid) {
		// direct consumer<--dependency list
		if (!this.modulesMapByUUID.has(consumerUuid)) {
			this.modulesMapByUUID.set(consumerUuid, new Set())
		}

		this.modulesMapByUUID.get(consumerUuid)?.add(dependencyUuid)

		// inverted dependency-->consumer list for filtering
		if (!this.modulesMapByUUIDInverted.has(dependencyUuid)) {
			this.modulesMapByUUIDInverted.set(dependencyUuid, new Set())
		}

		this.modulesMapByUUIDInverted.get(dependencyUuid)?.add(consumerUuid)
	}

	/** TODO remove uuid's by relative path */
	private createUUIDNodes(modules: IWebpackModuleShort[]) {
		let nodeIdByRelativePath: TUuidByRelativePath = new Map()
		let nodesById: TModuleByUUID = new Map()
		// const startTime = Date.now()
		log(`located ${modules.length} modules from this build.`)

		for (const module of modules) {
			const uuid: TUuid = v4()

			const relativePath = resolvePathPlus(module.name)

			nodeIdByRelativePath.set(relativePath, uuid)

			nodesById.set(uuid, {
				uuid: uuid,
				sizeInBytes: module.size || -1,
				fileName: fileNameFromPath(module.name),
				relativePath,
			})
		}

		// log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

		this.uuidByRelativePathMap = nodeIdByRelativePath
		this.moduleByUUIDMap = nodesById
	}

	private getModuleTypes(webpackModules: IWebpackModuleShort[]): string[] {
		const reasonTypes = webpackModules
			.map((module) => module.reasons.map((reason) => reason.type))
			.flat()
			.reduce(
				(acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)),
				[]
			)

		return reasonTypes
	}

	/** TODO verify edge direction */
	private createDependenciesList(
		filteredDestModules: IWebpackModuleShort[]
	): void {
		let relativePath: string
		let moduleShort: IWebpackModuleParsed
		/** dependencies, source */
		let reasons: IWebpackModuleReasonShort[] = []
		let moduleName: string
		/** consumer, destination */
		let destModule: IWebpackModuleParsed

		for (const webpackModule of filteredDestModules) {
			relativePath = resolvePathPlus(webpackModule.name)
			moduleShort = this.moduleByRelativePath(relativePath)

			if (!moduleShort?.uuid) {
				this.stats.emptyDestNodeUuids.add(relativePath)
				log("Empty parsed module", { name: webpackModule.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = webpackModule?.reasons?.filter(
				(module: IWebpackModuleReasonShort) => {
					// filter source/deps nodes
					const result = isModuleIncluded(
						resolvePathPlus(module.moduleName),
						depsConfig.filters
					)
					if (!result) {
						this.stats.excludedSrcNodes.add(module.moduleName)
					}
					return result
				}
			)

			for (const reason of reasons) {
				if (isReasonTypeExcluded(depsConfig.filters, reason.type)) {
					this.stats.excludedSrcNodesByType.add(reason.moduleName)
					continue
				}

				moduleName = resolvePathPlus(reason.moduleName)

				if (!moduleName) {
					this.stats.emptySrcNodes.add(reason.moduleName)
					log("Empty reason", {
						uuid: moduleShort?.uuid,
						reason: reason.moduleName,
					})
					continue
				}

				destModule = this.moduleByRelativePath(moduleName)

				if (!destModule?.uuid) {
					this.stats.emptyDestNodes.add(moduleName)
					log("Empty destination", {
						name: moduleName,
					})
					continue
				}

				// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
				this.addDependenciesById(destModule?.uuid, moduleShort?.uuid)
			}
		}
	}

	filterByMaxDependenciesCount() {
		if (depsConfig.filters.excludeDestNodeByMaxDepsCount > 0) {
			// exclude destination nodes(consumers)
			for (const [consumer, dependencies] of this.modulesMapByUUID) {
				if (
					dependencies.size >
					depsConfig.filters.excludeDestNodeByMaxDepsCount
				) {
					this.stats.excludedDestNodeByMaxDepsCount.add(consumer)
					this.modulesMapByUUID.delete(consumer)
					// log("Too many dependencies", { name: webpackModule.name })
				}
			}
		}

		if (depsConfig.filters.excludeSrcNodeByMaxDepsCount > 0) {
			// exclude source nodes(dependencies)
			let sourcesUUIDList: Set<TUuid> = new Set()

			for (const [dependency, consumers] of this
				.modulesMapByUUIDInverted) {
				if (
					consumers.size >
					depsConfig.filters.excludeSrcNodeByMaxDepsCount
				) {
					sourcesUUIDList.add(dependency)
					this.stats.excludedDestNodeByMaxDepsCount.add(dependency)

					for (const consumer of consumers) {
						// remove dependencies/sources
						this.modulesMapByUUID.get(consumer)?.delete(dependency)

						if (this.modulesMapByUUID.get(consumer)?.size <= 0) {
							// remove nodes with empty dependencies
							this.modulesMapByUUID.delete(consumer)
						}
					}
				}
			}
		}
	}

	/** TODO find how extract reason size */
	getDepsSizes(): string[] {
		let depsSizes: string[] = []
		// let moduleUuid: TUuid
		let module: IWebpackModuleParsed

		for (const [destNodeUuid, srcNodes] of this.modulesMapByUUID) {
			module = this.moduleByUUIDMap.get(destNodeUuid)
			depsSizes.push(
				`${module.sizeInBytes / 1000} MB: ${module.relativePath}`
			)

			// for (const srcNodeUuid of srcNodes) {
			// 	moduleUuid = this.uuidByRelativePathMap.get(srcNodeUuid)
			//     module = this.moduleByUUIDMap.get(moduleUuid)
			//     depsSizes.push(`${module.sizeInBytes/1000} MB: ${module.relativePath}`)
			// }
		}

		return depsSizes.sort(
			(current, next) =>
				parseFloat(next.split(" MB:")[0]) -
				parseFloat(current.split(" MB:")[0])
		)
	}

	getSummary(): string[] {
		return [
			`summary:`,
			`raw module types: ${this.stats.rawDestModulesTypes.length}`,
			`raw modules: ${this.stats.rawModules}`,
			`included modules: ${this.modulesMapByUUID.size}`,
			`flattened modules: ${this.moduleByUUIDMap.size}`,
			`flattened modules path: ${this.uuidByRelativePathMap.size}`,
			`filtered:`,
			`excluded dest nodes: ${this.stats.excludedDestNodes.size}`,
			`excluded src nodes: ${this.stats.excludedSrcNodes.size}`,
			`empty dest nodes uuid's: ${this.stats.emptyDestNodeUuids.size}`,
			`empty src nodes: ${this.stats.emptySrcNodes.size}`,
			`empty dest nodes: ${this.stats.emptyDestNodes.size}`,
			`excluded module reason types: ${this.stats.excludedSrcNodesByType.size}`,
			`excluded modules by max reasons count: ${this.stats.excludedDestNodeByMaxDepsCount.size}`,
		]
	}

	getData(): { [key: string]: string | number | string[] } {
		return {
			rawDestModulesTypes: this.stats.rawDestModulesTypes,
			excludedSrcNodesByType: [...this.stats.excludedSrcNodesByType],
			excludedSrcNodes: [...this.stats.excludedSrcNodes],
			excludedDestNodes: [...this.stats.excludedDestNodes],
			excludedDestNodeByMaxDepsCount: [
				...this.stats.excludedDestNodeByMaxDepsCount,
			],
			emptyDestNodeUuids: [...this.stats.emptyDestNodeUuids],
			emptyDestNodes: [...this.stats.emptyDestNodes],
			emptySrcNodes: [...this.stats.emptySrcNodes],
			depsSizes: this.stats.depsSizes,
		}
	}
}
