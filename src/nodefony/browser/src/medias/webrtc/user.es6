'use strict';
export default function (nodefony) {

  const userSettings = {
    constraintsOffer: {
      mandatory: {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    },
    //constraintsOffer: stage.browser.Gecko ? {'mandatory': {'MozDontOfferDataChannel':true}} : null
    displayName: ""
  };

  /*
   *
   *  CLASS USER
   *
   */
  class User {

    constructor(userName, settings = {}) {
      this.name = userName;
      this.settings = nodefony.extend(true, {}, userSettings, settings);
      this.displayName = this.settings.displayName || userName;
      this.audio = this.settings.constraintsOffer.mandatory.OfferToReceiveAudio;
      this.video = this.settings.constraintsOffer.mandatory.OfferToReceiveVideo;
      this.mediaStream = null;
      this.description = "";
      this.stream = null ;
    }

    createMediaStream() {
      this.mediaStream = new nodefony.medias.MediaStream(null, {
        audio: this.audio,
        video: this.video
      });
      return this.mediaStream;
    }

    getUserMedia(...args){
      return this.mediaStream.getUserMedia(...args)
      .then((stream)=>{
          this.stream = stream ;
          return stream;
      });
    }

    setDescription(desc) {
      this.description = desc;
    }
  }

  return User;
}
