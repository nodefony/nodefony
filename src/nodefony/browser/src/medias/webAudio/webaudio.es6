export default function (nodefony) {

  let audioContext = null;
  const webAudioApi = function () {
    audioContext = window.AudioContext || window.webkitAudioContext;
    if (audioContext) {
      return true;
    }
    return false;
  }();

  return {
    audioContext:audioContext
  };
}
