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
exports.extractUsages = void 0;
var logger_1 = require("../../utils/logger");
var webpack_1 = require("../../utils/webpack");
function getModuleTypes(webpackModules) {
    var reasonTypes = webpackModules
        .map(function (m) { return m.reasons.map(function (r) { return r.type; }); })
        .flat()
        .reduce(function (acc, curr) { return (acc.includes(curr) ? acc : acc.concat(curr)); }, []);
    return reasonTypes;
}
/** TODO remove unnecessary re-exports extraction; webpack stats already have all data */
function extractUsages(context) {
    var e_1, _a, e_2, _b, e_3, _c;
    var _d, _e, _f;
    var webpackModules = context.webpackModules, graph = context.graph, _g = context.printImportAnalysis, printImportAnalysis = _g === void 0 ? false : _g;
    var summary = { imports: 0, exports: 0, issuers: 0 };
    (0, logger_1.log)("analyzing imports and re-exports");
    var moduleTypes = getModuleTypes(webpackModules);
    var resolvedModules = webpackModules.map(function (item) {
        var _a;
        if ((_a = item === null || item === void 0 ? void 0 : item.issuerName) === null || _a === void 0 ? void 0 : _a.includes("providers.module.ts")) {
            (0, logger_1.log)("src/analyzer/analyzerUtils/extractUsages.ts:33", item.name);
        }
        return __assign(__assign({}, item), { issuerPath: item.issuerName, reasons: item.reasons.map(function (item) { return (__assign(__assign({}, item), { resolvedModulePath: (0, webpack_1.resolvePathPlus)(item.moduleName) })); }) });
    });
    try {
        for (var resolvedModules_1 = __values(resolvedModules), resolvedModules_1_1 = resolvedModules_1.next(); !resolvedModules_1_1.done; resolvedModules_1_1 = resolvedModules_1.next()) {
            var webpackModule = resolvedModules_1_1.value;
            var resolvedDependents = new Map();
            var relativePath = (0, webpack_1.resolvePathPlus)(webpackModule.name);
            var module_1 = graph.byRelativePath(relativePath);
            if (!(module_1 === null || module_1 === void 0 ? void 0 : module_1.uuid)) {
                (0, logger_1.logEmpty)("src/analyzer/analyzerUtils/extractUsages.ts:52", module_1 === null || module_1 === void 0 ? void 0 : module_1.uuid, webpackModule);
            }
            if (!((webpackModule === null || webpackModule === void 0 ? void 0 : webpackModule.reasons) instanceof Array)) {
                continue;
            }
            var reasons = (_d = webpackModule === null || webpackModule === void 0 ? void 0 : webpackModule.reasons) === null || _d === void 0 ? void 0 : _d.filter(function (m) {
                return (0, webpack_1.isIncluded)(m.resolvedModulePath, {
                    exclude: context.exclude,
                    excludeExcept: context.excludeExcept,
                    includeOnly: context.includeOnly,
                });
            });
            try {
                // Use the webpack import/export reason to resolve dependency chain
                for (var reasons_1 = (e_2 = void 0, __values(reasons)), reasons_1_1 = reasons_1.next(); !reasons_1_1.done; reasons_1_1 = reasons_1.next()) {
                    var reason = reasons_1_1.value;
                    // Ignore side effect evaluation.
                    if (reason.type.includes("side effect")) {
                        // console.log(
                        // 	"src/analyzer/analyzerUtils/extractUsages.ts:71",
                        // 	reason.type
                        // )
                        continue;
                    }
                    var moduleName = (0, webpack_1.resolvePathPlus)(reason.resolvedModulePath);
                    // Mark dependent as resolved, so we don't need to resolve multiple times.
                    if (resolvedDependents.has(moduleName)) {
                        continue;
                    }
                    resolvedDependents.set(moduleName, true);
                    // Resolve the module that utilizes/consumes the current module.
                    var consumerModule = graph.byRelativePath(moduleName);
                    if (!consumerModule) {
                        continue;
                    }
                    // Detect if the module is a being re-exported.
                    var isExport = reason.type.includes("export imported specifier");
                    if (isExport) {
                        // log(`  re-exported by ${consumerModule}`)
                        summary.exports++;
                        continue;
                    }
                    graph.addDependenciesById(consumerModule.uuid, module_1.uuid);
                    // log(`imported by ${consumerModule}`)
                    summary.imports++;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (reasons_1_1 && !reasons_1_1.done && (_b = reasons_1.return)) _b.call(reasons_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var issuers = (_f = (_e = webpackModule.reasons) === null || _e === void 0 ? void 0 : _e.filter(function (issuer) {
                return (0, webpack_1.isIncluded)(issuer.moduleName, {
                    exclude: context.exclude,
                    excludeExcept: context.excludeExcept,
                    includeOnly: context.includeOnly,
                });
            })) !== null && _f !== void 0 ? _f : [];
            try {
                for (var issuers_1 = (e_3 = void 0, __values(issuers)), issuers_1_1 = issuers_1.next(); !issuers_1_1.done; issuers_1_1 = issuers_1.next()) {
                    var issuer = issuers_1_1.value;
                    var module_2 = graph.byRelativePath(issuer.moduleName);
                    if (!module_2)
                        continue;
                    // report(gray(`  issued by ${module.absolutePath}`))
                    summary.issuers++;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (issuers_1_1 && !issuers_1_1.done && (_c = issuers_1.return)) _c.call(issuers_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (resolvedModules_1_1 && !resolvedModules_1_1.done && (_a = resolvedModules_1.return)) _a.call(resolvedModules_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    (0, logger_1.log)("\nsummary: \n", "module types: ".concat(moduleTypes, ";"), "imports: ".concat(summary.imports, ";"), "re-exports: ".concat(summary.exports, ";"), "issuers: ".concat(summary.issuers, ";"), "dependencies: ".concat(graph.dependenciesById.size));
    return graph;
}
exports.extractUsages = extractUsages;
