import {
    IDependencyMap,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../models/webpackStats.model"
import {
	IWebpackStatsV3,
	IWebpackStatsV3Chunk,
	IWebpackStatsV3Module,
	IWebpackStatsV3Reason,
} from "../models/webpack.3.model"
import { depsConfig } from "../../deps.config"
import {
	IWebpackStatsV5,
	IWebpackStatsV5Chunk,
	IWebpackStatsV5Module,
	IWebpackStatsV5Reason,
} from "../models/webpack.5.model"
import { DependenciesUUIDMap } from "./dependenciesUUIDMap"
import { getDependenciesMap } from "./dependenciesMap"

export class WebpackStatsParser {
	private modules: IWebpackModuleShort[]
    uuidMap: DependenciesUUIDMap
    dependencyMap: IDependencyMap


	constructor(stats: IWebpackStatsV3 | IWebpackStatsV5) {
		this.modules = this.getShortModules(stats)
        this.uuidMap = new DependenciesUUIDMap(this.modules)
		this.dependencyMap = getDependenciesMap(this.uuidMap, depsConfig)
	}

	/** modules filtering in  */
    private getShortModules(
		stats: IWebpackStatsV3 | IWebpackStatsV5
	): IWebpackModuleShort[] {
		let webpackModules: IWebpackModuleShort[]

		const webpackVersion = this.getWebpackVersion(stats)

		if (webpackVersion !== "3" && webpackVersion !== "5") {
			throw new Error("Unknown webpack version: " + stats?.version)
		}

		webpackModules = this.parseWebpackModules(stats.modules)

		if (!webpackModules?.length) {
			webpackModules = this.parseWebpackChunks(stats.chunks)
		}

		return webpackModules
	}

	private parseWebpackChunks(
		chunks: IWebpackStatsV3Chunk[] | IWebpackStatsV5Chunk[]
	): IWebpackModuleShort[] {
		const result = chunks
			.map((chunk) => chunk?.modules)
			.flat()
			.map((module) => ({
				size: module.size,
				name: module.name,
				issuerName: module.issuerName,
				identifier: module.identifier,
				id: String(module.id),
				reasons: this.parseWebpackModuleReasonsShort(module.reasons),
			}))

		return result
	}

	private parseWebpackModules(
		modules: IWebpackStatsV3Module[] | IWebpackStatsV5Module[]
	): IWebpackModuleShort[] {
		const result = modules.map((module) => ({
			size: module.size,
			name: module.name,
			issuerName: module.issuerName,
			identifier: module.identifier,
			id: String(module.id),
			reasons: this.parseWebpackModuleReasonsShort(module.reasons),
		}))

		return result
	}

	private parseWebpackModuleReasonsShort(
		reason: IWebpackStatsV3Reason[] | IWebpackStatsV5Reason[]
	): IWebpackModuleReasonShort[] {
		const result = reason.map((module) => {
			return {
				moduleIdentifier: module.moduleIdentifier,
				module: module.module,
				moduleName: module.moduleName,
				type: module.type,
			}
		})

		return result
	}

	private getWebpackVersion(stat: IWebpackStatsV5 | IWebpackStatsV3): string {
		return stat?.version.split(".")[0]
	}
}
