import { TSrcFileNamesByDest } from "../models/webpackStats.model"
import { saveJSON } from "../utils/files"

/**
 * @deprecated TODO verify/fix/improve
 *  https://github.com/pahen/madge/blob/master/lib/cyclic.js
 */
export function getCircularImports(
	srcFileNamesByDest: TSrcFileNamesByDest
): string[][] {
	const circular: string[][] = []

	const resolved: Map<string, boolean> = new Map()
	const unresolved: Map<string, boolean> = new Map()

	function getPath(srcFileName: string) {
		let visited = false

		return Object.keys(unresolved).filter((module) => {
			if (module === srcFileName) visited = true

			return visited && unresolved.get(module)
		})
	}

	function resolve(destFileName: string) {
		unresolved.set(destFileName, true)

		srcFileNamesByDest.get(destFileName)?.forEach((dependency) => {
			if (!resolved.get(dependency)) {
				if (unresolved.get(dependency)) {
					const paths = getPath(dependency)

					return circular.push(paths)
				}

				resolve(dependency)
			}
		})

		resolved.set(destFileName, true)
		unresolved.set(destFileName, false)
	}

	for (const [destFileName, srcFileNames] of srcFileNamesByDest) {
		resolve(destFileName)
	}

	return circular
}

export function saveCircularImports(
	fileName: string,
	srcFileNamesByDest: TSrcFileNamesByDest
) {
	const data = getCircularImports(srcFileNamesByDest)
	saveJSON(fileName, data)
}

/**
 * https://www.npmjs.com/package/circular-dependency-plugin
 * https://www.digitalocean.com/community/tutorials/angular-custom-webpack-config
 * @param logFile  - ["path1->path2", "path3->path4"]
 * @returns
 */
export function circularLogToMap(logFile: string[]): TSrcFileNamesByDest {
	let splittedChains = new Map<number, string[]>()
	let result: TSrcFileNamesByDest
	const CIRCULAR_DIVIDER = " -> "

	for (let i = 0; i < logFile.length; i++) {
		splittedChains.set(i, logFile[i].split(CIRCULAR_DIVIDER))
	}

	for (const [chainName, chain] of splittedChains) {
		if (chain?.length > 1) {
			for (let i = 0; i < chain.length; i++) {}
		} else {
            console.log('Error: not paired')
        }
	}

	return result
}
