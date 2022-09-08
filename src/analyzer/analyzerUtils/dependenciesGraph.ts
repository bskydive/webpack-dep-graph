import { IWebpackModuleParsed } from "../../models/webpackAnalyzer.model"

/** @deprecated TODO split state and logic */
export class DependenciesGraph {
	/** {'uuid':{...module}} */
    nodesById: Map<string, IWebpackModuleParsed> = new Map()
    /** {'path1':'uuid1'} */
    nodeIdByRelativePath: Map<string, string> = new Map()
	/** {"uuid:LoginPage": ["uuid:LoginForm", "uuid:LoginButton"]} */
	dependenciesById: Map<string, Set<string>> = new Map()

	byRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: string = this.nodeIdByRelativePath.get(relativePath)
		const module: IWebpackModuleParsed = this.nodesById.get(uuid)

        if (!uuid || !module?.uuid) return null

		return module
	}

	addDependenciesById(consumerId: string, dependencyId: string) {
		if (!this.dependenciesById.has(consumerId)) {
			this.dependenciesById.set(consumerId, new Set())
		}

		this.dependenciesById.get(consumerId)?.add(dependencyId)
	}
}
