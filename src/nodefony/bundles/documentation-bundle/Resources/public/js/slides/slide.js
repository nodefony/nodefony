const Reveal = require("reveal.js");
const jquery = require("jquery");

//const hljs = require("highlight.js");
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github.css';
hljs.registerLanguage('javascript', javascript);


require("reveal.js/plugin/markdown/marked.js");
require("reveal.js/plugin/markdown/markdown.js");
require("reveal.js/plugin/math/math.js");
require("reveal.js/plugin/notes/notes.js");
require("reveal.js/plugin/zoom-js/zoom.js");
//require("reveal.js/plugin/highlight/highlight.js");
//console.log(hljs);

import "reveal.js/css/reveal.scss";

//import "reveal.js/css/theme/moon.css";
//import "reveal.js/css/theme/source/solarized.scss";
//import "reveal.js/css/theme/source/white.scss";

import "reveal.js/css/theme/source/sky.scss";
//import "reveal.js/css/theme/source/night.scss";
//import "reveal.js/css/theme/source/blood.scss";
//import "reveal.js/css/theme/source/serif.scss";
//import "reveal.js/css/theme/source/simple.scss";

import "reveal.js/lib/css/zenburn.css";

class Slide {
  constructor() {

    jquery(document).ready(() => {
      this.reveal = Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,
        slideNumber: true,
        showSlideNumber: 'all',
        //showNotes: true,
        //autoSlide: 5000,
        postMessage: true,
        //mouseWheel: true,
        //parallaxBackgroundImage: 'https://localhost:5152/framework-bundle/images/nodefony-logo.png',
        //parallaxBackgroundSize: "100% 100%",
        markdown: {
          gfm: true,
          tables: true,
          breaks: true,
          sanitize: true,
          smartLists: true,
          smartypants: true,
          xhtml: true
        },
        //width: 960,
        //height: 700,
        // Factor of the display size that should remain empty around the content
        //margin: 0.1,
        // Bounds for smallest/largest possible scale to apply to content
        //minScale: 0.2,
        //maxScale: 1.5
        width: "100%",
        height: "100%",
        margin: 0,
        minScale: 1,
        maxScale: 1
      });

      /*Reveal.addKeyBinding({
        keyCode: 84,
        key: 't',
        description: 'Start timer'
      }, () => {
        console.log("pass t ");
      });*/

      hljs.initHighlightingOnLoad();
    });


  }
}

export default new Slide();