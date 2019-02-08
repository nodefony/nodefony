//const Reveal = require("reveal.js");
const jquery = require("jquery");
const io = require("socket.io-client");

const marked = require("reveal.js/plugin/markdown/marked.js");

const SPEAKER_LAYOUTS = {
  'default': 'Default',
  'wide': 'Wide',
  'tall': 'Tall',
  'notes-only': 'Notes only'
};

const params = [
  'receiver',
  'progress=false',
  'history=false',
  'transition=none',
  'backgroundTransition=none'
].join('&');

import "../../css/notes-server.css";

class NotesServer {
  constructor() {
    this.notes = null;
    this.notesValue = null;
    this.currentState = null;
    this.currentSlide = null;
    this.upcomingSlide = null;
    this.layoutLabel = null;
    this.layoutDropdown = null;
    this.connected = false;
    this.url = "/reveal";
    this.slideUrl = "https://localhost:5152/documentation/slides/server";
    jquery(document).ready(() => {
      this.initialize();
      this.initSocket();
    });
  }

  initialize() {

    this.setupLayout();
    this.setupIframes();
    // Limit to max one state update per X ms
    this.handleStateMessage = this.debounce(this.handleStateMessage, 200);

    // Once the iframes have loaded, emit a signal saying there's
    // a new subscriber which will trigger a 'statechanged'
    // message to be sent back
    window.addEventListener('message', (event) => {
      if (!event.data) {
        return;
      }
      let data = null;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      if (!data.data) {
        return;
      }
      if (data && data.namespace === 'reveal') {
        if (/ready/.test(data.eventName)) {
          this.socket.emit('new-subscriber', {
            socketId: this.socketId
          });
        }
      }
      // Messages sent by reveal.js inside of the current slide preview
      if (data && data.namespace === 'reveal') {
        if (/slidechanged|fragmentshown|fragmenthidden|overviewshown|overviewhidden|paused|resumed/.test(data.eventName) &&
          this.currentState !== JSON.stringify(data.state)) {
          this.socket.emit('statechanged-speaker', {
            state: data.state
          });
        }
      }
    });
  }

  initSocket() {
    this.socket = io(this.url, {
      transports: ['websocket'],
      path: '/socket.io'
    });
    this.socket.on('connect', () => {
      this.socketId = this.socket.id;
      if (this.connected === false) {
        this.connected = true;
        this.setupKeyboard();
        this.setupNotes();
        this.setupTimer();
      }
    });

    this.socket.on('statechanged', (data) => {
      // ignore data from sockets that aren't ours
      /*if (data.socketId !== this.socketId) {
        return;
      }*/
      this.handleStateMessage(data);
    });
  }

  /**
   * Called when the main window sends an updated state.
   */
  handleStateMessage(data) {
    // Store the most recently set state to avoid circular loops
    // applying the same state
    this.currentState = JSON.stringify(data.state);

    // No need for updating the notes in case of fragment changes
    if (data.notes) {
      this.notes.classList.remove('hidden');
      if (data.markdown) {
        this.notesValue.innerHTML = marked(data.notes);
      } else {
        this.notesValue.innerHTML = data.notes;
      }
    } else {
      this.notes.classList.add('hidden');
    }
    // Update the note slides
    this.currentSlide.contentWindow.postMessage(JSON.stringify({
      method: 'setState',
      args: [data.state]
    }), '*');
    this.upcomingSlide.contentWindow.postMessage(JSON.stringify({
      method: 'setState',
      args: [data.state]
    }), '*');
    this.upcomingSlide.contentWindow.postMessage(JSON.stringify({
      method: 'next'
    }), '*');
  }

  /**
   * Forward keyboard events to the current slide window.
   * This enables keyboard events to work even if focus
   * isn't set on the current slide iframe.
   */
  setupKeyboard() {
    document.addEventListener('keydown', (event) => {
      this.currentSlide.contentWindow.postMessage(JSON.stringify({
        method: 'triggerKey',
        args: [event.keyCode]
      }), '*');
    });
  }

  /**
   * Creates the preview iframes.
   */
  setupIframes() {
    this.currentURL = this.slideUrl + '/?' + params + '&postMessageEvents=true';
    this.upcomingURL = this.slideUrl + '/?' + params + '&controls=false';
    this.currentSlide = document.createElement('iframe');
    this.currentSlide.setAttribute('width', 1280);
    this.currentSlide.setAttribute('height', 1024);
    this.currentSlide.setAttribute('src', this.currentURL);
    document.querySelector('#current-slide').appendChild(this.currentSlide);
    this.upcomingSlide = document.createElement('iframe');
    this.upcomingSlide.setAttribute('width', 640);
    this.upcomingSlide.setAttribute('height', 512);
    this.upcomingSlide.setAttribute('src', this.upcomingURL);
    document.querySelector('#upcoming-slide').appendChild(this.upcomingSlide);
  }

  /**
   * Setup the notes UI.
   */
  setupNotes() {
    this.notes = document.querySelector('.speaker-controls-notes');
    this.notesValue = document.querySelector('.speaker-controls-notes .value');
  }

  /**
   * Create the timer and clock and start updating them
   * at an interval.
   */
  setupTimer() {
    this.start = new Date();
    this.timeEl = document.querySelector('.speaker-controls-time');
    this.clockEl = this.timeEl.querySelector('.clock-value');
    this.hoursEl = this.timeEl.querySelector('.hours-value');
    this.minutesEl = this.timeEl.querySelector('.minutes-value');
    this.secondsEl = this.timeEl.querySelector('.seconds-value');
    // Update once directly
    this._updateTimer();
    // Then update every second
    setInterval(this._updateTimer.bind(this), 1000);
    this.timeEl.addEventListener('click', () => {
      this.start = new Date();
      this._updateTimer();
      return false;
    });
  }

  _updateTimer() {
    let diff, hours, minutes, seconds,
      now = new Date();
    diff = now.getTime() - this.start.getTime();
    hours = Math.floor(diff / (1000 * 60 * 60));
    minutes = Math.floor((diff / (1000 * 60)) % 60);
    seconds = Math.floor((diff / 1000) % 60);

    this.clockEl.innerHTML = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
    this.hoursEl.innerHTML = this.zeroPadInteger(hours);
    this.hoursEl.className = hours > 0 ? '' : 'mute';
    this.minutesEl.innerHTML = ':' + this.zeroPadInteger(minutes);
    this.minutesEl.className = minutes > 0 ? '' : 'mute';
    this.secondsEl.innerHTML = ':' + this.zeroPadInteger(seconds);
  }

  /**
   * Sets up the speaker view layout and layout selector.
   */
  setupLayout() {
    this.layoutDropdown = document.querySelector('.speaker-layout-dropdown');
    this.layoutLabel = document.querySelector('.speaker-layout-label');

    // Render the list of available layouts
    for (let id in SPEAKER_LAYOUTS) {
      let option = document.createElement('option');
      option.setAttribute('value', id);
      option.textContent = SPEAKER_LAYOUTS[id];
      this.layoutDropdown.appendChild(option);
    }
    // Monitor the dropdown for changes
    this.layoutDropdown.addEventListener('change', (event) => {
      this.setLayout(this.layoutDropdown.value);
    }, false);

    // Restore any currently persisted layout
    this.setLayout(this.getLayout());
  }

  /**
   * Sets a new speaker view layout. The layout is persisted
   * in local storage.
   */
  setLayout(value) {
    const title = SPEAKER_LAYOUTS[value];
    this.layoutLabel.innerHTML = 'Layout' + (title ? (': ' + title) : '');
    this.layoutDropdown.value = value;
    document.body.setAttribute('data-speaker-layout', value);
    // Persist locally
    if (window.localStorage) {
      window.localStorage.setItem('reveal-speaker-layout', value);
    }
  }

  /**
   * Returns the ID of the most recently set speaker layout
   * or our default layout if none has been set.
   */
  getLayout() {
    if (window.localStorage) {
      const layout = window.localStorage.getItem('reveal-speaker-layout');
      if (layout) {
        return layout;
      }
    }
    // Default to the first record in the layouts hash
    for (let id in SPEAKER_LAYOUTS) {
      return id;
    }
  }

  zeroPadInteger(num) {
    let str = '00' + parseInt(num);
    return str.substring(str.length - 2);
  }

  /**
   * Limits the frequency at which a function can be called.
   */
  debounce(fn, ms) {
    let lastTime = 0,
      timeout;
    return (...args) => {
      var context = this;
      clearTimeout(timeout);
      const timeSinceLastCall = Date.now() - lastTime;
      if (timeSinceLastCall > ms) {
        fn.apply(context, args);
        lastTime = Date.now();
      } else {
        timeout = setTimeout(() => {
          fn.apply(context, args);
          lastTime = Date.now();
        }, ms - timeSinceLastCall);
      }
    };
  }

}

export default new NotesServer();