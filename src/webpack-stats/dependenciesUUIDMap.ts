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
	TUuidsByUuidMap,
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
	srcModuleByUUIDMap: TModuleByUUID = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	srcUuidByRelativePathMap: TUuidByRelativePath = new Map()

	/** resulting map: {"uuid_src": ["uuid_dest", "uuid_dest2"]} */
	destUuidsBySrcUuidMap: TUuidsByUuidMap = new Map()
	/** inverted resulting map for filtering: {"uuid_dest": ["uuid_src1", "uuid_src2"]} */
	destUuidBySrcUuidMapInverted: TUuidsByUuidMap = new Map()

	constructor(modules: IWebpackModuleShort[]) {
		let filteredSrcModules: IWebpackModuleShort[]

		filteredSrcModules = modules?.filter((m: IWebpackModuleShort) => {
			const result = isModuleIncluded(m.name, depsConfig.filters)
			if (!result) {
				this.stats.excludedSrcNodes.add(m.name)
			}

			return result
		})

		this.stats.rawModules = modules.length
		this.stats.rawSrcModulesTypes = this.getModuleTypes(modules)

		this.createSrcUUIDNodes(filteredSrcModules)
		this.createDependenciesList(filteredSrcModules)
		this.filterByMaxDependenciesCount()
		this.stats.depsSizes = this.getDepsSizes()
	}

	moduleByRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: TUuid = this.srcUuidByRelativePathMap.get(relativePath)
		const module: IWebpackModuleParsed = this.srcModuleByUUIDMap.get(uuid)

		if (!uuid || !module?.uuid) return null

		return module
	}

	addSrcNodesById(srcNodeId: TUuid, destNodeId: TUuid) {
		// fill direct list
		if (!this.destUuidsBySrcUuidMap.has(srcNodeId)) {
			this.destUuidsBySrcUuidMap.set(srcNodeId, new Set())
		}

		this.destUuidsBySrcUuidMap.get(srcNodeId)?.add(destNodeId)

		// fill inverted list for filtering
		if (!this.destUuidBySrcUuidMapInverted.has(destNodeId)) {
			this.destUuidBySrcUuidMapInverted.set(destNodeId, new Set())
		}

		this.destUuidBySrcUuidMapInverted.get(destNodeId)?.add(srcNodeId)
	}

	/** TODO remove uuid's by relative path */
	private createSrcUUIDNodes(modules: IWebpackModuleShort[]) {
		let srcNodeIdByRelativePath: TUuidByRelativePath = new Map()
		let srcNodesById: TModuleByUUID = new Map()
		// const startTime = Date.now()
		log(`located ${modules.length} modules from this build.`)

		for (const module of modules) {
			const uuid: TUuid = v4()

			const relativePath = resolvePathPlus(module.name)

			srcNodeIdByRelativePath.set(relativePath, uuid)

			srcNodesById.set(uuid, {
				uuid: uuid,
				sizeInBytes: module.size || -1,
				fileName: fileNameFromPath(module.name),
				relativePath,
			})
		}

		// log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

		this.srcUuidByRelativePathMap = srcNodeIdByRelativePath
		this.srcModuleByUUIDMap = srcNodesById
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
		filteredSrcModules: IWebpackModuleShort[]
	): void {
		let relativePath: string
		let srcModuleShort: IWebpackModuleParsed
		/** consumer, destination */
		let reasons: IWebpackModuleReasonShort[] = []
		let destModuleName: string
		/** dependencies, source */
		let destNode: IWebpackModuleParsed

		for (const module of filteredSrcModules) {
			relativePath = resolvePathPlus(module.name)
			srcModuleShort = this.moduleByRelativePath(relativePath)

			if (!srcModuleShort?.uuid) {
				this.stats.emptySrcNodeUuids.add(relativePath)
				log("Empty parsed module", { name: module.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = module?.reasons?.filter(
				(module: IWebpackModuleReasonShort) => {
					// filter source/deps nodes
					const result = isModuleIncluded(
						resolvePathPlus(module.moduleName),
						depsConfig.filters
					)
					if (!result) {
						this.stats.excludedDestNodes.add(module.moduleName)
					}
					return result
				}
			)

			for (const reason of reasons) {
				if (isReasonTypeExcluded(depsConfig.filters, reason.type)) {
					this.stats.excludedNodesByType.add(reason.moduleName)
					continue
				}

				destModuleName = resolvePathPlus(reason.moduleName)

				if (!destModuleName) {
					this.stats.emptyDestNodes.add(reason.moduleName)
					log("Empty reason", {
						uuid: srcModuleShort?.uuid,
						reason: reason.moduleName,
					})
					continue
				}

				destNode = this.moduleByRelativePath(destModuleName)

				if (!destNode?.uuid) {
					this.stats.emptyDestNodes.add(destModuleName)
					log("Empty destination", {
						name: destModuleName,
					})
					continue
				}

				// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
				this.addSrcNodesById(destNode?.uuid, srcModuleShort?.uuid)
			}
		}
	}

	filterByMaxDependenciesCount() {
		// exclude source nodes by max dest nodes
        if (depsConfig.filters.excludeByMaxIncomingCount > 0) {
			for (const [srcNodeId, destNodeIds] of this.destUuidsBySrcUuidMap) {
				if (
					destNodeIds.size >
					depsConfig.filters.excludeByMaxIncomingCount
				) {
					this.stats.excludedSrcNodeByMaxDepsCount.add(srcNodeId)
					this.destUuidsBySrcUuidMap.delete(srcNodeId)
				}
			}

            // TODO remove from this.destUuidBySrcUuidMapInverted too
		}

		// exclude dest nodes by max src nodes
        if (depsConfig.filters.excludeByMaxOutgoingCount > 0) {
			let destUUIDList: Set<TUuid> = new Set()

			for (const [destNodeId, srcNodeIds] of this.destUuidBySrcUuidMapInverted) {
				if (
					srcNodeIds.size >
					depsConfig.filters.excludeByMaxOutgoingCount
				) {
					destUUIDList.add(destNodeId)
					this.stats.excludedDestNodeByMaxDepsCount.add(destNodeId)

					for (const srcNodeId of srcNodeIds) {
						// remove destinations from source
						this.destUuidsBySrcUuidMap.get(srcNodeId)?.delete(destNodeId)

						if (
							this.destUuidsBySrcUuidMap.get(srcNodeId)?.size <= 0
						) {
							// remove source nodes with empty destinations
							this.destUuidsBySrcUuidMap.delete(srcNodeId)
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

		for (const [srcNodeUuid, destNodeUuids] of this.destUuidsBySrcUuidMap) {
			module = this.srcModuleByUUIDMap.get(srcNodeUuid)
			depsSizes.push(
				`${module.sizeInBytes / 1000} MB: ${module.relativePath}`
			)
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
			`raw module types: ${this.stats.rawSrcModulesTypes.length}`,
			`raw modules: ${this.stats.rawModules}`,
			`included modules: ${this.destUuidsBySrcUuidMap.size}`,
			`flattened modules: ${this.srcModuleByUUIDMap.size}`,
			`flattened modules path: ${this.srcUuidByRelativePathMap.size}`,
			`filtered:`,
			`excluded dest nodes: ${this.stats.excludedDestNodes.size}`,
			`excluded src nodes: ${this.stats.excludedSrcNodes.size}`,
			`empty dest nodes uuid's: ${this.stats.emptySrcNodeUuids.size}`,
			`empty src nodes: ${this.stats.emptySrcNodes.size}`,
			`empty dest nodes: ${this.stats.emptyDestNodes.size}`,
			`excluded module reason types: ${this.stats.excludedNodesByType.size}`,
			`excluded modules by max reasons count: ${this.stats.excludedDestNodeByMaxDepsCount.size}`,
		]
	}

	getData(): { [key: string]: string | number | string[] } {
		return {
			rawDestModulesTypes: this.stats.rawSrcModulesTypes,
			excludedSrcNodesByType: [...this.stats.excludedNodesByType],
			excludedSrcNodes: [...this.stats.excludedSrcNodes],
			excludedDestNodes: [...this.stats.excludedDestNodes],
			excludedSrcNodeByMaxDepsCount: [
				...this.stats.excludedSrcNodeByMaxDepsCount,
			],			
            excludedDestNodeByMaxDepsCount: [
				...this.stats.excludedDestNodeByMaxDepsCount,
			],
			emptyDestNodeUuids: [...this.stats.emptySrcNodeUuids],
			emptyDestNodes: [...this.stats.emptyDestNodes],
			emptySrcNodes: [...this.stats.emptySrcNodes],
			depsSizes: this.stats.depsSizes,
		}
	}
}
