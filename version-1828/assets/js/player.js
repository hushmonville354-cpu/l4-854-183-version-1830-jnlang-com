function initMoviePlayer(mediaUrl) {
  const video = document.getElementById('movieVideo');
  const button = document.getElementById('playerStart');
  const frame = document.querySelector('[data-player-frame]');
  let hlsInstance = null;
  let activated = false;

  if (!video || !button || !mediaUrl) {
    return;
  }

  function hideOverlay() {
    button.classList.add('is-hidden');
  }

  function showError() {
    button.classList.remove('is-hidden');
    button.innerHTML = '<span class="player-icon">!</span><strong>视频加载失败</strong>';
  }

  function attachStream() {
    if (activated) {
      return;
    }

    activated = true;
    hideOverlay();

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      video.play().catch(function () {
        button.classList.remove('is-hidden');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          showError();
        }
      });
      return;
    }

    showError();
  }

  button.addEventListener('click', attachStream);

  if (frame) {
    frame.addEventListener('click', function (event) {
      if (event.target === video && !activated) {
        attachStream();
      }
    });
  }

  video.addEventListener('play', hideOverlay);
}
