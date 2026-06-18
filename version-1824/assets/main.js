(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === activeSlide);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === activeSlide);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot, position) {
    dot.addEventListener('click', function () {
      showSlide(position);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterControls = document.querySelector('[data-filter-controls]');
  if (filterControls) {
    var keywordInput = filterControls.querySelector('[data-filter-keyword]');
    var yearSelect = filterControls.querySelector('[data-filter-year]');
    var typeSelect = filterControls.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    function applyFilter() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchType = !type || card.dataset.type === type;
        var matched = matchKeyword && matchYear && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var player = document.querySelector('[data-hls]');
  if (player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-hls');
    var hlsInstance = null;

    function attachSource() {
      if (!video || video.dataset.ready === 'true') {
        return;
      }
      video.dataset.ready = 'true';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function beginPlayback() {
      attachSource();
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginPlayback();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('button')) {
        return;
      }
      beginPlayback();
    });

    if (video) {
      video.addEventListener('play', function () {
        if (startButton) {
          startButton.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIE_INDEX) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var searchType = searchPage.querySelector('[data-search-type]');
    var resultBox = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function renderResults() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var type = searchType && searchType.value || '';
      var items = window.MOVIE_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !type || item.type === type;
        return matchQuery && matchType;
      }).slice(0, 120);

      if (!resultBox) {
        return;
      }

      if (!items.length) {
        resultBox.innerHTML = '<p class="empty-state">暂未找到匹配内容</p>';
        return;
      }

      resultBox.innerHTML = items.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="card-media" href="./' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
          '    <img class="poster-img" src="./' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="card-play">▶</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '</span><span>' + escapeHtml(item.type) + '</span></div>',
          '    <h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p>' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      resultBox.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('is-hidden');
        });
      });
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    var searchButton = searchPage.querySelector('button');

    if (searchInput) {
      searchInput.addEventListener('input', renderResults);
    }
    if (searchType) {
      searchType.addEventListener('change', renderResults);
    }
    if (searchButton) {
      searchButton.addEventListener('click', renderResults);
    }
    renderResults();
  }
})();
