import { IWebpackAnalyzerConfig } from 'src/models/webpackAnalyzer.model'

/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
export const depsConfig: IWebpackAnalyzerConfig = {
	webpackStatsFileName: 'webpack-stats.json', // can be passed as a cli parameter to index.ts in package.json scripts section
	exclude: ['index', 'cache', 'webpack', 'node_modules', 'main', 'logger', 'profile', 'config', 'platform','settings', 'popup', 'app', 'confirm', 'analytics', 'theme', 'error', 'home'], // exclude by words in module path
	excludeExcept: ['index'], // add some deps from excluded: exclude 'angular', but leave 'router'
	includeOnlyDestNode: ['index.ts'], // from nodes; applied after exclude and excludeExcept filters
	includeOnlySrcNode: ['index.ts'], // from edges/reasons; applied after exclude and excludeExcept filters
	edgeTypeExclude: [
		'cjs self exports reference', // fake dependencies loops
		'export imported specifier', // re-export TODO check necessity
	],
    showSourceEdgeLabels: true,
    showDestEdgeLabels: false,
	testGraphmlJs2Xml: false, // test js2xml
	graphmlDeps: true, // for yed editor
	printImportAnalysis: false, // not implemented, legacy
	depsJson: true, // js object
	circularDepsJson: true,
	cytoscapeJson: true,
	simplifiedDot: true, // human readable
    output: {

    },
    graphml: {

    },
	graphviz: {
		renderedDot: {
			enabled: false,
			engine: 'dot',
			type: 'dot',
			fileName: './graph-output/graphviz.dot',
		},
		renderedDotPng: {
			enabled: false,
			engine: 'dot',
			type: 'png',
			fileName: './graph-output/graphviz_dot.png',
		},
		renderedSpringPng: {
			enabled: false,
			engine: 'neato',
			type: 'png',
			fileName: './graph-output/graphviz_spring.png',
		},
		renderedDirectedPng: {
			enabled: false,
			engine: 'fdp',
			type: 'png',
			fileName: './graph-output/graphviz_directed.png',
		},
		renderedCircularPng: {
			enabled: false,
			engine: 'circo',
			type: 'png',
			fileName: './graph-output/graphviz_circular.png',
		},
		renderedRadialPng: {
			enabled: false,
			engine: 'twopi',
			type: 'png',
			fileName: './graph-output/graphviz_radial.png',
		},
		renderedClusteredPng: {
			enabled: false,
			engine: 'osage',
			type: 'png',
			fileName: './graph-output/graphviz_clustered.png',
		},
	},
}
