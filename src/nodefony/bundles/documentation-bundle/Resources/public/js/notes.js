//const Reveal = require("reveal.js");
const jquery = require("jquery");

const marked = require("reveal.js/plugin/markdown/marked.js");

import "../css/notes.css";

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
  'autoSlide=0',
  'backgroundTransition=none'
].join('&');


class Notes {
  constructor() {

    jquery(document).ready(() => {
      this.initialize();
      // Limit to max one state update per X ms
      this.handleStateMessage = this.debounce(this.handleStateMessage, 200);
    });

  }

  initialize() {
    this.notes = null;
    this.notesValue = null;
    this.currentState = null;
    this.currentSlide = null;
    this.upcomingSlide = null;
    this.layoutLabel = null;
    this.layoutDropdown = null;
    this.connected = false;

    this.setupLayout();

    this.connectionStatus = document.querySelector('#connection-status');
    this.connectionTimeout = setTimeout(() => {
      this.connectionStatus.innerHTML = 'Error connecting to main window.<br>Please try closing and reopening the speaker view.';
    }, 5000);

    window.addEventListener('message', (event) => {

      clearTimeout(this.connectionTimeout);
      this.connectionStatus.style.display = 'none';

      let data = JSON.parse(event.data);

      // The overview mode is only useful to the reveal.js instance
      // where navigation occurs so we don't sync it
      if (data.state) {
        delete data.state.overview;
      }
      // Messages sent by the notes plugin inside of the main window
      if (data && data.namespace === 'reveal-notes') {
        if (data.type === 'connect') {
          this.handleConnectMessage(data);
        } else if (data.type === 'state') {
          this.handleStateMessage(data);
        }
      }
      // Messages sent by the reveal.js inside of the current slide preview
      else if (data && data.namespace === 'reveal') {
        if (/ready/.test(data.eventName)) {
          // Send a message back to notify that the handshake is complete
          window.opener.postMessage(JSON.stringify({
            namespace: 'reveal-notes',
            type: 'connected'
          }), '*');
        } else if (/slidechanged|fragmentshown|fragmenthidden|paused|resumed/.test(data.eventName) && this.currentState !== JSON.stringify(data.state)) {
          window.opener.postMessage(JSON.stringify({
            method: 'setState',
            args: [data.state]
          }), '*');
        }
      }
    });
  }

  /**
   * Called when the main window is trying to establish a
   * connection.
   */
  handleConnectMessage(data) {
    if (this.connected === false) {
      this.connected = true;
      this.setupIframes(data);
      this.setupKeyboard();
      this.setupNotes();
      this.setupTimer();
    }
  }

  /**
   * Called when the main window sends an updated state.
   */
  handleStateMessage(data) {
    console.log(data)
    // Store the most recently set state to avoid circular loops
    // applying the same state
    this.currentState = JSON.stringify(data.state);
    // No need for updating the notes in case of fragment changes
    if (data.notes) {
      this.notes.classList.remove('hidden');
      this.notesValue.style.whiteSpace = data.whitespace;
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
   *
   * Block F5 default handling, it reloads and disconnects
   * the speaker notes window.
   */
  setupKeyboard() {

    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 116 || (event.metaKey && event.keyCode === 82)) {
        event.preventDefault();
        return false;
      }
      this.currentSlide.contentWindow.postMessage(JSON.stringify({
        method: 'triggerKey',
        args: [event.keyCode]
      }), '*');
    });
  }

  /**
   * Creates the preview iframes.
   */
  setupIframes(data) {

    let urlSeparator = /\?/.test(data.url) ? '&' : '?';
    let hash = '#/' + data.state.indexh + '/' + data.state.indexv;
    let currentURL = data.url + urlSeparator + params + '&postMessageEvents=true' + hash;
    let upcomingURL = data.url + urlSeparator + params + '&controls=false' + hash;

    this.currentSlide = document.createElement('iframe');
    this.currentSlide.setAttribute('width', 1280);
    this.currentSlide.setAttribute('height', 1024);
    this.currentSlide.setAttribute('src', currentURL);
    document.querySelector('#current-slide').appendChild(this.currentSlide);

    this.upcomingSlide = document.createElement('iframe');
    this.upcomingSlide.setAttribute('width', 640);
    this.upcomingSlide.setAttribute('height', 512);
    this.upcomingSlide.setAttribute('src', upcomingURL);
    document.querySelector('#upcoming-slide').appendChild(this.upcomingSlide);

  }

  /**
   * Setup the notes UI.
   */
  setupNotes() {
    this.notes = document.querySelector('.speaker-controls-notes');
    this.notesValue = document.querySelector('.speaker-controls-notes .value');
  }

  getTimings() {
    let slides = Reveal.getSlides();
    let defaultTiming = Reveal.getConfig().defaultTiming;
    if (defaultTiming === null) {
      return null;
    }
    let timings = [];
    for (var i in slides) {
      let slide = slides[i];
      let timing = defaultTiming;
      if (slide.hasAttribute('data-timing')) {
        let t = slide.getAttribute('data-timing');
        timing = parseInt(t);
        if (isNaN(timing)) {
          console.warn("Could not parse timing '" + t + "' of slide " + i + "; using default of " + defaultTiming);
          timing = defaultTiming;
        }
      }
      timings.push(timing);
    }
    return timings;
  }

  /**
   * Return the number of seconds allocated for presenting
   * all slides up to and including this one.
   */
  getTimeAllocated(timings) {
    let slides = Reveal.getSlides();
    let allocated = 0;
    let currentSlide = Reveal.getSlidePastCount();
    for (let i in slides.slice(0, currentSlide + 1)) {
      allocated += timings[i];
    }
    return allocated;
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
    this.pacingTitleEl = this.timeEl.querySelector('.pacing-title');
    this.pacingEl = this.timeEl.querySelector('.pacing');
    this.pacingHoursEl = this.pacingEl.querySelector('.hours-value');
    this.pacingMinutesEl = this.pacingEl.querySelector('.minutes-value');
    this.pacingSecondsEl = this.pacingEl.querySelector('.seconds-value');

    this.timings = this.getTimings();
    if (this.timings !== null) {
      this.pacingTitleEl.style.removeProperty('display');
      this.pacingEl.style.removeProperty('display');
    }
    // Update once directly
    this._updateTimer();
    // Then update every second
    setInterval(this._updateTimer.bind(this), 1000);
    this.timeEl.addEventListener('click', () => {
      this._resetTimer();
      return false;
    });
  }


  _displayTime(hrEl, minEl, secEl, time) {
    let sign = Math.sign(time) === -1 ? "-" : "";
    time = Math.abs(Math.round(time / 1000));
    let seconds = time % 60;
    let minutes = Math.floor(time / 60) % 60;
    let hours = Math.floor(time / (60 * 60));
    hrEl.innerHTML = sign + this.zeroPadInteger(hours);
    if (hours === 0) {
      hrEl.classList.add('mute');
    } else {
      hrEl.classList.remove('mute');
    }
    minEl.innerHTML = ':' + this.zeroPadInteger(minutes);
    if (hours === 0 && minutes === 0) {
      minEl.classList.add('mute');
    } else {
      minEl.classList.remove('mute');
    }
    secEl.innerHTML = ':' + this.zeroPadInteger(seconds);
  }


  _updateTimer() {
    let diff, hours, minutes, seconds,
      now = new Date();
    diff = now.getTime() - this.start.getTime();
    this.clockEl.innerHTML = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
    this._displayTime(this.hoursEl, this.minutesEl, this.secondsEl, diff);
    if (this.timings !== null) {
      this._updatePacing(diff);
    }
  }

  _updatePacing(diff) {
    let slideEndTiming = this.getTimeAllocated(this.timings) * 1000;
    let currentSlide = Reveal.getSlidePastCount();
    let currentSlideTiming = this.timings[currentSlide] * 1000;
    let timeLeftCurrentSlide = slideEndTiming - diff;
    if (timeLeftCurrentSlide < 0) {
      this.pacingEl.className = 'pacing behind';
    } else if (timeLeftCurrentSlide < currentSlideTiming) {
      this.pacingEl.className = 'pacing on-track';
    } else {
      this.pacingEl.className = 'pacing ahead';
    }
    this._displayTime(this.pacingHoursEl, this.pacingMinutesEl, this.pacingSecondsEl, this.timeLeftCurrentSlide);
  }

  _resetTimer() {
    if (this.timings === null) {
      this.start = new Date();
    } else {
      // Reset timer to beginning of current slide
      let slideEndTiming = this.getTimeAllocated(this.timings) * 1000;
      let currentSlide = Reveal.getSlidePastCount();
      let currentSlideTiming = this.timings[currentSlide] * 1000;
      let previousSlidesTiming = slideEndTiming - currentSlideTiming;
      let now = new Date();
      this.start = new Date(now.getTime() - previousSlidesTiming);
    }
    this._updateTimer();
  }

  /**
   * Sets up the speaker view layout and layout selector.
   */
  setupLayout() {
    this.layoutDropdown = document.querySelector('.speaker-layout-dropdown');
    this.layoutLabel = document.querySelector('.speaker-layout-label');

    // Render the list of available layouts
    for (var id in SPEAKER_LAYOUTS) {
      var option = document.createElement('option');
      option.setAttribute('value', id);
      option.textContent = SPEAKER_LAYOUTS[id];
      this.layoutDropdown.appendChild(option);
    }
    // Monitor the dropdown for changes
    this.layoutDropdown.addEventListener('change', ( /*event*/ ) => {
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
    let title = SPEAKER_LAYOUTS[value];
    this.layoutLabel.innerHTML = 'Layout' + (title ? (': ' + title) : '');
    this.layoutDropdown.value = value;
    document.body.setAttribute('data-speaker-layout', value);
    // Persist locally
    if (this.supportsLocalStorage()) {
      window.localStorage.setItem('reveal-speaker-layout', value);
    }
  }

  /**
   * Returns the ID of the most recently set speaker layout
   * or our default layout if none has been set.
   */
  getLayout() {
    if (this.supportsLocalStorage()) {
      let layout = window.localStorage.getItem('reveal-speaker-layout');
      if (layout) {
        return layout;
      }
    }
    // Default to the first record in the layouts hash
    for (let id in SPEAKER_LAYOUTS) {
      return id;
    }
  }

  supportsLocalStorage() {

    try {
      window.localStorage.setItem('test', 'test');
      window.localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
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
      //let args = arguments;
      let context = this;
      clearTimeout(timeout);
      let timeSinceLastCall = Date.now() - lastTime;
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

export default new Notes();