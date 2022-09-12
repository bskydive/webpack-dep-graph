import {
	IDependencyMap,
	IWebpackAnalyzerConfig as IDepsConfig,
	IWebpackAnalyzerConfig,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../models/webpackAnalyzer.model"
import { DependenciesUUIDMap } from "./analyzerUtils/dependenciesUUIDMap"
import { isIncluded } from "../utils/webpack"
import {
	IWebpackStatsV3,
	IWebpackStatsV3Chunk,
	IWebpackStatsV3Module,
	IWebpackStatsV3Reason,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import { getDependenciesMap } from "./analyzerUtils/dependenciesMap"
import { filterDependencies } from "./analyzerUtils/filterDependencies"
import { log } from "../utils/logger"
import {
	IWebpackStatsV5,
	IWebpackStatsV5Chunk,
	IWebpackStatsV5Module,
	IWebpackStatsV5Reason,
} from "../models/webpack.5.model"

export class WebpackAnalyzer {
	config: IDepsConfig = depsConfig
	graph: DependenciesUUIDMap
	modules: IWebpackModuleShort[]
	dependencyMap: IDependencyMap = {}
	circularImports: string[][] = []

	constructor(stats: IWebpackStatsV3 | IWebpackStatsV5) {
		const webpackVersion = stats?.version.split(".")[0]
		let webpackModules: IWebpackModuleShort[] = []

		if (webpackVersion === "3" || webpackVersion === "5") {
			this.modules = this.parseWebpackModules(stats.modules)

			if (!this?.modules?.length) {
				this.modules = this.parseWebpackChunks(stats.chunks)
			}

			webpackModules = this.modules?.filter((module: any) =>
				isIncluded(module.name, depsConfig.filters)
			)
		} else {
			throw new Error("Unknown webpack version: " + stats?.version)
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

	analyze(config: IWebpackAnalyzerConfig): IDependencyMap {
		log(`\n modules to parse: `, this.modules.length, `\n`)

		this.graph = new DependenciesUUIDMap(this.modules)

		this.graph = filterDependencies(this.graph)

		this.dependencyMap = getDependenciesMap(this.graph, config)

		return this.dependencyMap
	}
}
