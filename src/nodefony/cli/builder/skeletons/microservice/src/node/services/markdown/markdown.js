const nodefony = require("nodefony");
const fs = require('fs');
const readFile = util.promisify(fs.readFile);


class Markdown extends nodefony.Service {

  constructor(service){
    super("Markdown", service.container);
    this.service = service ;
    this.settings = this.service.settings.markdown ;
    this.engine = require('markdown-it')(this.settings);
    this.log("Running");
  }

  fileToMarkdown(file){
    return readFile(file)
    .then((content)=>{
      return this.engine.render(content.toString("utf8"));
    })
    .catch((e)=>{
      throw e ;
    });
  }
}

module.exports = Markdown ;
