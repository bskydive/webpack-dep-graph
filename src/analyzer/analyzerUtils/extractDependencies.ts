import { log, logEmpty } from "../../utils/logger"
import {
	IWebpackAnalyzerContext,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import { isIncluded, resolvePathPlus } from "../../utils/webpack"
import { DependenciesGraph } from "./dependenciesGraph"

function getModuleTypes(webpackModules: IWebpackModuleShort[]): string[] {
	const reasonTypes = webpackModules
		.map((module) => module.reasons.map((reason) => reason.type))
		.flat()
		.reduce(
			(acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)),
			[]
		)

	return reasonTypes
}

export function extractDependencies(
	context: IWebpackAnalyzerContext
): DependenciesGraph {
	const { webpackModules, graph } = context
	const summary = { imports: 0 }
	const moduleTypes: string[] = getModuleTypes(webpackModules)

	for (const webpackModule of webpackModules) {
		const relativePath: string = resolvePathPlus(webpackModule.name)
		const module: IWebpackModuleParsed = graph.byRelativePath(relativePath)

		if (!module?.uuid) {
			logEmpty(
				"src/analyzer/analyzerUtils/extractDependencies.ts:38",
				module?.uuid,
				webpackModule.name
			)
			continue
		}

		if (!webpackModule?.reasons?.length) {
			continue
		}

		const reasons: IWebpackModuleReasonShort[] =
			webpackModule?.reasons?.filter((m: IWebpackModuleReasonShort) =>
				isIncluded(m.moduleName, context)
			)

		// Use the webpack import/export reason to resolve dependency chain
		for (const reason of reasons) {
			const isReasonTypeExcluded =
				context.edgeTypeExclude.findIndex((item) =>
					reason.type.includes(item)
				) >= 0

			if (isReasonTypeExcluded) {
				continue
			}

			const moduleName: string = resolvePathPlus(reason.moduleName)
			if (!moduleName) {
				logEmpty(
					"src/analyzer/analyzerUtils/extractDependencies.ts:74",
					moduleName,
					reason.moduleName
				)
				continue
			}

			const consumerModule: IWebpackModuleParsed =
				graph.byRelativePath(moduleName)
			if (!consumerModule?.uuid) {
				logEmpty(
					"src/analyzer/analyzerUtils/extractDependencies.ts:94",
					consumerModule?.uuid,
					moduleName
				)
				continue
			}

			// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
			graph.addDependenciesById(consumerModule?.uuid, module?.uuid)

			summary.imports++
		}
	}

	log(
		`\nsummary: \n`,
		`module types: ${moduleTypes};`,
		`imports: ${summary.imports};`,
		`dependencies: ${graph.dependenciesById.size}`,
		`nodesPaths: ${graph.nodeIdByRelativePath.size}`,
		`nodes: ${graph.nodesById.size}`
	)

	return graph
}
