import { digraph, Graph, RenderEngine } from "graphviz"
import { IDependencyMap } from "../models/webpackAnalyzer.model"
import { writeFile } from "./files"
import { log } from "./logger"

/**
 * https://renenyffenegger.ch/notes/tools/Graphviz/examples/index
 */
export function createDotGraph(dependencyMap: IDependencyMap): Graph {
	const g: Graph = digraph("G")

	for (const consumerPath in dependencyMap) {
		const n = g.addNode(consumerPath, { color: "blue" })

		const dependencies = dependencyMap[consumerPath]
		for (const dep of dependencies) {
			g.addEdge(n, dep, { color: "red" })
		}
	}

	return g
}

export function saveGraphvizRendered(data: {
	graph: Graph,
	fileName?: string,
    engine: RenderEngine,
    type: 'png' | 'dot'
}) {
    const fileName = data.fileName || `graphviz_${data.engine}.${data.type}`

    log(`${fileName} calculations starts`)    

    data.graph.render({ 
        type: data.type, 
        use: data.engine 
    }, fileName)

    // TODO use callback (data: Buffer) => log(`${fileName} calculations ended`)
}

export function saveSimplifiedDot(
	g: Graph,
	fileName: string = "graphviz_simplified.dot"
) {
	writeFile(fileName, g.to_dot())
}
