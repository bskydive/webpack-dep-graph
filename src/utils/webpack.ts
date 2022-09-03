import { logEmpty } from "./logger"
import { IWebpackStatsV3Module } from "../models/webpack.3.model"
import { IWebpackStatsV3 } from "src/models/webpack.3.model"
import { readFile } from "./files"
import { IWebpackStatsV5 } from "../models/webpack.5.model"
import { IWebpackModuleShort } from "src/models/webpackAnalyzer.model"

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
		regExpExclude = new RegExp(`${opts.exclude.join("|")}`)
	}

	if (opts.excludeExcept.length) {
		regExpExcludeExcept = new RegExp(`${opts.excludeExcept.join("|")}`)
	}

	if (opts.includeOnly.length) {
		regExpIncludeOnly = new RegExp(`${opts.includeOnly.join("|")}`)
		result = regExpIncludeOnly.test(text)
	} else {
		result = regExpExcludeExcept?.test(text) || !regExpExclude?.test(text)
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

export function parseAbsolutePath(module: IWebpackModuleShort): string {
	let path = module.identifier?.split("!")[1] || ""

	logEmpty("src/utils/webpack.ts:24", module.name)

	return path
}

export function fileNameFromPath(path: string) {
	const [name]: string[] = path.split("/").slice(-1)
	logEmpty("src/utils/webpack.ts:31", path)
	return name
}

export function loadWebpackStat(
	fileName: string
): IWebpackStatsV3 | IWebpackStatsV5 {
	const statString = readFile(fileName)

	const stat: IWebpackStatsV3 = JSON.parse(statString)

	return stat
}
