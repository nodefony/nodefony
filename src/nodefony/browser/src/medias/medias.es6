export default function (nodefony) {

  //polyfill
  let getMediaStream = null;
  const updaterMedia = function () {
    try {
      if (!navigator.mediaDevices) {
        navigator.mediaDevices = {};
      }
      if (!navigator.mediaDevices.getUserMedia) {
        let getUserMedia = navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia ||
          navigator.getUserMedia;
        if (getUserMedia) {
          navigator.mediaDevices.getUserMedia = function (constraints) {
            return new Promise(function (resolve, reject) {
              getUserMedia(constraints,
                function (stream) {
                  resolve(stream);
                },
                function (error) {
                  reject(error);
                }
              );
            });
          };
        } else {
          navigator.mediaDevices.getUserMedia = function () {
            return new Promise(function (resolve, reject) {
              reject('getUserMedia is not supported in this browser.');
            });
          };
        }
      }

      const video = document.createElement('video');
      if ("srcObject" in video) {
        getMediaStream = function (stream) {
          return stream;
        };
      } else {
        getMediaStream = function (stream) {
          try {
            return URL.createObjectURL(stream);
          } catch (e) {
            try {
              return window.URL.createObjectURL(stream);
            } catch (e) {
              return stream;
            }
          }
        };
      }
      // The representation of tracks in a stream is changed in M26.
      // Unify them for earlier Chrome versions in the coexisting period.
      try{
        if (webkitMediaStream && !webkitMediaStream.prototype.getVideoTracks) {
            webkitMediaStream.prototype.getVideoTracks = function () {
            return this.videoTracks;
          };
          webkitMediaStream.prototype.getAudioTracks = function () {
            return this.audioTracks;
          };
        } else {
          if (MediaStream && !MediaStream.prototype.getVideoTracks) {
            MediaStream.prototype.getVideoTracks = function () {
              return [];
            };
          }
          if (MediaStream && !MediaStream.prototype.getAudioTracks) {
            MediaStream.prototype.getAudioTracks = function () {
              return [];
            };
          }
        }
      }catch(e){
        if (MediaStream && !MediaStream.prototype.getVideoTracks) {
          MediaStream.prototype.getVideoTracks = function () {
            return [];
          };
        }
        if (MediaStream && !MediaStream.prototype.getAudioTracks) {
          MediaStream.prototype.getAudioTracks = function () {
            return [];
          };
        }
      }

    } catch (e) {
      throw e;
    }
  }();

  /*
   *	MEDIA STREAM
   *
   */
  const defaultSettingsStream = {
    audio: true,
    video: true,
    autoplay: true
  };

  class MediaStream extends nodefony.Service {

    constructor(mediaElement, settings, container = null) {
      super("MediaStream", container);
      this.settings = nodefony.extend({}, defaultSettingsStream, settings);
      this.urlStream = null;
      this.stream = this.settings.stream ? this.setStream(this.settings.stream) : null;
      this.mediaElement = mediaElement ? mediaElement : null;
      this.getMediaStream = getMediaStream;
    }

    getUserMedia(settings = {}) {
      return new Promise((resolve, reject)=>{
        if (settings) {
          this.settings = nodefony.extend({}, defaultSettingsStream, settings);
          this.settingsToListen(settings);
        }
        return navigator.mediaDevices.getUserMedia({
            video: this.settings.video,
            audio: this.settings.audio
          })
          .then((stream) => {
            this.setStream(stream);
            this.fire("onSucces", stream, this);
            return resolve(stream);
          })
          .catch((e) => {
            this.fire("onError", e, this);
            return reject(e);
          });
      });
    }

    setStream(stream) {
      this.stream = stream;
      this.urlStream = this.getMediaStream(stream);
      this.videotracks = this.getVideoTracks();
      this.audiotracks = this.getAudioTracks();
      return stream;
    }

    stop(stream = this.stream) {
      return new Promise((resolve, reject) => {
        let error = null;
        if (stream) {
          this.getTracks(stream).forEach(track => track.stop());
          return resolve(stream);
        }
        error = new Error("no Stream detected");
        this.fire("onError", error);
        return reject(error);
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
          }else{
            this.mediaElement.src = window.URL.createObjectURL(stream);
          }
          this.mediaElement.onloadedmetadata =  (event) => {
            try{
              this.mediaElement.play();
              this.fire("onloadedmetadata", event);
              return resolve(event);
            }catch(e){
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
    MediaStream: MediaStream
  };
}
