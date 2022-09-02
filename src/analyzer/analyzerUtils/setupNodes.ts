import { AnalyzerContext } from "../../models/AnalyzerContext"
import {
	resolvePathPlus,
	parseAbsolutePath,
	fileNameFromPath,
} from "../../utils/webpack"
import { v4 } from "uuid"
import { log } from "../../utils/logger"

export function createModuleNodes(context: AnalyzerContext) {
	const { graph, vfs, webpackModules } = context
	const startTime = Date.now()

	log(`located ${webpackModules.length} modules from this build.`)

	for (const module of webpackModules) {
		const id = v4()

		const relativePath = resolvePathPlus(module.name) // TODO add issuerName to scope
		const absolutePath = parseAbsolutePath(module)

		graph.nodeIdByRelativePath.set(relativePath, id)

		graph.nodesById.set(id, {
			uuid: id,
			webpackModuleId: module.id || -1,
			sizeInBytes: module.size || -1,
			fileName: fileNameFromPath(module.name),
			relativePath,
			absolutePath,
		})

		// Register the path with the virtual file system.
		vfs.touch(absolutePath, id)
	}

	log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

	return graph
}
