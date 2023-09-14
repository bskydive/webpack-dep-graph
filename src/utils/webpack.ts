import { log, logEmpty } from "./logger"
import { IWebpackStatsV3 } from "src/models/webpack.3.model"
import { readFile } from "./files"
import { IWebpackStatsV5 } from "../models/webpack.5.model"
import {
    IConfigFilters,
    IWebpackModuleShort,
} from "../models/webpackStats.model"

/** excludeSrc & excludeSrcExcept filter options applied to IWebpackModuleShort[] and IWebpackModuleReasonShort */
export function isModuleIncluded(
    moduleName: string,
    filters: IConfigFilters
): boolean {
    let regExpExclude: RegExp = null
    let regExpExcludeExcept: RegExp = null
    let result: boolean = false

    if (filters.exclude.length) {
        regExpExclude = new RegExp(`${filters.exclude.join("|")}`)
    }

    if (filters.excludeExcept.length) {
        regExpExcludeExcept = new RegExp(`${filters.excludeExcept.join("|")}`)
    }

    result =
        regExpExcludeExcept?.test(moduleName) ||
        !regExpExclude?.test(moduleName)

    return result
}

export function isReasonTypeExcluded(
    filters: IConfigFilters,
    reasonType: string
): boolean {
    return (
        filters.edgeTypeExclude.findIndex((item) =>
            reasonType.includes(item)
        ) >= 0
    )
}

/** 
 * @deprecated TODO remove, useful only for reasons name
 * parse `path1 + path2` to `path1`
 */
export const resolvePathPlus = (name: string) => {
    const splitter = " + ";
    let result = name
    let splitted = name?.split(splitter);

    if (splitted?.length) {
        result = splitted[0];
    }

    // if (splitted?.length > 2) {
    //     log("resolvePathPlus count:", splitted?.length, "path:", name)
    // }

    return result
}

/** @deprecated TODO remove or reuse */
export function parseAbsolutePath(identifier: string): string {
    let path = identifier?.split("!")[1] || ""

    return path
}

export function loadWebpackStat(
    fileName: string
): IWebpackStatsV3 | IWebpackStatsV5 {
    if (typeof fileName !== "string" || !fileName?.length) {
        throw new Error("Empty stats file name: " + fileName)
    }

    const statString = readFile(fileName)
    const stat: IWebpackStatsV3 = JSON.parse(statString)

    log(`${fileName} loaded`)

    return stat
}
