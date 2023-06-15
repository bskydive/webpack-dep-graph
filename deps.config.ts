import { IConfig } from "src/models/webpackStats.model"

/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
export const depsConfig: IConfig = {
	input: {
		webpackStatsFileName: "stats.json", // can be passed as a cli parameter to index.ts in package.json scripts section
	},
	filters: {
		exclude: [
            "node_modules",
		], // exclude by words in module path
		excludeExcept: [], // add some deps from excluded: exclude 'angular', but leave 'router'
		includeOnlyDestNode: [], // from nodes; applied after exclude and excludeExcept filters
		includeOnlySrcNode: [], // from edges/reasons; applied after exclude and excludeExcept filters
        excludeByMaxOutgoingCount: 5, // applied after exclude* and include* filters
        excludeByMaxIncomingCount: 0, // applied after exclude* and include* filters
        edgeTypeExclude: [
            "cjs self exports reference", // fake dependencies loops
			"export imported specifier", // re-export TODO check necessity
		],
        // TODO implement
        // depsCountEdgeColor: {
        //      0: 'green',
        //      10: 'red'
        // },
        // linesCountNodeFrame: { // file lines count
        //      0: '1px',
        //      500: '2px',
        //      1000: '5px'
        // },
        // codeComplexityNodeTextColor: {
        //      0: 'green',
        //      10: 'red'
        // },
        // collapseNodePaths: ['node_modules'], // replace edge-node-edge with one edge
        // collapseNodeColor: 'brown',
        // excludeNodeExceptColor: 'brown',
	},
	output: {
		testGraphmlJs2Xml: { // test js2xml
            enabled: false,
            fileName: '',
        },
		graphmlDeps: { // for yed editor
            enabled: true,
            fileName: "./graph-output/deps.graphml",
        },
		depsJson: { // js object
            enabled: true,
            fileName: './graph-output/deps.json',
        },
        statsJson: { // js object
            enabled: true,
            fileName: './graph-output/stats_summary.json',
        },
		circularDepsJson: { // 
            enabled: true,
            fileName: "./graph-output/circular.json",
        },
		cytoscapeJson: { // 
            enabled: true,
            fileName: "./graph-output/cytoscape.json",
        },
		simplifiedDot: { // human readable
            enabled: true,
            fileName: "./graph-output/graph_simplified.dot",
        },
	},
	graphml: {
		showSourceEdgeLabels: true,
		showDestEdgeLabels: false,
		node: {
			id: "n0",
			label: "",
			notes: "",
			x: 10,
			y: 10,
			height: 30,
			width: 100,
			textColor: "#FF0000",
			color: "#000000",
		},
		edge: {
			id: "e0",
			sourceKey: "n0",
			targetKey: "n0",
			label: "",
			width: 1,
			labelX: 0,
			labelY: 0,
			textColor: "#999999",
			color: "#999999",
		},
	},
	graphviz: {
		renderedDot: {
			enabled: false,
			engine: "dot",
			type: "dot",
			fileName: "./graph-output/graphviz.dot",
		},
		renderedDotPng: {
			enabled: false,
			engine: "dot",
			type: "png",
			fileName: "./graph-output/graphviz_dot.png",
		},
		renderedSpringPng: {
			enabled: false,
			engine: "neato",
			type: "png",
			fileName: "./graph-output/graphviz_spring.png",
		},
		renderedDirectedPng: {
			enabled: false,
			engine: "fdp",
			type: "png",
			fileName: "./graph-output/graphviz_directed.png",
		},
		renderedCircularPng: {
			enabled: false,
			engine: "circo",
			type: "png",
			fileName: "./graph-output/graphviz_circular.png",
		},
		renderedRadialPng: {
			enabled: false,
			engine: "twopi",
			type: "png",
			fileName: "./graph-output/graphviz_radial.png",
		},
		renderedClusteredPng: {
			enabled: false,
			engine: "osage",
			type: "png",
			fileName: "./graph-output/graphviz_clustered.png",
		},
	},
}
