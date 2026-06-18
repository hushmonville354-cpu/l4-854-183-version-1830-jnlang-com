(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function matchYear(card, yearValue) {
    if (!yearValue) {
      return true;
    }
    var year = parseInt(card.getAttribute('data-year') || '', 10);
    if (yearValue === '1990') {
      return !year || year < 2020;
    }
    return String(year) === yearValue;
  }

  function bindLocalFilter(scope) {
    var section = scope.closest('.section') || document;
    var input = section.querySelector('.filter-input');
    var select = section.querySelector('.filter-select');
    var cards = selectAll('.movie-card', scope);

    function update() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = select ? select.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matched = (!query || haystack.indexOf(query) !== -1) && matchYear(card, yearValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      var empty = section.querySelector('.no-results');
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'no-results';
          empty.textContent = '没有找到匹配的影片。';
          scope.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (select) {
      select.addEventListener('change', update);
    }
  }

  selectAll('[data-filter-scope]').forEach(bindLocalFilter);

  var globalForm = document.querySelector('[data-global-search-form]');
  var globalResults = document.querySelector('[data-global-search-results]');

  if (globalForm && globalResults && window.SEARCH_INDEX) {
    var globalInput = globalForm.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (globalInput) {
      globalInput.value = initialQuery;
    }

    function renderResults(query) {
      var value = (query || '').trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (movie) {
        if (!value) {
          return movie.hot;
        }
        return movie.search.indexOf(value) !== -1;
      }).slice(0, value ? 120 : 48);

      if (!results.length) {
        globalResults.innerHTML = '<div class="no-results">没有找到匹配的影片。</div>';
        return;
      }

      globalResults.innerHTML = results.map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-frame" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</div>',
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    globalForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderResults(globalInput ? globalInput.value : '');
    });

    if (globalInput) {
      globalInput.addEventListener('input', function () {
        renderResults(globalInput.value);
      });
    }

    renderResults(initialQuery);
  }
}());
