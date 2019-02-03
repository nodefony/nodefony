const Reveal = require("reveal.js");
const jquery = require("jquery")

const hljs = require("highlight.js");
require("reveal.js/plugin/markdown/markdown.js");
require("reveal.js/plugin/markdown/markdown.js");
require("reveal.js/plugin/highlight/highlight.js");
//console.log(hljs);

import "reveal.js/css/reveal.scss";

//import "reveal.js/css/theme/moon.css";
//import "reveal.js/css/theme/source/solarized.scss";
//import "reveal.js/css/theme/source/white.scss";

//import "reveal.js/css/theme/source/sky.scss";
import "reveal.js/css/theme/source/night.scss";
//import "reveal.js/css/theme/source/blood.scss";
//import "reveal.js/css/theme/source/serif.scss";
//import "reveal.js/css/theme/source/simple.scss";

class Slide {
  constructor() {
    $(document).ready(() => {
      this.reveal = Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,
        markdown: {
          gfm: true,
          smartypants: true
        }
      });
    });


  }
}

export default new Slide();