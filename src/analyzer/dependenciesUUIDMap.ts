import { depsConfig } from "../../deps.config"
import { log } from "../utils/logger"
import {
	isModuleIncluded,
	isReasonTypeExcluded,
	resolvePathPlus,
} from "../utils/webpack"
import { v4 } from "uuid"
import {
	IStats,
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
	TDependenciesListByUUID,
	TModuleByUUID,
	TUUIDByRelativePath,
} from "../models/webpackStats.model"
import { fileNameFromPath } from "../utils/files"

/** @deprecated TODO split state and logic */
export class DependenciesUUIDMap {
	stats: IStats = {
		rawModules: 0,
		emptyUUID: 0,
		emptyReasons: 0,
		emptyReasonDest: 0,
		reasonTypeExcluded: 0,
		maxReasonCountExcluded: 0,
		moduleTypes: [],
	}

	/** flattened list for parsing {'uuid':{...module}} */
	moduleByUUID: TModuleByUUID = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	uuidByRelativePath: TUUIDByRelativePath = new Map()

	/** resulting map: {"uuid:LoginPage": ["uuid:LoginForm", "uuid:LoginButton"]} */
	dependenciesListByUUID: TDependenciesListByUUID = new Map()

	constructor(modules: IWebpackModuleShort[]) {
        let filteredDestModules: IWebpackModuleShort[]

        filteredDestModules = modules?.filter((m: IWebpackModuleShort) =>
			// filter target/dest nodes
			isModuleIncluded(m.name, depsConfig.filters)
		)

		this.stats.moduleTypes = this.getModuleTypes(modules)

        this.createUUIDNodes(filteredDestModules)
		this.filterDependencies(filteredDestModules)
	}

	moduleByRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: string = this.uuidByRelativePath.get(relativePath)
		const module: IWebpackModuleParsed = this.moduleByUUID.get(uuid)

		if (!uuid || !module?.uuid) return null

		return module
	}

	addDependenciesById(consumerId: string, dependencyId: string) {
		if (!this.dependenciesListByUUID.has(consumerId)) {
			this.dependenciesListByUUID.set(consumerId, new Set())
		}

		this.dependenciesListByUUID.get(consumerId)?.add(dependencyId)
	}

	private createUUIDNodes(modules: IWebpackModuleShort[]) {
		let nodeIdByRelativePath: TUUIDByRelativePath = new Map()
		let nodesById: TModuleByUUID = new Map()
		// const startTime = Date.now()
		log(`located ${modules.length} modules from this build.`)

		for (const module of modules) {
			const id = v4()

			const relativePath = resolvePathPlus(module.name)

			nodeIdByRelativePath.set(relativePath, id)

			nodesById.set(id, {
				uuid: id,
				sizeInBytes: module.size || -1,
				fileName: fileNameFromPath(module.name),
				relativePath,
			})
		}

		// log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

		this.uuidByRelativePath = nodeIdByRelativePath
		this.moduleByUUID = nodesById
	}

	private getModuleTypes(webpackModules: IWebpackModuleShort[]): string[] {
		const reasonTypes = webpackModules
			.map((module) => module.reasons.map((reason) => reason.type))
			.flat()
			.reduce(
				(acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)),
				[]
			)

		return reasonTypes
	}

	private filterDependencies(filteredDestModules: IWebpackModuleShort[] ): void {
		let relativePath: string
		let module: IWebpackModuleParsed
		/** dependencies, source */
		let reasons: IWebpackModuleReasonShort[] = []
		let moduleName: string
		/** consumer */
		let destModule: IWebpackModuleParsed

		for (const webpackModule of filteredDestModules) {
			relativePath = resolvePathPlus(webpackModule.name)
			module = this.moduleByRelativePath(relativePath)

			if (!module?.uuid) {
				this.stats.emptyUUID++
				log("Empty parsed module", { name: webpackModule.name })
				continue
			}

			if (
				depsConfig.filters.excludeNodeByMaxDepsCount > 0 &&
				webpackModule.reasons.length >
					depsConfig.filters.excludeNodeByMaxDepsCount
			) {
				this.stats.maxReasonCountExcluded++
				// log("Too many dependencies", { name: webpackModule.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = webpackModule?.reasons?.filter(
				(m: IWebpackModuleReasonShort) =>
					// filter source/deps nodes
					isModuleIncluded(m.moduleName, depsConfig.filters)
			)

			for (const reason of reasons) {
				if (isReasonTypeExcluded(depsConfig.filters, reason.type)) {
					this.stats.reasonTypeExcluded++
					continue
				}

				moduleName = resolvePathPlus(reason.moduleName)

				if (!moduleName) {
					this.stats.emptyReasons++
					log("Empty reason", {
						uuid: module?.uuid,
						reason: reason.moduleName,
					})
					continue
				}

				destModule = this.moduleByRelativePath(moduleName)

				if (!destModule?.uuid) {
					this.stats.emptyReasonDest++
					log("Empty destination", {
						name: moduleName,
					})
					continue
				}

				// TODO add module.issuerName as dependency:  module.name-->module.issuerName(consumer)
				this.addDependenciesById(destModule?.uuid, module?.uuid)
			}
		}
	}

	getSummary(): string[] {
		return [
			`summary:`,
			`raw modules: ${this.stats.rawModules}`,
			`raw module types: ${this.stats.moduleTypes};`,
			`dependencies: ${this.dependenciesListByUUID.size}`,
			`nodesPaths: ${this.uuidByRelativePath.size}`,
			`nodes: ${this.moduleByUUID.size}`,
			`filtered:`,
			`empty module uuid: ${this.stats.emptyUUID}`,
			`empty reasons: ${this.stats.emptyReasons}`,
			`empty reasons dest: ${this.stats.emptyReasonDest}`,
			`excluded module reason type: ${this.stats.reasonTypeExcluded}`,
			`max reasons count: ${this.stats.maxReasonCountExcluded}`,
		]
	}
}
