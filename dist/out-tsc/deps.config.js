"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depsConfig = void 0;
/**
 * graphviz calculation takes a large time
 * https://graphviz.org/docs/layouts/
 * RenderEngine = 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
 */
exports.depsConfig = {
    projectRoot: '',
    exclude: ['cache', 'webpack', 'node_modules'],
    excludeExcept: [],
    includeOnly: [],
    testGraphml: false,
    graphmlDeps: true,
    printImportAnalysis: false,
    depsJson: true,
    circularDepsJson: true,
    cytoscapeJson: true,
    simplifiedDot: true,
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
};
