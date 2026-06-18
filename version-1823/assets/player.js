(function () {
  window.initVideoPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var source = options.src;
    var hls = null;
    var loaded = false;
    var pending = false;

    if (!video || !overlay || !source) {
      return;
    }

    function beginPlay() {
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (!pending) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pending) {
            pending = false;
            beginPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = source;
      }
    }

    function requestPlay() {
      pending = true;
      loadSource();
      beginPlay();
    }

    overlay.addEventListener("click", requestPlay);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        requestPlay();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        requestPlay();
      }
    });
    video.addEventListener("playing", function () {
      pending = false;
      overlay.classList.add("is-hidden");
    });
  };
})();
