import { log } from "../utils/logger"
import {
	IDependencyMap,
	IConfig,
	IConfigFilters,
	IWebpackModuleParsed,
	TModuleByUUID,
} from "../models/webpackStats.model"
import { DependenciesUUIDMap } from "./dependenciesUUIDMap"

/** applied only after dependencyMap creation to filter in both directions: src/dest nodes */
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

function getModuleName(modules: TModuleByUUID, destModuleId: string) {
	return modules.get(destModuleId)?.relativePath || ""
}

function getModuleDependencies(
	destModules: TModuleByUUID,
	dependencies: Set<string>
): string[] {
	return Array.from(dependencies).map((dependencyName: string) =>
		getModuleName(destModules, dependencyName)
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

/** postprocessing */
export function getDependenciesMap(
	uuidMap: DependenciesUUIDMap,
	opts: IConfig
): IDependencyMap {
	const result: IDependencyMap = {}
	let srcModules: string[]
	let destModule: string

	for (const [destModuleId, dependencies] of uuidMap.dependenciesListByUUID) {
		destModule = getModuleName(uuidMap.moduleByUUID, destModuleId)
		srcModules = getModuleDependencies(uuidMap.moduleByUUID, dependencies)

		if (!destModule) {
			log(
				"src/analyzer/analyzerUtils/dependencyMap.ts:67",
				"EMPTY dest module name",
				destModuleId
			)

			continue
		}

		if (isDependencyLinkIncluded(opts.filters, srcModules, destModule)) {
			result[destModule] = srcModules
		}
	}

	return result
}
