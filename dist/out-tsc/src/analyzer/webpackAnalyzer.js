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
exports.webpackAnalyzer = void 0;
var ModuleGraph_1 = require("./analyzerUtils/ModuleGraph");
var webpack_1 = require("../utils/webpack");
var deps_config_1 = require("../../deps.config");
var circular_1 = require("./analyzerUtils/circular");
var dependencyMap_1 = require("./analyzerUtils/dependencyMap");
var extractUsages_1 = require("./analyzerUtils/extractUsages");
var setupNodes_1 = require("./analyzerUtils/setupNodes");
var logger_1 = require("../utils/logger");
var webpackAnalyzer = /** @class */ (function () {
    function webpackAnalyzer(stat) {
        this.config = deps_config_1.depsConfig;
        this.stat = stat;
        this.analyzerContext = __assign(__assign({}, this.config), { graph: new ModuleGraph_1.ModuleGraph(), webpackModules: this.stat.modules.filter(function (m) {
                return (0, webpack_1.isIncluded)(m.name, {
                    exclude: deps_config_1.depsConfig.exclude,
                    excludeExcept: deps_config_1.depsConfig.excludeExcept,
                    includeOnly: deps_config_1.depsConfig.includeOnly,
                });
            }), dependencyMap: {}, circularImports: [] });
    }
    webpackAnalyzer.prototype.getStatCount = function () {
        return {
            dependenciesById: this.analyzerContext.graph.dependenciesById.size,
            nodeIdByRelativePath: this.analyzerContext.graph.nodeIdByRelativePath.size,
            nodesById: this.analyzerContext.graph.nodesById.size,
        };
    };
    webpackAnalyzer.prototype.analyze = function () {
        var projectRoot = (0, webpack_1.getAppRootPath)(this.stat.modules, {
            exclude: deps_config_1.depsConfig.exclude,
            excludeExcept: deps_config_1.depsConfig.excludeExcept,
            includeOnly: deps_config_1.depsConfig.includeOnly,
        });
        if (projectRoot)
            this.config.projectRoot = projectRoot;
        (0, logger_1.log)("\n modules to parse: ", this.stat.modules.length, "\n");
        this.analyzerContext.graph = (0, setupNodes_1.createModuleNodes)(this.analyzerContext);
        (0, logger_1.log)("\n nodes created: \n", this.getStatCount(), "\n");
        this.analyzerContext.graph = (0, extractUsages_1.extractUsages)(this.analyzerContext);
        (0, logger_1.log)("\n usages extracted: \n", this.getStatCount(), "\n");
        this.analyzerContext.dependencyMap = (0, dependencyMap_1.getDependencyMap)(this.analyzerContext.graph);
        this.analyzerContext.circularImports = (0, circular_1.getCircularImports)(this.analyzerContext.dependencyMap);
        return this.analyzerContext;
    };
    return webpackAnalyzer;
}());
exports.webpackAnalyzer = webpackAnalyzer;
