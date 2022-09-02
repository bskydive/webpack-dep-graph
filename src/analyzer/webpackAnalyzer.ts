import {
	IAnalyzerConfig as IDepsConfig,
	AnalyzerContext,
} from "../models/AnalyzerContext"
import { ModuleGraph } from "./analyzerUtils/ModuleGraph"
import { isIncluded, getAppRootPath } from "../utils/webpack"
import {
	IWebpackStatsV3,
	IWebpackStatsV3Module,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import { getCircularImports } from "./analyzerUtils/circular"
import { getDependencyMap } from "./analyzerUtils/dependencyMap"
import { extractUsages } from "./analyzerUtils/extractUsages"
import { createModuleNodes } from "./analyzerUtils/setupNodes"
import { log } from "../utils/logger"
import { IWebpackStatsV5 } from "../models/webpack.5.model"

export class webpackAnalyzer {
	config: IDepsConfig = depsConfig
	analyzerContext: AnalyzerContext
	modules: IWebpackStatsV3Module[] = []

	constructor(stats: IWebpackStatsV3 | IWebpackStatsV5) {
		const webpackVersion = stats?.version.split(".")[0]
		let webpackModules: IWebpackStatsV3Module[] = []

		if (webpackVersion === "3" && stats.modules instanceof Array) {
			log("Webpack version 3 detected")

			this.modules = stats.modules as IWebpackStatsV3Module[]

			webpackModules = (stats as IWebpackStatsV3).modules?.filter(
				(module: any) =>
					isIncluded(module.name, {
						exclude: depsConfig.exclude,
						excludeExcept: depsConfig.excludeExcept,
						includeOnly: depsConfig.includeOnly,
					})
			) as IWebpackStatsV3Module[]
		} else {
			throw new Error("Unknown webpack version" + stats?.version)
		}

		this.analyzerContext = {
			...this.config,
			graph: new ModuleGraph(),
			webpackModules: webpackModules,
			dependencyMap: {},
			circularImports: [],
		}
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

	analyze(): AnalyzerContext {
		const projectRoot = getAppRootPath(this.modules, {
			exclude: depsConfig.exclude,
			excludeExcept: depsConfig.excludeExcept,
			includeOnly: depsConfig.includeOnly,
		})

		if (projectRoot) this.config.projectRoot = projectRoot

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
