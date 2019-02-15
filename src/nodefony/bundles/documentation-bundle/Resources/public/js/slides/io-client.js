const io = require("socket.io-client");
const jquery = require("jquery");
const Reveal = require("reveal.js");


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

//import "reveal.js/css/theme/source/sky.scss";
import "reveal.js/css/theme/source/night.scss";
//import "reveal.js/css/theme/source/blood.scss";
//import "reveal.js/css/theme/source/serif.scss";
//import "reveal.js/css/theme/source/simple.scss";

import "reveal.js/lib/css/zenburn.css";

class NotesClient {
  constructor() {
    this.url = "/reveal";
    jquery(document).ready(() => {
      this.initialize();
      this.initSocket();
      this.post();
    });
  }

  initialize() {

    this.reveal = Reveal.initialize({
      controls: true,
      progress: true,
      history: false,
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

    hljs.initHighlightingOnLoad();

  }

  initSocket() {
    this.socket = io.connect(this.url, {
      transports: ['websocket'],
      path: '/socket.io',
      forceNew: true
    });
    this.socketId = Math.random().toString().slice(2);

    console.log('View slide notes at ' + window.location.origin + '/documentation/notes/server/' + this.socketId);

    this.socket.on('new-subscriber', (data) => {
      console.log("new - subscriber")
      this.post();
    });

    // When the state changes from inside of the speaker view
    this.socket.on('statechanged-speaker', (data) => {
      Reveal.setState(data.state);
    });

    /*if (window.location.search.match(/receiver/gi)) {
      return;
    }*/

    Reveal.addEventListener('slidechanged', () => {
      this.post();
    });
    Reveal.addEventListener('fragmentshown', () => {
      this.post();
    });
    Reveal.addEventListener('fragmenthidden', () => {
      this.post();
    });
    Reveal.addEventListener('overviewhidden', () => {
      this.post();
    });
    Reveal.addEventListener('overviewshown', () => {
      this.post();
    });
    Reveal.addEventListener('paused', () => {
      this.post();
    });
    Reveal.addEventListener('resumed', () => {
      this.post();
    });

  }

  post() {
    this.slideElement = Reveal.getCurrentSlide();
    this.notesElement = this.slideElement.querySelector('aside.notes');
    let messageData = {
      notes: '',
      markdown: false,
      socketId: this.socketId,
      state: Reveal.getState()
    };
    // Look for notes defined in a slide attribute
    if (this.slideElement.hasAttribute('data-notes')) {
      messageData.notes = this.slideElement.getAttribute('data-notes');
    }
    // Look for notes defined in an aside element
    if (this.notesElement) {
      messageData.notes = this.notesElement.innerHTML;
      messageData.markdown = typeof this.notesElement.getAttribute('data-markdown') === 'string';
    }
    this.socket.emit('statechanged', messageData);
  }

}

export default new NotesClient();