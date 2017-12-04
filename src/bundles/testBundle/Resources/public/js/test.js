/*
 *
 *	ENTRY POINT WEBPACK DEMO BUNLDE
 *
 *
 *  Add your assets here with require  to an integration in webpack  bundle
 *
 *  require('jquery');
 *  require('../css/mycss.css')
 *
 */
require("../css/test.css");

module.exports = function () {

  /*
   *	Class
   *
   *	Namespace test client side
   *
   */
  const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  const SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  const test = class test {

    constructor() {
      $(document).ready(() => {
        // init speakToText
        this.speakToText();
        // init textToSpeak
        //this.textToSpeak("Les sanglots longs Des violons De l’automne Blessent mon cœur D’une langueur Monotone.");
        this.textToSpeak($("#version").html().replace(/^\s*|\s*$/g, ''));
        //this.textToSpeak($("#french").html().replace(/^\s*|\s*$/g, ''));
      });
    }

    speakToText() {
      this.recognizing = null;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interim = true;

      this.button = $("#button").get(0);
      $("#button").on("click", this.toggleStartStop.bind(this));

      this.final_span = $("#final_span").get(0);
      this.interim_span = $("#interim_span").get(0);
      this.reset();
      this.recognition.onend = this.reset.bind(this);
      this.recognition.onresult = this.onresult.bind(this);
    }

    textToSpeak(text) {
      this.SpeechSynthesisUtterance = new SpeechSynthesisUtterance();
      this.SpeechSynthesisUtterance.text = text;
      this.SpeechSynthesisUtterance.lang = 'fr-FR';
      this.SpeechSynthesisUtterance.rate = 1.2;
      this.speechSynthesis = speechSynthesis;
      //this.SpeechSynthesisUtterance.onend = function(event) { alert('Finished in ' + event.elapsedTime + ' seconds.'); }
      this.speechSynthesis.speak(this.SpeechSynthesisUtterance);
    }

    onresult(event) {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].final) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      this.final_span.innerHTML = final;
      this.interim_span.innerHTML = interim;
    }

    reset() {
      this.recognizing = false;
      this.button.innerHTML = "Click to Speak";
    }

    toggleStartStop() {
      if (this.recognizing) {
        this.recognition.stop();
        this.reset();
      } else {
        this.recognition.start();
        this.recognizing = true;
        this.button.innerHTML = "Click to Stop";
        this.final_span.innerHTML = "";
        this.interim_span.innerHTML = "";
      }
    }
  };

  return new test();
}();