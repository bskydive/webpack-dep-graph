import { WebpackStatsParser } from "./analyzer/webpackStats"
import { IDependencyMap } from "./models/webpackAnalyzer.model"
import {
	createDotGraph,
	IGraphvizDot,
	saveGraphvizRendered,
	saveSimplifiedDot,
} from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import {
	ICyElementDefinition,
	parseEdgeDefinitions,
	saveCytoscape,
} from "./utils/cytoscape"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { depsConfig } from "../deps.config"
import { log } from "./utils/logger"
import { getCircularImports } from "./analyzer/analyzerUtils/circular"
import { IWebpackStatsV3 } from "./models/webpack.3.model"
import { IWebpackStatsV5 } from "./models/webpack.5.model"

function main() {
	let GRAPHML_STUB: { [key: string]: string }
	let cytoscapeGraph: ICyElementDefinition[]
	let statFileName: string
	let webpackStat: IWebpackStatsV3 | IWebpackStatsV5
	let dotGraph: IGraphvizDot
	let dependencyMap: IDependencyMap
	let statsParser: WebpackStatsParser
	let circularImports: string[][]

	log(`loading ${statFileName}`)
	statFileName = process?.argv[2] || depsConfig.input.webpackStatsFileName
	webpackStat = loadWebpackStat(statFileName)

	log("stats parsing start")
	statsParser = new WebpackStatsParser(webpackStat)
	dependencyMap = statsParser.dependencyMap
	log(statsParser.uuidMap.getSummary())

	log("graph parsing start")
	dotGraph = createDotGraph(dependencyMap)

	if (depsConfig.output.testGraphmlJs2Xml) {
		GRAPHML_STUB = loadGraphml("./src/models/graphml.3.22.stub.graphml") // for testing lib save
		saveGraphml("./graph-output/test_save.graphml", GRAPHML_STUB)
	}

	if (depsConfig.output.depsJson) {
		saveCytoscape("./graph-output/deps.json", dependencyMap)
	}

	if (depsConfig.output.graphmlDeps) {
		saveGraphmlFromDot(dependencyMap, "./graph-output/deps.graphml")
	}

	circularImports = getCircularImports(dependencyMap)

	if (depsConfig.output.circularDepsJson) {
		saveCytoscape("./graph-output/circular.json", circularImports)
	}

	if (depsConfig.output.cytoscapeJson) {
		cytoscapeGraph = parseEdgeDefinitions(dependencyMap)
		saveCytoscape("./graph-output/cytoscape.json", cytoscapeGraph)
	}

	if (depsConfig.output.simplifiedDot) {
		saveSimplifiedDot(dotGraph, "./graph-output/graph_simplified.dot")
	}

	log("heavy async calculations start")

	for (const [key, value] of Object.entries(depsConfig.graphviz)) {
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

main()
