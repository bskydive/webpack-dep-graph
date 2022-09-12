import { depsConfig } from "../../../deps.config"
import { log } from "../../utils/logger"
import {
	fileNameFromPath,
	isIncluded,
	resolvePathPlus,
} from "../../utils/webpack"
import { v4 } from "uuid"
import {
	IWebpackModuleParsed,
	IWebpackModuleShort,
} from "../../models/webpackAnalyzer.model"

/** @deprecated TODO split state and logic */
export class DependenciesUUIDMap {
    /** source unparsed list */
    modules: IWebpackModuleShort[] = []	

    /** flattened list for parsing {'uuid':{...module}} */
	modulesByUUID: Map<string, IWebpackModuleParsed> = new Map()
	/** flattened list for parsing {'path1':'uuid1'} */
	UUIDByRelativePath: Map<string, string> = new Map()

    /** resulting map: {"uuid:LoginPage": ["uuid:LoginForm", "uuid:LoginButton"]} */
	dependenciesListByUUID: Map<string, Set<string>> = new Map()
    

	constructor(modules: IWebpackModuleShort[]) {
        this.modules = modules
		this.createUUIDNodes(modules)
	}

	byRelativePath(relativePath: string): IWebpackModuleParsed | null {
		const uuid: string = this.UUIDByRelativePath.get(relativePath)
		const module: IWebpackModuleParsed = this.modulesByUUID.get(uuid)

		if (!uuid || !module?.uuid) return null

		return module
	}

	addDependenciesById(consumerId: string, dependencyId: string) {
		if (!this.dependenciesListByUUID.has(consumerId)) {
			this.dependenciesListByUUID.set(consumerId, new Set())
		}

		this.dependenciesListByUUID.get(consumerId)?.add(dependencyId)
	}

	createUUIDNodes(modules: IWebpackModuleShort[]) {
		let nodeIdByRelativePath: Map<string, string> = new Map()
		let nodesById: Map<string, IWebpackModuleParsed> = new Map()
		const startTime = Date.now()
		const webpackModules = modules?.filter((m: IWebpackModuleShort) =>
			isIncluded(m.name, depsConfig.filters)
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

		this.UUIDByRelativePath = nodeIdByRelativePath
		this.modulesByUUID = nodesById
	}
}
