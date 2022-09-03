import { RenderEngine } from "graphviz"
import { ModuleGraph } from "../analyzer/analyzerUtils/ModuleGraph"
import { IWebpackStatsV3Module } from "./webpack.3.model"
import { IWebpackStatsV5Module } from "./webpack.5.model"

export const EMPTY_MODULE_PARSED: IWebpackModuleParsed = {
	uuid: "",
	fileName: "",
	relativePath: "",
}

/** for calculations */
export interface IWebpackModuleParsed {
	uuid: string
	sizeInBytes?: number // TODO @deprecated remove or implement file size visualizer
	fileName: string
	relativePath: string
}

/** prepared for the IWebpackModuleParsed, parsed from the version dependend formats */
export interface IWebpackModuleShort {
	identifier: string
	size: number
	name: string
	issuerName?: string
	id: string
	reasons: IWebpackModuleReasonShort[]
}

export interface IWebpackModuleReasonShort {
	moduleIdentifier: string // absolute path
	module: string
	moduleName: string // relative path
	type: string
}

export type IDependencyMap = Record<string, string[]>

export interface IWebpackAnalyzerContext extends IWebpackAnalyzerConfig {
	graph: ModuleGraph
	webpackModules: IWebpackModuleShort[]
	dependencyMap: IDependencyMap
	circularImports: string[][]
}

export interface IGraphvizRenderOpts {
	enabled: boolean
	engine: RenderEngine
	fileName: string
	type: "png" | "dot"
}

/** graphviz calculation takes a large time */
export interface IWebpackAnalyzerConfig {
	webpackStatsFileName: string
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
