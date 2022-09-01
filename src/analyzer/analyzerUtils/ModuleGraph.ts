import { IWebpackModuleParsed } from "../../models/webpackAnalyzer.model"

export class ModuleGraph {
  nodesById: Map<string, IWebpackModuleParsed> = new Map()
  nodeIdByRelativePath: Map<string, string> = new Map()

  /**
   * Lookup the module ids that is being used by the given module.
   *
   * It's an adjacency list containing the module ids,
   * which can be represented as a directed acyclic graph (DAG).
   *
   * e.g. `{"id:LoginPage": ["id:LoginForm", "id:LoginButton"]}`,
   **/
  dependenciesById: Map<string, Set<string>> = new Map()

  byRelativePath(relativePath: string): IWebpackModuleParsed | null {
    const id = this.nodeIdByRelativePath.get(relativePath)
    if (!id) return null

    const module = this.nodesById.get(id)
    if (!module) return null

    return module
  }

  addDependenciesById(consumerId: string, dependencyId: string) {
    if (!this.dependenciesById.has(consumerId)) {
      this.dependenciesById.set(consumerId, new Set())
    }

    this.dependenciesById.get(consumerId)?.add(dependencyId)
  }
}
