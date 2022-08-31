import { Analyzer } from "./analyzer/Analyzer"
import { AnalyzerContext } from "./models/AnalyzerContext"
import { createDotGraph, saveGraphvizRenderedDot, saveGraphvizDotSimplified, saveGraphvizRenderedPng } from "./utils/graphviz"
import { loadWebpackStat } from "./utils/webpack"
import { parseEdgeDefinitions, saveCytoscape } from "./utils/cytoscape"
// import { writeFile } from "./utils/files"
import { loadGraphml, saveGraphml, saveGraphmlFromDot } from "./utils/graphml"
// import { printFileTree } from "./utils/printFileTree"

function main() {
	let analyzerContext: AnalyzerContext
	const statFileName = process.argv[2] || "webpack-stats.json"
	console.log(`\n------- loading ${statFileName} ------\n`)

	const webpackStat = loadWebpackStat(statFileName)
	const grapml = loadGraphml("./src/models/graphml.3.22.stub.graphml")

	if (webpackStat) {
		const analyzer = new Analyzer(webpackStat)
		analyzerContext = analyzer.analyze()

		console.log(`\n------- displaying file tree ------\n`)
		// printFileTree(analyzerContext)
		const dotGraph = createDotGraph(analyzerContext.dependencyMap)
		const cytoscapeGraph = parseEdgeDefinitions(
			analyzerContext.dependencyMap
		)

		// saveGraphml("test_save.graphml", grapml)
		saveCytoscape("./deps.json", analyzerContext.dependencyMap)
		saveGraphmlFromDot(analyzerContext.dependencyMap, "./deps.graphml")
		saveCytoscape("./circular.json", analyzerContext.circularImports)
		saveCytoscape("./cytoscape.json", cytoscapeGraph)
		saveGraphvizRenderedDot(dotGraph, "./graph.dot")
		saveGraphvizRenderedPng(dotGraph, "./graph.png")
		saveGraphvizDotSimplified(dotGraph, "./graph_simplified.dot")
	}
}

main()
