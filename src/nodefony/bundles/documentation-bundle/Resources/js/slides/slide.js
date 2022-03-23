import Reveal from 'reveal.js';
import jquery from 'jquery' ;
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Math from 'reveal.js/plugin/math/math.esm.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import Zoom from 'reveal.js/plugin/zoom/zoom.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import css from 'highlight.js/lib/languages/css';
import yaml from 'highlight.js/lib/languages/yaml';
import twig from 'highlight.js/lib/languages/twig';
import nginx from 'highlight.js/lib/languages/nginx';

import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";

//import "reveal.js/dist/theme/moon.css";
//import "reveal.js/dist/theme/source/solarized.scss";
//import "reveal.js/dist/theme/source/white.scss";
//import "reveal.js/dist/theme/source/night.scss";
//import "reveal.js/dist/theme/source/blood.scss";
//import "reveal.js/dist/theme/source/serif.scss";
//import "reveal.js/dist/theme/source/simple.scss";

//import 'highlight.js/styles/mono-blue.css';
import 'highlight.js/styles/atom-one-dark.css';
//import 'highlight.js/styles/github.css';
import '../../css/slides-nodefony.css';

class Slide {
  constructor() {

    jquery(document).ready(() => {
      //document.addEventListener('DOMContentLoaded', () => {
      this.reveal = new Reveal({
        plugins: [ Markdown, Math, Notes, Zoom /*Highlight*/]
      })
      this.reveal.initialize({
        controls: true,
        controlsBackArrows: 'faded',
        progress: true,
        history: true,
        center: false,
        //rtl:true,
        slideNumber: true,
        showSlideNumber: 'speaker',
        transition: 'slide',
        //transitionSpeed: "slow",
        //hideAddressBar: true,
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
        //margin: 0.06,
        //minScale: 1,
        //maxScale: 1
      }).then(()=>{
        /*Reveal.addKeyBinding({
          keyCode: 84,
          key: 't',
          description: 'Start timer'
        }, () => {
          console.log("pass t ");
        });*/
        hljs.registerLanguage('javascript', javascript);
        hljs.registerLanguage('bash', bash);
        hljs.registerLanguage('shell', shell);
        hljs.registerLanguage('css', css);
        hljs.registerLanguage('yaml', yaml);
        hljs.registerLanguage('twig', twig);
        hljs.registerLanguage('nginx', nginx);
        hljs.initHighlighting();
        //hljs.initHighlightingOnLoad();
      });
    });
  }
}
export default new Slide();
