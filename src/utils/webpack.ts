import { logEmpty } from "./logger"
import { IWebpackStatsV5Module } from "../models/webpack5.model"
import { IWebpackStatsV5 } from "src/models/webpack5.model"
import { readFile } from "./files"

export interface IIncludedOptions {
	exclude: string[]
	excludeExcept: string[]
	includeOnly: string[]
}

export function isIncluded(text: string, opts: IIncludedOptions): boolean {
	let regExpExclude: RegExp = null
	let regExpExcludeExcept: RegExp = null
	let regExpIncludeOnly: RegExp = null
	let result: boolean = false

	if (opts.exclude.length) {
		regExpExclude = new RegExp(`/${opts.exclude.join("|")}/`)
	}

	if (opts.excludeExcept.length) {
		regExpExcludeExcept = new RegExp(`/${opts.excludeExcept.join("|")}/`)
	}

	if (opts.includeOnly.length) {
		regExpIncludeOnly = new RegExp(`/${opts.includeOnly.concat("|")}/`)
		result = regExpIncludeOnly.test(text)
	} else {
		result = !regExpExclude?.test(text) || regExpExcludeExcept?.test(text)
	}

	return result
}

export const resolvePathPlus = (name: string) => {
	let result = name

	if (typeof name === "string" && name.length) {
		result = name.split(" + ")[0]
	}

	logEmpty("src/utils/webpack.ts:16", name)

	return result
}

export function parseAbsolutePath(module: IWebpackStatsV5Module): string {
	let path = module.identifier?.split("!")[1] || ""

	logEmpty("src/utils/webpack.ts:24", module.name)

	return path
}

export function fileNameFromPath(path: string) {
	const [name]: string[] = path.split("/").slice(-1)
	logEmpty("src/utils/webpack.ts:31", path)
	return name
}

/** @deprecated TODO refactor to use without rootPath */
export function getAppRootPath(
	modules: IWebpackStatsV5Module[],
	opts: IIncludedOptions
) {
	let rootPath: string = ""
	const appModule = modules.find(
		(module: IWebpackStatsV5Module) =>
			isIncluded(module.name, opts) && /node_modules/.test(module.issuer)
	)

	if (appModule) {
		rootPath =
			appModule.issuer.split("node_modules")[0] ||
			appModule.issuer.split("node_modules")[0] ||
			""
	}

	if (!rootPath) {
		console.warn(
			"src/utils/webpack.ts:52",
			"EMPTY app root path!",
			appModule.name
		)
	}

	return rootPath
}

export function loadWebpackStat(fileName: string): IWebpackStatsV5 {
	const statString = readFile(fileName)

	const stat: IWebpackStatsV5 = JSON.parse(statString)

	return stat
}
