/**
 *  The class is a **`default` CONTROLLER** .
 *  @class default
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.defaultVersion = this.kernel.settings.version;
    this.docPath = this.kernel.nodefonyPath;
  }

  /**
   *
   *  @method indexAction
   *
   */
  indexAction(version) {
    let defaultVersion = null;
    let force = this.query.force;
    if (!version) {
      defaultVersion = this.defaultVersion;
    } else {
      defaultVersion = version;
    }
    if (force) {
      try {
        let file = new nodefony.fileClass(this.kernel.rootDir + "/README.md");
        if (file) {
          let res = this.htmlMdParser(file.content(file.encoding), {
            linkify: true,
            typographer: true
          });
          return this.render("documentationBundle::index.html.twig", {
            bundle: "nodefony",
            readme: res,
            version: defaultVersion
          });
        }
      } catch (e) {
        this.logger(e, "ERROR");
      }
    }
    let myUrl = this.generateUrl("documentation-version", {
      bundle: "nodefony",
      version: defaultVersion
    });
    return this.redirect(myUrl);
  }

  subSectionAction(version, bundle, section) {
    let subsection = null;
    let Path = null;
    let finder = null;
    if (this.query.subsection) {
      subsection = this.query.subsection;
    } else {
      subsection = section;
    }

    if (!bundle) {
      bundle = "nodefony";
    }
    if (bundle === "nodefony") {
      Path = path.resolve(this.docPath);
    } else {
      if (this.kernel.bundles[bundle]) {
        Path = this.kernel.bundles[bundle].path;
      } else {
        Path = this.docPath;
      }
    }
    try {
      if (version) {
        if (section) {
          finder = new nodefony.finder({
            path: Path + "/doc/" + version + "/" + section,
            depth: 1
          });
        } else {
          finder = new nodefony.finder({
            path: Path + "/doc/" + version,
            depth: 1
          });
        }
      } else {
        throw "404";
      }
    } catch (e) {
      let myUrl = this.generateUrl("documentation-version", {
        bundle: "nodefony",
        version: this.defaultVersion
      });
      return this.redirect(myUrl);
    }
    let directory = finder.result.getDirectories();
    let sections = [];
    directory.forEach(function (ele) {
      sections.push(ele.name);
    });
    return this.render("documentationBundle:layouts:navSection.html.twig", {
      bundle: bundle,
      version: version,
      section: section,
      sections: sections,
      subsection: subsection
    });
  }

  versionAction(version, bundle, section) {
    let subsection = null;
    let Path = null;
    let finder = null;
    let myUrl = null;
    let directoryBundles = null;
    let file = null;
    let res = null;
    let finderVersion = null;

    if (this.query.subsection) {
      subsection = this.query.subsection;
    } else {
      subsection = "";
    }

    if (!bundle) {
      bundle = "nodefony";
    }
    if (bundle === "nodefony") {
      Path = path.resolve(this.docPath);
      let bundles = this.kernel.bundles;
      if (!section) {
        directoryBundles = [];
        for (var myBundle in bundles) {
          directoryBundles.push(bundles[myBundle]);
        }
      }

    } else {
      if (this.kernel.bundles[bundle]) {
        Path = this.kernel.bundles[bundle].path;
      } else {
        myUrl = this.generateUrl("documentation-version", {
          bundle: "nodefony",
          version: this.defaultVersion
        });
        return this.redirect(myUrl);
      }
    }
    // get all version
    try {
      finderVersion = new nodefony.finder({
        path: path.resolve(Path, "doc"),
        recurse: false
      });
    } catch (e) {
      throw e;
    }
    let directory = finderVersion.result.getDirectories();
    let all = [];
    directory.forEach(function (ele) {
      all.push(ele.name);
    });

    // manage link
    let findPath = null;
    try {
      if (version) {
        if (section) {
          if (subsection) {
            findPath = path.resolve(Path, "doc", version, section, subsection);
          } else {
            findPath = path.resolve(Path, "doc", version, section);
          }
        } else {
          findPath = path.resolve(Path, "doc", version);
        }
      } else {
        findPath = path.resolve(Path, "doc", "default");
      }
      findPath = new nodefony.fileClass(findPath);
    } catch (e) {
      findPath = path.resolve(Path, "doc", "default");
      try {
        findPath = new nodefony.fileClass(findPath);
        myUrl = this.generateUrl("documentation-version", {
          bundle: bundle,
          version: "default"
        });
        return this.redirect(myUrl);
      } catch (e) {
        myUrl = this.generateUrl("documentation-version", {
          bundle: "nodefony",
          version: "default"
        });
        return this.redirect(myUrl);
      }
    }

    finder = new nodefony.finder({
      path: findPath,
      recurse: false,
      followSymLink: true
    });

    let result = finder.result;
    if (section) {
      let force = this.query.force;
      if (!force) {
        //twig
        file = result.getFile("index.html.twig", true);
        if (file) {
          res = this.renderRawView(file, {
            bundle: bundle,
            readme: res,
            version: version,
            section: section,
            allVersions: all,
            subsection: subsection
          });
          return this.render("documentationBundle::index.html.twig", {
            bundle: bundle,
            readme: res,
            version: version,
            section: section,
            allVersions: all,
            subsection: subsection
          });
        }
      }
      // MD
      file = result.getFile("readme.md", true);
      if (!file) {
        return this.render("documentationBundle::index.html.twig", {
          bundle: bundle,
          version: version,
          section: section,
          allVersions: all,
          subsection: subsection
        });
      }
      res = this.htmlMdParser(file.content(file.encoding), {
        linkify: true,
        typographer: true
      });
      return this.render("documentationBundle::index.html.twig", {
        bundle: bundle,
        readme: res,
        version: version,
        section: section,
        allVersions: all,
        subsection: subsection
      });
    } else {
      let force = this.query.force;
      if (!force) {
        file = result.getFile("index.html.twig", true);
        if (file) {
          res = this.renderRawView(file, {
            bundle: bundle,
            readme: res,
            version: version,
            section: section,
            allVersions: all,
            subsection: subsection,
            bundles: directoryBundles
          });
          return this.render("documentationBundle::index.html.twig", {
            bundle: bundle,
            readme: res,
            version: version,
            section: section,
            allVersions: all,
            subsection: subsection,
            bundles: directoryBundles
          });
        }
      }

      file = result.getFile("README.md", true);
      if (file) {
        res = this.htmlMdParser(file.content(file.encoding), {
          linkify: true,
          typographer: true
        });
        return this.render("documentationBundle::index.html.twig", {
          bundle: bundle,
          readme: res,
          version: version,
          section: section,
          allVersions: all,
          subsection: subsection
        });
      } else {
        return this.render("documentationBundle::index.html.twig", {
          bundle: bundle,
          readme: res,
          version: version,
          section: section,
          allVersions: all,
          subsection: subsection
        });
      }
    }
  }

  navDocAction() {
    let finder = new nodefony.finder({
      path: path.resolve(this.docPath, "doc"),
      recurse: false,
    });

    let directory = finder.result.getDirectories();
    //console.log(directory)

    let versions = [];
    directory.forEach(function (ele) {
      versions.push(ele.name);
    });

    return this.renderSync("documentationBundle::navDoc.html.twig", {
      versions: versions
    });
  }

  navDocBundleAction() {
    let bundles = this.kernel.bundles;
    let directory = [];
    for (let bundle in bundles) {
      directory.push(bundles[bundle]);
    }
    return this.renderView("documentationBundle::navDocBundle.html.twig", {
      versions: directory
    });
  }

  /**
   *
   *   footer
   *
   *
   */
  footerAction() {
    let translateService = this.get("translation");
    let version = this.kernel.settings.version;
    let path = this.generateUrl("home");
    let year = new Date().getFullYear();
    let langs = translateService.getLangs();
    let locale = translateService.getLocale();
    let langOptions = "";
    for (let ele in langs) {
      if (locale === langs[ele].value) {
        langOptions += '<option value="' + langs[ele].value + '" selected >' + langs[ele].name + '</option>';
      } else {
        langOptions += '<option value="' + langs[ele].value + '" >' + langs[ele].name + '</option>';
      }
    }
    let html = '<nav class="navbar navbar-default navbar-fixed-bottom" role="navigation">\
             <div class"container-fluid">\
             <div class="navbar-header">\
             <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#footer-collapse">\
             <span class="sr-only">Toggle navigation</span>\
             <span class="icon-bar"></span>\
             <span class="icon-bar"></span>\
             <span class="icon-bar"></span>\
             </button>\
             <a class=" text-primary navbar-text" href="' + path + '" style="margin-left:20px" >\
             ' + year + '\
             <strong class="text-primary"> NODEFONY ' + version + '  ©</strong> \
             </a>\
             </div>\
             <div class="collapse navbar-collapse" id="footer-collapse">\
             <ul class="nav navbar-nav navbar-left">\
             </ul>\
             <ul class="nav navbar-nav navbar-right">\
             <li  class="navbar-btn pull-right" style="margin-right:40px">\
             <select id="langs"  class="form-control">\
             ' + langOptions + '\
             </select>\
             </li>\
             </div>\
             </div>\
             </div>\
             </div>';
    return this.getResponse(html);
  }

  searchAction() {
    let url = this.generateUrl("documentation-version", {
      bundle: "nodefony",
      version: "default"
    }, true);

    let request = this.getRequest();
    let context = this.getContext();
    //console.log(request.url.host)
    let query = request.query;
    if (query.search) {
      let webCrawler = this.get("webCrawler");
      webCrawler.siteAll(url, query.search, context, (data) => {
        this.renderJsonAsync(data);
      });
    } else {
      this.renderJsonAsync({});
    }
  }
};