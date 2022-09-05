import { log, logEmpty } from "../../utils/logger"
import {
	IWebpackAnalyzerContext,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import { isIncluded, resolvePathPlus } from "../../utils/webpack"

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

/** TODO remove unnecessary re-exports extraction; webpack stats already have all data */
export function extractUsages(context: IWebpackAnalyzerContext) {
	const { webpackModules, graph } = context
	const summary = { imports: 0, exports: 0, issuers: 0 }

	log("analyzing imports and re-exports")

	const moduleTypes: string[] = getModuleTypes(webpackModules)

	for (const webpackModule of webpackModules) {
		// TODO check necessity
		// const resolvedDependents: Map<string, boolean> = new Map()

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
					includeOnly: context.includeOnly,
				})
			)

		// Use the webpack import/export reason to resolve dependency chain
		for (const reason of reasons) {
			// Remove node edge loops
			const isReasonExcluded =
				context.edgeTypeExclude.findIndex((item) =>
					reason.type.includes(item)
				) >= 0

			if (isReasonExcluded) {
				summary.exports++
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

			// TODO check necessity
			// Mark dependent as resolved, so we don't need to resolve multiple times.
			/* 			if (resolvedDependents.has(moduleName)) {
				continue
			}

			resolvedDependents.set(moduleName, true)
             */

			// Resolve the module that utilizes/consumes the current module.
			const consumerModule = graph.byRelativePath(moduleName)
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

		const issuers =
			webpackModule.reasons?.filter((issuer) =>
				isIncluded(issuer.moduleName, {
					exclude: context.exclude,
					excludeExcept: context.excludeExcept,
					includeOnly: context.includeOnly,
				})
			) ?? []

		for (const issuer of issuers) {
			const module = graph.byRelativePath(issuer.moduleName)
			if (!module) continue

			summary.issuers++
		}
	}

	log(
		`\nsummary: \n`,
		`module types: ${moduleTypes};`,
		`imports: ${summary.imports};`,
		`re-exports: ${summary.exports};`,
		`issuers: ${summary.issuers};`,
		`dependencies: ${graph.dependenciesById.size}`
	)

	return graph
}
