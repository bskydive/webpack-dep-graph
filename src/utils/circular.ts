import { error } from "console"

export interface IModule {
	debugId: string
	resource: string
	// weak: boolean;
	module: IModule
	dependencies: IModule[]
}

export interface IModuleSeen {
	[key: string]: boolean
}

// see src/webpack-stats/circular.ts

export class CircularDependencyPlugin {
	apply(modules: IModule[]) {
		let errors: string[] = []
		for (let module of modules) {
			let maybeCyclicalPathsList = this.isCyclic(module, module, {}, errors)
			if (maybeCyclicalPathsList) {
				// detected
				console.log("errors: ", errors)
				continue
			}
		}
	}

	/** TODO move errorsOut to return section */
	isCyclic(initialModule: IModule, currentModule: IModule, seenModules: IModuleSeen, errorsOut: string[]): string[] {
		// Add the current module to the seen modules cache
		seenModules[currentModule.debugId] = true

		// If the modules aren't associated to resources
		// it's not possible to display how they are cyclical
		if (!currentModule.resource || !initialModule.resource) {
			return []
		}

		// Iterate over the current modules dependencies
		for (let dependency of currentModule.dependencies) {
			if (dependency.constructor && dependency.constructor.name === "CommonJsSelfReferenceDependency") {
				continue
			}

			let depModule: IModule = null

			depModule = dependency.module

			if (!depModule) {
				continue
			}
			// ignore dependencies that don't have an associated resource
			if (!depModule.resource) {
				continue
			}
			// ignore dependencies that are resolved asynchronously
			//   if (this.options.allowAsyncCycles && dependency.weak) { continue }
			// the dependency was resolved to the current module due to how webpack internals
			// setup dependencies like CommonJsSelfReferenceDependency and ModuleDecoratorDependency
			if (currentModule === depModule) {
				continue
			}

			if (depModule.debugId in seenModules) {
				if (depModule.debugId === initialModule.debugId) {
					// Initial module has a circular dependency
					return [currentModule.resource, depModule.resource]
				}
				// Found a cycle, but not for this module
				continue
			}

			let maybeCyclicalPathsList: string[] = this.isCyclic(initialModule, depModule, seenModules, errorsOut)

			if (maybeCyclicalPathsList.length) {
				maybeCyclicalPathsList.unshift(currentModule.resource)
				errorsOut.push(maybeCyclicalPathsList.join(" -> "))
				return maybeCyclicalPathsList
			}
		}

		return []
	}
}
