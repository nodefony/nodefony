const path = require("path");
const asciify = require('asciify-image');

class mobilenetCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("mobilenet", cli, bundle);
    this.mobilenetService = this.get("mobileNet");
  }

  showHelp() {
    this.setHelp("mobilenet:load",
      "Load mobilenet model datasets"
    );
    this.setHelp("mobilenet:classify",
      "Classify image with mobilenet convolition model "
    );
  }

  async load() {
    const model = await this.mobilenetService.loadModel();
    return model;
  }

  async classify(mypath) {
    let img;
    if (path) {
      img = path.resolve(mypath)
    }
    if (!img) {
      throw new Error("bad image path")
    }

    const asciified = await asciify(img, {
        fit: 'box',
        width:  35,
        height: 35
        //width: 5,
        //height: 5,
        //format:"array"
      })

    this.log(`
${asciified}`);
    return await this.mobilenetService.classify(img)
  }

}
module.exports = mobilenetCommand;
