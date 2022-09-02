import {
	IAnalyzerConfig as IDepsConfig,
	AnalyzerContext,
} from "../models/AnalyzerContext"
import { ModuleGraph } from "./analyzerUtils/ModuleGraph"
import { isIncluded, getAppRootPath } from "../utils/webpack"
import { IWebpackStatsV5 } from "../models/webpack5.model"
import { depsConfig } from "../../deps.config"
import { getCircularImports } from "./analyzerUtils/circular"
import { getDependencyMap } from "./analyzerUtils/dependencyMap"
import { extractUsages } from "./analyzerUtils/extractUsages"
import { createModuleNodes } from "./analyzerUtils/setupNodes"
import { log } from "../utils/logger"

export class webpackAnalyzer {
	stat: IWebpackStatsV5
	config: IDepsConfig = depsConfig
	analyzerContext: AnalyzerContext

	constructor(stat: IWebpackStatsV5) {
		this.stat = stat
		this.analyzerContext = {
			...this.config,
			graph: new ModuleGraph(),
			webpackModules: this.stat.modules.filter((m) =>
				isIncluded(m.name, {
					exclude: depsConfig.exclude,
					excludeExcept: depsConfig.excludeExcept,
					includeOnly: depsConfig.includeOnly,
				})
			),
			dependencyMap: {},
			circularImports: [],
		}
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
		const projectRoot = getAppRootPath(this.stat.modules, {
			exclude: depsConfig.exclude,
			excludeExcept: depsConfig.excludeExcept,
			includeOnly: depsConfig.includeOnly,
		})

		if (projectRoot) this.config.projectRoot = projectRoot

		log(`\n modules to parse: `, this.stat.modules.length, `\n`)

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
