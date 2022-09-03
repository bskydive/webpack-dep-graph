import { IWebpackAnalyzerContext } from "../../models/webpackAnalyzer.model"
import { resolvePathPlus, fileNameFromPath } from "../../utils/webpack"
import { v4 } from "uuid"
import { log } from "../../utils/logger"

export function createModuleNodes(context: IWebpackAnalyzerContext) {
	const { graph, webpackModules } = context
	const startTime = Date.now()

	log(`located ${webpackModules.length} modules from this build.`)

	for (const module of webpackModules) {
		const id = v4()

		const relativePath = resolvePathPlus(module.name)

		// TODO add issuerName to scope src/analyzer/analyzerUtils/dependencyMap.ts:25
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
