import { RenderEngine } from "graphviz"
import { ModuleGraph } from "../analyzer/analyzerUtils/ModuleGraph"
import { IWebpackStatsV5Module } from "./webpack5.model"

export type IDependencyMap = Record<string, string[]>

export interface AnalyzerContext extends IAnalyzerConfig {
	graph: ModuleGraph
	webpackModules: IWebpackStatsV5Module[]
	dependencyMap: IDependencyMap
	circularImports: string[][]
}

export interface IGraphvizRenderOpts {
    enabled: boolean
    engine: RenderEngine
    fileName: string
    type: 'png' | 'dot'
}

/** graphviz calculation takes a large time */
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
    simplifiedDot: boolean
	graphviz: {
		renderedDot: IGraphvizRenderOpts
		renderedDotPng: IGraphvizRenderOpts
		renderedSpringPng: IGraphvizRenderOpts
		renderedDirectedPng: IGraphvizRenderOpts
		renderedCircularPng: IGraphvizRenderOpts
		renderedRadialPng: IGraphvizRenderOpts
		renderedClusteredPng: IGraphvizRenderOpts
	}
}
