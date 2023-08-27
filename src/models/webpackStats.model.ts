import { RenderEngine } from "graphviz"
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

/** destPath:{srcPath1, srcPath2} */
export type TSrcFileNamesByDest = Map<string, string[]>

export interface IGraphvizRenderOpts {
	enabled: boolean
	engine: RenderEngine
	fileName: string
	type: "png" | "dot"
}

interface IWebpackStatsConfigOutputEntry {
	enabled: boolean
	fileName: string
}

export interface IConfigOutput {
	testGraphmlJs2Xml: IWebpackStatsConfigOutputEntry
	depsJson: IWebpackStatsConfigOutputEntry
	statsJson: IWebpackStatsConfigOutputEntry
	graphmlDeps: IWebpackStatsConfigOutputEntry
	circularDepsJson: IWebpackStatsConfigOutputEntry
	cytoscapeJson: IWebpackStatsConfigOutputEntry
	simplifiedDot: IWebpackStatsConfigOutputEntry
}

export interface IConfigGraphml {
	showSourceEdgeLabels: boolean
	showDestEdgeLabels: boolean
	edge: IGraphmlEdge
	node: IGraphmlNode
}

export interface IConfigGrapviz {
	renderedDot: IGraphvizRenderOpts
	renderedDotPng: IGraphvizRenderOpts
	renderedSpringPng: IGraphvizRenderOpts
	renderedDirectedPng: IGraphvizRenderOpts
	renderedCircularPng: IGraphvizRenderOpts
	renderedRadialPng: IGraphvizRenderOpts
	renderedClusteredPng: IGraphvizRenderOpts
}

export interface IConfigFilters {
	exclude: string[]
	excludeExcept: string[]
	includeOnlyDestNode: string[]
	includeOnlySrcNode: string[]
	excludeByMaxOutgoingCount: number
	excludeByMaxIncomingCount: number
	edgeTypeExclude: TWebpackReasonShortType[]
}

/** TODO rename/split context vars, that use this interface */
export interface IConfig {
	input: {
		webpackStatsFileName: string
	}
	filters: IConfigFilters
	output: IConfigOutput
	graphml: IConfigGraphml
	graphviz: IConfigGrapviz
}


export type TModuleByUUID = Map<TUuid, IWebpackModuleParsed>

export type TUUIDByRelativePath = Map<string, TUuid>

export type TUuidsByUuidMap = Map<TUuid, Set<TUuid>>

/** id for IWebpackModuleParsed entry */
export type TUuid = string

export interface IStats {
    rawModules: number
    rawSrcModulesTypes: string[]
    excludedNodesByType: Set<string>
    excludedSrcNodes: Set<string>
    excludedDestNodes: Set<string>
    excludedSrcNodeByMaxDepsCount: Set<string>
    excludedDestNodeByMaxDepsCount: Set<string>
    emptySrcNodeUuids: Set<string>
    emptyDestNodes: Set<string>
    emptySrcNodes: Set<string>
    depsSizes: string[]
}

export const STATS_EMPTY: IStats = {
    rawModules: 0,
    rawSrcModulesTypes: [],
    excludedNodesByType: new Set(),
    excludedSrcNodes: new Set(),
    excludedDestNodes: new Set(),
    excludedSrcNodeByMaxDepsCount: new Set(),
    excludedDestNodeByMaxDepsCount: new Set(),
    emptySrcNodeUuids: new Set(),
    emptyDestNodes: new Set(), // TODO add source module uuid, convert to map
    emptySrcNodes: new Set(),
    depsSizes: []
}
