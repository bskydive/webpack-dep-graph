# Webpack Dependency Graph Visualizer

Partially fixed, but not working yet. Fixing output format parsers.

## What is it

 * webpack stats.json parser
 * local web based dependencies graph viewer
 * [DOT]() graph converter
 * [cytoscape]() graph converter

## What is it for

- Detect a circular dependency in a large monorepo project.
- Figure out where the module is being used, imported and exported from.
- Analyze why webpack cannot tree-shake a particular module or dependency from the chunk.
- Refactoring decision maker helper
- addition tool for the [code analysis methodic](https://github.com/bskydive/code_quality_js)

## this project is based on 

- unmaintained broken [draft repo](https://github.com/heypoom/webpack-dep-graph)
- https://github.com/pahen/madge (Maintained, does not use webpack-stats.json)
- https://github.com/g0t4/webpack-stats-graph (Unmaintained)
- https://github.com/jantimon/webpack-dependency-stats (Unmaintained)

