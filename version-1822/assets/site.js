(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".category-filter"));
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
  var selectedYear = "all";
  function applyFilter() {
    var input = filterInputs[0];
    var term = input ? input.value.trim().toLowerCase() : "";
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-card"));
    cards.forEach(function (card) {
      var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
      var year = card.getAttribute("data-year") || "";
      var matchText = !term || text.indexOf(term) !== -1;
      var matchYear = selectedYear === "all" || year === selectedYear;
      card.classList.toggle("is-filter-hidden", !(matchText && matchYear));
    });
  }
  filterInputs.forEach(function (input) {
    input.addEventListener("input", applyFilter);
  });
  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedYear = button.getAttribute("data-year-filter") || "all";
      yearButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilter();
    });
  });
})();
