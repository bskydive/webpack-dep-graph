import { RenderEngine } from "graphviz"
import { DependenciesUUIDMap } from "../analyzer/analyzerUtils/dependenciesUUIDMap"
import { IGraphmlEdge, IGraphmlNode } from "./graphml.model"
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

export type TWebpackReasonShortType =
	| TWebpackStatsV5ReasonType
	| TWebpackStatsV3ReasonType
	| "side effect"

export interface IWebpackModuleReasonShort {
	moduleIdentifier: string // absolute path
	module: string
	moduleName: string // relative path
	type: string
}

export type IDependencyMap = Record<string, string[]>

export interface IGraphvizRenderOpts {
	enabled: boolean
	engine: RenderEngine
	fileName: string
	type: "png" | "dot"
}

export interface IWebpackAnalyzerConfigOutput {
	testGraphmlJs2Xml: boolean
	printImportAnalysis: boolean
	depsJson: boolean
	graphmlDeps: boolean
	circularDepsJson: boolean
	cytoscapeJson: boolean
	simplifiedDot: boolean
}

export interface IWebpackAnalyzerConfigGraphml {
	showSourceEdgeLabels: boolean
	showDestEdgeLabels: boolean
	edge: IGraphmlEdge
	node: IGraphmlNode
}

export interface IWebpackAnalyzerConfigGrapviz {
	renderedDot: IGraphvizRenderOpts
	renderedDotPng: IGraphvizRenderOpts
	renderedSpringPng: IGraphvizRenderOpts
	renderedDirectedPng: IGraphvizRenderOpts
	renderedCircularPng: IGraphvizRenderOpts
	renderedRadialPng: IGraphvizRenderOpts
	renderedClusteredPng: IGraphvizRenderOpts
}

export interface IWebpackAnalyzerConfigFilters {
	exclude: string[]
	excludeExcept: string[]
	includeOnlyDestNode: string[]
	includeOnlySrcNode: string[]
	excludeNodeByMaxDepsCount: number
	edgeTypeExclude: TWebpackReasonShortType[]
}

/** TODO rename/split context vars, that use this interface */
export interface IWebpackAnalyzerConfig {
	input: {
		webpackStatsFileName: string
	}
	filters: IWebpackAnalyzerConfigFilters
	output: IWebpackAnalyzerConfigOutput
	graphml: IWebpackAnalyzerConfigGraphml
	graphviz: IWebpackAnalyzerConfigGrapviz
}
