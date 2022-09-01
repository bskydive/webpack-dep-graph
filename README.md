# Webpack Dependency Graph Visualizer

Fixed and working.

## What is it

 * webpack [stats.json](https://webpack.js.org/api/stats) parser/converter for visual/UI dependencies analysis
 * [configurable](./deps.config.ts) deps filters: exclude, except, include
 * [DOT](https://github.com/glejeune/node-graphviz) graph converter
 * [cytoscape](https://cytoscape.org/) graph converter
 * json graph converter
 * [graphml](http://graphml.graphdrawing.org/) graph converter for proprietary [yed](https://www.yworks.com/products/yed/download) editor
 * [output examples](./doc/README.md)
 * TODO [graphviz](http://magjac.com/graphviz-visual-editor/) graph viewer
 * TODO local webpack dev server
 * TODO [cytoscape](https://js.cytoscape.org) graph viewer

## What is it for

 * Refactoring decision making helper
 * addition tool for the [code analysis methodic](https://github.com/bskydive/code_quality_js)
 * Detect a circular dependency in a large monorepo project.
 * Figure out where the module is being used, imported and exported from.
 * Analyze why webpack cannot tree-shake a particular module or dependency from the chunk.

## How to run

 * set the [config](./deps.config.js) params
 * optionally use [node version manager](https://github.com/nvm-sh/nvm) to choose node@16+
 * execute in console
    ```bash
        nvm i 16 # optionally
        npm i
        cp ${your_project_folder}/stats.json ./webpack-dep-graph/webpack-stats.json
        npm run start
        
    ```
 * output
    * graph_text.dot
    * graph.dot
    * graph.png
    * deps.json
    * cytoscape.json

## this project is based on 

 * unmaintained broken [draft repo](https://github.com/heypoom/webpack-dep-graph)
 * https://github.com/pahen/madge (Maintained, does not use webpack-stats.json)
 * https://github.com/g0t4/webpack-stats-graph (Unmaintained)
 * https://github.com/jantimon/webpack-dependency-stats (Unmaintained)

