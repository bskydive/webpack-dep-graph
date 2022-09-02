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
exports.saveCytoscape = exports.parseNodeDefinitions = exports.parseEdgeDefinitions = void 0;
var files_1 = require("./files");
function parseNode(data) {
    var _a;
    return _a = {}, _a[data.id] = data.label || "", _a;
}
function parseEdge(data) {
    var _a;
    return _a = {},
        _a[data.id] = data.label || "",
        _a.source = data.source,
        _a.target = data.target,
        _a;
}
function parseElementDefinition(data) {
    return {
        data: data,
    };
}
function parseEdgeDefinitions(dependencyMap) {
    var e_1, _a;
    var result = [];
    var edges = [];
    var edge;
    var dependenciesPaths = [];
    for (var targetPath in dependencyMap) {
        dependenciesPaths = dependencyMap[targetPath];
        try {
            for (var dependenciesPaths_1 = (e_1 = void 0, __values(dependenciesPaths)), dependenciesPaths_1_1 = dependenciesPaths_1.next(); !dependenciesPaths_1_1.done; dependenciesPaths_1_1 = dependenciesPaths_1.next()) {
                var dependencyPath = dependenciesPaths_1_1.value;
                edge = parseEdge({
                    id: targetPath,
                    source: dependencyPath,
                    target: targetPath,
                });
                edges.push(edge);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (dependenciesPaths_1_1 && !dependenciesPaths_1_1.done && (_a = dependenciesPaths_1.return)) _a.call(dependenciesPaths_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return result.concat(edges.map(function (item) { return parseElementDefinition(item); }));
}
exports.parseEdgeDefinitions = parseEdgeDefinitions;
function parseNodeDefinitions(dependencyMap) {
    var result = [];
    var nodes = [];
    var node;
    for (var targetPath in dependencyMap) {
        node = parseNode({ id: targetPath });
        nodes.push(node);
    }
    return result.concat(nodes.map(function (item) { return parseElementDefinition(item); }));
}
exports.parseNodeDefinitions = parseNodeDefinitions;
function saveCytoscape(fileName, data) {
    var json = JSON.stringify(data, null, 2);
    (0, files_1.writeFile)(fileName, json);
}
exports.saveCytoscape = saveCytoscape;
