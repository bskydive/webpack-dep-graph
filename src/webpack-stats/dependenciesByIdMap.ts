import { depsConfig } from "../../deps.config"
import { log } from "../utils/logger"
import { isModuleIncluded, isReasonTypeExcluded, resolvePathPlus } from "../utils/webpack"
import {
	IStats,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
	TIdsByIdGraphMap,
	TModuleByIDMap,
	TFileId,
	STATS_EMPTY,
} from "../models/webpackStats.model"
import { fileNameFromPath } from "../utils/files"

/** Concatenating source and dest modules into Map */
export class DependenciesByIdMap {
	stats: IStats = STATS_EMPTY
	/** flattened list for parsing {'id':{...module}} */
	srcModuleByIDMap: TModuleByIDMap = new Map()
	/** resulting map: {"id_src": ["id_dest", "id_dest2"]} */
	destIdsBySrcIdMap: TIdsByIdGraphMap = new Map()
	/** inverted resulting map for filtering by destination: {"id_dest": ["id_src1", "id_src2"]} */
	srcIdsByDestIdMap: TIdsByIdGraphMap = new Map()

	constructor(modules: IWebpackModuleShort[], webpackVersion: string) {
		let filteredSrcModules: IWebpackModuleShort[] = []

		this.stats.webpackVersion = webpackVersion

		modules?.forEach((srcModule: IWebpackModuleShort) => {
			const result = isModuleIncluded(srcModule.name, depsConfig.filters)

			if (!result) {
				this.stats.excludedSrcNodes.add(srcModule.name)
			} else {
				filteredSrcModules.push(srcModule)
				this.stats.rawUniqSrcModulesTypes = new Set([
					...this.stats.rawUniqSrcModulesTypes,
					...this.getUniqReasonTypes(srcModule.reasons),
				])
			}
		})

		this.stats.rawModules = [...filteredSrcModules]
		this.stats.rawModulesCount = filteredSrcModules.length

		this.srcModuleByIDMap = this.getParsedModulesMap(filteredSrcModules)
		this.createDependenciesList(this.srcModuleByIDMap)
		this.filterByMaxDependenciesCount()
		this.stats.depsSizes = this.getDepsSizes()
	}

	srcModuleByFilePath(filePath: string): IWebpackModuleParsed | null {
		const module: IWebpackModuleParsed = this.srcModuleByIDMap.get(filePath)

		if (!module?.srcFilePath) return null

		return module
	}

	addSrcNodesById(srcNodeId: TFileId, destNodeId: TFileId) {
		if (!this.destIdsBySrcIdMap.has(srcNodeId)) {
			this.destIdsBySrcIdMap.set(srcNodeId, new Set())
		}

		this.destIdsBySrcIdMap.get(srcNodeId)?.add(destNodeId)

		if (!this.srcIdsByDestIdMap.has(destNodeId)) {
			this.srcIdsByDestIdMap.set(destNodeId, new Set())
		}

		this.srcIdsByDestIdMap.get(destNodeId)?.add(srcNodeId)
	}

	/** parse long paths to ID's */
	private getParsedModulesMap(rawModules: IWebpackModuleShort[]): TModuleByIDMap {
		let result: TModuleByIDMap = new Map()

		// const startTime = Date.now()
		log(`starting to parse ${rawModules.length} modules from this build.`)

		for (const rawModule of rawModules) {
			const filePath: string = resolvePathPlus(rawModule.name)
			const parsedModule: IWebpackModuleParsed = result.get(filePath)

			if (!parsedModule) {
				// create new entry
				result.set(filePath, {
					sizeInBytes: rawModule?.size || 0,
					srcFileName: fileNameFromPath(rawModule.name),
					srcFilePath: filePath,
					destFilesPathSet: new Set(rawModule.reasons.map((reason) => reason.moduleName)),
				})
			} else {
				// modify entry

				parsedModule.destFilesPathSet = new Set([
					...parsedModule.destFilesPathSet,
					...rawModule.reasons.map((reason) => reason.moduleName),
				])

				parsedModule.sizeInBytes = parsedModule.sizeInBytes || 0 + rawModule.size || 0

				this.stats.existingModulePath.set(
					parsedModule.srcFilePath,
					this.stats.existingModulePath.get(parsedModule.srcFilePath) || 0 + 1
				)
			}

			result.set(filePath, parsedModule)
		}

		// log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

		return result
	}

	private getUniqReasonTypes(reasons: IWebpackModuleReasonShort[]): string[] {
		const reasonTypes = reasons
			.map((reason) => reason.type)
			.flat()
			.reduce((acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)), [])

		return reasonTypes
	}

	/** TODO verify edge direction 
     * !TODO migrate from IWebpackModuleShort to TModuleByIDMap
    */
	private createDependenciesList(filteredSrcModules: TModuleByIDMap): void {
		let srcFilePath: string
		let srcModuleShort: IWebpackModuleParsed
		/** consumer, destination */
		let reasons: IWebpackModuleReasonShort[] = []
		let destModuleName: string
		/** dependencies, source */
		let destNode: IWebpackModuleParsed

		for (const module of filteredSrcModules) {
			srcFilePath = module.name
			srcModuleShort = this.srcModuleByFilePath(srcFilePath)

			if (!srcModuleShort?.srcFilePath) {
				this.stats.emptySrcNodePaths.add(srcFilePath)
				// log("Empty parsed module", { name: module.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = module?.reasons?.filter((module: IWebpackModuleReasonShort) => {
				// filter source/deps nodes
				const result = isModuleIncluded(resolvePathPlus(module.moduleName), depsConfig.filters)
				if (!result) {
					this.stats.excludedDestNodes.add(module.moduleName)
				}
				return result
			})

			for (const reason of reasons) {
				if (isReasonTypeExcluded(depsConfig.filters, reason.type)) {
					this.stats.excludedNodesByType.add(`${reason.type}: ${reason.moduleName}`)
					continue
				}

				destModuleName = resolvePathPlus(reason.moduleName)

				if (!destModuleName) {
					this.stats.emptyDestNodes.add("not resolved path: " + reason.moduleName)
					// log("Empty reason", {
					//     uuid: srcModuleShort?.uuid,
					//     reason: reason.moduleName,
					// })
					continue
				}

				destNode = this.srcModuleByFilePath(destModuleName)

				if (!destNode?.srcFilePath) {
					// TODO !!! add dest uuids generation
					this.stats.emptyDestNodes.add("no uuid: " + destModuleName)
					// log("Empty destination", { name: destModuleName })
					continue
				}

				this.addSrcNodesById(destNode?.srcFilePath, srcModuleShort?.srcFilePath)
			}
		}
	}

	filterByMaxDependenciesCount() {
		// exclude source nodes by max dest nodes
		if (depsConfig.filters.excludeByMaxIncomingCount > 0) {
			for (const [srcNodeId, destNodeIds] of this.destIdsBySrcIdMap) {
				if (destNodeIds.size > depsConfig.filters.excludeByMaxIncomingCount) {
					this.stats.excludedSrcNodeByMaxDepsCount.add(srcNodeId)
					// TODO get path this.srcUuidByRelativePathMap.get(srcNodeId)
					this.destIdsBySrcIdMap.delete(srcNodeId)
				}
			}

			// TODO remove from this.destUuidBySrcUuidMapInverted too
		}

		// exclude dest nodes by max src nodes
		if (depsConfig.filters.excludeByMaxOutgoingCount > 0) {
			let destUUIDList: Set<TFileId> = new Set()

			for (const [destNodeId, srcNodeIds] of this.srcIdsByDestIdMap) {
				if (srcNodeIds.size > depsConfig.filters.excludeByMaxOutgoingCount) {
					destUUIDList.add(destNodeId)
					this.stats.excludedDestNodeByMaxDepsCount.add(destNodeId)
					// TODO get path
					// [...this.destUuidsBySrcUuidMap].find(([key, value]) => value === destNodeId)[0]
					// this.srcUuidByRelativePathMap.get(destNodeId)

					for (const srcNodeId of srcNodeIds) {
						// remove destinations from source
						this.destIdsBySrcIdMap.get(srcNodeId)?.delete(destNodeId)

						if (this.destIdsBySrcIdMap.get(srcNodeId)?.size <= 0) {
							// remove source nodes with empty destinations
							this.destIdsBySrcIdMap.delete(srcNodeId)
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

		for (const [srcNodeUuid, destNodeUuids] of this.destIdsBySrcIdMap) {
			module = this.srcModuleByIDMap.get(srcNodeUuid)
			depsSizes.push(`${module.sizeInBytes / 1000} MB: ${module.srcFilePath}`)
		}

		return depsSizes.sort(
			(current, next) => parseFloat(next.split(" MB:")[0]) - parseFloat(current.split(" MB:")[0])
		)
	}

	getSummary(): Object {
		return {
			summary: ">",
			"webpack version": this.stats.webpackVersion,
			"raw module types": this.stats.rawUniqSrcModulesTypes.size,
			"raw modules": this.stats.rawModulesCount,
			"included modules": this.destIdsBySrcIdMap.size,
			"flattened modules": this.srcModuleByIDMap.size,
			filtered: ">",
			"excluded dest nodes": this.stats.excludedDestNodes.size,
			"excluded src nodes": this.stats.excludedSrcNodes.size,
			"existing nodes": this.stats.existingModulePath.size,

			"empty src nodes": this.stats.emptySrcNodePaths.size,
			"empty dest nodes": this.stats.emptyDestNodes.size,

			"excluded module reason types": this.stats.excludedNodesByType.size,
			"excluded modules by max reasons": this.stats.excludedDestNodeByMaxDepsCount.size,
		}
	}

	getData(): { [key: string]: any } {
		return {
			rawModules: this.stats.rawModules,
			rawDestModulesTypes: this.stats.rawUniqSrcModulesTypes,
			excludedSrcNodesByType: [...this.stats.excludedNodesByType],
			excludedSrcNodes: [...this.stats.excludedSrcNodes],
			excludedDestNodes: [...this.stats.excludedDestNodes],
			excludedSrcNodeByMaxDepsCount: [...this.stats.excludedSrcNodeByMaxDepsCount],
			excludedDestNodeByMaxDepsCount: [...this.stats.excludedDestNodeByMaxDepsCount],
			existingModulePath: [...this.stats.existingModulePath],
			emptySrcNodePaths: [...this.stats.emptySrcNodePaths],
			emptyDestNodes: [...this.stats.emptyDestNodes],
			depsSizes: this.stats.depsSizes,
		}
	}
}
