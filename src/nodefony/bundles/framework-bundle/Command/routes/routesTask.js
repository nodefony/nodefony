class displayTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.router = this.get("router");
  }

  showHelp(help = "") {
    help += `\t${this.cli.clc.green("router:display:routes [routeName]")}\t\t Display all routes or route  Example : nodefony router:display:route home\n`;
    help += `\t${this.cli.clc.green("router:display:match url")}\t Get route who match url Example : nodefony router:display:match /nodefony`;
    console.log(help);
    return help;
  }

  routes(name = null) {
    try {
      return this.getRoutes(name, true);
    } catch (e) {
      throw e;
    }
  }


  match(url) {
    if (url) {
      return this.matchRoutes(url);
    } else {
      this.logger(new Error("Bad argument must have url  to match"), "ERROR");
    }
  }


  getRoutes(name, display) {
    let ele = this.router.getRoutes(name);
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
    if (ele) {
      return ele;
    }
    throw new Error(`Route : ${name} don't exist`);
  }

  displayTable(titre, ele, firstMatch) {
    let head = [
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
    let table = this.cli.displayTable(null, {
      head: head
    });
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].defaults.controller) {
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

}

module.exports = displayTask;