import { IWebpackAnalyzerConfig } from "src/models/webpackAnalyzer.model"

/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
export const depsConfig: IWebpackAnalyzerConfig = {
	input: {
		webpackStatsFileName: "webpack-stats.json", // can be passed as a cli parameter to index.ts in package.json scripts section
	},
	filters: {
		exclude: [
            "index",
			"node_modules",
            "main",
            "cache",
			"webpack",
			"logger",
			"profile",
			"config",
			"platform",
			"settings",
			"popup",
			"confirm",
			"analytics",
			"theme",
			"error",
		], // exclude by words in module path
		excludeExcept: [], // add some deps from excluded: exclude 'angular', but leave 'router'
		includeOnlyDestNode: [], // from nodes; applied after exclude and excludeExcept filters
		includeOnlySrcNode: [], // from edges/reasons; applied after exclude and excludeExcept filters
        // TODO implement
        excludeNodeByMaxDepsCount: 3, // applied after exclude* and include* filters
        edgeTypeExclude: [
			"cjs self exports reference", // fake dependencies loops
			"export imported specifier", // re-export TODO check necessity
		],
	},
	output: {
		printImportAnalysis: false, // not implemented, legacy
		testGraphmlJs2Xml: false, // test js2xml
		graphmlDeps: true, // for yed editor
		depsJson: true, // js object
		circularDepsJson: true,
		cytoscapeJson: true,
		simplifiedDot: true, // human readable
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
