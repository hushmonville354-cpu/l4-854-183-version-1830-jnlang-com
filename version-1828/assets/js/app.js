(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dots] button'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const filterForm = document.querySelector('[data-card-filter]');
  const filterList = document.querySelector('[data-filter-list]');
  const filterButtons = document.querySelector('[data-filter-buttons]');

  if (filterForm && filterList) {
    const input = filterForm.querySelector('input');
    const cards = Array.from(filterList.querySelectorAll('.movie-card'));
    let currentYear = '';
    let currentRegion = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      const keyword = normalize(input.value);
      cards.forEach(function (card) {
        const title = normalize(card.dataset.title);
        const region = normalize(card.dataset.region);
        const year = normalize(card.dataset.year);
        const genre = normalize(card.dataset.genre);
        const haystack = [title, region, year, genre].join(' ');
        const keywordMatch = !keyword || haystack.includes(keyword);
        const yearMatch = !currentYear || year === normalize(currentYear);
        const regionMatch = !currentRegion || region === normalize(currentRegion);
        card.style.display = keywordMatch && yearMatch && regionMatch ? '' : 'none';
      });
    }

    input.addEventListener('input', applyFilter);

    if (filterButtons) {
      filterButtons.addEventListener('click', function (event) {
        const target = event.target.closest('button');
        if (!target) {
          return;
        }
        filterButtons.querySelectorAll('button').forEach(function (button) {
          button.classList.remove('is-active');
        });
        target.classList.add('is-active');
        currentYear = target.dataset.filterYear || '';
        currentRegion = target.dataset.filterRegion || '';
        if (target.dataset.filterAll !== undefined) {
          currentYear = '';
          currentRegion = '';
        }
        applyFilter();
      });
    }
  }

  const searchForm = document.querySelector('[data-search-form]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchTitle = document.querySelector('[data-search-title]');

  if (searchForm && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
    const input = searchForm.querySelector('input[name="q"]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function makeCard(movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="play-chip">播放</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
            '<a class="movie-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>' +
            '<div class="movie-meta">' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
              '<span>' + escapeHtml(movie.year) + '</span>' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch(query) {
      const keyword = normalize(query);
      const matches = window.SEARCH_MOVIES.filter(function (movie) {
        const haystack = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase();
        return !keyword || haystack.includes(keyword);
      }).slice(0, 80);

      searchTitle.textContent = keyword ? '搜索结果' : '推荐结果';

      if (!matches.length) {
        searchResults.innerHTML = '<div class="search-empty">暂未找到匹配影片，可尝试更换关键词。</div>';
        return;
      }

      searchResults.innerHTML = matches.map(makeCard).join('');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      const nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', nextUrl);
      runSearch(query);
    });

    runSearch(initialQuery);
  }
})();
