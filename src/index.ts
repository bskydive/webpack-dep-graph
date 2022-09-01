import { Analyzer } from "./analyzer/Analyzer"
import { AnalyzerContext, IAnalyzerConfig } from "./models/AnalyzerContext"
import {
	createDotGraph,
	saveGraphvizRenderedDot,
	saveGraphvizDotSimplified,
	saveGraphvizRenderedPng,
} from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import { parseEdgeDefinitions, saveCytoscape } from "./utils/cytoscape"
// import { writeFile } from "./utils/files"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
import { printFileTree } from "./utils/printFileTree"
import { depsConfig } from "../deps.config"

function main() {
	let analyzerContext: AnalyzerContext
	const config: IAnalyzerConfig = depsConfig
	const statFileName = process.argv[2] || "webpack-stats.json"
	console.log(`\n------- loading ${statFileName} ------\n`)

	const webpackStat = loadWebpackStat(statFileName)
	const grapml = loadGraphml("./src/models/graphml.3.22.stub.graphml")

	if (webpackStat) {
		const analyzer = new Analyzer(webpackStat)
		analyzerContext = analyzer.analyze()

		console.log(`\n------- displaying file tree ------\n`)
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
			saveCytoscape("./deps.json", analyzerContext.dependencyMap)
		}
		if (config.graphmlDeps) {
			saveGraphmlFromDot(analyzerContext.dependencyMap, "./deps.graphml")
		}
		if (config.circularDepsJson) {
			saveCytoscape("./circular.json", analyzerContext.circularImports)
		}
		if (config.cytoscapeJson) {
			saveCytoscape("./cytoscape.json", cytoscapeGraph)
		}
		if (config.graphvizRenderedDot) {
			saveGraphvizRenderedDot(dotGraph, "./graph.dot")
		}
		if (config.graphvizRenderedPng) {
			saveGraphvizRenderedPng(dotGraph, "./graph.png")
		}
		if (config.graphvizDotSimplified) {
			saveGraphvizDotSimplified(dotGraph, "./graph_simplified.dot")
		}
	}
}

main()
