"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAPHML_FOOTER = exports.GRAPHML_HEADER = exports.GRAPHML_EDGE_DEFAULT = exports.GRAPHML_NODE_DEFAULT = void 0;
exports.GRAPHML_NODE_DEFAULT = {
    id: "n0",
    label: "",
    notes: "",
    x: 10,
    y: 10,
    height: 30,
    weight: 30,
};
exports.GRAPHML_EDGE_DEFAULT = {
    id: "e0",
    sourceKey: "n0",
    targetKey: "n0",
    label: "",
    y: 0
};
exports.GRAPHML_HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\" xmlns:java=\"http://www.yworks.com/xml/yfiles-common/1.0/java\" xmlns:sys=\"http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0\" xmlns:x=\"http://www.yworks.com/xml/yfiles-common/markup/2.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:y=\"http://www.yworks.com/xml/graphml\" xmlns:yed=\"http://www.yworks.com/xml/yed/3\" xsi:schemaLocation=\"http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd\">\n    <!--Created by yEd 3.22-->\n    <key attr.name=\"Description\" attr.type=\"string\" for=\"graph\" id=\"d0\"/>\n    <key for=\"port\" id=\"d1\" yfiles.type=\"portgraphics\"/>\n    <key for=\"port\" id=\"d2\" yfiles.type=\"portgeometry\"/>\n    <key for=\"port\" id=\"d3\" yfiles.type=\"portuserdata\"/>\n    <key attr.name=\"url\" attr.type=\"string\" for=\"node\" id=\"d4\"/>\n    <key attr.name=\"description\" attr.type=\"string\" for=\"node\" id=\"d5\"/>\n    <key for=\"node\" id=\"d6\" yfiles.type=\"nodegraphics\"/>\n    <key for=\"graphml\" id=\"d7\" yfiles.type=\"resources\"/>\n    <key attr.name=\"url\" attr.type=\"string\" for=\"edge\" id=\"d8\"/>\n    <key attr.name=\"description\" attr.type=\"string\" for=\"edge\" id=\"d9\"/>\n    <key for=\"edge\" id=\"d10\" yfiles.type=\"edgegraphics\"/>\n    <graph edgedefault=\"directed\" id=\"G\">\n        <data key=\"d0\" xml:space=\"preserve\"/>\n";
exports.GRAPHML_FOOTER = "    </graph>\n    <data key=\"d7\">\n        <y:Resources/>\n    </data>\n</graphml>\n";
