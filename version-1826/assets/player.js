(function () {
  window.initPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function beginPlay() {
      overlay && overlay.classList.add('is-hidden');

      if (loaded) {
        video.play().catch(function () {});
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            loaded = false;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        beginPlay();
      }
    });

    video.addEventListener('play', function () {
      overlay && overlay.classList.add('is-hidden');
    });
  };
}());
