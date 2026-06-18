(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      var restart = function () {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      show(0);
      restart();
    }

    var search = document.querySelector('[data-movie-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activeKind = 'all';
    var noResult = document.querySelector('[data-no-result]');
    var applyFilter = function () {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var kind = card.getAttribute('data-kind') || 'movie';
        var matchText = !q || text.indexOf(q) !== -1;
        var matchKind = activeKind === 'all' || kind === activeKind;
        var visible = matchText && matchKind;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (noResult) {
        noResult.style.display = shown ? 'none' : 'block';
      }
    };
    if (search) {
      search.addEventListener('input', applyFilter);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeKind = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });
    applyFilter();
  });
})();
