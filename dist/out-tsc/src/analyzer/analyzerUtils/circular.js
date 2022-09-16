"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircularImports = void 0;
/**
 * Source: https://github.com/pahen/madge/blob/master/lib/cyclic.js
 */
function getCircularImports(graph) {
    var circular = [];
    var resolved = new Map();
    var unresolved = new Map();
    function getPath(parent) {
        var visited = false;
        return Object.keys(unresolved).filter(function (module) {
            if (module === parent)
                visited = true;
            return visited && unresolved.get(module);
        });
    }
    function resolve(id) {
        unresolved.set(id, true);
        if (graph[id]) {
            graph[id].forEach(function (dependency) {
                if (!resolved.get(dependency)) {
                    if (unresolved.get(dependency)) {
                        var paths = getPath(dependency);
                        return circular.push(paths);
                    }
                    resolve(dependency);
                }
            });
        }
        resolved.set(id, true);
        unresolved.set(id, false);
    }
    Object.keys(graph).forEach(resolve);
    return circular;
}
exports.getCircularImports = getCircularImports;
