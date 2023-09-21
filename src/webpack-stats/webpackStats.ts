import {
    TSrcFileNamesByDest,
    IWebpackModuleReasonShort,
    IWebpackModuleShort,
} from "../models/webpackStats.model"
import {
    IWebpackStatsV3,
    IWebpackStatsV3Chunk,
    IWebpackStatsV3ChunkModule,
    IWebpackStatsV3Module,
    IWebpackStatsV3Reason,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import {
    IWebpackStatsV5,
    IWebpackStatsV5Chunk,
    IWebpackStatsV5ChunkModule,
    IWebpackStatsV5Module,
    IWebpackStatsV5Reason,
} from "../models/webpack.5.model"
import { DependenciesByIdMap } from "./dependenciesByIdMap"
import { getSrcFileNamesByDest } from "./dependenciesMapParser"
import { log } from "../utils/logger"

export class WebpackStatsParser {
    modules: IWebpackModuleShort[]
    uuidMap: DependenciesByIdMap
    srcFileNamesByDest: TSrcFileNamesByDest

    constructor(stats: IWebpackStatsV3 | IWebpackStatsV5) {
        this.modules = this.getShortModules(stats)
        this.uuidMap = new DependenciesByIdMap(this.modules, stats.version)
        this.srcFileNamesByDest = getSrcFileNamesByDest(
            this.uuidMap,
            depsConfig
        )
    }

    /** remove properties from raw stats.json */
    private getShortModules(
        stats: IWebpackStatsV3 | IWebpackStatsV5
    ): IWebpackModuleShort[] {
        let webpackModules: IWebpackModuleShort[]

        const webpackVersion = this.getWebpackVersion(stats)

        if (webpackVersion !== "3" && webpackVersion !== "5") {
            throw new Error("Unknown webpack version: " + stats?.version)
        }

        webpackModules = this.parseWebpackModules(stats?.modules)

        if (!webpackModules?.length) {
            log('Empty modules, getting data from the chunks');
            webpackModules = this.parseWebpackChunks(stats?.chunks)
        }

        return webpackModules
    }

    /** alternative data source */
    private parseWebpackChunks(
        chunks: IWebpackStatsV3Chunk[] | IWebpackStatsV5Chunk[]
    ): IWebpackModuleShort[] {
        const result: IWebpackModuleShort[] = chunks
            .map((chunk) => chunk?.modules)
            .flat()
            .map((module) => this.getWebpackModuleShort(module))

        return result
    }

    /** main data source */
    private parseWebpackModules(
        modules: IWebpackStatsV3Module[] | IWebpackStatsV5Module[]
    ): IWebpackModuleShort[] {
        const result: IWebpackModuleShort[] = modules?.map(
            (module) => this.getWebpackModuleShort(module)
        )

        return result
    }

    /** copy issuer into reasons */
    private getWebpackModuleShort(module:
        IWebpackStatsV3Module | IWebpackStatsV5Module |
        IWebpackStatsV3ChunkModule | IWebpackStatsV5ChunkModule
    ): IWebpackModuleShort {
        const result: IWebpackModuleShort = {
            size: module.size,
            name: module.name,
            issuerName: module.issuerName || null,
            reasons: [
                { moduleName: module.issuerName || null, type: 'issuerParser' },
                ...this.parseWebpackModuleReasons(module.reasons)
            ],
        }

        return result;
    }

    /** version dependent parsing v5/v3 */
    private parseWebpackModuleReasons(
        reason: IWebpackStatsV3Reason[] | IWebpackStatsV5Reason[]
    ): IWebpackModuleReasonShort[] {
        const result = reason.map((module) => {
            return {
                moduleName:
                    (module as IWebpackStatsV5Reason)?.resolvedModule ||
                    (module as IWebpackStatsV3Reason)?.resolvedModulePath ||
                    module?.moduleName,
                type: module.type,
            }
        })

        return result
    }

    private getWebpackVersion(stat: IWebpackStatsV5 | IWebpackStatsV3): string {
        return stat?.version.split(".")[0]
    }
}
