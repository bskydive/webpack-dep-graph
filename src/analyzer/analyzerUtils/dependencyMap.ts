import { log, logEmpty } from "../../utils/logger"
import {
	IDependencyMap,
	IWebpackAnalyzerConfig,
	IWebpackModuleParsed,
} from "../../models/webpackAnalyzer.model"
import { DependenciesGraph } from "./dependenciesGraph"
import { IIncludedOptions } from "../../utils/webpack"

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

/** postprocessing */
export function getDependencyMap(
	graph: DependenciesGraph,
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

		if (
			!opts.filters.includeOnlyDestNode.length &&
			!opts.filters.includeOnlySrcNode.length
		) {
			// empty included only option
			result[destModule] = srcModules
		}

		if ( 
			opts.filters.includeOnlySrcNode.length && 
            opts.filters.includeOnlySrcNode.join('').length
		) {
			// filter source modules(dependencies)
			srcModules = srcModules.filter((srcModule) =>
            isModuleIncludedOnly(srcModule, opts.filters.includeOnlySrcNode))
		}

		if (
            srcModules.length ||
			isModuleIncludedOnly(destModule, opts.filters.includeOnlyDestNode)
		) {
            // filter dest modules(issuer)
            result[destModule] = srcModules
		}
	}

	return result
}

/** add missed nodes from edge definitions for graphml */
export function missedDependencyMapSrcNodes(
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

	return result
}
