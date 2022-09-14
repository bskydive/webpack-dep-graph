import { IDependencyMap } from "../models/webpackStats.model"
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
	dependencyMap: IDependencyMap
): ICyElementDefinition[] {
	let result: ICyElementDefinition[] = []
	let edges: ICyEdgeDataDefinition[] = []
	let edge: ICyEdgeDataDefinition
	let dependenciesPaths: string[] = []

	for (const targetPath in dependencyMap) {
		dependenciesPaths = dependencyMap[targetPath]

		for (const dependencyPath of dependenciesPaths) {
			edge = parseEdge({
				id: targetPath,
				source: dependencyPath,
				target: targetPath,
			})

			edges.push(edge)
		}
	}

	return result.concat(edges.map((item) => parseElementDefinition(item)))
}

export function parseNodeDefinitions(
	dependencyMap: IDependencyMap
): ICyElementDefinition[] {
	let result: ICyElementDefinition[] = []
	let nodes: ICyNodeDataDefinition[] = []
	let node: ICyNodeDataDefinition

	for (const targetPath in dependencyMap) {
		node = parseNode({ id: targetPath })
		nodes.push(node)
	}

	return result.concat(nodes.map((item) => parseElementDefinition(item)))
}


export function saveCytoscape(fileName: string, dependencyMap: IDependencyMap) {
    const data = parseEdgeDefinitions(dependencyMap)
    saveJSON(fileName, data)
}