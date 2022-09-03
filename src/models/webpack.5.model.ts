export interface IWebpackStatsV5 {
	hash: string
	version: string
	time: number
	builtAt: number
	publicPath: string
	outputPath: string
	assetsByChunkName: AssetsByChunkName
	assets: Asset[]
	chunks: IWebpackStatsV5Chunk[]
	modules: IWebpackStatsV5Module[]
	entrypoints: Entrypoints
	namedChunkGroups: Entrypoints
	errors: any[]
	errorsCount: number
	warnings: any[]
	warningsCount: number
	children: any[]
}

interface Entrypoints {
	main: Main
}

interface Main {
	name: string
	chunks: string[]
	assets: Asset2[]
	filteredAssets: number
	assetsSize: number
	auxiliaryAssets: any[]
	filteredAuxiliaryAssets: number
	auxiliaryAssetsSize: number
	children: Related
	childAssets: Related
	isOverSizeLimit: boolean
}

interface Asset2 {
	name: string
	size: number
}

export interface IWebpackStatsV5Module {
	type: string
	moduleType: string
	layer?: any
	size: number
	sizes: Sizes2
	built: boolean
	codeGenerated: boolean
	buildTimeExecuted: boolean
	cached: boolean
	identifier: string
	name: string
	nameForCondition?: string
	index?: number
	preOrderIndex?: number
	index2?: number
	postOrderIndex?: number
	cacheable?: boolean
	optional: boolean
	orphan: boolean
	issuer?: string
	issuerName?: string
	issuerPath?: IssuerPath[]
	failed: boolean
	errors: number
	warnings: number
	profile?: Profile
	id: string
	issuerId?: string
	chunks: string[]
	assets: any[]
	reasons: IWebpackStatsV5Reason[]
	usedExports?: any
	providedExports?: string[]
	optimizationBailout: string[]
	depth?: number
}

export interface IWebpackStatsV5Chunk {
	rendered: boolean
	initial: boolean
	entry: boolean
	recorded: boolean
	size: number
	sizes: Sizes
	names: string[]
	idHints: any[]
	runtime: string[]
	files: string[]
	auxiliaryFiles: any[]
	hash: string
	childrenByOrder: Related
	id: string
	siblings: any[]
	parents: any[]
	children: any[]
	modules: IWebpackStatsV5ChunkModule[]
	origins: Origin[]
}

interface Origin {
	module: string
	moduleIdentifier: string
	moduleName: string
	loc: string
	request: string
}

interface IWebpackStatsV5ChunkModule {
	type: string
	moduleType: string
	layer?: any
	size: number
	sizes: Sizes2
	built: boolean
	codeGenerated: boolean
	buildTimeExecuted: boolean
	cached: boolean
	identifier: string
	name: string
	nameForCondition?: string
	index?: number
	preOrderIndex?: number
	index2?: number
	postOrderIndex?: number
	cacheable?: boolean
	optional: boolean
	orphan: boolean
	dependent: boolean
	issuer?: string
	issuerName?: string
	issuerPath?: IssuerPath[]
	failed: boolean
	errors: number
	warnings: number
	profile?: Profile
	id: string
	issuerId?: string
	chunks: string[]
	assets: any[]
	reasons: IWebpackStatsV5Reason[]
	usedExports?: any
	providedExports?: string[]
	optimizationBailout: string[]
	depth?: number
}

export interface IWebpackStatsV5Reason {
	moduleIdentifier?: string
	module?: string
	moduleName?: string
	resolvedModuleIdentifier?: string
	resolvedModule?: string
	type: string
	active: boolean
	explanation: string
	userRequest?: string
	loc: string
	moduleId?: string
	resolvedModuleId?: string
}

interface IssuerPath {
	identifier: string
	name: string
	profile: Profile
	id: string
}

interface Profile {
	total: number
	resolving: number
	restoring: number
	building: number
	integration: number
	storing: number
	additionalResolving: number
	additionalIntegration: number
	factory: number
	dependencies: number
}

interface Sizes2 {
	javascript?: number
	runtime?: number
}

interface Sizes {
	javascript: number
	runtime: number
}

interface Asset {
	type: string
	name: string
	size: number
	emitted: boolean
	comparedForEmit: boolean
	cached: boolean
	info: Info
	chunkNames: string[]
	chunkIdHints: any[]
	auxiliaryChunkNames: any[]
	auxiliaryChunkIdHints: any[]
	related: Related
	chunks: string[]
	auxiliaryChunks: any[]
	isOverSizeLimit: boolean
}

interface Related {}

interface Info {
	javascriptModule: boolean
	size: number
}

interface AssetsByChunkName {
	main: string[]
}
