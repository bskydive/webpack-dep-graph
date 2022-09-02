export const EMPTY_MODULE_PARSED: IWebpackModuleParsed = {
    uuid: '',
	fileName: '',
	relativePath: '',
	absolutePath: ''
}

export interface IWebpackModuleParsed {
	uuid: string
	webpackModuleId?: number // TODO @deprecated remove or implement file size visualizer
	sizeInBytes?: number // TODO @deprecated remove or implement file size visualizer
	fileName: string
	relativePath: string
	absolutePath: string
}

/** @deprecated TODO remove or reuse legacy code */
export interface WebpackReason {
	moduleIdentifier: string
	module: string
	moduleName: string
	resolvedModuleIdentifier: string
	resolvedModule: string
	type: string
	active: boolean
	explanation: string
	userRequest: string
	loc: string
	moduleId: string | null
	resolvedModuleId: string | null
}

