"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.readFile = void 0;
var fs_1 = __importDefault(require("fs"));
function readFile(fileName) {
    var startTime = Date.now();
    try {
        // console.log('src/utils/loadWebpackStat.ts:9', fileName);
        var statString = fs_1.default.readFileSync(fileName, "utf-8");
        console.debug("loading stat.json takes ".concat(Date.now() - startTime, "ms."));
        return statString;
    }
    catch (error) {
        console.error("unable to read webpack stat file: ".concat(fileName), error);
    }
}
exports.readFile = readFile;
function writeFile(path, data) {
    fs_1.default.writeFileSync(path, data);
}
exports.writeFile = writeFile;
