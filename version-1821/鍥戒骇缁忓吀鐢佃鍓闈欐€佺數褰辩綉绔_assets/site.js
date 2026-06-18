(function () {
  const body = document.body;
  const base = body ? body.dataset.base || '' : '';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function imagePath(path) {
    if (!path) {
      return '';
    }
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    return base + path.replace(/^\.\//, '');
  }

  function pagePath(path) {
    if (!path) {
      return '#';
    }
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    return base + path.replace(/^\.\//, '');
  }

  function setupMobileMenu() {
    const button = qs('[data-mobile-menu]');
    const panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupPosterFallbacks() {
    qsa('[data-poster-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        const frame = image.closest('.poster-frame, .hero-poster, .detail-cover, .ranking-poster, .search-result');
        if (frame && !frame.dataset.fallbackReady) {
          frame.dataset.fallbackReady = '1';
          frame.style.position = frame.style.position || 'relative';
          frame.setAttribute('aria-label', image.alt || '封面图');
        }
      }, { once: true });
    });
  }

  function setupHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    if (slides.length <= 1) {
      return;
    }
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupCardFilter() {
    const input = qs('[data-card-filter]');
    if (!input) {
      return;
    }
    const cards = qsa('[data-card]');
    input.addEventListener('input', function () {
      const q = normalize(input.value);
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.type
        ].join(' '));
        card.classList.toggle('is-hidden-by-filter', q && !haystack.includes(q));
      });
    });
  }

  function setupCategoryFilter() {
    const input = qs('[data-category-filter]');
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      const q = normalize(input.value);
      qsa('[data-category-item]').forEach(function (item) {
        item.classList.toggle('is-hidden-by-filter', q && !normalize(item.textContent).includes(q));
      });
      qsa('[data-category-group]').forEach(function (group) {
        const visibleItems = qsa('[data-category-item]', group).filter(function (item) {
          return !item.classList.contains('is-hidden-by-filter');
        });
        group.classList.toggle('is-empty', visibleItems.length === 0);
      });
    });
  }

  function renderSearchResults(container, query) {
    const index = window.MOVIE_SEARCH_INDEX || [];
    const q = normalize(query);
    if (!container) {
      return;
    }
    if (!q) {
      container.innerHTML = '';
      container.classList.remove('is-open');
      return;
    }
    const results = index.filter(function (item) {
      return normalize([
        item.title,
        item.region,
        item.year,
        item.type,
        item.genre,
        item.tags
      ].join(' ')).includes(q);
    }).slice(0, 24);

    if (!results.length) {
      container.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到匹配内容</strong><p>换一个片名、题材、年份或地区试试。</p></div></div>';
      container.classList.add('is-open');
      return;
    }

    container.innerHTML = results.map(function (item) {
      return [
        '<a class="search-result" href="' + pagePath(item.url) + '">',
        '  <img src="' + imagePath(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + ' 封面" data-poster-image>',
        '  <div>',
        '    <strong>' + item.title + '</strong>',
        '    <span>' + item.region + ' · ' + item.year + ' · ' + item.type + ' · ' + item.score + '分</span>',
        '    <p>' + item.oneLine + '</p>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
    container.classList.add('is-open');
    setupPosterFallbacks();
  }

  function setupGlobalSearch() {
    const panel = qs('[data-search-panel]');
    const pageResults = qs('[data-search-page-results]');
    qsa('[data-global-search-form]').forEach(function (form) {
      const input = qs('input[name="q"]', form);
      if (!input) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const target = pageResults || panel;
        renderSearchResults(target, input.value);
      });
      input.addEventListener('input', function () {
        if (pageResults) {
          renderSearchResults(pageResults, input.value);
        } else if (input.value.length >= 2) {
          renderSearchResults(panel, input.value);
        } else if (panel) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
        }
      });
    });
    document.addEventListener('click', function (event) {
      if (!panel || !panel.classList.contains('is-open')) {
        return;
      }
      const inside = event.target.closest('[data-search-panel], [data-global-search-form]');
      if (!inside) {
        panel.classList.remove('is-open');
      }
    });
  }

  function setupPlayer() {
    const video = qs('#videoPlayer');
    const button = qs('[data-play-button]');
    const status = qs('[data-player-status]');
    if (!video || !button) {
      return;
    }
    let initialized = false;
    let hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function initSource() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      const src = video.dataset.src;
      if (!src) {
        setStatus('播放源缺失');
        return Promise.reject(new Error('missing source'));
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('正在调用浏览器原生 HLS 播放');
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('高清播放线路已载入');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放线路连接异常，请稍后重试');
          }
        });
        return Promise.resolve();
      }
      video.src = src;
      setStatus('当前浏览器可能不支持 HLS，请更换现代浏览器');
      return Promise.resolve();
    }

    button.addEventListener('click', function () {
      initSource().then(function () {
        button.classList.add('is-hidden');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
            setStatus('浏览器阻止了自动播放，请再次点击播放');
          });
        }
      }).catch(function () {
        button.classList.remove('is-hidden');
      });
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupPosterFallbacks();
    setupHeroCarousel();
    setupCardFilter();
    setupCategoryFilter();
    setupGlobalSearch();
    setupPlayer();
  });
}());
