import {
	IWebpackModuleParsed,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import {
	resolvePathPlus,
	fileNameFromPath,
	isIncluded,
} from "../../utils/webpack"
import { v4 } from "uuid"
import { log } from "../../utils/logger"
import { depsConfig } from "../../../deps.config"

export function createGraphNodes(
	modules: IWebpackModuleShort[]
): [Map<string, string>, Map<string, IWebpackModuleParsed>] {
	let nodeIdByRelativePath: Map<string, string> = new Map()
	let nodesById: Map<string, IWebpackModuleParsed> = new Map()
	const startTime = Date.now()
	const webpackModules = modules?.filter((m: IWebpackModuleShort) =>
		isIncluded(m.name, depsConfig.filters)
	)

	log(`located ${webpackModules.length} modules from this build.`)

	for (const module of webpackModules) {
		const id = v4()

		const relativePath = resolvePathPlus(module.name)

		nodeIdByRelativePath.set(relativePath, id)

		nodesById.set(id, {
			uuid: id,
			sizeInBytes: module.size || -1,
			fileName: fileNameFromPath(module.name),
			relativePath,
		})
	}

	log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

	return [nodeIdByRelativePath, nodesById]
}
