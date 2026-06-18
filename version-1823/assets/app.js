(function () {
  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.getElementById("menuToggle");
    var nav = document.getElementById("siteNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.getElementById("heroSlider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function renderSearchResults(panel, items) {
    if (!items.length) {
      panel.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
      panel.classList.add("is-open");
      return;
    }
    panel.innerHTML = items.slice(0, 8).map(function (item) {
      var title = escapeHtml(item.title);
      var meta = escapeHtml(item.year + " · " + item.type + " · " + item.category);
      var url = encodeURI(item.url);
      var cover = encodeURI(item.cover);
      return [
        '<a href="./' + url + '">',
        '<img src="' + cover + '" alt="' + title + '">',
        '<span><strong>' + title + '</strong><span>' + meta + '</span></span>',
        '</a>'
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  function setupGlobalSearch() {
    var input = document.getElementById("globalSearch");
    var panel = document.getElementById("searchPanel");
    if (!input || !panel || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = normalizeText(input.value);
      if (!keyword) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      var items = window.SITE_MOVIES.filter(function (item) {
        var haystack = normalizeText([item.title, item.year, item.type, item.region, item.genre, item.category].join(" "));
        return haystack.indexOf(keyword) !== -1;
      });
      renderSearchResults(panel, items);
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalizeText(search && search.value);
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        cards.forEach(function (card) {
          var title = normalizeText(card.getAttribute("data-title"));
          var genre = normalizeText(card.getAttribute("data-genre"));
          var region = normalizeText(card.getAttribute("data-region"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var text = title + " " + genre + " " + region + " " + normalizeText(cardType) + " " + cardYear;
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !selectedYear || cardYear === selectedYear;
          var matchesType = !selectedType || cardType === selectedType;
          card.classList.toggle("is-filter-hidden", !(matchesQuery && matchesYear && matchesType));
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupWideSearch() {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q");
    if (!keyword) {
      return;
    }
    var local = document.querySelector("[data-filter-search]");
    if (local) {
      local.value = keyword;
      local.dispatchEvent(new Event("input"));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
    setupWideSearch();
  });
})();
