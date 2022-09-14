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
	TUUIDByRelativePath,
} from "../models/webpackStats.model"
import { fileNameFromPath } from "../utils/files"

/** Concatenating source and dest modules into Map */
export class DependenciesUUIDMap {
	stats: IStats = {
		dependencyExcluded: 0,
		rawModules: 0,
		moduleExcluded: 0,
		emptyUUID: 0,
		emptyReasons: 0,
		emptyReasonDest: 0,
		reasonTypeExcluded: 0,
		maxReasonCountExcluded: 0,
		moduleTypes: [],
	}

	/** flattened list for parsing {'uuid':{...module}} */
	moduleByUUIDMap: TModuleByUUID = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	uuidByRelativePathMap: TUUIDByRelativePath = new Map()

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
				this.stats.moduleExcluded++
			}

			return result
		})

		this.stats.rawModules = modules.length
		this.stats.moduleTypes = this.getModuleTypes(modules)

		this.createUUIDNodes(filteredDestModules)
		this.createDependenciesList(filteredDestModules)
		this.filterByMaxDependenciesCount()
	}

	moduleByRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: string = this.uuidByRelativePathMap.get(relativePath)
		const module: IWebpackModuleParsed = this.moduleByUUIDMap.get(uuid)

		if (!uuid || !module?.uuid) return null

		return module
	}

	addDependenciesById(consumerId: string, dependencyId: string) {
		// direct consumer<--dependency list
		if (!this.modulesMapByUUID.has(consumerId)) {
			this.modulesMapByUUID.set(consumerId, new Set())
		}

		this.modulesMapByUUID.get(consumerId)?.add(dependencyId)

		// inverted dependency-->consumer list for filtering
		if (!this.modulesMapByUUIDInverted.has(dependencyId)) {
			this.modulesMapByUUIDInverted.set(dependencyId, new Set())
		}

		this.modulesMapByUUIDInverted.get(dependencyId)?.add(consumerId)
	}

	private createUUIDNodes(modules: IWebpackModuleShort[]) {
		let nodeIdByRelativePath: TUUIDByRelativePath = new Map()
		let nodesById: TModuleByUUID = new Map()
		// const startTime = Date.now()
		log(`located ${modules.length} modules from this build.`)

		for (const module of modules) {
			const id = v4()

			const relativePath = resolvePathPlus(module.name)

			nodeIdByRelativePath.set(relativePath, id)

			nodesById.set(id, {
				uuid: id,
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

	private createDependenciesList(
		filteredDestModules: IWebpackModuleShort[]
	): void {
		let relativePath: string
		let moduleParsed: IWebpackModuleParsed
		/** dependencies, source */
		let reasons: IWebpackModuleReasonShort[] = []
		let moduleName: string
		/** consumer */
		let destModule: IWebpackModuleParsed

		for (const webpackModule of filteredDestModules) {
			relativePath = resolvePathPlus(webpackModule.name)
			moduleParsed = this.moduleByRelativePath(relativePath)

			if (!moduleParsed?.uuid) {
				this.stats.emptyUUID++
				log("Empty parsed module", { name: webpackModule.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = webpackModule?.reasons?.filter(
				(m: IWebpackModuleReasonShort) => {
					// filter source/deps nodes
					const result = isModuleIncluded(
						m.moduleName,
						depsConfig.filters
					)
					if (!result) {
						this.stats.dependencyExcluded++
					}
					return result
				}
			)

			for (const reason of reasons) {
				if (isReasonTypeExcluded(depsConfig.filters, reason.type)) {
					this.stats.reasonTypeExcluded++
					continue
				}

				moduleName = resolvePathPlus(reason.moduleName)

				if (!moduleName) {
					this.stats.emptyReasons++
					log("Empty reason", {
						uuid: moduleParsed?.uuid,
						reason: reason.moduleName,
					})
					continue
				}

				destModule = this.moduleByRelativePath(moduleName)

				if (!destModule?.uuid) {
					this.stats.emptyReasonDest++
					log("Empty destination", {
						name: moduleName,
					})
					continue
				}

				// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
				this.addDependenciesById(destModule?.uuid, moduleParsed?.uuid)
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
					this.stats.maxReasonCountExcluded++
					this.modulesMapByUUID.delete(consumer)
					// log("Too many dependencies", { name: webpackModule.name })
				}
			}
		}

		if (depsConfig.filters.excludeSrcNodeByMaxDepsCount > 0) {
			// exclude source nodes(dependencies)
			let sourcesUUIDList: Set<string> = new Set()

			for (const [dependency, consumers] of this
				.modulesMapByUUIDInverted) {
				if (
					consumers.size >
					depsConfig.filters.excludeSrcNodeByMaxDepsCount
				) {
					sourcesUUIDList.add(dependency)

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

			this.stats.maxReasonCountExcluded += sourcesUUIDList?.size
		}
	}

	getSummary(): string[] {
		return [
			`summary:`,
			`raw module types: ${this.stats.moduleTypes};`,
			`raw modules: ${this.stats.rawModules}`,
			`excluded modules: ${this.stats.moduleExcluded}`,
			`excluded dependencies: ${this.stats.dependencyExcluded}`,
			`included modules: ${this.modulesMapByUUID.size}`,
			`flattened modules: ${this.moduleByUUIDMap.size}`,
			`flattened modules path: ${this.uuidByRelativePathMap.size}`,
			`filtered:`,
			`empty module uuid's: ${this.stats.emptyUUID}`,
			`empty reasons: ${this.stats.emptyReasons}`,
			`empty reasons dest: ${this.stats.emptyReasonDest}`,
			`excluded module reason types: ${this.stats.reasonTypeExcluded}`,
			`excluded modules by max reasons count: ${this.stats.maxReasonCountExcluded}`,
		]
	}
}
