
/** https://webpack.js.org/api/stats */
export interface IWebpackStatsV3 {
	errors: any[]
	warnings: string[]
	version: string
	hash: string
	time: number
	publicPath: string
	assetsByChunkName: AssetsByChunkName
	assets: Asset[]
	filteredAssets: number
	entrypoints: Entrypoints
	chunks: IWebpackStatsV3Chunk[]
	modules: IWebpackStatsV3Module[]
	filteredModules: number
	children: any[]
}

export interface IWebpackStatsV3Module {
	id: number
	identifier: string
	name: string
	index: number
	index2: number
	size: number
	cacheable: boolean
	built: boolean
	optional: boolean
	prefetched: boolean
	chunks: number[]
	assets: any[]
	issuer?: string
	issuerId?: number
	issuerName?: string
	failed: boolean
	errors: number
	warnings: number
	reasons: IWebpackStatsV3Reason[]
	usedExports: string[] | any[] | boolean
	providedExports?: string[]
	optimizationBailout: string[]
	depth: number
	source?: string
	issuerPath?: string
}

export interface IWebpackStatsV3Chunk {
	id: number
	rendered: boolean
	initial: boolean
	entry: boolean
	extraAsync: boolean
	size: number
	names: string[]
	files: string[]
	hash: string
	parents: number[]
	modules: IWebpackStatsV3ChunkModule[]
	filteredModules: number
	origins: (Origin | Origins2)[]
}

interface Origins2 {
	moduleId?: any
	module: string
	moduleIdentifier: string
	moduleName: string
	loc: string
	name: string
	reasons: any[]
}

interface Origin {
	moduleId: number
	module: string
	moduleIdentifier: string
	moduleName: string
	loc: string
	name?: any
	reasons: any[]
}

interface IWebpackStatsV3ChunkModule {
	id: number
	identifier: string
	name: string
	index: number
	index2: number
	size: number
	cacheable: boolean
	built: boolean
	optional: boolean
	prefetched: boolean
	chunks: number[]
	assets: any[]
	issuer?: string
	issuerId?: number
	issuerName?: string
	failed: boolean
	errors: number
	warnings: number
	reasons: IWebpackStatsV3Reason[]
	usedExports: string[] | string[] | any[] | boolean | boolean | boolean
	providedExports: (string[] | string[] | null | string)[]
	optimizationBailout: (string | string)[]
	depth: number
	source?: string
}

export type TWebpackStatsV3ReasonType =
	| "harmony import"
	| "cjs require"
	| "import() context lazy"
	| "context element"
	| "amd require"
	| "cjs require context"
	| "import()"
	| "export imported specifier"

export interface IWebpackStatsV3Reason {
	moduleId: number
	moduleIdentifier: string
	module: string
	moduleName: string
	type: TWebpackStatsV3ReasonType
	userRequest: string
	loc: string
	resolvedModulePath?: string
}

interface Entrypoints {
	main: Main
}

interface Main {
	chunks: number[]
	assets: string[]
	isOverSizeLimit: boolean
}

interface Asset {
	name: string
	size: number
	chunks: number[]
	chunkNames: string[]
	emitted: boolean
	isOverSizeLimit?: boolean
}

interface AssetsByChunkName {
	main: string[]
	vendor: string[]
}
