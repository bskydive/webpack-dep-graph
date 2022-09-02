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
exports.createModuleNodes = void 0;
var webpack_1 = require("../../utils/webpack");
var uuid_1 = require("uuid");
var logger_1 = require("../../utils/logger");
function createModuleNodes(context) {
    var e_1, _a;
    var graph = context.graph, webpackModules = context.webpackModules;
    var startTime = Date.now();
    (0, logger_1.log)("located ".concat(webpackModules.length, " modules from this build."));
    try {
        for (var webpackModules_1 = __values(webpackModules), webpackModules_1_1 = webpackModules_1.next(); !webpackModules_1_1.done; webpackModules_1_1 = webpackModules_1.next()) {
            var module_1 = webpackModules_1_1.value;
            var id = (0, uuid_1.v4)();
            var relativePath = (0, webpack_1.resolvePathPlus)(module_1.name); // TODO add issuerName to scope
            var absolutePath = (0, webpack_1.parseAbsolutePath)(module_1);
            graph.nodeIdByRelativePath.set(relativePath, id);
            graph.nodesById.set(id, {
                uuid: id,
                webpackModuleId: module_1.id || -1,
                sizeInBytes: module_1.size || -1,
                fileName: (0, webpack_1.fileNameFromPath)(module_1.name),
                relativePath: relativePath,
                absolutePath: absolutePath,
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (webpackModules_1_1 && !webpackModules_1_1.done && (_a = webpackModules_1.return)) _a.call(webpackModules_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    (0, logger_1.log)("creating module nodes takes: ".concat(Date.now() - startTime, "ms."));
    return graph;
}
exports.createModuleNodes = createModuleNodes;
