/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [],
  options: {
    doNotFollow: {
      path: "node_modules"
    },
    tsPreCompilationDeps: false,
    tsConfig: {
      fileName: "./jsconfig.json"
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"]
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)",
        theme: {
          graph: {
            splines: "ortho",
            rankdir: "TD",
            bgcolor: "transparent",
            fontname: "Arial",
            fontsize: "9"
          },
          node: {
            color: "blue",
            fontcolor: "blue", 
            fontname: "Arial",
            fontsize: "9"
          },
          edge: {
            color: "grey",
            fontcolor: "grey",
            fontname: "Arial", 
            fontsize: "9"
          },
          modules: [
            {
              criteria: { source: "src/lib/patterns" },
              attributes: { 
                fillcolor: "#ffcccc",
                color: "#cc0000",
                fontcolor: "#cc0000"
              }
            },
            {
              criteria: { source: "src/lib/builders" },
              attributes: { 
                fillcolor: "#ccffcc",
                color: "#00cc00", 
                fontcolor: "#00cc00"
              }
            },
            {
              criteria: { source: "src/lib/strategies" },
              attributes: { 
                fillcolor: "#ccccff",
                color: "#0000cc",
                fontcolor: "#0000cc"
              }
            },
            {
              criteria: { source: "src/lib/factories" },
              attributes: { 
                fillcolor: "#ffffcc",
                color: "#cccc00",
                fontcolor: "#cccc00"
              }
            },
            {
              criteria: { source: "src/lib/SlideEngine.js" },
              attributes: { 
                fillcolor: "#ffccff",
                color: "#cc00cc",
                fontcolor: "#cc00cc"
              }
            }
          ]
        }
      }
    }
  }
};