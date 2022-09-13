import { WebpackStatsParser } from "./analyzer/webpackStats"
import { IDependencyMap } from "./models/webpackStats.model"
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
	saveJSON,
} from "./utils/cytoscape"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { depsConfig } from "../deps.config"
import { log } from "./utils/logger"
import { getCircularImports } from "./analyzer/circular"
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

	if (depsConfig.output.testGraphmlJs2Xml.enabled) {
		GRAPHML_STUB = loadGraphml("./src/models/graphml.3.22.stub.graphml") // for testing lib save
		saveGraphml("./graph-output/test_save.graphml", GRAPHML_STUB)
	}

	if (depsConfig.output.depsJson.enabled) {
		saveJSON(depsConfig.output.depsJson.fileName, dependencyMap)
	}

	if (depsConfig.output.graphmlDeps.enabled) {
		saveGraphmlFromDot(depsConfig.output.graphmlDeps.fileName, dependencyMap)
	}

	if (depsConfig.output.circularDepsJson.enabled) {
        circularImports = getCircularImports(dependencyMap)
		saveJSON(depsConfig.output.circularDepsJson.fileName, circularImports)
	}

	if (depsConfig.output.cytoscapeJson.enabled) {
		cytoscapeGraph = parseEdgeDefinitions(dependencyMap)
		saveJSON(depsConfig.output.cytoscapeJson.fileName, cytoscapeGraph)
	}

	if (depsConfig.output.simplifiedDot.enabled) {
		saveSimplifiedDot(depsConfig.output.simplifiedDot.fileName, dotGraph)
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
