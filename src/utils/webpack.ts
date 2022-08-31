import { logEmpty } from "./logger"
import { IWebpackStatsV5Module } from "../analyzer/models/webpack5.model"
import { IWebpackStatsV5 } from "src/analyzer/models/webpack5.model"
import { readFile } from "./files"

export const nonProjectDirs: RegExp = /cache|webpack|node_modules/
export const isAppSourcesPath = (key: string) => !nonProjectDirs.test(key)

export const resolvePathPlus = (name: string) => {
	let result = name

	if (typeof name === "string" && name.length) {
		result = name.split(" + ")[0]
	}

	logEmpty("src/analyzer/parsers/moduleParser.ts:8", name)

	return result
}

export function parseAbsolutePath(module: IWebpackStatsV5Module): string {
	let path = module.identifier?.split("!")[1] || ""

	logEmpty("src/analyzer/parsers/pathParser.ts:6", module.name)

	return path
}

export function fileNameFromPath(path: string) {
	const [name]: string[] = path.split("/").slice(-1)
	logEmpty("src/analyzer/parsers/pathParser.ts:17", path)
	return name
}

/** @deprecated TODO remove unused code */
export function getAppRootPath(modules: IWebpackStatsV5Module[]) {
	let rootPath: string = ""
	const appModule = modules.find(
		(module: IWebpackStatsV5Module) =>
			isAppSourcesPath(module.name) && /node_modules/.test(module.issuer)
	)

	if (appModule) {
		rootPath =
			appModule.issuer.split("node_modules")[0] ||
			appModule.issuer.split("node_modules")[0] ||
			""
	}

	if (!rootPath) {
		console.warn(
			"src/analyzer/parsers/projectRoot.ts:19",
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
