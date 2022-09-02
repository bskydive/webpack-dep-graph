"use strict";
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
exports.loadWebpackStat = exports.getAppRootPath = exports.fileNameFromPath = exports.parseAbsolutePath = exports.resolvePathPlus = exports.isIncluded = void 0;
var logger_1 = require("./logger");
var files_1 = require("./files");
function isIncluded(text, opts) {
    var regExpExclude = null;
    var regExpExcludeExcept = null;
    var regExpIncludeOnly = null;
    var result = false;
    if (opts.exclude.length) {
        regExpExclude = new RegExp("".concat(opts.exclude.join("|")));
    }
    if (opts.excludeExcept.length) {
        regExpExcludeExcept = new RegExp("".concat(opts.excludeExcept.join("|")));
    }
    if (opts.includeOnly.length) {
        regExpIncludeOnly = new RegExp("".concat(opts.includeOnly.join("|")));
        result = regExpIncludeOnly.test(text);
    }
    else {
        result = (regExpExcludeExcept === null || regExpExcludeExcept === void 0 ? void 0 : regExpExcludeExcept.test(text)) || !(regExpExclude === null || regExpExclude === void 0 ? void 0 : regExpExclude.test(text));
    }
    return result;
}
exports.isIncluded = isIncluded;
var resolvePathPlus = function (name) {
    var result = name;
    if (typeof name === "string" && name.length) {
        result = name.split(" + ")[0];
    }
    (0, logger_1.logEmpty)("src/utils/webpack.ts:16", name);
    return result;
};
exports.resolvePathPlus = resolvePathPlus;
function parseAbsolutePath(module) {
    var _a;
    var path = ((_a = module.identifier) === null || _a === void 0 ? void 0 : _a.split("!")[1]) || "";
    (0, logger_1.logEmpty)("src/utils/webpack.ts:24", module.name);
    return path;
}
exports.parseAbsolutePath = parseAbsolutePath;
function fileNameFromPath(path) {
    var _a = __read(path.split("/").slice(-1), 1), name = _a[0];
    (0, logger_1.logEmpty)("src/utils/webpack.ts:31", path);
    return name;
}
exports.fileNameFromPath = fileNameFromPath;
/** @deprecated TODO refactor to use without rootPath */
function getAppRootPath(modules, opts) {
    var rootPath = "";
    var appModule = modules.find(function (module) {
        return isIncluded(module.name, opts) && /node_modules/.test(module.issuer);
    });
    if (appModule) {
        rootPath =
            appModule.issuer.split("node_modules")[0] ||
                appModule.issuer.split("node_modules")[0] ||
                "";
    }
    if (!rootPath) {
        console.warn("src/utils/webpack.ts:52", "EMPTY app root path!", appModule.name);
    }
    return rootPath;
}
exports.getAppRootPath = getAppRootPath;
function loadWebpackStat(fileName) {
    var statString = (0, files_1.readFile)(fileName);
    var stat = JSON.parse(statString);
    return stat;
}
exports.loadWebpackStat = loadWebpackStat;
