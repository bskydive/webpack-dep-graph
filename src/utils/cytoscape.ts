import { TSrcFileNamesByDest } from "../models/webpackStats.model"
import { saveJSON } from "./files"

/** see src/viewer/node_modules/@types/cytoscape/index.d.ts:83 */
export interface ICyElementDefinition {
	data: ICyNodeDataDefinition | ICyEdgeDataDefinition
}

interface ICyNodeDataDefinition {
	[id: string]: any
}

interface ICyEdgeDataDefinition {
	source: string
	target: string
	[id: string]: any
}

function parseNode(data: {
	id: string
	label?: string
}): ICyNodeDataDefinition {
	return { [data.id]: data.label || "" }
}

function parseEdge(data: {
	id: string
	source: string
	target: string
	label?: string
}): ICyEdgeDataDefinition {
	return {
		[data.id]: data.label || "",
		source: data.source,
		target: data.target,
	}
}

function parseElementDefinition(
	data: ICyNodeDataDefinition | ICyEdgeDataDefinition
) {
	return {
		data: data,
	}
}

export function parseEdgeDefinitions(
	srcFileNamesByDest: TSrcFileNamesByDest
): ICyElementDefinition[] {
	let result: ICyElementDefinition[] = []
	let edges: ICyEdgeDataDefinition[] = []
	let edge: ICyEdgeDataDefinition

	for (const [destFileName, srcFileNames] of srcFileNamesByDest) {
		for (const srcFileName of srcFileNames) {
			edge = parseEdge({
				id: destFileName,
				source: srcFileName,
				target: destFileName,
			})

			edges.push(edge)
		}
	}

	return result.concat(edges.map((item) => parseElementDefinition(item)))
}

export function parseNodeDefinitions(
	srcFileNamesByDest: TSrcFileNamesByDest
): ICyElementDefinition[] {
	let result: ICyElementDefinition[] = []
	let nodes: ICyNodeDataDefinition[] = []
	let node: ICyNodeDataDefinition

	for (const destFileName in srcFileNamesByDest) {
		node = parseNode({ id: destFileName })
		nodes.push(node)
	}

	return result.concat(nodes.map((item) => parseElementDefinition(item)))
}

export function saveCytoscape(
	fileName: string,
	dependencyMap: TSrcFileNamesByDest
) {
	const data = parseEdgeDefinitions(dependencyMap)
	saveJSON(fileName, data)
}
