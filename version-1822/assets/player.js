(function () {
  var video = document.getElementById("playerVideo");
  var overlay = document.getElementById("playerOverlay");
  if (!video || !overlay || typeof playerSource !== "string") {
    return;
  }
  var ready = false;
  function attachSource() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playerSource;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(playerSource);
      hls.attachMedia(video);
    } else {
      video.src = playerSource;
    }
  }
  function playVideo() {
    attachSource();
    video.controls = true;
    overlay.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }
  overlay.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove("is-hidden");
    }
  });
})();
