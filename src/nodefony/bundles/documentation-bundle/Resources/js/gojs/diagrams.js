import "gojs";

class Diagram {
  constructor() {
    this.make = go.GraphObject.make;
    this.init();
  }

  init() {
    // create a Diagram for the DIV HTML element
    this.diagram = this.make(go.Diagram, "myDiagramDiv", {
      initialScale: 2
    });
    //this.diagram.initialScale = 2;

    this.createTemplateMap();
    this.createTemplate();
    this.displayDiagram();

  }


  createTemplateMap() {
    this.templateMap = new go.Map();
    this.diagram.nodeTemplateMap = this.templateMap;
    //this.diagram.nodeTemplate

  }


  createTemplate() {
    return this.make(go.Node, "Auto",
      new go.Binding("location", "loc", go.Point.parse),
      this.make(go.Shape, "RoundedRectangle", { // default values if the data.highlight is undefined:
          fill: "yellow",
          stroke: "orange",
          strokeWidth: 2
        },
        new go.Binding("fill", "highlight", function (v) {
          return v ? "pink" : "lightblue";
        }),
        new go.Binding("stroke", "highlight", function (v) {
          return v ? "red" : "blue";
        }),
        new go.Binding("strokeWidth", "highlight", function (v) {
          return v ? 3 : 1;
        })),
      this.make(go.TextBlock, {
          margin: 5
        },
        new go.Binding("text", "key"))
    );
  }

  setData() {
    return [
      {
        key: "Alpha",
        loc: "0 0",
        highlight: false,
        category: "simple"
      },
      {
        key: "Beta",
        loc: "100 50",
        highlight: true,
        category: "simple"
      },
      {
        key: "Gamma",
        loc: "0 100",
        category: "simple"
      } // highlight property undefined: use defaults
    ];
  }

  setLink() {
    return [
      {
        from: "Alpha",
        to: "Beta"
      }
    ];
  }

  displayDiagram() {
    this.templateMap.add("simple", this.createTemplate());
    this.diagram.model = new go.GraphLinksModel(this.setData(), this.setLink());
  }

}

export default new Diagram();