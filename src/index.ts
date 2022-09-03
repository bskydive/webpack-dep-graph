import { webpackAnalyzer } from "./analyzer/webpackAnalyzer"
import {
	IWebpackAnalyzerContext,
	IWebpackAnalyzerConfig,
	IGraphvizRenderOpts,
} from "./models/webpackAnalyzer.model"
import {
	createDotGraph,
	saveGraphvizRendered,
	saveSimplifiedDot,
} from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import { parseEdgeDefinitions, saveCytoscape } from "./utils/cytoscape"
// import { writeFile } from "./utils/files"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { depsConfig } from "../deps.config"
import { log } from "./utils/logger"

function main() {
	let analyzerContext: IWebpackAnalyzerContext
	const config: IWebpackAnalyzerConfig = depsConfig
	const statFileName = process?.argv[2] || config.webpackStatsFileName
	log("loading ${statFileName}")

	const grapml = loadGraphml("./src/models/graphml.3.22.stub.graphml") // for testing lib save
	const webpackStat = loadWebpackStat(statFileName)
    
	if (webpackStat?.version) {
		const analyzer = new webpackAnalyzer(webpackStat)
		analyzerContext = analyzer.analyze()

		log("calculations start")
		const dotGraph = createDotGraph(analyzerContext.dependencyMap)
		const cytoscapeGraph = parseEdgeDefinitions(
			analyzerContext.dependencyMap
		)

		if (config.testGraphml) {
			saveGraphml("test_save.graphml", grapml)
		}

		if (config.depsJson) {
			saveCytoscape("./graph-output/deps.json", analyzerContext.dependencyMap)
		}

		if (config.graphmlDeps) {
			saveGraphmlFromDot(analyzerContext.dependencyMap, "./graph-output/deps.graphml")
		}

		if (config.circularDepsJson) {
			saveCytoscape("./graph-output/circular.json", analyzerContext.circularImports)
		}

		if (config.cytoscapeJson) {
			saveCytoscape("./graph-output/cytoscape.json", cytoscapeGraph)
		}

		if (config.simplifiedDot) {
			saveSimplifiedDot(dotGraph, "./graph-output/graph_simplified.dot")
		}

		log("heavy calculations start")

		for (const [key, value] of Object.entries(config.graphviz)) {
			if (value?.enabled) {
				saveGraphvizRendered({
					graph: dotGraph,
					engine: value?.engine,
                    type: value?.type,
					fileName: value?.fileName,
				})
			}
		}
	}
}

main()
