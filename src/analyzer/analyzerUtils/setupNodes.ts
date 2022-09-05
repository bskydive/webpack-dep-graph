import {
	IWebpackAnalyzerContext,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import {
	resolvePathPlus,
	fileNameFromPath,
	isIncluded,
} from "../../utils/webpack"
import { v4 } from "uuid"
import { log } from "../../utils/logger"

export function createModuleNodes(context: IWebpackAnalyzerContext) {
	const graph = context.graph
	const startTime = Date.now()
	const webpackModules = context.webpackModules?.filter(
		(m: IWebpackModuleShort) =>
			isIncluded(m.name, {
				exclude: context.exclude,
				excludeExcept: context.excludeExcept,
				includeOnly: context.includeOnlyDestNode,
			})
	)

	log(`located ${webpackModules.length} modules from this build.`)

	for (const module of webpackModules) {
		const id = v4()

		const relativePath = resolvePathPlus(module.name)

		graph.nodeIdByRelativePath.set(relativePath, id)

		graph.nodesById.set(id, {
			uuid: id,
			sizeInBytes: module.size || -1,
			fileName: fileNameFromPath(module.name),
			relativePath,
		})
	}

	log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

	return graph
}
