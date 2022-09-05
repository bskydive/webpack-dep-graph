import { log, logEmpty } from "../../utils/logger"
import {
	IWebpackAnalyzerContext,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import { isIncluded, resolvePathPlus } from "../../utils/webpack"
import { ModuleGraph } from "./ModuleGraph"

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

/** @deprecated TODO move statistics to post processing at getDependencyMap */
function parsedIssuersCount(
	reasons: IWebpackModuleReasonShort[],
	context: IWebpackAnalyzerContext,
	graph: ModuleGraph
): number {
	let issuerCount = 0

	const issuers =
		reasons?.filter((issuer) =>
			isIncluded(issuer.moduleName, {
				exclude: context.exclude,
				excludeExcept: context.excludeExcept,
				includeOnly: context.includeOnlyDestNode,
			})
		) ?? []

	for (const issuer of issuers) {
		const module = graph.byRelativePath(issuer.moduleName)
		if (!module) continue

		issuerCount++
	}

	return issuerCount
}

export function extractDependencies(context: IWebpackAnalyzerContext) {
	const { webpackModules, graph } = context
	const summary = { imports: 0, issuers: 0 }
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
				isIncluded(m.moduleName, {
					exclude: context.exclude,
					excludeExcept: context.excludeExcept,
					includeOnly: context.includeOnlySrcNode,
				})
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

			const consumerModule: IWebpackModuleParsed = graph.byRelativePath(moduleName)
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

		summary.issuers += parsedIssuersCount(
			webpackModule?.reasons,
			context,
			graph
		)
	}

	log(
		`\nsummary: \n`,
		`module types: ${moduleTypes};`,
		`imports: ${summary.imports};`,
		`issuers: ${summary.issuers};`,
		`dependencies: ${graph.dependenciesById.size}`
	)

	return graph
}
