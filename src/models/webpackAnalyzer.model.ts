import { RenderEngine } from "graphviz"
import { DependenciesGraph } from "../analyzer/analyzerUtils/dependenciesGraph"
import { TWebpackStatsV3ReasonType } from "./webpack.3.model"
import { TWebpackStatsV5ReasonType } from "./webpack.5.model"

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

export type TWebpackReasonShortType = TWebpackStatsV5ReasonType | TWebpackStatsV3ReasonType | 'side effect'

export interface IWebpackModuleReasonShort {
	moduleIdentifier: string // absolute path
	module: string
	moduleName: string // relative path
	type: string
}

export type IDependencyMap = Record<string, string[]>

export interface IWebpackAnalyzerContext extends IWebpackAnalyzerConfig {
	graph: DependenciesGraph
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

/** TODO rename/split context vars, that use this interface */
export interface IWebpackAnalyzerConfig {
	webpackStatsFileName: string
	exclude: string[]
	excludeExcept: string[]
	includeOnlyDestNode: string[]
	includeOnlySrcNode: string[]
    edgeTypeExclude: TWebpackReasonShortType[]
    showSourceEdgeLabels: boolean
    showDestEdgeLabels: boolean
	testGraphmlJs2Xml: boolean
	printImportAnalysis: boolean
	depsJson: boolean
	graphmlDeps: boolean
	circularDepsJson: boolean
	cytoscapeJson: boolean
	simplifiedDot: boolean
    graphml: {}
    output: {}
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
