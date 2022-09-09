import { WebpackAnalyzer } from "./analyzer/webpackAnalyzer"
import {
	IDependencyMap,
	IWebpackAnalyzerConfig,
} from "./models/webpackAnalyzer.model"
import {
	createDotGraph,
	saveGraphvizRendered,
	saveSimplifiedDot,
} from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import { parseEdgeDefinitions, saveCytoscape } from "./utils/cytoscape"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { depsConfig } from "../deps.config"
import { log } from "./utils/logger"
import { getCircularImports } from "./analyzer/analyzerUtils/circular"

function main() {
	const config: IWebpackAnalyzerConfig = depsConfig
	const statFileName = process?.argv[2] || config.input.webpackStatsFileName
	const GRAPHML_STUB = loadGraphml("./src/models/graphml.3.22.stub.graphml") // for testing lib save
	const webpackStat = loadWebpackStat(statFileName)
	let dependencyMap: IDependencyMap = {}
    let analyzer: WebpackAnalyzer
    let circularImports: string[][]

	log("loading ${statFileName}")

	if (webpackStat?.version) {
		
		
        analyzer = new WebpackAnalyzer(webpackStat)
		dependencyMap = analyzer.analyze(config)

		log("calculations start")
		const dotGraph = createDotGraph(dependencyMap)
		const cytoscapeGraph = parseEdgeDefinitions(dependencyMap)

		if (config.output.testGraphmlJs2Xml) {
			saveGraphml("./graph-output/test_save.graphml", GRAPHML_STUB)
		}

		if (config.output.depsJson) {
			saveCytoscape("./graph-output/deps.json", dependencyMap)
		}

		if (config.output.graphmlDeps) {
			saveGraphmlFromDot(dependencyMap, "./graph-output/deps.graphml")
		}

		circularImports = getCircularImports(dependencyMap)

		if (config.output.circularDepsJson) {
			saveCytoscape("./graph-output/circular.json", circularImports)
		}

		if (config.output.cytoscapeJson) {
			saveCytoscape("./graph-output/cytoscape.json", cytoscapeGraph)
		}

		if (config.output.simplifiedDot) {
			saveSimplifiedDot(dotGraph, "./graph-output/graph_simplified.dot")
		}

		log("heavy async calculations start")

		for (const [key, value] of Object.entries(config.graphviz)) {
			if (value?.enabled) {

                log(`${key}-->${value?.fileName} calculations starts`)

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
