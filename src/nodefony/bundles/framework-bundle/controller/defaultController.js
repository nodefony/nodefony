module.exports = class defaultController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
  }

  ["404Action"] (error) {
    if (!error) {
      error = new Error();
      error.code = 404;
      throw error;
    }
    this.getResponse().setStatusCode(404);
    if (this.context.isJson) {
      return this.render("frameworkBundle::404.json.twig", {
        error: error ? error : new Error("Not Found")
      });
    }
    return this.render("frameworkBundle::404.html.twig", {
      error: error ? error : new Error("Not Found")
    });
  }

  ["401Action"] (error) {
    if (!error) {
      error = new Error("Unauthorized");
      error.code = 401;
      throw error;
    }
    this.getResponse().setStatusCode(401);
    if (this.context.isJson) {
      return this.render("frameworkBundle::401.json.twig", {
        error
      });
    }
    // this.context.response.setHeaders({"Content-Type": "text/html; charset=utf-8"});
    return this.render("frameworkBundle::401.html.twig", {
      error
    });
  }

  ["403Action"] (error) {
    if (!error) {
      error = new Error();
      error.code = 403;
      throw error;
    }
    this.getResponse().setStatusCode(403);
    if (this.context.isJson) {
      return this.render("frameworkBundle::403.json.twig", {
        error
      });
    }
    return this.render("frameworkBundle::403.html.twig", {
      error
    });
  }

  ["500Action"] (error) {
    if (!error) {
      error = new Error();
      error.code = 500;
      throw error;
    }
    this.getResponse().setStatusCode(500);
    if (this.context.isJson) {
      return this.render("frameworkBundle::exception.json.twig", {
        error
      });
    }
    return this.render("frameworkBundle::exception.html.twig", {
      error
    });
  }

  exceptionsAction (error) {
    if (!error) {
      error = new Error();
      error.code = 500;
      throw error;
    }
    if (this.context.isJson) {
      return this.render("frameworkBundle::exception.json.twig", {
        error
      });
    }
    return this.render("frameworkBundle::exception.html.twig", {
      error
    });
  }

  timeoutAction (error) {
    if (this.context.isJson) {
      return this.render("frameworkBundle::timeout.json.twig", {
        error
      });
    }
    // this.context.response.setHeaders({"Content-Type": "text/html; charset=utf-8"});
    return this.render("frameworkBundle::timeout.html.twig", {
      error
    });
  }

  readmeAction () {
    const kernel = this.container.get("kernel");
    const path = `${kernel.rootDir}/README.md`;
    const file = new nodefony.fileClass(path);
    const res = this.htmlMdParser(file.content(), {
      linkify: true,
      typographer: true
    });
    return this.render("frameworkBundle::md.html.twig", {
      html: res
    });
  }
};
