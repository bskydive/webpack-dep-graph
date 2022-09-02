import { log, logEmpty } from "../../utils/logger"
import { AnalyzerContext } from "../../models/AnalyzerContext"
import {
	IWebpackStatsV5Module,
	IWebpackStatsV5Reason,
} from "../../models/webpack5.model"

import { isIncluded, resolvePathPlus } from "../../utils/webpack"
import { IWebpackModuleParsed } from "src/models/webpackAnalyzer.model"

function getModuleTypes(webpackModules: IWebpackStatsV5Module[]) {
	const reasonTypes = webpackModules
		.map((m) => m.reasons.map((r) => r.type))
		.flat()
		.reduce(
			(acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)),
			[]
		)

	return reasonTypes
}

/** TODO remove unnecessary re-exports extraction; webpack stats already have all data */
export function extractUsages(context: AnalyzerContext) {
	const { webpackModules, graph, printImportAnalysis = false } = context
	const summary = { imports: 0, exports: 0, issuers: 0 }

	log("analyzing imports and re-exports")

	const moduleTypes = getModuleTypes(webpackModules)

	const resolvedModules: IWebpackStatsV5Module[] = webpackModules.map(
		(item) => {
			if (item?.issuerName?.includes("providers.module.ts")) {
				log("src/analyzer/analyzerUtils/extractUsages.ts:33",item.name)
			}

			return {
				...item,
				issuerPath: item.issuerName,
				reasons: item.reasons.map((item) => ({
					...item,
					resolvedModulePath: resolvePathPlus(item.moduleName),
				})),
			}
		}
	)

	for (const webpackModule of resolvedModules) {
		const resolvedDependents: Map<string, boolean> = new Map()

		const relativePath: string = resolvePathPlus(webpackModule.name)

		const module: IWebpackModuleParsed = graph.byRelativePath(relativePath)
		if (!module?.uuid) {
			logEmpty(
				"src/analyzer/analyzerUtils/extractUsages.ts:52",
				module?.uuid,
				webpackModule
			)
		}

		if (!(webpackModule?.reasons instanceof Array)) {
			continue
		}

		const reasons: Partial<IWebpackStatsV5Reason>[] =
			webpackModule?.reasons?.filter((m: IWebpackStatsV5Reason) =>
				isIncluded(m.resolvedModulePath, {
					exclude: context.exclude,
					excludeExcept: context.excludeExcept,
					includeOnly: context.includeOnly,
				})
			)

		// Use the webpack import/export reason to resolve dependency chain
		for (const reason of reasons) {
			// Ignore side effect evaluation.
			if (reason.type.includes("side effect")) {
				// console.log(
				// 	"src/analyzer/analyzerUtils/extractUsages.ts:71",
				// 	reason.type
				// )
				continue
			}

			const moduleName = resolvePathPlus(reason.resolvedModulePath)

			// Mark dependent as resolved, so we don't need to resolve multiple times.
			if (resolvedDependents.has(moduleName)) {
				continue
			}

			resolvedDependents.set(moduleName, true)

			// Resolve the module that utilizes/consumes the current module.
			const consumerModule = graph.byRelativePath(moduleName)
			if (!consumerModule) {
				continue
			}

			// Detect if the module is a being re-exported.
			const isExport = reason.type.includes("export imported specifier")

			if (isExport) {
				// log(`  re-exported by ${consumerModule}`)
				summary.exports++
				continue
			}

			graph.addDependenciesById(consumerModule.uuid, module.uuid)

			// log(`imported by ${consumerModule}`)
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

			// report(gray(`  issued by ${module.absolutePath}`))
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
