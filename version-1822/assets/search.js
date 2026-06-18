(function () {
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  if (input) {
    input.value = query;
  }
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function render(items) {
    if (!results) {
      return;
    }
    if (!items.length) {
      results.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
      return;
    }
    results.innerHTML = items.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join("");
      return '<article class="movie-card">' +
        '<a class="card-cover" href="./' + encodeURI(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="card-play">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="./' + encodeURI(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join("");
  }
  function runSearch(value) {
    var term = value.trim().toLowerCase();
    if (!term) {
      results.innerHTML = "";
      return;
    }
    var items = (window.SEARCH_MOVIES || []).filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
      return text.indexOf(term) !== -1;
    }).slice(0, 120);
    render(items);
  }
  runSearch(query);
  if (input) {
    input.addEventListener("input", function () {
      runSearch(input.value);
    });
  }
})();
