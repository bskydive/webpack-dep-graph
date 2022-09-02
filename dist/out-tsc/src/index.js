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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var webpackAnalyzer_1 = require("./analyzer/webpackAnalyzer");
var graphviz_1 = require("./utils/graphviz");
var webpack_1 = require("./utils/webpack");
var cytoscape_1 = require("./utils/cytoscape");
// import { writeFile } from "./utils/files"
var graphml_1 = require("./utils/graphml");
var deps_config_1 = require("../deps.config");
var logger_1 = require("./utils/logger");
function main() {
    var e_1, _a;
    var analyzerContext;
    var config = deps_config_1.depsConfig;
    var statFileName = process.argv[2] || "webpack-stats.json";
    (0, logger_1.log)("loading ${statFileName}");
    var webpackStat = (0, webpack_1.loadWebpackStat)(statFileName);
    var grapml = (0, graphml_1.loadGraphml)("./src/models/graphml.3.22.stub.graphml");
    if (webpackStat) {
        var analyzer = new webpackAnalyzer_1.webpackAnalyzer(webpackStat);
        analyzerContext = analyzer.analyze();
        (0, logger_1.log)("calculations start");
        var dotGraph = (0, graphviz_1.createDotGraph)(analyzerContext.dependencyMap);
        var cytoscapeGraph = (0, cytoscape_1.parseEdgeDefinitions)(analyzerContext.dependencyMap);
        if (config.testGraphml) {
            (0, graphml_1.saveGraphml)("test_save.graphml", grapml);
        }
        if (config.depsJson) {
            (0, cytoscape_1.saveCytoscape)("./graph-output/deps.json", analyzerContext.dependencyMap);
        }
        if (config.graphmlDeps) {
            (0, graphml_1.saveGraphmlFromDot)(analyzerContext.dependencyMap, "./graph-output/deps.graphml");
        }
        if (config.circularDepsJson) {
            (0, cytoscape_1.saveCytoscape)("./graph-output/circular.json", analyzerContext.circularImports);
        }
        if (config.cytoscapeJson) {
            (0, cytoscape_1.saveCytoscape)("./graph-output/cytoscape.json", cytoscapeGraph);
        }
        if (config.simplifiedDot) {
            (0, graphviz_1.saveSimplifiedDot)(dotGraph, "./graph-output/graph_simplified.dot");
        }
        (0, logger_1.log)("heavy calculations start");
        try {
            for (var _b = __values(Object.entries(config.graphviz)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (value === null || value === void 0 ? void 0 : value.enabled) {
                    (0, graphviz_1.saveGraphvizRendered)({
                        graph: dotGraph,
                        engine: value === null || value === void 0 ? void 0 : value.engine,
                        type: value === null || value === void 0 ? void 0 : value.type,
                        fileName: value === null || value === void 0 ? void 0 : value.fileName,
                    });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
main();
