import { Analyzer } from "./analyzer/Analyzer"
import {
	AnalyzerContext,
	IAnalyzerConfig,
	IGraphvizRenderOpts,
} from "./models/AnalyzerContext"
import {
	createDotGraph,
	saveGraphvizRendered,
	saveSimplifiedDot,
} from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import { parseEdgeDefinitions, saveCytoscape } from "./utils/cytoscape"
// import { writeFile } from "./utils/files"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { printFileTree } from "./utils/printFileTree"
import { depsConfig } from "../deps.config"
import { log } from "./utils/logger"

function main() {
	let analyzerContext: AnalyzerContext
	const config: IAnalyzerConfig = depsConfig
	const statFileName = process.argv[2] || "webpack-stats.json"
	log("loading ${statFileName}")

	const webpackStat = loadWebpackStat(statFileName)
	const grapml = loadGraphml("./src/models/graphml.3.22.stub.graphml")

	if (webpackStat) {
		const analyzer = new Analyzer(webpackStat)
		analyzerContext = analyzer.analyze()

		log("calculations start")
		const dotGraph = createDotGraph(analyzerContext.dependencyMap)
		const cytoscapeGraph = parseEdgeDefinitions(
			analyzerContext.dependencyMap
		)

		if (config.testGraphml) {
			saveGraphml("test_save.graphml", grapml)
		}

		if (config.printImportAnalysis) {
			printFileTree(analyzerContext)
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
