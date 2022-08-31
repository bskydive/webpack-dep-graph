import { logEmpty } from "../../utils/logger";
import { IDependencyMap } from "../../models/AnalyzerContext";
import { ModuleGraph } from "./ModuleGraph"

export function getDependencyMap(graph: ModuleGraph): IDependencyMap {
  const mapping: IDependencyMap = {}
  const toPath = (id: string) => graph.nodesById.get(id)?.relativePath || ""

  for (const [id, dependencies] of graph.dependenciesById) {
    mapping[toPath(id)] = Array.from(dependencies).map(toPath)
  }

  logEmpty('src/analyzer/analyzerUtils/dependencyMap.ts:10', mapping?.length?.toString());
  return mapping
}
