export const depsConfig = {
	projectRoot: "",
	exclude: ["cache", "webpack", "node_modules"],
	excludeExcept: [], // add some deps from excluded
	includeOnly: [], // exclude and excludeExcept will be ignored
	testGraphml: false, // test js2xml
    printImportAnalysis: false, // not implemented, legacy
    depsJson: true,
    graphmlDeps: true,
    circularDepsJson: true,
    cytoscapeJson: true,
    graphvizRenderedDot: true, // large execution time!
    graphvizRenderedPng: true, // large execution time!
    graphvizDotSimplified: true,
}
