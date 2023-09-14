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

/** 
 * source path list with destinations
 * used for the IWebpackModuleParsed
 * parsed from the version dependend formats 
 */
export interface IWebpackModuleShort {
	// identifier: string // includes absolute path with `!` and `|` separators
	size: number
	name: string // source path for `reasons.moduleName`
	issuerName?: string // destination path for `name`, used for debugging, moved to reasons
	// id: string // number
	reasons: IWebpackModuleReasonShort[] // destination paths for `name`
}

export type TWebpackReasonShortType =
	| TWebpackStatsV5ReasonType
	| TWebpackStatsV3ReasonType
	| "side effect"
    | "issuerParser" // see src/webpack-stats/webpackStats.ts:getWebpackModuleShort()

/** destination paths */
export interface IWebpackModuleReasonShort {
	// moduleIdentifier: string // includes absolute path with `!` and `|` separators
	// module: string // additional destination relative path for moduleName `+` other modules count
	moduleName: string // destination for parent `name` and source relative path for `module`
	type: TWebpackReasonShortType
}

/** {destPath:[srcPath1, srcPath2]} */
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


/** search module by UUID */
export type TModuleByUUID = Map<TUuid, IWebpackModuleParsed>

/** search uuid by relative path */
export type TUUIDByRelativePath = Map<string, TUuid>

export type TUuidsByUuidMap = Map<TUuid, Set<TUuid>>

/** id for IWebpackModuleParsed entry */
export type TUuid = string

export interface IStats {
    webpackVersion: string
    rawModules: IWebpackModuleShort[]
    rawModulesCount: number
    rawUniqSrcModulesTypes: Set<string>
    excludedNodesByType: Set<string>
    excludedSrcNodes: Set<string>
    excludedDestNodes: Set<string>
    excludedSrcNodeByMaxDepsCount: Set<string>
    excludedDestNodeByMaxDepsCount: Set<string>
    emptySrcNodePaths: Set<string>
    emptyDestNodes: Set<string>
    depsSizes: string[]
}

export const STATS_EMPTY: IStats = {
    webpackVersion: '',
    rawModules: [],
    rawModulesCount: 0,
    rawUniqSrcModulesTypes: new Set(),
    excludedNodesByType: new Set(),
    excludedSrcNodes: new Set(),
    excludedDestNodes: new Set(),
    excludedSrcNodeByMaxDepsCount: new Set(),
    excludedDestNodeByMaxDepsCount: new Set(),
    emptySrcNodePaths: new Set(),
    emptyDestNodes: new Set(), // TODO add source module uuid, convert to map
    depsSizes: []
}
