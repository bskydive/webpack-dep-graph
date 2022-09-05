import { IWebpackAnalyzerConfig } from "src/models/webpackAnalyzer.model"

/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
export const depsConfig: IWebpackAnalyzerConfig = {
	webpackStatsFileName: "stats.json", // can be passed as a cli parameter to index.ts in package.json scripts section
	exclude: ["cache", "webpack", "node_modules", 'main', 'logger', 'index', 'profile', 'config', 'platform','settings', 'popup', 'app', 'confirm', 'analytics', 'theme', 'error', 'home'],
	excludeExcept: [], // add some deps from excluded
	includeOnlyDestNode: ['index.ts'], // from nodes; exclude and excludeExcept will be ignored
	includeOnlySrcNode: ['index.ts'], // from edges/reasons; exclude and excludeExcept will be ignored
	edgeTypeExclude: [
		"cjs self exports reference", // fake dependencies loops
		"export imported specifier", // re-export TODO check necessity
	],
	testGraphml: false, // test js2xml
	graphmlDeps: true, // for yed editor
	printImportAnalysis: false, // not implemented, legacy
	depsJson: true, // js object
	circularDepsJson: true,
	cytoscapeJson: true,
	simplifiedDot: true, // human readable
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
