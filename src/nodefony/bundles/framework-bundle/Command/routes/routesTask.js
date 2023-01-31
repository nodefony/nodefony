class displayTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.router = this.get("router");
  }

  showHelp () {
    this.setHelp(
      "router:display:routes [routeName]",
      "Display all routes or route  Example : nodefony router:display:route home"
    );
    this.setHelp(
      "router:display:match uri",
      "Get route who match uri Example : nodefony router:display:match /nodefony"
    );
  }

  routes (name = null) {
    try {
      if (this.command.json) {
        const ele = this.getRoutes(name);
        console.log(JSON.stringify(ele));
        return ele;
      }
      return this.getRoutes(name, true);
    } catch (e) {
      throw e;
    }
  }

  match (url) {
    if (url) {
      return this.matchRoutes(url);
    }
    this.log(new Error("Bad argument must have url  to match"), "ERROR");
  }


  getRoutes (name, display) {
    let ele = this.router.getRoutes(name);
    if (ele && display) {
      if (nodefony.typeOf(ele) === "object") {
        ele = [ele];
      }
      try {
        this.displayTable("ROUTES", ele);
        return ele;
      } catch (e) {
        console.log(e);
      }
    }
    if (ele) {
      return ele;
    }
    throw new Error(`Route : ${name} don't exist`);
  }

  displayTable (titre, ele, firstMatch) {
    const head = [
      "NB",
      "ROUTE",
      "PATH",
      // "VARIABLES",
      // "HOST",
      "BUNDLE",
      "CONTROLLER",
      "ACTION"
      // "OPTIONS"
      // "SCHEMES",
      // "PATTERN",
    ];
    // if (firstMatch) {
    head.push("FIRST MATCH");
    // }
    const table = this.cli.displayTable([], {
      head
    });
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].defaults.controller) {
        const detail = ele[i].defaults.controller.split(":");
        const tab = [
          i + 1,
          ele[i].name,
          ele[i].path,
          // ele[i].variables,
          // ele[i].host|| "",
          detail[0],
          detail[1],
          detail[2]
          // util.inspect( ele[i].options)
          // ele[i].schemes|| "",
          // ele[i].pattern,
        ];
        tab.push(ele[i].firstMatch || "none");

        /* if (firstMatch) {
          tab.push(ele[i].firstMatch);
        }else{
          tab.push("none");
        }*/
        table.push(tab);
      }
    }
    console.log(table.toString());
    return table;
  }

  matchRoutes (uri) {
    const myUrl = url.parse(uri);
    this.log(`URI TO CHECK : ${uri}`);
    const routes = this.getRoutes();
    const tab = [];
    for (let i = 0; i < routes.length; i++) {
      const {pattern} = routes[i];
      const res = myUrl.pathname.match(pattern);
      if (res) {
        tab.push(routes[i]);
      }
    }
    if (tab.length) {
      tab[0].firstMatch = "*";
      this.displayTable(`MATCH URI : ${uri}`, tab, true);
    } else {
      this.displayTable("no routes match GENARATE ALL ROUTE", routes);
      this.log(`URI : ${uri} no routes to match `, "ERROR");
    }
    return tab;
  }
}

module.exports = displayTask;
