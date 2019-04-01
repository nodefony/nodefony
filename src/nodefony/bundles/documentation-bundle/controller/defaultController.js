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
    this.docPath = this.kernel.nodefonyPath;
    this.urlGit = this.bundle.settings.github.url;
    this.git = this.get("git");
    this.defaultVersion = this.git.currentVersion;
    this.currentVersion = nodefony.version;
    this.project = nodefony.projectName;
  }

  getVersions() {
    return this.git.getReleases()
      .then((tags) => {
        return tags;
      }).catch(e => {
        throw e;
      });
  }

  /**
   *
   */
  headerAction(version) {
    return this.render("documentation:layouts:header.html.twig", {
      langs: this.get("translation").getLangs(),
      locale: this.getLocale(),
      version: version || this.defaultVersion,
      bundle: "nodefony"
    });
  }

  /**
   *
   */
  footerAction() {
    let version = this.kernel.settings.version;
    return this.render("documentation:layouts:footer.html.twig", {
      version: version,
      year: new Date().getFullYear()
    });
  }

  /**
   *    @Method ({ "GET"})
   *    @Route ("/document/lang", name="doc-lang")
   */
  langAction() {
    if (this.query.language) {
      if (this.session) {
        this.session.set("lang", this.query.language);
        let route = this.session.getMetaBag("lastRoute");
        if (route) {
          return this.redirect(this.url(route));
        }
      }
    }
    let referer = this.request.getHeader("referer");
    if (referer) {
      return this.redirect(referer);
    }
    return this.redirect("/");
  }

  searchAction() {
    let url = this.generateUrl("documentation-version", {
      bundle: "nodefony",
      version: this.defaultVersion
    }, true);
    if (this.query.search) {
      let webCrawler = this.get("webCrawler");
      webCrawler.siteAll(url, this.query.search, this.context, (data) => {
        this.renderJsonAsync(data);
      });
    } else {
      this.renderJsonAsync({});
    }
  }

  /**
   *
   *  @method indexAction
   *
   */
  indexAction(version) {
    let defaultVersion = this.currentVersion;
    let force = this.query.force;
    if (version) {
      defaultVersion = version;
    }
    if (force) {
      try {
        let file = new nodefony.fileClass(path.resolve(this.kernel.rootDir, "README.md"));
        if (file) {
          let res = this.htmlMdParser(file.content(file.encoding), {
            linkify: true,
            typographer: true
          });
          return this.render("documentation::index.html.twig", {
            bundle: this.project,
            readme: res,
            version: defaultVersion,
            url: this.urlGit,
            project: this.project
          });
        }
      } catch (e) {
        this.logger(e, "ERROR");
      }
    }
    let myUrl = this.generateUrl("documentation-version", {
      bundle: this.project,
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
      if (bundle === this.project) {
        Path = this.kernel.rootDir;
      } else {
        if (this.kernel.bundles[bundle]) {
          Path = this.kernel.bundles[bundle].path;
        } else {
          Path = this.kernel.rootDir;
        }
      }
    }
    try {
      if (section) {
        finder = new nodefony.finder({
          path: Path + "/doc/" + section,
          depth: 1
        });
      } else {
        finder = new nodefony.finder({
          path: Path + "/doc/",
          depth: 1
        });
      }
    } catch (e) {
      throw e;
    }
    let directory = finder.result.getDirectories();
    let sections = [];
    directory.forEach(function (ele) {
      sections.push(ele.name);
    });
    return this.render("documentation:layouts:navSection.html.twig", {
      bundle: bundle,
      version: version,
      section: section,
      sections: sections,
      subsection: subsection
    });
  }

  versionAction(version, bundle, section) {
    let Path = null;
    if (this.method === "POST" && this.query) {
      if (this.query.version) {
        if (this.query.version !== this.defaultVersion) {
          // CHANGE VERSION
          return this.git.checkoutVersion(this.query.version, "nodefony")
            .then((ele) => {
              return this.redirectToRoute("documentation-version", {
                version: ele,
                bundle: "nodefony"
              });
            });
        } else {
          return this.redirectToRoute("documentation-version", {
            version: this.query.version,
            bundle: "nodefony"
          });
        }
      }
      if (this.query.project) {
        return this.git.getCurrentBranch()
          .then((ele) => {
            return this.redirectToRoute("documentation-version", {
              version: ele,
              bundle: this.project
            });
          });
      }
    }
    if (!Path) {
      Path = this.git.getClonePath();
    }
    let subsection = null;
    let finder = null;
    let myUrl = null;
    let directoryBundles = null;
    let file = null;
    let readme = null;
    let res = null;

    if (this.query.subsection) {
      subsection = this.query.subsection;
    } else {
      subsection = "";
    }

    if (!bundle) {
      bundle = "nodefony";
    }
    if (bundle === this.project) {
      Path = this.kernel.rootDir;
      let bundles = this.kernel.bundles;
      if (!section) {
        directoryBundles = [];
        for (let myBundle in bundles) {
          if (!(myBundle + "-bundle" in this.kernel.bundlesCore) || this.project === "nodefony-core") {
            directoryBundles.push(bundles[myBundle]);
          }
        }
      }
    } else {
      if (bundle === "nodefony") {
        Path = path.resolve(Path, "src", "nodefony");
        let bundles = this.kernel.bundles;
        if (!section) {
          directoryBundles = [];
          for (let myBundle in bundles) {
            if (myBundle + "-bundle" in this.kernel.bundlesCore) {
              directoryBundles.push(bundles[myBundle]);
            }
          }
        }
      } else {
        if (this.kernel.bundles[bundle]) {
          Path = this.kernel.bundles[bundle].path;
        } else {
          myUrl = this.generateUrl("documentation-version", {
            bundle: nodefony.projectName,
            version: this.defaultVersion
          });
          return this.redirect(myUrl);
        }
      }
    }
    // manage link
    let findPath = null;
    try {
      if (section) {
        if (subsection) {
          findPath = path.resolve(Path, "doc", section, subsection);
        } else {
          findPath = path.resolve(Path, "doc", section);
        }
      } else {
        findPath = path.resolve(Path, "doc");
      }
      findPath = new nodefony.fileClass(findPath);
    } catch (e) {
      findPath = path.resolve(Path, "doc");
      try {
        findPath = new nodefony.fileClass(findPath);
        myUrl = this.generateUrl("documentation-version", {
          bundle: bundle,
          version: version
        });
        return this.redirect(myUrl);
      } catch (e) {
        myUrl = this.generateUrl("documentation-version", {
          bundle: "nodefony",
          version: version
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
    file = result.getFile("index.html.twig", true);
    readme = result.getFile("README.md", true);
    if (!readme) {
      readme = result.getFile("readme.md", true);
    }
    if (readme) {
      res = this.htmlMdParser(readme.content(readme.encoding), {
        linkify: true,
        typographer: true
      });
    }
    let data = {
      bundle: bundle,
      version: version,
      section: section,
      subsection: subsection,
      bundles: directoryBundles,
      url: this.urlGit,
      project: this.project
    };
    if (file) {
      res = this.renderRawView(file, nodefony.extend(data, {
        readme: res
      }));
    }
    return this.render("documentation::index.html.twig", nodefony.extend(data, {
      readme: res
    }));
  }

};