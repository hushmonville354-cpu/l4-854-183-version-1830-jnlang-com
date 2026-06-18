(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('[data-mobile-menu-button]');
    var menu = one('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var input = one('[data-search-input]', scope);
      var chips = all('[data-filter-chip]', scope);
      var cards = all('[data-movie-card]', scope);
      var empty = one('[data-no-results]', scope);
      var keyword = '';
      var activeChip = '';

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchChip = !activeChip || text.indexOf(activeChip) !== -1;
          var show = matchKeyword && matchChip;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', function () {
          keyword = input.value.trim().toLowerCase();
          apply();
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var value = (chip.getAttribute('data-filter-chip') || '').toLowerCase();
          if (activeChip === value) {
            activeChip = '';
            chip.classList.remove('is-active');
          } else {
            chips.forEach(function (item) {
              item.classList.remove('is-active');
            });
            activeChip = value;
            chip.classList.add('is-active');
          }
          apply();
        });
      });
    });
  }

  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function attachSource(video, source) {
    if (!source || video.getAttribute('data-loaded') === '1') {
      playVideo(video);
      return;
    }
    video.setAttribute('data-loaded', '1');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video);
      });
      hls.on(window.Hls.Events.ERROR, function () {
        if (!video.src) {
          video.src = source;
        }
      });
    } else {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        playVideo(video);
      }, { once: true });
      playVideo(video);
    }
  }

  function setupPlayers() {
    all('[data-player]').forEach(function (stage) {
      var video = one('video', stage);
      var button = one('[data-play-button]', stage);
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video-src') || '';

      function begin() {
        button.classList.add('is-hidden');
        attachSource(video, source);
      }

      button.addEventListener('click', begin);
      stage.addEventListener('click', function (event) {
        if (event.target === video || event.target === stage) {
          begin();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
