/**
 * Source: https://github.com/pahen/madge/blob/master/lib/cyclic.js
 */
export function getCircularImports(dependenciesMap: Record<string, string[]>): string[][] {
  const circular: string[][] = []

  const resolved: Map<string, boolean> = new Map()
  const unresolved: Map<string, boolean> = new Map()

  function getPath(parent: string) {
    let visited = false

    return Object.keys(unresolved).filter((module) => {
      if (module === parent) visited = true

      return visited && unresolved.get(module)
    })
  }

  function resolve(id: string) {
    unresolved.set(id, true)

    if (dependenciesMap[id]) {
      dependenciesMap[id].forEach((dependency) => {
        if (!resolved.get(dependency)) {
          if (unresolved.get(dependency)) {
            const paths = getPath(dependency)

            return circular.push(paths)
          }

          resolve(dependency)
        }
      })
    }

    resolved.set(id, true)
    unresolved.set(id, false)
  }

  Object.keys(dependenciesMap).forEach(resolve)

  return circular
}
