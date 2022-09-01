import {
	IAnalyzerConfig as IDepsConfig,
	AnalyzerContext,
} from "../models/AnalyzerContext"
import { ModuleGraph } from "./analyzerUtils/ModuleGraph"
import { isIncluded, getAppRootPath } from "../utils/webpack"
import { VirtualFS } from "../utils/virtualFS"
import {
	IWebpackStatsV5,
	IWebpackStatsV5Module,
} from "../models/webpack5.model"
import {
	getDependencyMap,
	createModuleNodes,
	extractUsages,
	getCircularImports,
} from "./analyzerUtils/index"
import { depsConfig } from "../../deps.config"

export class Analyzer {
	stat: IWebpackStatsV5
	config: IDepsConfig = depsConfig
	analyzerContext: AnalyzerContext

	constructor(stat: IWebpackStatsV5) {
		this.stat = stat
		this.analyzerContext = {
			...this.config,
			vfs: new VirtualFS(),
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
			issuedBy: this.analyzerContext.graph.issuedBy.size,
			exportedBy: this.analyzerContext.graph.exportedBy.size,
			nodeIdByRelativePath:
				this.analyzerContext.graph.nodeIdByRelativePath.size,
			nodesById: this.analyzerContext.graph.nodesById.size,
		}
	}

	analyze(): AnalyzerContext {
		console.log("src/analyzer/Analyzer.ts:55", this.stat.modules.length)

		const projectRoot = getAppRootPath(this.stat.modules, {
			exclude: depsConfig.exclude,
			excludeExcept: depsConfig.excludeExcept,
			includeOnly: depsConfig.includeOnly,
		})

		if (projectRoot) this.config.projectRoot = projectRoot

		console.log("src/analyzer/Analyzer.ts:65", this.getStatCount())

		this.analyzerContext.graph = createModuleNodes(this.analyzerContext)
		console.log("src/analyzer/Analyzer.ts:68", this.getStatCount())

		this.analyzerContext.graph = extractUsages(this.analyzerContext)
		console.log("src/analyzer/Analyzer.ts:71", this.getStatCount())

		this.analyzerContext.dependencyMap = getDependencyMap(
			this.analyzerContext.graph
		)
		this.analyzerContext.circularImports = getCircularImports(
			this.analyzerContext.dependencyMap
		)

		return this.analyzerContext
	}
}
