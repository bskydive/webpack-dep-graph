"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGraphmlFromDot = exports.createDotGraphXml = exports.addEdge = exports.addNode = exports.graphmlEdgeToXml = exports.graphmlNodeToXml = exports.saveGraphml = exports.loadGraphml = exports.fromGraphmlXml = exports.toGraphmlXml = void 0;
var graphml_model_1 = require("../models/graphml.model");
var xml_js_1 = require("xml-js");
var files_1 = require("./files");
var webpack_1 = require("../utils/webpack");
var dependencyMap_1 = require("../analyzer/analyzerUtils/dependencyMap");
// import { create } from "xmlbuilder"
function toGraphmlXml(js) {
    // const xml = create(js).end({ pretty: true })
    var xml = (0, xml_js_1.js2xml)(js, { compact: false, spaces: 4 });
    return xml;
}
exports.toGraphmlXml = toGraphmlXml;
function fromGraphmlXml(xml) {
    var js = (0, xml_js_1.xml2js)(xml, { compact: false });
    return js;
}
exports.fromGraphmlXml = fromGraphmlXml;
function loadGraphml(fileName) {
    var xml = (0, files_1.readFile)(fileName);
    var js = fromGraphmlXml(xml);
    return js;
}
exports.loadGraphml = loadGraphml;
function saveGraphml(fileName, data) {
    var xml = toGraphmlXml(data);
    (0, files_1.writeFile)(fileName, xml);
}
exports.saveGraphml = saveGraphml;
function graphmlNodeToXml(data) {
    if (data === void 0) { data = graphml_model_1.GRAPHML_NODE_DEFAULT; }
    return "        <node id=\"".concat(data.id, "\">\n            <data key=\"d5\" xml:space=\"preserve\"><![CDATA[").concat(data.notes, "]]></data>\n            <data key=\"d6\">\n                <y:ShapeNode>\n                    <y:Geometry height=\"30.0\" width=\"99.0\" x=\"790.0\" y=\"559.0\"/>\n                    <y:Fill hasColor=\"false\" transparent=\"false\"/>\n                    <y:BorderStyle color=\"#000000\" raised=\"false\" type=\"line\" width=\"1.0\"/>\n                    <y:NodeLabel alignment=\"center\" autoSizePolicy=\"content\" fontFamily=\"Dialog\" fontSize=\"12\" fontStyle=\"plain\" hasBackgroundColor=\"false\" hasLineColor=\"false\" height=\"18.0625\" horizontalTextPosition=\"center\" iconTextGap=\"4\" modelName=\"custom\" textColor=\"#000000\" verticalTextPosition=\"bottom\" visible=\"true\" width=\"62.927734375\" x=\"").concat(data.x, "\" xml:space=\"preserve\" y=\"").concat(data.y, "\">").concat(data.label, "<y:LabelModel><y:SmartNodeLabelModel distance=\"4.0\"/></y:LabelModel><y:ModelParameter><y:SmartNodeLabelModelParameter labelRatioX=\"0.0\" labelRatioY=\"0.0\" nodeRatioX=\"0.0\" nodeRatioY=\"0.0\" offsetX=\"0.0\" offsetY=\"0.0\" upX=\"0.0\" upY=\"-1.0\"/></y:ModelParameter></y:NodeLabel>\n                    <y:Shape type=\"rectangle\"/>\n                </y:ShapeNode>\n            </data>\n        </node>\n");
}
exports.graphmlNodeToXml = graphmlNodeToXml;
function graphmlEdgeToXml(data) {
    if (data === void 0) { data = graphml_model_1.GRAPHML_EDGE_DEFAULT; }
    return "        <edge id=\"".concat(data.id, "\" source=\"").concat(data.sourceKey, "\" target=\"").concat(data.targetKey, "\">\n            <data key=\"d9\"/>\n            <data key=\"d10\">\n                <y:PolyLineEdge>\n                    <y:Path sx=\"0.0\" sy=\"0.0\" tx=\"0.0\" ty=\"0.0\"/>\n                    <y:LineStyle color=\"#000000\" type=\"line\" width=\"1.0\"/>\n                    <y:Arrows source=\"none\" target=\"standard\"/>\n                    <y:EdgeLabel alignment=\"center\" configuration=\"AutoFlippingLabel\" distance=\"2.0\" fontFamily=\"Dialog\" fontSize=\"12\" fontStyle=\"plain\" hasBackgroundColor=\"false\" hasLineColor=\"false\" height=\"18.0625\" horizontalTextPosition=\"center\" iconTextGap=\"4\" modelName=\"custom\" preferredPlacement=\"anywhere\" ratio=\"0.5\" textColor=\"#000000\" verticalTextPosition=\"bottom\" visible=\"true\" width=\"62.55859375\" x=\"14.28329576570377\" xml:space=\"preserve\" y=\"").concat(data.y, "\">").concat(data.label, "<y:LabelModel><y:SmartEdgeLabelModel autoRotationEnabled=\"false\" defaultAngle=\"0.0\" defaultDistance=\"10.0\"/></y:LabelModel><y:ModelParameter><y:SmartEdgeLabelModelParameter angle=\"0.0\" distance=\"30.0\" distanceToCenter=\"true\" position=\"right\" ratio=\"0.5\" segment=\"0\"/></y:ModelParameter><y:PreferredPlacementDescriptor angle=\"0.0\" angleOffsetOnRightSide=\"0\" angleReference=\"absolute\" angleRotationOnRightSide=\"co\" distance=\"-1.0\" frozen=\"true\" placement=\"anywhere\" side=\"anywhere\" sideReference=\"relative_to_edge_flow\"/></y:EdgeLabel>\n                    <y:BendStyle smoothed=\"false\"/>\n                </y:PolyLineEdge>\n            </data>\n        </edge>\n");
}
exports.graphmlEdgeToXml = graphmlEdgeToXml;
function addNode() { }
exports.addNode = addNode;
function addEdge() { }
exports.addEdge = addEdge;
function createDotGraphXml(dependencyMap) {
    var _a;
    var allSrcNodes = {};
    var result = graphml_model_1.GRAPHML_HEADER;
    var currentNode = graphml_model_1.GRAPHML_NODE_DEFAULT;
    var currentEdge = graphml_model_1.GRAPHML_EDGE_DEFAULT;
    allSrcNodes = __assign(__assign({}, (0, dependencyMap_1.missedDependencyMapSrcNodes)(dependencyMap)), dependencyMap);
    var _loop_1 = function (nodePathDest) {
        currentNode = {
            id: nodePathDest,
            label: (0, webpack_1.fileNameFromPath)(nodePathDest),
            notes: nodePathDest,
            x: currentNode.x + currentNode.height + 10,
            y: currentNode.y + currentNode.weight + 10,
            height: 30,
            weight: 30,
        };
        result += graphmlNodeToXml(currentNode);
        (_a = dependencyMap[nodePathDest]) === null || _a === void 0 ? void 0 : _a.forEach(function (nodePathSrc) {
            currentEdge = {
                id: "edge_" + nodePathDest,
                sourceKey: nodePathSrc,
                targetKey: nodePathDest,
                label: "",
                y: 0,
            };
            result += graphmlEdgeToXml(currentEdge);
        });
    };
    for (var nodePathDest in allSrcNodes) {
        _loop_1(nodePathDest);
    }
    return result.concat(graphml_model_1.GRAPHML_FOOTER);
}
exports.createDotGraphXml = createDotGraphXml;
function saveGraphmlFromDot(data, fileName) {
    if (fileName === void 0) { fileName = "./deps.graphml"; }
    var xml = createDotGraphXml(data);
    (0, files_1.writeFile)(fileName, xml);
}
exports.saveGraphmlFromDot = saveGraphmlFromDot;
