// ROUTING
module.exports = {

  "documentation-slide": {
    pattern: "/documentation/slides",
    defaults: {
      controller: "documentation:slide:slides"
    }
  },
  "documentation-notes": {
    pattern: "/documentation/notes.html",
    defaults: {
      controller: "documentation:slide:notes"
    }
  },
  "documentation-slides-server": {
    pattern: "/documentation/slides/server",
    defaults: {
      controller: "documentation:slide:slidesServer"
    }
  },
  "documentation-notes-server": {
    pattern: "/documentation/notes/server",
    defaults: {
      controller: "documentation:slide:notesServer"
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