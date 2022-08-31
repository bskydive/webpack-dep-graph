import { logEmpty } from "../../utils/logger"
import { IDependencyMap } from "../../models/AnalyzerContext"
import { ModuleGraph } from "./ModuleGraph"

export function getDependencyMap(graph: ModuleGraph): IDependencyMap {
	const mapping: IDependencyMap = {}
	const toPath = (id: string) => graph.nodesById.get(id)?.relativePath || ""

	for (const [id, dependencies] of graph.dependenciesById) {
		mapping[toPath(id)] = Array.from(dependencies).map(toPath)
	}

	logEmpty(
		"src/analyzer/analyzerUtils/dependencyMap.ts:10",
		mapping?.length?.toString()
	)
	return mapping
}

/** add missed nodes from edge definitions for graphml */
export function missedDependencyMapSrcNodes(
	dependencyMap: IDependencyMap
): IDependencyMap {
	let result: IDependencyMap = {}

	for (const targetPath in dependencyMap) {
		for (const dependencyPath of dependencyMap[targetPath]) {
			if (!dependencyMap[dependencyPath]) {
                result[dependencyPath] = []
            }
		}
	}

	return result
}
