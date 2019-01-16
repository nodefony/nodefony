// ROUTING

module.exports = {

  documentation: {
    pattern: "/documentation",
    defaults: {
      controller: "documentation:default:index"
    }
  },
  "documentation-search": {
    pattern: "/documentation/search",
    defaults: {
      controller: "documentation:default:search"
    }
  },
  "documentation-version": {
    pattern: `/documentation/{version}/{bundle}`,
    defaults: {
      controller: "documentation:default:version",
      bundle: "nodefony",
      version: nodefony.version,
    }
  },
  "documentation-section": {
    pattern: "/documentation/{version}/{bundle}/{section}",
    defaults: {
      controller: "documentation:default:version",
      version: nodefony.version,
      bundle: "nodefony",
      section: "default"
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