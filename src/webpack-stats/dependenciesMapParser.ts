import { log } from "../utils/logger"
import {
	TSrcFileNamesByDest,
	IConfig,
	IConfigFilters,
	TModuleByIDMap,
    TFileId,
} from "../models/webpackStats.model"
import { DependenciesByIdMap } from "./dependenciesByIdMap"

/** applied only after dependencyMap creation to filter in both directions: src/dest modules */
function isModuleIncludedOnly(
	moduleName: string,
	includeOnly: string[]
): boolean {
	let result: boolean = false
	let regExpIncludeOnly: RegExp = null

	if (includeOnly.length && includeOnly.join("|")) {
		regExpIncludeOnly = new RegExp(`${includeOnly.join("|")}`)
		result = regExpIncludeOnly.test(moduleName)
	}

	return result
}

function getDestModulePath(srcModules: TModuleByIDMap, destModuleUuid: TFileId) {
	return srcModules.get(destModuleUuid)?.srcFilePath || ""
}

function getDestModulesPaths(
	srcModules: TModuleByIDMap,
	destModules: Set<string>
): string[] {
	return Array.from(destModules).map((dependencyPath: string) =>
		getDestModulePath(srcModules, dependencyPath)
	)
}

function isDependencyLinkIncluded(
	filters: IConfigFilters,
	srcModules: string[],
	destModule: string
): boolean {
	if (
		!filters.includeOnlyDestNode.length &&
		!filters.includeOnlySrcNode.length
	) {
		// empty included only option
		return true
	}

	if (
		filters.includeOnlySrcNode.length &&
		filters.includeOnlySrcNode.join("").length
	) {
		// filter source modules(dependencies)
		srcModules = srcModules.filter((srcModule) =>
			isModuleIncludedOnly(srcModule, filters.includeOnlySrcNode)
		)
	}

	if (
		srcModules.length ||
		isModuleIncludedOnly(destModule, filters.includeOnlyDestNode)
	) {
		// filter dest modules(issuer)
		return true
	}

	return false
}

/** postprocessing, converting Map to array */
export function getSrcFileNamesByDest(
	uuidMap: DependenciesByIdMap,
	opts: IConfig
): TSrcFileNamesByDest {
	const result: TSrcFileNamesByDest = new Map()
	let srcModules: string[]
	let destPath: string

	for (const [srcNodeId, destNodeIds] of uuidMap.destIdsBySrcIdMap) {
		destPath = getDestModulePath(uuidMap.srcModuleByIDMap, srcNodeId)
		srcModules = getDestModulesPaths(uuidMap.srcModuleByIDMap, destNodeIds)

		if (!destPath) {
			log(
				"src/webpack-stats/dependenciesMap.ts:89",
				"EMPTY dest module name",
				srcNodeId
			)

			continue
		}

		if (isDependencyLinkIncluded(opts.filters, srcModules, destPath)) {
			result.set(destPath,srcModules)
		}
	}

	return result
}
