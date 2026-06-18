(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-page]").forEach(function (panel) {
      var root = panel.parentElement;
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var empty = root.querySelector("[data-filter-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && input) {
        input.value = query;
      }

      function apply() {
        var q = text(input && input.value);
        var r = text(region && region.value);
        var t = text(type && type.value);
        var y = text(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var match = true;

          if (q && haystack.indexOf(q) === -1) {
            match = false;
          }
          if (r && text(card.getAttribute("data-region")) !== r) {
            match = false;
          }
          if (t && text(card.getAttribute("data-type")) !== t) {
            match = false;
          }
          if (y && text(card.getAttribute("data-year")) !== y) {
            match = false;
          }

          card.classList.toggle("is-hidden", !match);
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector("[data-play-overlay]");
      var button = player.querySelector("[data-play-button]");
      var errorBox = player.querySelector("[data-player-error]");
      var url = player.getAttribute("data-video-url");
      var loaded = false;
      var hls = null;

      function showError() {
        if (errorBox) {
          errorBox.classList.add("is-visible");
        }
      }

      function loadVideo() {
        if (loaded || !video || !url) {
          return;
        }
        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          showError();
        }
      }

      function playVideo() {
        loadVideo();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        if (video) {
          video.setAttribute("controls", "controls");
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
              if (layer) {
                layer.classList.remove("is-hidden");
              }
            });
          }
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      if (layer) {
        layer.addEventListener("click", function () {
          playVideo();
        });
      }

      if (video) {
        video.addEventListener("error", showError);
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
