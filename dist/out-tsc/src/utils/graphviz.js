"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSimplifiedDot = exports.saveGraphvizRendered = exports.createDotGraph = void 0;
var graphviz_1 = require("graphviz");
var files_1 = require("./files");
var logger_1 = require("./logger");
/**
 * https://renenyffenegger.ch/notes/tools/Graphviz/examples/index
 */
function createDotGraph(dependencyMap) {
    var e_1, _a;
    var g = (0, graphviz_1.digraph)("G");
    for (var consumerPath in dependencyMap) {
        var n = g.addNode(consumerPath, { color: "blue" });
        var dependencies = dependencyMap[consumerPath];
        try {
            for (var dependencies_1 = (e_1 = void 0, __values(dependencies)), dependencies_1_1 = dependencies_1.next(); !dependencies_1_1.done; dependencies_1_1 = dependencies_1.next()) {
                var dep = dependencies_1_1.value;
                g.addEdge(n, dep, { color: "red" });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (dependencies_1_1 && !dependencies_1_1.done && (_a = dependencies_1.return)) _a.call(dependencies_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return g;
}
exports.createDotGraph = createDotGraph;
function saveGraphvizRendered(data) {
    var fileName = data.fileName || "graphviz_".concat(data.engine, ".").concat(data.type);
    (0, logger_1.log)("".concat(fileName, " calculations starts"));
    data.graph.render({
        type: data.type,
        use: data.engine
    }, fileName);
    // TODO use callback (data: Buffer) => log(`${fileName} calculations ended`)
}
exports.saveGraphvizRendered = saveGraphvizRendered;
function saveSimplifiedDot(g, fileName) {
    if (fileName === void 0) { fileName = "graphviz_simplified.dot"; }
    (0, files_1.writeFile)(fileName, g.to_dot());
}
exports.saveSimplifiedDot = saveSimplifiedDot;
