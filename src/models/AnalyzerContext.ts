import { ModuleGraph } from "../analyzer/analyzerUtils/ModuleGraph"
import { VirtualFS } from "../utils/virtualFS"
import { IWebpackStatsV5Module } from "./webpack5.model"

export type IDependencyMap = Record<string, string[]>

export interface AnalyzerContext extends AnalyzerConfig {
	vfs: VirtualFS
	graph: ModuleGraph
	webpackModules: IWebpackStatsV5Module[]
	dependencyMap: IDependencyMap
	circularImports: string[][]
}

export interface AnalyzerConfig {
	projectRoot: string
	printImportAnalysis?: boolean
}
