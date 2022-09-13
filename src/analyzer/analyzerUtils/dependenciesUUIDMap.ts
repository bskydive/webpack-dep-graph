import { depsConfig } from "../../../deps.config"
import { log } from "../../utils/logger"
import {
	fileNameFromPath,
	isModuleIncluded,
	isReasonExcluded,
	resolvePathPlus,
} from "../../utils/webpack"
import { v4 } from "uuid"
import {
	IWebpackModuleParsed,
	IWebpackModuleReasonShort,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"

/** @deprecated TODO split state and logic */
export class DependenciesUUIDMap {
	/** source unparsed list */
	modules: IWebpackModuleShort[] = []
	stats: {
		emptyUUID: number
		emptyReasons: number
		moduleTypes: string[]
	} = {
		emptyUUID: 0,
		emptyReasons: 0,
		moduleTypes: [],
	}

	/** flattened list for parsing {'uuid':{...module}} */
	moduleByUUID: Map<string, IWebpackModuleParsed> = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	uuidByRelativePath: Map<string, string> = new Map()

	/** resulting map: {"uuid:LoginPage": ["uuid:LoginForm", "uuid:LoginButton"]} */
	dependenciesListByUUID: Map<string, Set<string>> = new Map()

	constructor(modules: IWebpackModuleShort[]) {
		this.modules = modules
		this.createUUIDNodes(modules)
		this.filterDependencies()
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
		let nodeIdByRelativePath: Map<string, string> = new Map()
		let nodesById: Map<string, IWebpackModuleParsed> = new Map()
		const startTime = Date.now()
		const webpackModules = modules?.filter((m: IWebpackModuleShort) =>
			isModuleIncluded(m.name, depsConfig.filters)
		)

		log(`located ${webpackModules.length} modules from this build.`)

		for (const module of webpackModules) {
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

		log(`creating module nodes takes: ${Date.now() - startTime}ms.`)

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

	private isEmptyData(
		uuid: string,
		reasons: IWebpackModuleReasonShort[]
	): boolean {
		if (!uuid) {
			this.stats.emptyUUID++
		}
		if (!reasons?.length) {
			this.stats.emptyReasons++
		}

		return !uuid || !reasons?.length
	}

	private filterDependencies(): void {
		let relativePath: string
		let module: IWebpackModuleParsed
		/** dependencies, source */
		let reasons: IWebpackModuleReasonShort[] = []
		let moduleName: string
		/** node, consumer */
		let destModule: IWebpackModuleParsed

		this.stats.moduleTypes = this.getModuleTypes(this.modules)

		for (const webpackModule of this.modules) {
			relativePath = resolvePathPlus(webpackModule.name)
			module = this.moduleByRelativePath(relativePath)

			if (this.isEmptyData(module?.uuid, webpackModule?.reasons)) {
				// log("Empty parsed module", { name: webpackModule.name })
				continue
			}

			// exclude & excludeExcept filter options applied
			reasons = webpackModule?.reasons?.filter(
				(m: IWebpackModuleReasonShort) =>
					isModuleIncluded(m.moduleName, depsConfig.filters)
			)

			for (const reason of reasons) {
				if (isReasonExcluded(depsConfig.filters, reason.type)) {
					continue
				}

				moduleName = resolvePathPlus(reason.moduleName)

				if (!moduleName) {
					log("Empty reason", {
						uuid: module?.uuid,
						reason: reason.moduleName,
					})
					continue
				}

				destModule = this.moduleByRelativePath(moduleName)

				if (!destModule?.uuid) {
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
			`raw modules: ${this.modules.length}`,
			`raw module types: ${this.stats.moduleTypes};`,
			`filtered module uuid: ${this.stats.emptyUUID}`,
			`filtered module reasons: ${this.stats.emptyUUID}`,
			`dependencies: ${this.dependenciesListByUUID.size}`,
			`nodesPaths: ${this.uuidByRelativePath.size}`,
			`nodes: ${this.moduleByUUID.size}`,
		]
	}
}
