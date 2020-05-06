export default function (nodefony) {

  /*
   *
   *	CLASS AUDIOBUS
   *
   */
  const defaultAudioBusSettings = {
    panner: false,
    analyser: false
  };

  class AudioBus {

    constructor(name, mixer, settings) {
      this.name = name;
      this.mixer = mixer;
      this.settings = nodefony.extend({}, defaultAudioBusSettings, settings);
      this.eventsManager = nodefony.notificationsCenter.create(this.settings, this);
      this.audioContext = new nodefony.medias.webAudioApi.audioContext();
      this.tracks = [];
      this.nbTracks = 0;
      this.audioNodes = {};
      this.in = null;
      this.out = null;
      this.destination = null;
      this.muted = false;
      this.createNodes();
    }

    listen() {
      return this.eventsManager.listen.apply(this.eventsManager, arguments);
    }

    unListen() {
      return this.eventsManager.unListen.apply(this.eventsManager, arguments);
    }

    fire() {
      return this.eventsManager.fire.apply(this.eventsManager, arguments);
    }

    createNodes() {
      // mute
      this.audioNodes.mute = this.createGain();
      this.in = this.audioNodes.mute;

      // gain
      this.audioNodes.gain = this.createGain();
      this.in.connect(this.audioNodes.gain);
      this.out = this.audioNodes.gain;

      // analyseur stéreo
      if (this.settings.analyser) {
        this.audioNodes.splitter = this.createChannelSplitter(2);
        this.out.connect(this.audioNodes.splitter);
        this.audioNodes.analyserLeft = this.createAnalyser();
        this.audioNodes.analyserLeft.smoothingTimeConstant = 0.85;
        this.audioNodes.splitter.connect(this.audioNodes.analyserLeft, 0, 0);

        this.audioNodes.analyserRight = this.createAnalyser();
        this.audioNodes.analyserRight.smoothingTimeConstant = 0.85;
        this.audioNodes.splitter.connect(this.audioNodes.analyserRight, 1, 0);
      }

      // panoramique
      if (this.settings.panner) {
        this.audioNodes.panner = this.createStereoPanner();
        this.out.connect(this.audioNodes.panner);
        this.out = this.audioNodes.panner;
      }
    }

    connect(audioNode) {
      this.destination = audioNode;
      this.out.connect(audioNode);
      this.fire("onConnect", audioNode, this);
    }

    disconnect() {
      if (this.destination) {
        this.out.disconnect(this.destination);
        this.destination = null;
        this.fire("onDisconnect", this);
      }
    }

    setGain(value) {
      //this.audioNodes.gain.gain.value = value;
      this.audioNodes.gain.gain.setValueAtTime(value, this.audioContext.currentTime + 1);
      this.fire("onSetGain", value);
      return this;
    }

    getGain() {
      return this.audioNodes.gain.gain.value;
    }

    mute() {
      //this.audioNodes.mute.gain.value = 0;
      this.audioNodes.mute.gain.setValueAtTime(0, this.audioContext.currentTime + 1);

      this.muted = true;
      this.fire("onMute", this);
      return this;
    }

    unmute() {
      //this.audioNodes.mute.gain.value = 1;
      this.audioNodes.mute.gain.setValueAtTime(1, this.audioContext.currentTime + 1);
      this.muted = false;
      this.fire("onUnMute", this);
      return this;
    }

    createGain() {
      return this.audioContext.createGain();
    }

    createPanner() {
      return this.audioContext.createPanner();
    }

    createStereoPanner() {
      return this.audioContext.createStereoPanner();
    }

    createFilter() {
      return this.audioContext.createBiquadFilter();
    }

    createAnalyser() {
      return this.audioContext.createAnalyser();
    }

    createChannelSplitter(nbChannel) {
      return this.audioContext.createChannelSplitter(nbChannel);
    }

    createChannelMerger(nbChannel) {
      return this.audioContext.createChannelMerger(nbChannel);
    }

    createOscillator() {
      return this.audioContext.createOscillator();
    }

    createMediaStreamDestination() {
      var destination = this.audioContext.createMediaStreamDestination();
      this.disconnect();
      this.connect(destination);
      return destination;
    }

    createTrack(media, settings) {
      var track = new nodefony.medias.webAudioApi.Track(media, this, settings);
      this.tracks.push(track);
      this.nbTracks++;
      this.fire("onCreateTrack", track, this);
      return track;
    }

    removeTrack(track) {
      let ele = null;
      let name = null;
      switch (true) {
      case track instanceof nodefony.medias.webAudioApi.Track:
        for (let i = 0; i < this.tracks.length; i++) {
          if (this.tracks[i] === track) {
            name = track.name;
            track.pause();
            track.disconnect();
            // remove from tab
            ele = this.tracks.splice(i, 1);
            this.nbTracks--;
            this.fire("onRemoveTrack", ele[0], this);
            delete ele[0];
            break;
          }
        }
        break;
      case typeof track === "number":
      case typeof track === "string":
        name = track;
        for (let i = 0; i < this.tracks.length; i++) {
          if (this.tracks[i].name === name) {
            this.tracks[i].pause();
            this.tracks[i].disconnect();
            // remove from tab
            ele = this.tracks.splice(i, 1);
            this.nbTracks--;
            this.fire("onRemoveTrack", ele[0], this);
            delete ele[0];
            break;
          }
        }
        break;
      }
      if (!ele) {
        throw new Error("this track doesn't exist in  bus : " + this.name);
      }
      return true;
    }
  }
  return AudioBus;
}
