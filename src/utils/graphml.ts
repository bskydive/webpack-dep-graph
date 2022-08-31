import {
	GRAPHML_EDGE_DEFAULT,
	GRAPHML_FOOTER,
	GRAPHML_HEADER,
	GRAPHML_NODE_DEFAULT,
	IGraphmlEdge,
	IGraphmlNode,
} from "../analyzer/models/graphml.model"
import { ElementCompact, js2xml, xml2js } from "xml-js"
import { readFile, writeFile } from "./files"
import { IDependencyMap } from "../analyzer/models/AnalyzerContext"
import { fileNameFromPath } from "../utils/webpack"
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
	data: IGraphmlNode = GRAPHML_NODE_DEFAULT
): string {
	return `\
        <node id="${data.id}">
            <data key="d5"/>
            <data key="d6">
                <y:ShapeNode>
                    <y:Geometry height="30.0" width="99.0" x="790.0" y="559.0"/>
                    <y:Fill hasColor="false" transparent="false"/>
                    <y:BorderStyle color="#000000" raised="false" type="line" width="1.0"/>
                    <y:NodeLabel alignment="center" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.0625" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="#000000" verticalTextPosition="bottom" visible="true" width="62.927734375" x="${data.x}" xml:space="preserve" y="${data.y}">${data.label}<y:LabelModel><y:SmartNodeLabelModel distance="4.0"/></y:LabelModel><y:ModelParameter><y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/></y:ModelParameter></y:NodeLabel>
                    <y:Shape type="rectangle"/>
                </y:ShapeNode>
            </data>
        </node>\n`
}

export function graphmlEdgeToXml(
	data: IGraphmlEdge = GRAPHML_EDGE_DEFAULT
): string {
	return `\
        <edge id="${data.id}" source="${data.sourceKey}" target="${data.targetKey}">
            <data key="d9"/>
            <data key="d10">
                <y:PolyLineEdge>
                    <y:Path sx="0.0" sy="0.0" tx="0.0" ty="0.0"/>
                    <y:LineStyle color="#000000" type="line" width="1.0"/>
                    <y:Arrows source="none" target="standard"/>
                    <y:EdgeLabel alignment="center" configuration="AutoFlippingLabel" distance="2.0" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.0625" horizontalTextPosition="center" iconTextGap="4" modelName="custom" preferredPlacement="anywhere" ratio="0.5" textColor="#000000" verticalTextPosition="bottom" visible="true" width="62.55859375" x="14.28329576570377" xml:space="preserve" y="${data.y}">${data.label}<y:LabelModel><y:SmartEdgeLabelModel autoRotationEnabled="false" defaultAngle="0.0" defaultDistance="10.0"/></y:LabelModel><y:ModelParameter><y:SmartEdgeLabelModelParameter angle="0.0" distance="30.0" distanceToCenter="true" position="right" ratio="0.5" segment="0"/></y:ModelParameter><y:PreferredPlacementDescriptor angle="0.0" angleOffsetOnRightSide="0" angleReference="absolute" angleRotationOnRightSide="co" distance="-1.0" frozen="true" placement="anywhere" side="anywhere" sideReference="relative_to_edge_flow"/></y:EdgeLabel>
                    <y:BendStyle smoothed="false"/>
                </y:PolyLineEdge>
            </data>
        </edge>\n`
}

export function addNode() {}

export function addEdge() {}

export function createDotGraphXml(dependencyMap: IDependencyMap): string {
	let result: string = GRAPHML_HEADER
	let currentNode: IGraphmlNode = GRAPHML_NODE_DEFAULT
	let currentEdge: IGraphmlEdge = GRAPHML_EDGE_DEFAULT

	for (const nodePathDest in dependencyMap) {
		currentNode = {
			id: nodePathDest,
			label: fileNameFromPath(nodePathDest),
			x: currentNode.x + currentNode.height + 10,
			y: currentNode.y + currentNode.weight + 10,
			height: 30,
			weight: 30,
		}

		result += graphmlNodeToXml(currentNode)

		const dependencies = dependencyMap[nodePathDest]

		for (const nodePathSrc of dependencies) {
			currentEdge = {
				id: "edge_" + nodePathDest,
				sourceKey: nodePathSrc,
				targetKey: nodePathDest,
				label: "", // fileNameFromPath(nodePathSrc + '--' + nodePathDest),
				y: 0,
			}

			result += graphmlEdgeToXml(currentEdge)
		}
	}

	return result.concat(GRAPHML_FOOTER)
}

export function saveGraphmlFromDot(
	data: IDependencyMap,
	fileName: string = "./deps.graphml"
) {
	const xml: string = createDotGraphXml(data)

	writeFile(fileName, xml)
}
