module.exports = nodefony.registerController("default", function () {

  const defaultController = class defaultController extends nodefony.controller {
    constructor(container, context) {
      super(container, context);
    }

    /**
     *
     *	@method indexAction
     *
     */
    indexAction() {
      // markdown read and parse readme.md
      try {
        let path = this.get("kernel").rootDir + "/src/nodefony/bundles/unitTestBundle/readme.md";
        let file = new nodefony.fileClass(path);
        let res = this.htmlMdParser(file.content(file.encoding), {
          linkify: true,
          typographer: true
        });
        return this.render("unitTestBundle::index.html.twig", {
          readme: res
        });
      } catch (e) {
        return this.forward("frameworkBundle:default:system", {
          view: "unitTestBundle::index.html.twig",
          bundle: this.getParameters("bundles.unitTest")
        });
      }
    }
  };

  return defaultController;
});
