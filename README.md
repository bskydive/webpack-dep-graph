# Webpack Dependency Graph Visualizer

Fixed and working.

## What is it

 * webpack [stats.json](https://webpack.js.org/api/stats) parser/converter for visual/UI dependencies analysis
 * [configurable](./deps.config.ts) deps filters: exclude, except, include
 * [DOT](https://github.com/glejeune/node-graphviz) graph converter
 * [cytoscape](https://cytoscape.org/) graph converter
 * json graph converter
 * [graphml](http://graphml.graphdrawing.org/) graph converter for proprietary [yed](https://www.yworks.com/products/yed/download) editor
 * TODO [graphviz](http://magjac.com/graphviz-visual-editor/) graph viewer
 * TODO local webpack dev server
 * TODO [cytoscape](https://js.cytoscape.org) graph viewer
 * TODO file size viewer

### Examples

The graphviz layout renderer seems to be useless. You can upload the simplified dot file into any [graphviz editor](http://magjac.com/graphviz-visual-editor/) and try to play with settings. Generating graphml and editing it in [yEd](https://www.yworks.com/products/yed/download) are the best option for now.

 * input
    * example of the [webpack stats](./doc/webpack-stats.json)
 * output
    * [json: circular dependencies](./graph-output/circular.json)
    * [json: cytoscape](./graph-output/cytoscape.json)
    * [json: analyzed deps from webpack stats](./graph-output/deps.json)
    * [xml: simplified dot graph](./graph-output/graph_simplified.dot)
        * ![](./doc/graphviz_dot_simplified.jpg)
    * graphviz
        * summary: imports: 1551, re-exports: 0, issuers: 1252
        * [deps.config.ts](./deps.config.ts)
            ```ts
                exclude: ['cache', 'webpack', 'node_modules'],
                excludeExcept: [], includeOnly: [],
            ```
        * [xml: dot](./graph-output/graphviz.dot)
            * ![](./doc/graphviz_dot.jpg)
        * [png: dot layout](./graph-output/graphviz_dot.png)
            * ![](./doc/graphviz_dot_layout.jpg)
        * [png: spring layout](./graph-output/graphviz_spring.png)
            * ![](./doc/graphviz_spring_layout.jpg)
        * [png: directed layout](./graph-output/graphviz_directed.png)
            * ![](./doc/graphviz_directed_layout.jpg)
            * ![](./doc/graphviz_directed_layout_full.jpg)
        * [png: circular layout](./graph-output/graphviz_circular.png)
            * ![](./doc/graphviz_circle_layout.jpg)
            * ![](./doc/graphviz_circle_layout_full.jpg)
        * [png: radial layout](./graph-output/graphviz_radial.png)
            * ![](./doc/graphviz_radial_layout.jpg)
        * [png: clustered layout](./graph-output/graphviz_clustered.png)
            * ![](./doc/graphviz_clustered_layout.jpg)
    * graphml for [yed](https://www.yworks.com/products/yed) editor
        * see full in node data properties(right click)
            * ![](./doc/graphml_yed_data.jpg)
        * search in nodes, urls, properties
            * ![](./doc/graphml_yed_search.jpg)
        * [graphml: raw xml](./graph-output/deps.graphml)
        * Manually applied in yed circular layout: `tools-->fit node to label`, `layout-->circular (alt+shift+c)`
            * exclude non project files
                * summary: imports: 1551, re-exports: 0, issuers: 1252
                * [deps.config.ts](./deps.config.ts)
                    ```ts
                        exclude: ['cache', 'webpack', 'node_modules'],
                        excludeExcept: [], includeOnly: [],
                    ```
                * [graphml](./graph-output/deps_circular.graphml)
                * ![](./doc/graphml_xml.jpg)
                * ![](./doc/graphml_png.jpg)
            * include all
                * summary: imports: 7800; re-exports: 0; issuers: 7493; dependencies: 1630
                * [deps.config.ts](./deps.config.ts)
                    ```ts
                        exclude: [], excludeExcept: [], includeOnly: [],
                    ```
                * ![](./doc/graphml_all.jpg)
            * include only angular
                * summary: imports: 64, re-exports: 0, issuers: 52
                * [deps.config.ts](./deps.config.ts)
                    ```ts
                        exclude: ['cache', 'webpack', 'node_modules'],
                        excludeExcept: [], includeOnly: ['angular'],
                    ```
                * ![](./doc/graphml_only.jpg)
            * exclude non project files except angular
                * summary: imports: 2025; re-exports: 0; issuers: 1678; dependencies: 237
                * [deps.config.ts](./deps.config.ts)
                    ```ts
                        exclude: ['cache', 'webpack', 'node_modules'],
                        excludeExcept: ['angular'], includeOnly: [],
                    ```
                * ![](./doc/graphml_except.jpg)


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

## this project is based on 

 * unmaintained broken [draft repo](https://github.com/heypoom/webpack-dep-graph)
 * https://github.com/pahen/madge (Maintained, does not use webpack-stats.json)
 * https://github.com/g0t4/webpack-stats-graph (Unmaintained)
 * https://github.com/jantimon/webpack-dependency-stats (Unmaintained)

