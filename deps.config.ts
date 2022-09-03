import { IWebpackAnalyzerConfig } from 'src/models/webpackAnalyzer.model'

/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
export const depsConfig: IWebpackAnalyzerConfig = {
	projectRoot: '',
	webpackStatsFileName: 'webpack-stats.json', // can be passed as a cli parameter to index.ts in package.json scripts section
	exclude: ['cache', 'webpack', 'node_modules'],
	excludeExcept: [], // add some deps from excluded
	includeOnly: [], // exclude and excludeExcept will be ignored
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
			engine: 'dot',
            type: 'dot',
            fileName: './graph-output/graphviz.dot'
		},
		renderedDotPng: {
			enabled: false,
			engine: 'dot',
            type: 'png',
            fileName: './graph-output/graphviz_dot.png'
		},
		renderedSpringPng: {
			enabled: false,
			engine: 'neato',
            type: 'png',
            fileName: './graph-output/graphviz_spring.png'
		},
		renderedDirectedPng: {
			enabled: false,
			engine: 'fdp',
            type: 'png',
            fileName: './graph-output/graphviz_directed.png'
		},
		renderedCircularPng: {
			enabled: false,
			engine: 'circo',
            type: 'png',
            fileName: './graph-output/graphviz_circular.png'
		},
		renderedRadialPng: {
			enabled: false,
			engine: 'twopi',
            type: 'png',
            fileName: './graph-output/graphviz_radial.png'
		},
		renderedClusteredPng: {
			enabled: false,
			engine: 'osage',
            type: 'png',
            fileName: './graph-output/graphviz_clustered.png'
		},
	},
}
