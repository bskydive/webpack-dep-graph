"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleGraph = void 0;
var ModuleGraph = /** @class */ (function () {
    function ModuleGraph() {
        /** {'uuid':{...module}} */
        this.nodesById = new Map();
        /** {'path1':'uuid1'} */
        this.nodeIdByRelativePath = new Map();
        /** {"uuid:LoginPage": ["uuid:LoginForm", "uuid:LoginButton"]} */
        this.dependenciesById = new Map();
    }
    ModuleGraph.prototype.byRelativePath = function (relativePath) {
        var uuid = this.nodeIdByRelativePath.get(relativePath);
        var module = this.nodesById.get(uuid);
        if (!uuid || !(module === null || module === void 0 ? void 0 : module.uuid))
            return null;
        return module;
    };
    ModuleGraph.prototype.addDependenciesById = function (consumerId, dependencyId) {
        var _a;
        if (!this.dependenciesById.has(consumerId)) {
            this.dependenciesById.set(consumerId, new Set());
        }
        (_a = this.dependenciesById.get(consumerId)) === null || _a === void 0 ? void 0 : _a.add(dependencyId);
    };
    return ModuleGraph;
}());
exports.ModuleGraph = ModuleGraph;
