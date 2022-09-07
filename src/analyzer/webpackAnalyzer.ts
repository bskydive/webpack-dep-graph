import {
	IWebpackAnalyzerConfig as IDepsConfig,
	IWebpackAnalyzerConfig,
	IWebpackAnalyzerContext,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../models/webpackAnalyzer.model"
import { DependenciesGraph } from "./analyzerUtils/dependenciesGraph"
import { isIncluded } from "../utils/webpack"
import {
	IWebpackStatsV3,
	IWebpackStatsV3Chunk,
	IWebpackStatsV3Module,
	IWebpackStatsV3Reason,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import { getCircularImports } from "./analyzerUtils/circular"
import { getDependencyMap } from "./analyzerUtils/dependencyMap"
import { extractDependencies } from "./analyzerUtils/extractDependencies"
import { createGraphNodes } from "./analyzerUtils/graphNodes"
import { log } from "../utils/logger"
import {
	IWebpackStatsV5,
	IWebpackStatsV5Chunk,
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

		if (webpackVersion === "3" || webpackVersion === "5") {
			this.modules = this.parseWebpackModules(stats.modules)

			if (!this?.modules?.length) {
				this.modules = this.parseWebpackChunks(stats.chunks)
			}

			webpackModules = this.modules?.filter((module: any) =>
				isIncluded(module.name, depsConfig)
			)
		} else {
			throw new Error("Unknown webpack version: " + stats?.version)
		}

		this.analyzerContext = {
			...this.config,
			graph: new DependenciesGraph(),
			webpackModules: webpackModules,
			dependencyMap: {},
			circularImports: [],
		}
	}

	parseWebpackChunks(
		chunks: IWebpackStatsV3Chunk[] | IWebpackStatsV5Chunk[]
	): IWebpackModuleShort[] {
		const result = chunks
			.map((chunk) => chunk?.modules)
			.flat()
			.map((module) => ({
				size: module.size,
				name: module.name,
				issuerName: module.issuerName,
				identifier: module.identifier,
				id: String(module.id),
				reasons: this.parseWebpackModuleReasonsShort(module.reasons),
			}))

		return result
	}

	parseWebpackModules(
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

	analyze(config: IWebpackAnalyzerConfig): IWebpackAnalyzerContext {
		log(`\n modules to parse: `, this.modules.length, `\n`)
		let [nodeIdByRelativePath, nodesById] = createGraphNodes(this.analyzerContext)

        this.analyzerContext.graph.nodeIdByRelativePath = nodeIdByRelativePath
        this.analyzerContext.graph.nodesById = nodesById

		this.analyzerContext.graph = extractDependencies(this.analyzerContext)

		this.analyzerContext.dependencyMap = getDependencyMap(
			this.analyzerContext.graph,
			config
		)

		this.analyzerContext.circularImports = getCircularImports(
			this.analyzerContext.dependencyMap
		)

		return this.analyzerContext
	}
}
