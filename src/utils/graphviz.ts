import { digraph, Graph, RenderEngine } from "graphviz"
import { IDependencyMap } from "../models/webpackStats.model"
import { writeFile } from "./files"
import { log } from "./logger"

export type IGraphvizDot = Graph

/**
 * https://renenyffenegger.ch/notes/tools/Graphviz/examples/index
 * TODO find how set nodesep attr https://www.graphviz.org/faq/#FaqLarger
 */
export function createDotGraph(dependencyMap: IDependencyMap): IGraphvizDot {
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
	graph: Graph
	fileName?: string
	engine: RenderEngine
	type: "png" | "dot"
}) {
	const fileName = data.fileName || `graphviz_${data.engine}.${data.type}`

	data.graph.render(
		{
			type: data.type,
			use: data.engine,
		},
		fileName
	)

	// TODO use callback saveRendered
}

/** callback for logging end of operation */
function saveRendered(data: Buffer, fileName: string) {
    log(`${fileName} calculations ended`)
    writeFile(fileName, data)
}

export function saveSimplifiedDot(fileName: string, g: Graph) {
	writeFile(fileName, g.to_dot())
}
