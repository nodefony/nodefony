// ROUTING
module.exports = {

  "documentation-slide": {
    pattern: "/documentation/slide",
    defaults: {
      controller: "documentation:slide:index"
    }
  },
  "documentation-search": {
    pattern: "/documentation/search",
    defaults: {
      controller: "documentation:default:search"
    }
  },
  "documentation": {
    pattern: "/documentation/{version}/{bundle}",
    defaults: {
      controller: "documentation:default:version",
      bundle: nodefony.projectPackage.name,
      version: nodefony.projectPackage.version
    }
  },
  "documentation-version": {
    pattern: `/documentation/{version}/{bundle}`,
    defaults: {
      controller: "documentation:default:version",
      bundle: nodefony.projectPackage.name,
      version: nodefony.projectPackage.version
    }
  },
  "documentation-section": {
    pattern: "/documentation/{version}/{bundle}/{section}",
    defaults: {
      controller: "documentation:default:version",
      bundle: nodefony.projectPackage.name,
      version: nodefony.projectPackage.version
    }
  },
  "documentation-demo-html": {
    pattern: "/doc/demo/html/{name}",
    defaults: {
      controller: "documentation:demo:html",
      name: "nodefony"
    }
  },
  "documentation-demo-render": {
    pattern: "/doc/demo/render/{name}",
    defaults: {
      controller: "documentation:demo:render",
      name: "nodefony"
    }
  }
};