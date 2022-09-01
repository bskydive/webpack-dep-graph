# Documentation

Here you can see some examples of input and output

 * input
    * example of the [webpack stats](./webpack-stats.json)
 * output
    * [json: circular dependencies](../graph-output/circular.json)
    * [json: cytoscape](../graph-output/cytoscape.json)
    * [json: analyzed deps from webpack stats](../graph-output/deps.json)
    * [xml: simplified dot graph](../graph-output/graph_simplified.dot)
        * ![](./graphviz_dot_simplified.jpg)
    * graphviz rendered
        * [xml: dot](../graph-output/graphviz.dot)
            * ![](./graphviz_dot.jpg)
        * [png: dot layout](../graph-output/graphviz_dot.png)
            * ![](./graphviz_dot_layout.jpg)
        * [png: spring layout](../graph-output/graphviz_spring.png)
            * ![](./graphviz_spring_layout.jpg)
        * [png: directed layout](../graph-output/graphviz_directed.png)
            * ![](./graphviz_directed_layout.jpg)
            * ![](./graphviz_directed_layout_full.jpg)
        * [png: circular layout](../graph-output/graphviz_circular.png)
            * ![](./graphviz_circle_layout.jpg)
            * ![](./graphviz_circle_layout_full.jpg)
        * [png: radial layout](../graph-output/graphviz_radial.png)
            * ![](./graphviz_radial_layout.jpg)
        * [png: clustered layout](../graph-output/graphviz_clustered.png)
            * ![](./graphviz_clustered_layout.jpg)
    * analyzed deps from webpack stats for [yed](https://www.yworks.com/products/yed) editor
        * see full in node data properties(right click)
            * ![](./graphml_data.jpg)
        * [graphml: raw xml](../graph-output/deps.graphml)
        * manually edited in yed [graphml: circular layout(alt+shift+c)](../graph-output/deps_circular.graphml)
            * ![](./graphml_xml.jpg)
            * ![](./graphml_png.jpg)

