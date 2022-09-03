import {
	IWebpackAnalyzerConfig as IDepsConfig,
	IWebpackAnalyzerContext,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../models/webpackAnalyzer.model"
import { ModuleGraph } from "./analyzerUtils/ModuleGraph"
import { isIncluded } from "../utils/webpack"
import {
	IWebpackStatsV3,
	IWebpackStatsV3Module,
	IWebpackStatsV3Reason,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import { getCircularImports } from "./analyzerUtils/circular"
import { getDependencyMap } from "./analyzerUtils/dependencyMap"
import { extractUsages } from "./analyzerUtils/extractUsages"
import { createModuleNodes } from "./analyzerUtils/setupNodes"
import { log } from "../utils/logger"
import {
	IWebpackStatsV5,
	IWebpackStatsV5Module,
	IWebpackStatsV5Reason,
} from "../models/webpack.5.model"

export class webpackAnalyzer {
	config: IDepsConfig = depsConfig
	analyzerContext: IWebpackAnalyzerContext
	modules: IWebpackModuleShort[] = []

	constructor(stats: IWebpackStatsV3 | IWebpackStatsV5) {
		const webpackVersion = stats?.version.split(".")[0]
		let webpackModules: IWebpackModuleShort[] = []

		if (webpackVersion === "3" && stats.modules instanceof Array) {
			log("Webpack version 3 detected")

			this.modules = this.parseWebpackModuleShort(stats.modules)

			webpackModules = this.modules?.filter((module: any) =>
				isIncluded(module.name, {
					exclude: depsConfig.exclude,
					excludeExcept: depsConfig.excludeExcept,
					includeOnly: depsConfig.includeOnly,
				})
			)
		} else {
			throw new Error("Unknown webpack version: " + stats?.version)
		}

		this.analyzerContext = {
			...this.config,
			graph: new ModuleGraph(),
			webpackModules: webpackModules,
			dependencyMap: {},
			circularImports: [],
		}
	}

	parseWebpackModuleShort(
		modules: IWebpackStatsV3Module[] | IWebpackStatsV5Module[]
	): IWebpackModuleShort[] {
		const result = modules.map((module) => ({
			size: module.size,
			name: module.name,
			issuerName: module.issuerName,
			identifier: module.identifier,
			id: String(module.id),
			reasons: this.parseWebpackModuleReasonsShort(module.reasons),
		}))

		return result
	}

	parseWebpackModuleReasonsShort(
		reason: IWebpackStatsV3Reason[] | IWebpackStatsV5Reason[]
	): IWebpackModuleReasonShort[] {
		const result = reason.map((module) => {
			return {
				moduleIdentifier: module.moduleIdentifier,
				module: module.module,
				moduleName: module.moduleName,
				type: module.type,
			}
		})

		return result
	}

	getWebpackVersion(stat: IWebpackStatsV5 | IWebpackStatsV3): string {
		return stat?.version.split(".")[0]
	}

	getStatCount() {
		return {
			dependenciesById: this.analyzerContext.graph.dependenciesById.size,
			nodeIdByRelativePath:
				this.analyzerContext.graph.nodeIdByRelativePath.size,
			nodesById: this.analyzerContext.graph.nodesById.size,
		}
	}

	analyze(): IWebpackAnalyzerContext {
		log(`\n modules to parse: `, this.modules.length, `\n`)

		this.analyzerContext.graph = createModuleNodes(this.analyzerContext)
		log(`\n nodes created: \n`, this.getStatCount(), `\n`)

		this.analyzerContext.graph = extractUsages(this.analyzerContext)
		log(`\n usages extracted: \n`, this.getStatCount(), `\n`)

		this.analyzerContext.dependencyMap = getDependencyMap(
			this.analyzerContext.graph
		)
		this.analyzerContext.circularImports = getCircularImports(
			this.analyzerContext.dependencyMap
		)

		return this.analyzerContext
	}
}
