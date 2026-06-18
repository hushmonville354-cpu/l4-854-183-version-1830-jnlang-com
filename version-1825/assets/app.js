(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function safeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[match];
    });
  }

  function initMobileMenu() {
    var button = one('[data-mobile-menu]');
    var panel = one('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = one('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = all('.hero-slide', root);
    var dots = all('[data-hero-dot]', root);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function initLocalFilter() {
    var input = one('[data-filter-input]');
    var list = one('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = all('.filter-card', list);
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter') || '').toLowerCase();
        card.style.display = !value || text.indexOf(value) >= 0 ? '' : 'none';
      });
    });
  }

  function searchItemHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + safeText(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card filter-card">' +
        '<a class="poster-link" href="' + safeText(item.url) + '" aria-label="' + safeText(item.title) + '">' +
          '<img src="' + safeText(item.cover) + '" alt="' + safeText(item.title) + '" loading="lazy">' +
          '<span class="poster-glow"></span>' +
          '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + safeText(item.url) + '">' + safeText(item.title) + '</a></h3>' +
          '<p class="card-line">' + safeText(item.line) + '</p>' +
          '<div class="card-meta">' +
            '<a href="' + safeText(item.categoryUrl) + '">' + safeText(item.category) + '</a>' +
            '<span>' + safeText(item.year) + '</span>' +
            '<span>' + safeText(item.type) + '</span>' +
          '</div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var results = one('#search-results');
    var input = one('#search-page-input');
    var hint = one('#search-hint');
    if (!results || !input || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    function render(value) {
      var q = value.trim().toLowerCase();
      var matches = window.SEARCH_ITEMS.filter(function (item) {
        return !q || item.search.indexOf(q) >= 0;
      }).slice(0, 120);
      if (hint) {
        hint.textContent = q ? '为你展示匹配内容。' : '输入关键词后显示相关影片。';
      }
      results.innerHTML = matches.length ? matches.map(searchItemHtml).join('') : '<p class="card-line">没有找到相关内容。</p>';
    }
    render(query);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  window.initMoviePlayer = function (source, id) {
    var video = one('#player-' + id);
    var shell = one('#player-shell-' + id);
    var button = one('#play-button-' + id);
    var hlsInstance = null;
    if (!video || !shell || !button || !source) {
      return;
    }
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      attach();
      shell.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
    button.addEventListener('click', start);
    shell.addEventListener('click', function (event) {
      if (event.target === video || shell.classList.contains('is-playing')) {
        return;
      }
      start();
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
}());
