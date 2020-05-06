import adapter from 'webrtc-adapter';

export default function (nodefony) {

  /*
   *	MEDIA STREAM
   *
   */
  const defaultSettingsStream = {
    audio: true,
    video: true,
    autoplay: true
  };

  const defaultSettingsStreamScreen = {
    video: true,
    audio: false,
  };


  class MediaStream extends nodefony.Service {

    constructor(mediaElement, settings, container = null) {
      super("MediaStream", container);
      this.settings = nodefony.extend({}, defaultSettingsStream, settings);
      this.urlStream = null;
      //this.stream = this.settings.stream ? this.setStream(this.settings.stream) : null;
      this.mediaElement = mediaElement ? mediaElement : null;
      //this.getMediaStream = getMediaStream;
      this.active = null;
      this.ended = null;
      this.id = null;
    }

    get stream() {
      return this._stream;
    }

    set stream(value) {
      return this.setStream(value);
    }

    getUserMedia(settings = {}) {
      return new Promise((resolve, reject) => {
        this.settings = nodefony.extend({}, defaultSettingsStream, settings);
        this.settingsToListen(settings);
        return navigator.mediaDevices.getUserMedia({
            video: this.settings.video,
            audio: this.settings.audio
          })
          .then((stream) => {
            this.stream = stream;
            this.fire("onSucces", this.stream, this);
            return resolve(this.stream);
          })
          .catch((e) => {
            this.fire("onError", e, this);
            return reject(e);
          });
      });
    }

    // todo  https://webrtc.github.io/samples/src/content/getusermedia/getdisplaymedia/
    // https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/getdisplaymedia
    getUserScreen(settings ={}) {
      return new Promise((resolve, reject) => {
        this.settings = nodefony.extend({}, defaultSettingsStreamScreen, settings);
        this.settingsToListen(settings);
        return navigator.mediaDevices.getDisplayMedia( this.settings)
        .then((stream) => {
          this.stream = stream;
          this.fire("onSucces", this.stream, this);
          return resolve(this.stream);
        })
        .catch((e) => {
          this.fire("onError", e, this);
          return reject(e);
        });
      });
    }

    setStream(stream) {
      this._stream = stream;
      this.active = stream.active;
      this.ended = stream.ended;
      this.id = stream.id;
      //this.urlStream = this.getMediaStream(this._stream);
      this.videotracks = this.getVideoTracks();
      this.audiotracks = this.getAudioTracks();
      this._stream.onremovetrack = (event) => {
        this.fire("onRemovetrack", event, this);
      };
      this._stream.onaddtrack = (event) => {
        this.fire("onAddtrack", event, this);
      };
      return this._stream;
    }

    stop(stream = this.stream) {
      return new Promise((resolve, reject) => {
        try {
          if (stream) {
            this.getTracks(stream).forEach(track => track.stop());
            this.stream = null;
            return resolve(stream);
          }
        } catch (e) {
          this.fire("onError", e);
          return reject(e);
        }
        return resolve(this.stream);
      });
    }

    getTracks(stream = this.stream) {
      let error = null;
      if (stream) {
        return stream.getTracks();
      }
      error = new Error("no Stream detected");
      this.fire("onError", error);
      throw error;
    }

    attachMediaStream(element = this.mediaElement, stream = this.stream) {
      return new Promise((resolve, reject) => {
        try {
          this.mediaElement = element;
          if ("srcObject" in this.mediaElement) {
            this.mediaElement.srcObject = stream;
          } else {
            this.mediaElement.src = window.URL.createObjectURL(stream);
          }
          this.mediaElement.play();
          this.mediaElement.onloadedmetadata = (event) => {
            try {
              this.mediaElement.play();
              this.fire("onloadedmetadata", event);
              return resolve(event);
            } catch (e) {
              this.fire("onError", e);
              return reject(e);
            }
          };
        } catch (e) {
          this.fire("onError", e);
          return reject(e);
        }
      });
    }

    reattachMediaStream(stream, element = this.mediaElement) {
      let error = null;
      if (stream) {
        this.stream = stream;
        if (element) {
          return this.attachMediaStream(element);
        }
        error = new Error("no dom element detected for reattach MediaStream ");
        this.fire("onError", error);
        throw error;
      }
      error = new Error("no Stream detected");
      this.fire("onError", error);
      throw error;
    }

    getVideoTracks(stream = this.stream) {
      if (stream) {
        return stream.getVideoTracks();
      }
      const error = new Error("no Stream detected");
      this.fire("onError", error);
      throw error;
    }

    getAudioTracks(stream = this.stream) {
      if (stream) {
        return stream.getAudioTracks();
      }
      const error = new Error("no Stream detected");
      this.fire("onError", error);
      throw error;
    }

  }

  return {
    MediaStream: MediaStream,
    webrtcAdapter: adapter
  };
}
