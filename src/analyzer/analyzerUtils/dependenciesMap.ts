import { log } from "../../utils/logger"
import {
	IDependencyMap,
	IWebpackAnalyzerConfig,
	IWebpackAnalyzerConfigFilters,
	IWebpackModuleParsed,
} from "../../models/webpackAnalyzer.model"
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

function getModuleName(
	destModuleId: string,
	modules: Map<string, IWebpackModuleParsed>
) {
	return modules.get(destModuleId)?.relativePath || ""
}

function getModuleDependencies(
	dependencies: Set<string>,
	destModules: Map<string, IWebpackModuleParsed>
): string[] {
	return Array.from(dependencies).map((dependencyName: string) =>
		getModuleName(dependencyName, destModules)
	)
}

function isDependencyLinkIncluded(
	filters: IWebpackAnalyzerConfigFilters,
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

/** find missed nodes from edge definitions for graphml */
export function missedDependenciesMapSrcNodes(
	dependencyMap: IDependencyMap
): IDependencyMap {
	let result: IDependencyMap = {}
	// TODO add issuerName see src/analyzer/analyzerUtils/setupNodes.ts:21
	for (const targetPath in dependencyMap) {
		for (const dependencyPath of dependencyMap[targetPath]) {
			if (!dependencyMap[dependencyPath]) {
				result[dependencyPath] = []
			}
		}
	}

    log('added missed dest nodes', Object.keys(result).length)
	return result
}

/** postprocessing */
export function getDependenciesMap(
	graph: DependenciesUUIDMap,
	opts: IWebpackAnalyzerConfig
): IDependencyMap {
	const result: IDependencyMap = {}
	let srcModules: string[]
	let destModule: string

	for (const [destModuleId, dependencies] of graph.dependenciesById) {
		destModule = getModuleName(destModuleId, graph.nodesById)
		srcModules = getModuleDependencies(dependencies, graph.nodesById)

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

