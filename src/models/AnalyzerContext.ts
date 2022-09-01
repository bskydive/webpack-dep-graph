import { ModuleGraph } from "../analyzer/analyzerUtils/ModuleGraph"
import { VirtualFS } from "../utils/virtualFS"
import { IWebpackStatsV5Module } from "./webpack5.model"

export type IDependencyMap = Record<string, string[]>

export interface AnalyzerContext extends IAnalyzerConfig {
	vfs: VirtualFS
	graph: ModuleGraph
	webpackModules: IWebpackStatsV5Module[]
	dependencyMap: IDependencyMap
	circularImports: string[][]
}

export interface IAnalyzerConfig {
	projectRoot: string
	exclude: string[]
	excludeExcept: string[]
	includeOnly: string[]
	testGraphml: boolean
	printImportAnalysis: boolean
	depsJson: boolean
	graphmlDeps: boolean
	circularDepsJson: boolean
	cytoscapeJson: boolean
	graphvizRenderedDot: boolean // long execution
	graphvizRenderedPng: boolean // long execution
	graphvizDotSimplified: boolean
}
