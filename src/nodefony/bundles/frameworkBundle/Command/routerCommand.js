module.exports = nodefony.registerCommand("router", function () {


  const router = class router extends nodefony.cliKernel {

    constructor(container, command, options) {

      super("router", container, container.get("notificationsCenter"), options);

      this.router = this.container.get("router");
      let cmd = command[0].split(":");
      let args = command[1];
      switch (cmd[1]) {
      case "generate":
        switch (cmd[2]) {
        case "routes":
          this.getRoutes(null, true);
          break;
        case "route":
          if (args[0]) {
            this.getRoutes(args[0], true);
          } else {
            this.logger(new Error(command[0] + " must have route name"), "ERROR");
          }
          break;
        default:
          this.showHelp();
        }
        break;
      case "match":
        if (cmd[2] === "url") {
          if (args[0]) {
            this.matchRoutes(args[0]);
          } else {
            this.logger(new Error(command[0] + " must have url  to match"), "ERROR");
          }
        }
        break;
      default:
        this.showHelp();
      }
      this.terminate(0);
    }

    getRoutes(name, display) {
      var ele = this.router.getRoutes(name);
      if (ele && display) {
        if (nodefony.typeOf(ele) === "object") {
          ele = [ele];
        }
        try {
          this.displayTable("ROUTES", ele);
        } catch (e) {
          console.log(e);
        }
      }
      return ele;
    }

    displayTable(titre, ele, firstMatch) {
      var head = [
        "NB",
        "ROUTE",
        "PATH",
        //"VARIABLES",
        //"HOST",
        "BUNDLE",
        "CONTROLLER",
        "ACTION"
        //"OPTIONS"
        //"SCHEMES",
        //"PATTERN",
      ];
      if (firstMatch) {
        head.push("FIRST MATCH");
      }
      var table = super.displayTable(null, {
        head: head
      });
      for (var i = 0; i < ele.length; i++) {
        var detail = ele[i].defaults.controller.split(":");
        var tab = [
          i + 1,
          ele[i].name,
          ele[i].path,
          //ele[i].variables,
          //ele[i].host|| "",
          detail[0],
          detail[1],
          detail[2]
          //util.inspect( ele[i].options)
          //ele[i].schemes|| "",
          //ele[i].pattern,
        ];
        if (firstMatch) {
          tab.push(ele[i].firstMatch);
        }
        table.push(tab);
      }
      console.log(table.toString());
      return table;
    }

    matchRoutes(Url) {
      var myUrl = url.parse(Url);
      this.logger("URL TO CHECK : " + Url);
      var routes = this.getRoutes();
      var tab = [];
      for (var i = 0; i < routes.length; i++) {
        var pattern = routes[i].pattern;
        var res = myUrl.pathname.match(pattern);
        if (res) {
          tab.push(routes[i]);
        }
      }
      if (tab.length) {
        tab[0].firstMatch = "*";
        this.displayTable("MATCH URL : " + Url, tab, true);
      } else {
        this.logger("no routes match ", "ERROR");
        this.displayTable("no routes match GENARATE ALL ROUTE", routes);
      }
    }
  };

  return {
    name: "router",
    commands: {
      routes: ["router:generate:routes", "Generate all routes"],
      route: ["router:generate:route routeName", "Generate one route Example : nodefony router:generate:route home "],
      url: ["router:match:url url", "Get route who match url Example : nodefony router:match:url /nodefony"]
    },
    cli: router
  };
});
