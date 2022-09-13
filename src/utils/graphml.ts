import {
	GRAPHML_FOOTER,
	GRAPHML_HEADER,
	IGraphmlEdge,
	IGraphmlNode,
} from "../models/graphml.model"
import { ElementCompact, js2xml, xml2js } from "xml-js"
import { readFile, writeFile } from "./files"
import { IDependencyMap } from "../models/webpackStats.model"
import { fileNameFromPath } from "../utils/files"
import { depsConfig } from "../../deps.config"
// import { create } from "xmlbuilder"

export function toGraphmlXml(js: ElementCompact): string {
	// const xml = create(js).end({ pretty: true })
	const xml: string = js2xml(js, { compact: false, spaces: 4 })

	return xml
}

export function fromGraphmlXml(xml: string): ElementCompact {
	const js: ElementCompact = xml2js(xml, { compact: false })

	return js
}

export function loadGraphml(fileName: string): { [key: string]: string } {
	const xml = readFile(fileName)

	const js: { [key: string]: string } = fromGraphmlXml(xml)

	return js
}

export function saveGraphml(fileName: string, data: { [key: string]: string }) {
	const xml: string = toGraphmlXml(data)

	writeFile(fileName, xml)
}

export function graphmlNodeToXml(
	data: IGraphmlNode = depsConfig.graphml.node
): string {
	return `\
    <node id="${data.id}">
    <data key="d5" xml:space="preserve"><![CDATA[${data.notes}]]></data>
    <data key="d6">
      <y:ShapeNode>
        <y:Geometry height="${data.height}.0" width="${data.width}.0" x="${data.x}.0" y="${data.y}.0"/>
        <y:Fill hasColor="false" transparent="false"/>
        <y:BorderStyle color="${data.color}" raised="false" type="line" width="1.0"/>
        <y:NodeLabel alignment="center" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.0625" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="${data.textColor}" verticalTextPosition="bottom" visible="true" width="50.951171875" x="24.0244140625" xml:space="preserve" y="5.96875">${data.label}<y:LabelModel><y:SmartNodeLabelModel distance="4.0"/></y:LabelModel><y:ModelParameter><y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/></y:ModelParameter></y:NodeLabel>
        <y:Shape type="rectangle"/>
      </y:ShapeNode>
    </data>
    </node>\n`
}

export function graphmlEdgeToXml(
	data: IGraphmlEdge = depsConfig.graphml.edge
): string {
	return `\
    <edge id="${data.id}" source="${data.sourceKey}" target="${data.targetKey}">
    <data key="d9"/>
    <data key="d10">
      <y:PolyLineEdge>
        <y:Path sx="0.0" sy="0.0" tx="0.0" ty="0.0"/>
        <y:LineStyle color="${data.color}" type="line" width="${data.width}.0"/>
        <y:Arrows source="none" target="standard"/>
        <y:EdgeLabel alignment="center" configuration="AutoFlippingLabel" distance="2.0" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.0625" horizontalTextPosition="center" iconTextGap="4" modelName="custom" preferredPlacement="anywhere" ratio="0.5" textColor="${data.textColor}" verticalTextPosition="bottom" visible="true" width="74.154296875" x="${data.labelX}.0" xml:space="preserve" y="${data.labelY}.0">${data.label}<y:LabelModel><y:SmartEdgeLabelModel autoRotationEnabled="false" defaultAngle="0.0" defaultDistance="10.0"/></y:LabelModel><y:ModelParameter><y:SmartEdgeLabelModelParameter angle="0.0" distance="30.0" distanceToCenter="true" position="right" ratio="0.5" segment="0"/></y:ModelParameter><y:PreferredPlacementDescriptor angle="0.0" angleOffsetOnRightSide="0" angleReference="absolute" angleRotationOnRightSide="co" distance="-1.0" frozen="true" placement="anywhere" side="anywhere" sideReference="relative_to_edge_flow"/></y:EdgeLabel>
        <y:BendStyle smoothed="false"/>
      </y:PolyLineEdge>
    </data>
    </edge>\n`
}

/** add src nodes to graph nodes section */
function addDependenciesMapSrcNodes(
	dependencyMap: IDependencyMap
): IDependencyMap {
	let result: IDependencyMap = {}
	// TODO add issuerName see src/analyzer/analyzerUtils/setupNodes.ts:21
	for (const targetPath in dependencyMap) {
		for (const dependencyPath of dependencyMap[targetPath]) {
			if (!dependencyMap[dependencyPath]) {
				result[dependencyPath] = []
			}
		}
	}

	return result
}

export function createDotGraphXml(dependencyMap: IDependencyMap): string {
	let allDestNodes: IDependencyMap = {}
	let result: string = GRAPHML_HEADER
	let currentNode: IGraphmlNode = depsConfig.graphml.node
	let currentEdge: IGraphmlEdge = depsConfig.graphml.edge

	allDestNodes = {
		...addDependenciesMapSrcNodes(dependencyMap),
		...dependencyMap,
	}

	// Nodes
	for (const destNode in allDestNodes) {
		currentNode = {
			...depsConfig.graphml.node,
			id: `nodeId_${destNode}`,
			label: fileNameFromPath(destNode),
			notes: destNode,
			x: currentNode.x + currentNode.width + 10,
			y: currentNode.y + currentNode.height + 10,
		}
		result += graphmlNodeToXml(currentNode)
	}

	// Edges
	for (const destNode in allDestNodes) {
		dependencyMap[destNode]?.forEach((srcNode) => {
			let label = depsConfig.graphml.showSourceEdgeLabels ? srcNode : ""
			// escaping text for xml parser
			label += depsConfig.graphml.showDestEdgeLabels
				? ` --\\> ${destNode}`
				: ""

			currentEdge = {
				...depsConfig.graphml.edge,
				id: `edgeId_${srcNode}_${destNode}`,
				sourceKey: `nodeId_${srcNode}`,
				targetKey: `nodeId_${destNode}`,
				label: label,
			}

			result += graphmlEdgeToXml(currentEdge)
		})
	}

	return result.concat(GRAPHML_FOOTER)
}

export function saveGraphmlFromDot(fileName: string, data: IDependencyMap) {
	const xml: string = createDotGraphXml(data)

	writeFile(fileName, xml)
}
