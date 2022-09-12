import { log } from "../../utils/logger"
import {
	IWebpackAnalyzerConfigFilters,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"
import { isIncluded, resolvePathPlus } from "../../utils/webpack"
import { DependenciesUUIDMap } from "./dependenciesUUIDMap"
import { depsConfig } from "../../../deps.config"

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

function isReasonExcluded(
	filters: IWebpackAnalyzerConfigFilters,
	reasonType: string
): boolean {
	return (
		filters.edgeTypeExclude.findIndex((item) =>
			reasonType.includes(item)
		) >= 0
	)
}

/** @deprecated TODO make stateless */
function isEmptyData(
	uuid: string,
	reasons: IWebpackModuleReasonShort[],
	stats: {
		emptyUUID: number
		emptyReasons: number
	}
): boolean {
	if (!uuid) {
		stats.emptyUUID++
	}
	if (!reasons?.length) {
		stats.emptyReasons++
	}
	return !uuid || !reasons?.length
}

/** @deprecated TODO move to DependenciesUUIDMap.addDependenciesById */
export function filterDependencies(
	graph: DependenciesUUIDMap
): DependenciesUUIDMap {
	let relativePath: string
	let module: IWebpackModuleParsed
	/** dependencies, source */
	let reasons: IWebpackModuleReasonShort[] = []
	let moduleName: string
	/** node, consumer */
	let destModule: IWebpackModuleParsed
	let stats = {
		emptyUUID: 0,
		emptyReasons: 0,
	}

	const moduleTypes: string[] = getModuleTypes(graph.modules)

	for (const webpackModule of graph.modules) {
		relativePath = resolvePathPlus(webpackModule.name)
		module = graph.byRelativePath(relativePath)

		if (isEmptyData(module?.uuid, webpackModule?.reasons, stats)) {
			// log("Empty parsed module", { name: webpackModule.name })
			continue
		}

		// exclude & excludeExcept filter options applied
		reasons = webpackModule?.reasons?.filter(
			(m: IWebpackModuleReasonShort) =>
				isIncluded(m.moduleName, depsConfig.filters)
		)

		for (const reason of reasons) {
			if (isReasonExcluded(depsConfig.filters, reason.type)) {
				continue
			}

			moduleName = resolvePathPlus(reason.moduleName)

			if (!moduleName) {
				log("Empty reason", {
					uuid: module?.uuid,
					reason: reason.moduleName,
				})
				continue
			}

			destModule = graph.byRelativePath(moduleName)

			if (!destModule?.uuid) {
				log("Empty destination", {
					name: moduleName,
				})
				continue
			}

			// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
			graph.addDependenciesById(destModule?.uuid, module?.uuid)
		}
	}

	log(
		`\nsummary: \n`,
		`raw modules: ${graph.modules.length}`,
		`raw module types: ${moduleTypes};`,
		`filtered module uuid: ${stats.emptyUUID}`,
		`filtered module reasons: ${stats.emptyUUID}`,
		`dependencies: ${graph.dependenciesListByUUID.size}`,
		`nodesPaths: ${graph.UUIDByRelativePath.size}`,
		`nodes: ${graph.modulesByUUID.size}`
	)

	return graph
}
