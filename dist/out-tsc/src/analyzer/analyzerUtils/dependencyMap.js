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
exports.missedDependencyMapSrcNodes = exports.getDependencyMap = void 0;
var logger_1 = require("../../utils/logger");
function getDependencyMap(graph) {
    var e_1, _a;
    var _b;
    var mapping = {};
    var toPath = function (id) { var _a; return ((_a = graph.nodesById.get(id)) === null || _a === void 0 ? void 0 : _a.relativePath) || ""; };
    try {
        for (var _c = __values(graph.dependenciesById), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), id = _e[0], dependencies = _e[1];
            mapping[toPath(id)] = Array.from(dependencies).map(toPath);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    (0, logger_1.logEmpty)("src/analyzer/analyzerUtils/dependencyMap.ts:10", (_b = mapping === null || mapping === void 0 ? void 0 : mapping.length) === null || _b === void 0 ? void 0 : _b.toString());
    return mapping;
}
exports.getDependencyMap = getDependencyMap;
/** add missed nodes from edge definitions for graphml */
function missedDependencyMapSrcNodes(dependencyMap) {
    var e_2, _a;
    var result = {};
    for (var targetPath in dependencyMap) {
        try {
            for (var _b = (e_2 = void 0, __values(dependencyMap[targetPath])), _c = _b.next(); !_c.done; _c = _b.next()) {
                var dependencyPath = _c.value;
                if (!dependencyMap[dependencyPath]) {
                    result[dependencyPath] = [];
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return result;
}
exports.missedDependencyMapSrcNodes = missedDependencyMapSrcNodes;
