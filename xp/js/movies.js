// NL Cinema — a full Movies & Series app for the XP system, powered by TMDB.
// Mirrors the real NL site: TMDB catalog + OMDB IMDb ratings + YouTube trailers.
// \"Watch Now\" opens the playimdb link inside NL PLAYER (the browser-like window),
// exactly like the site's openWatch(): window.open(playimdb/title/<imdbId>/).

(function () {
  "use strict";

  var TMDB_BASE = "https://api.themoviedb.org/3";
  var IMG = "https://image.tmdb.org/t/p";
  var LANG = "ar";
  var CACHE_TTL = 3600 * 1000 * 24; // 24h

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tmdbKey() { return (window.NL_TMDB_KEY || "").trim(); }
  function omdbKey() { return (window.NL_OMDB_KEY || "").trim(); }

  // YouTube trailer thumbnail (used as a poster fallback, like the site does).
  function ytThumb(key) { return key ? ("https://i.ytimg.com/vi/" + key + "/hqdefault.jpg") : ""; }

  function posterSrc(item) {
    if (item.posterPath) return item.posterPath.indexOf("http") === 0 ? item.posterPath : (IMG + "/w342" + item.posterPath);
    if (item.trailerKey) return ytThumb(item.trailerKey);
    return "";
  }
  function backdropSrc(item) {
    if (item.backdropPath) return item.backdropPath.indexOf("http") === 0 ? item.backdropPath : (IMG + "/original" + item.backdropPath);
    if (item.trailerKey) return "https://i.ytimg.com/vi/" + item.trailerKey + "/maxresdefault.jpg";
    return "";
  }

  // ---------------- curated fallback (works with NO API key) ----------------
  var FALLBACK = {
    movie: [
      { id: 823464, type: "movie", title: "Dune: Part Two", overview: "\u064a\u062a\u062d\u062f \u0628\u0648\u0644 \u0623\u062a\u0631\u064a\u062f\u0633 \u0645\u0639 \u062a\u0634\u0627\u0646\u064a \u0648\u0627\u0644\u0641\u0631\u064a\u0645\u0646 \u0644\u0634\u0646 \u062d\u0631\u0628 \u0627\u0646\u062a\u0642\u0627\u0645\u064a\u0629 \u0636\u062f \u0627\u0644\u0645\u062a\u0622\u0645\u0631\u064a\u0646 \u0627\u0644\u0630\u064a\u0646 \u062f\u0645\u0651\u0631\u0648\u0627 \u0639\u0627\u0626\u0644\u062a\u0647.", trailerKey: "Way9Dexny3w", year: "2024", rating: 8.3, imdbId: "tt15239678", genreNames: ["Action", "Adventure", "Sci-Fi"], runtime: 166, cast: [], posterPath: "", backdropPath: "" },
      { id: 27205, type: "movie", title: "Inception", overview: "\u0644\u0635 \u0645\u0627\u0647\u0631 \u064a\u0633\u0631\u0642 \u0627\u0644\u0623\u0633\u0631\u0627\u0631 \u0645\u0646 \u0627\u0644\u0639\u0642\u0644 \u0627\u0644\u0628\u0627\u0637\u0646 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062d\u0644\u0645\u060c \u062a\u064f\u0639\u0631\u0636 \u0639\u0644\u064a\u0647 \u0641\u0631\u0635\u0629 \u0644\u0632\u0631\u0639 \u0641\u0643\u0631\u0629 \u0628\u062f\u0644 \u0633\u0631\u0642\u062a\u0647\u0627.", trailerKey: "YoHD9XEInc0", year: "2010", rating: 8.4, imdbId: "tt1375666", genreNames: ["Sci-Fi", "Action", "Adventure"], runtime: 148, cast: [], posterPath: "", backdropPath: "" },
      { id: 155, type: "movie", title: "The Dark Knight", overview: "\u064a\u0648\u0627\u062c\u0647 \u0628\u0627\u062a\u0645\u0627\u0646 \u0627\u0644\u062c\u0648\u0643\u0631 \u0641\u064a \u0627\u062e\u062a\u0628\u0627\u0631 \u0644\u0642\u062f\u0631\u062a\u0647 \u0639\u0644\u0649 \u062d\u0645\u0627\u064a\u0629 \u0645\u062f\u064a\u0646\u0629 \u063a\u0648\u062b\u0627\u0645 \u0645\u0646 \u0627\u0644\u0641\u0648\u0636\u0649.", trailerKey: "EXeTwQWrcwY", year: "2008", rating: 9.0, imdbId: "tt0468569", genreNames: ["Action", "Crime", "Drama"], runtime: 152, cast: [], posterPath: "", backdropPath: "" },
      { id: 157336, type: "movie", title: "Interstellar", overview: "\u0641\u0631\u064a\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u062a\u0643\u0634\u0641\u064a\u0646 \u064a\u0633\u0627\u0641\u0631 \u0639\u0628\u0631 \u062b\u0642\u0628 \u062f\u0648\u062f\u064a \u0628\u062d\u062b\u0627\u064b \u0639\u0646 \u0645\u0648\u0637\u0646 \u062c\u062f\u064a\u062f \u0644\u0644\u0628\u0634\u0631\u064a\u0629.", trailerKey: "zSWdZVtXT7E", year: "2014", rating: 8.4, imdbId: "tt0816692", genreNames: ["Adventure", "Drama", "Sci-Fi"], runtime: 169, cast: [], posterPath: "", backdropPath: "" },
      { id: 872585, type: "movie", title: "Oppenheimer", overview: "\u0642\u0635\u0629 \u0627\u0644\u0639\u0627\u0644\u0650\u0645 \u0631\u0648\u0628\u0631\u062a \u0623\u0648\u0628\u0646\u0647\u0627\u064a\u0645\u0631 \u0648\u062f\u0648\u0631\u0647 \u0641\u064a \u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0642\u0646\u0628\u0644\u0629 \u0627\u0644\u0630\u0631\u064a\u0629.", trailerKey: "uYPbbksJxIg", year: "2023", rating: 8.3, imdbId: "tt15398776", genreNames: ["Drama", "History"], runtime: 181, cast: [], posterPath: "", backdropPath: "" },
      { id: 603, type: "movie", title: "The Matrix", overview: "\u064a\u0643\u062a\u0634\u0641 \u0645\u0628\u0631\u0645\u062c \u062d\u0627\u0633\u0648\u0628 \u0623\u0646 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0630\u064a \u064a\u0639\u064a\u0634 \u0641\u064a\u0647 \u0645\u062d\u0627\u0643\u0627\u0629 \u062d\u0627\u0633\u0648\u0628\u064a\u0629.", trailerKey: "vKQi3bBA1y8", year: "1999", rating: 8.2, imdbId: "tt0133093", genreNames: ["Action", "Sci-Fi"], runtime: 136, cast: [], posterPath: "", backdropPath: "" },
      { id: 496243, type: "movie", title: "Parasite", overview: "\u0639\u0627\u0626\u0644\u0629 \u0641\u0642\u064a\u0631\u0629 \u062a\u062a\u0633\u0644\u0644 \u062a\u062f\u0631\u064a\u062c\u064a\u0627\u064b \u0625\u0644\u0649 \u062d\u064a\u0627\u0629 \u0639\u0627\u0626\u0644\u0629 \u062b\u0631\u064a\u0629.", trailerKey: "5xH0HfJHsaY", year: "2019", rating: 8.5, imdbId: "tt6751668", genreNames: ["Drama", "Thriller"], runtime: 132, cast: [], posterPath: "", backdropPath: "" },
      { id: 299534, type: "movie", title: "Avengers: Endgame", overview: "\u064a\u062c\u062a\u0645\u0639 \u0627\u0644\u0623\u0628\u0637\u0627\u0644 \u0627\u0644\u062e\u0627\u0631\u0642\u0648\u0646 \u0644\u0639\u0643\u0633 \u0645\u0627 \u0641\u0639\u0644\u0647 \u062b\u0627\u0646\u0648\u0633.", trailerKey: "TcMBFSGVi1c", year: "2019", rating: 8.2, imdbId: "tt4154796", genreNames: ["Adventure", "Action", "Sci-Fi"], runtime: 181, cast: [], posterPath: "", backdropPath: "" }
    ],
    tv: [
      { id: 1396, type: "tv", title: "Breaking Bad", overview: "\u0645\u062f\u0631\u0651\u0633 \u0643\u064a\u0645\u064a\u0627\u0621 \u0645\u0635\u0627\u0628 \u0628\u0627\u0644\u0633\u0631\u0637\u0627\u0646 \u064a\u062a\u062d\u0648\u0644 \u0625\u0644\u0649 \u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0645\u062e\u062f\u0631\u0627\u062a.", trailerKey: "HhesaQXLuRY", year: "2008", rating: 9.5, imdbId: "tt0903747", genreNames: ["Drama", "Crime"], seasons: 5, episodes: 62, cast: [], posterPath: "", backdropPath: "" },
      { id: 1399, type: "tv", title: "Game of Thrones", overview: "\u0639\u0627\u0626\u0644\u0627\u062a \u0646\u0628\u064a\u0644\u0629 \u062a\u062a\u0635\u0627\u0631\u0639 \u0639\u0644\u0649 \u0639\u0631\u0634 \u0627\u0644\u0645\u0645\u0627\u0644\u0643 \u0627\u0644\u0633\u0628\u0639.", trailerKey: "KPLWWIOCOOQ", year: "2011", rating: 9.2, imdbId: "tt0944947", genreNames: ["Drama", "Fantasy", "Adventure"], seasons: 8, episodes: 73, cast: [], posterPath: "", backdropPath: "" },
      { id: 66732, type: "tv", title: "Stranger Things", overview: "\u0623\u0637\u0641\u0627\u0644 \u064a\u0648\u0627\u062c\u0647\u0648\u0646 \u0642\u0648\u0649 \u062e\u0627\u0631\u0642\u0629 \u0648\u062a\u062c\u0627\u0631\u0628 \u062d\u0643\u0648\u0645\u064a\u0629 \u0633\u0631\u064a\u0629.", trailerKey: "b9EkMc79ZSU", year: "2016", rating: 8.6, imdbId: "tt4574334", genreNames: ["Drama", "Sci-Fi", "Mystery"], seasons: 4, episodes: 42, cast: [], posterPath: "", backdropPath: "" },
      { id: 100088, type: "tv", title: "The Last of Us", overview: "\u0646\u0627\u062c\u064d \u064a\u0631\u0627\u0641\u0642 \u0641\u062a\u0627\u0629 \u0639\u0628\u0631 \u0623\u0645\u0631\u064a\u0643\u0627 \u0627\u0644\u0645\u062f\u0645\u0651\u0631\u0629 \u0628\u0639\u062f \u0648\u0628\u0627\u0621.", trailerKey: "uLtkt8BonwM", year: "2023", rating: 8.7, imdbId: "tt3581920", genreNames: ["Drama", "Sci-Fi"], seasons: 2, episodes: 16, cast: [], posterPath: "", backdropPath: "" },
      { id: 87108, type: "tv", title: "Chernobyl", overview: "\u062f\u0631\u0627\u0645\u0627 \u062a\u0627\u0631\u064a\u062e\u064a\u0629 \u0639\u0646 \u0643\u0627\u0631\u062b\u0629 \u062a\u0634\u064a\u0631\u0646\u0648\u0628\u064a\u0644 \u0627\u0644\u0646\u0648\u0648\u064a\u0629 \u0639\u0627\u0645 1986.", trailerKey: "s9APLXM9Ei8", year: "2019", rating: 9.3, imdbId: "tt7366338", genreNames: ["Drama", "History"], seasons: 1, episodes: 5, cast: [], posterPath: "", backdropPath: "" },
      { id: 119051, type: "tv", title: "Wednesday", overview: "\u0648\u064a\u0646\u0632\u062f\u0627\u064a \u0623\u062f\u0627\u0645\u0632 \u062a\u062d\u0642\u0651\u0642 \u0641\u064a \u062c\u0631\u0627\u0626\u0645 \u063a\u0627\u0645\u0636\u0629 \u062f\u0627\u062e\u0644 \u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629 \u0646\u064a\u0641\u0631\u0645\u0648\u0631.", trailerKey: "Di310WS8zLk", year: "2022", rating: 8.1, imdbId: "tt13443470", genreNames: ["Comedy", "Mystery", "Fantasy"], seasons: 1, episodes: 8, cast: [], posterPath: "", backdropPath: "" }
    ]
  };

  // genre ids per media type for the discover rows
  var GENRE_ROWS = {
    movie: [ { id: 28, label: "\u0623\u0643\u0634\u0646" }, { id: 27, label: "\u0631\u0639\u0628" }, { id: 18, label: "\u062f\u0631\u0627\u0645\u0627" }, { id: 878, label: "\u062e\u064a\u0627\u0644 \u0639\u0644\u0645\u064a" } ],
    tv: [ { id: 10759, label: "\u0645\u063a\u0627\u0645\u0631\u0629 \u0648\u0623\u0643\u0634\u0646" }, { id: 9648, label: "\u063a\u0645\u0648\u0636" }, { id: 18, label: "\u062f\u0631\u0627\u0645\u0627" }, { id: 16, label: "\u0631\u0633\u0648\u0645 \u0645\u062a\u062d\u0631\u0643\u0629" } ]
  };

  function fetchJson(url) {
    var ckey = "nlmov_" + url.replace(/api_key=[^&]*/, "api_key=x");
    try {
      var c = localStorage.getItem(ckey);
      if (c) { var p = JSON.parse(c); if (Date.now() - p.t < CACHE_TTL) return Promise.resolve(p.d); }
    } catch (e) {}
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("net");
      return r.json();
    }).then(function (d) {
      try { localStorage.setItem(ckey, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    });
  }

  function normalize(raw, type) {
    var isTv = type === "tv";
    var trailer = "";
    if (raw.videos && raw.videos.results) {
      var tr = raw.videos.results.find(function (v) { return v.site === "YouTube" && v.type === "Trailer"; });
      trailer = (tr && tr.key) || "";
    }
    return {
      id: raw.id, type: type,
      title: (isTv ? (raw.name || raw.title) : (raw.title || raw.name)) || "\u0628\u062f\u0648\u0646 \u0639\u0646\u0648\u0627\u0646",
      overview: raw.overview || "",
      posterPath: raw.poster_path || "",
      backdropPath: raw.backdrop_path || "",
      year: String(isTv ? (raw.first_air_date || "") : (raw.release_date || "")).split("-")[0] || "",
      rating: typeof raw.vote_average === "number" ? raw.vote_average : 0,
      genreIds: raw.genre_ids || (raw.genres ? raw.genres.map(function (g) { return g.id; }) : []),
      genreNames: raw.genres ? raw.genres.map(function (g) { return g.name; }) : [],
      trailerKey: trailer || raw.trailer_key || "",
      imdbId: raw.imdb_id || (raw.external_ids && raw.external_ids.imdb_id) || "",
      runtime: raw.runtime || (raw.episode_run_time && raw.episode_run_time[0]) || 0,
      seasons: raw.number_of_seasons || 0,
      episodes: raw.number_of_episodes || 0,
      cast: (raw.credits && raw.credits.cast ? raw.credits.cast : []).slice(0, 6).map(function (c) {
        return { name: c.name, character: c.character || "", profile: c.profile_path || "" };
      })
    };
  }

  // ---------------- the app ----------------
  function initMovies(win, showNotification) {
    var root = win.querySelector(".window-content");
    if (!root) return;
    var hasKey = !!tmdbKey();
    var tab = "movie";

    root.style.cssText = "display:flex;flex-direction:column;height:100%;width:100%;background:#101010;color:#eee;overflow:hidden;font-family:Tahoma,Arial,sans-serif;";
    root.setAttribute("dir", "rtl");
    root.innerHTML =
      '<div style="flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:8px 14px;background:linear-gradient(#1f1f1f,#141414);border-bottom:1px solid #c0392b;">' +
        '<span style="font-weight:900;font-size:18px;color:#e50914;letter-spacing:1px;">NL CINEMA</span>' +
        '<div class="nlc-tabs" style="display:flex;gap:6px;">' +
          '<button class="nlc-tab" data-tab="movie" style="padding:5px 14px;border:0;border-radius:14px;background:#e50914;color:#fff;font-weight:bold;cursor:pointer;font-size:12px;">\u0623\u0641\u0644\u0627\u0645</button>' +
          '<button class="nlc-tab" data-tab="tv" style="padding:5px 14px;border:0;border-radius:14px;background:#2a2a2a;color:#ccc;font-weight:bold;cursor:pointer;font-size:12px;">\u0645\u0633\u0644\u0633\u0644\u0627\u062a</button>' +
        '</div>' +
        '<input class="nlc-search" type="text" placeholder="\u0628\u062d\u062b..." style="margin-inline-start:auto;width:200px;height:26px;padding:0 10px;border:1px solid #444;border-radius:13px;background:#222;color:#fff;outline:none;font-size:12px;"/>' +
      '</div>' +
      (hasKey ? "" :
        '<div style="flex:0 0 auto;padding:7px 14px;background:#3a2d00;color:#ffcf66;font-size:11.5px;border-bottom:1px solid #6b5300;">\u26A0 \u0645\u0641\u062a\u0627\u062d TMDB \u063a\u064a\u0631 \u0645\u0636\u0628\u0648\u0637 \u0628\u0639\u062f \u2014 \u064a\u064f\u0639\u0631\u0636 \u0643\u062a\u0627\u0644\u0648\u062c \u062a\u062c\u0631\u064a\u0628\u064a. \u0623\u0636\u0650\u0641 \u0633\u0631 TMDB_API_KEY \u0641\u064a GitHub Actions \u0644\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0643\u062a\u0627\u0644\u0648\u062c \u0627\u0644\u0643\u0627\u0645\u0644.</div>') +
      '<div class="nlc-scroll" style="flex:1 1 auto;overflow-y:auto;overflow-x:hidden;min-height:0;"></div>';

    var scroll = root.querySelector(".nlc-scroll");
    var searchInput = root.querySelector(".nlc-search");
    var tabBtns = root.querySelectorAll(".nlc-tab");

    function setTab(t) {
      tab = t;
      tabBtns.forEach(function (b) {
        var on = b.dataset.tab === t;
        b.style.background = on ? "#e50914" : "#2a2a2a";
        b.style.color = on ? "#fff" : "#ccc";
      });
      searchInput.value = "";
      loadTab();
    }
    tabBtns.forEach(function (b) { b.addEventListener("click", function () { setTab(b.dataset.tab); }); });

    var searchTimer = null;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      var q = searchInput.value.trim();
      if (!q) { loadTab(); return; }
      searchTimer = setTimeout(function () { runSearch(q); }, 400);
    });

    function spinner(msg) {
      scroll.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px;color:#888;">' +
        '<div style="width:34px;height:34px;border:4px solid #333;border-top-color:#e50914;border-radius:50%;animation:nlcspin 1s linear infinite;"></div>' +
        '<div style="font-size:12px;">' + esc(msg || "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...") + '</div></div>' +
        '<style>@keyframes nlcspin{to{transform:rotate(360deg)}}</style>';
    }

    function card(item) {
      var p = posterSrc(item);
      var d = document.createElement("div");
      d.style.cssText = "flex:0 0 auto;width:130px;cursor:pointer;transition:transform .15s;";
      d.innerHTML =
        '<div style="width:130px;height:195px;border-radius:8px;overflow:hidden;background:#222;border:1px solid #333;position:relative;">' +
          (p ? '<img src="' + esc(p) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'"/>' : "") +
          '<div style="position:absolute;top:4px;inset-inline-end:4px;background:rgba(0,0,0,.75);color:#f5c518;font-size:10px;font-weight:bold;padding:1px 5px;border-radius:4px;">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:#ddd;margin-top:5px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(item.title) + '</div>' +
        '<div style="font-size:10px;color:#888;">' + esc(item.year || "") + '</div>';
      d.addEventListener("mouseenter", function () { d.style.transform = "scale(1.06)"; });
      d.addEventListener("mouseleave", function () { d.style.transform = "scale(1)"; });
      d.addEventListener("click", function () { openDetail(item); });
      return d;
    }

    function rowEl(title, items) {
      if (!items || !items.length) return null;
      var wrap = document.createElement("div");
      wrap.style.cssText = "padding:10px 14px;";
      var h = document.createElement("div");
      h.textContent = title;
      h.style.cssText = "font-size:14px;font-weight:bold;color:#eee;margin-bottom:8px;";
      var strip = document.createElement("div");
      strip.style.cssText = "display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;";
      items.forEach(function (it) { strip.appendChild(card(it)); });
      wrap.appendChild(h);
      wrap.appendChild(strip);
      return wrap;
    }

    function hero(item) {
      if (!item) return null;
      var bd = backdropSrc(item);
      var h = document.createElement("div");
      h.style.cssText = "position:relative;height:230px;display:flex;align-items:flex-end;padding:18px;" +
        (bd ? "background:linear-gradient(to top,#101010 5%,rgba(16,16,16,.2)),url('" + bd.replace(/'/g, "%27") + "') center/cover;" : "background:#1a1a1a;");
      h.innerHTML =
        '<div style="max-width:60%;">' +
          '<div style="font-size:24px;font-weight:900;color:#fff;text-shadow:0 2px 8px #000;">' + esc(item.title) + '</div>' +
          '<div style="font-size:11px;color:#ccc;margin:6px 0;display:flex;gap:10px;"><span style="color:#f5c518;font-weight:bold;">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</span><span>' + esc(item.year || "") + '</span></div>' +
          '<div style="font-size:11.5px;color:#ddd;line-height:1.7;max-height:60px;overflow:hidden;">' + esc(item.overview || "") + '</div>' +
          '<button class="nlc-hero-watch" style="margin-top:10px;background:#e50914;color:#fff;border:0;padding:8px 22px;border-radius:5px;font-weight:bold;cursor:pointer;font-size:13px;">\u25B6 \u0634\u0627\u0647\u062f \u0627\u0644\u0622\u0646</button>' +
        '</div>';
      h.querySelector(".nlc-hero-watch").addEventListener("click", function () { openDetail(item); });
      return h;
    }

    function renderLists(lists, heroItem) {
      scroll.innerHTML = "";
      var hr = hero(heroItem);
      if (hr) scroll.appendChild(hr);
      lists.forEach(function (l) {
        var r = rowEl(l.title, l.items);
        if (r) scroll.appendChild(r);
      });
    }

    function loadTab() {
      if (!hasKey) {
        var fb = FALLBACK[tab].slice();
        var byGenre = function (g) { return fb.filter(function (m) { return m.genreNames.indexOf(g) >= 0; }); };
        renderLists([
          { title: "\u0627\u0644\u0623\u0643\u062b\u0631 \u0631\u0648\u0627\u062c\u0627\u064b", items: fb },
          { title: "\u062f\u0631\u0627\u0645\u0627", items: byGenre("Drama") },
          { title: "\u0623\u0643\u0634\u0646", items: byGenre("Action") }
        ], fb[0]);
        return;
      }
      spinner();
      var key = tmdbKey();
      var L = "&language=" + LANG;
      var t = tab;
      var urls = [
        TMDB_BASE + "/trending/" + t + "/week?api_key=" + key + L,
        TMDB_BASE + "/" + t + "/top_rated?api_key=" + key + L,
        TMDB_BASE + "/" + t + "/popular?api_key=" + key + L
      ];
      var grows = GENRE_ROWS[t];
      grows.forEach(function (g) {
        urls.push(TMDB_BASE + "/discover/" + t + "?api_key=" + key + L + "&with_genres=" + g.id + "&sort_by=popularity.desc");
      });
      Promise.allSettled(urls.map(fetchJson)).then(function (res) {
        function items(i) {
          var r = res[i];
          if (r.status === "fulfilled" && r.value && r.value.results) {
            return r.value.results.map(function (x) { return normalize(x, t); }).filter(function (x) { return x.posterPath || x.trailerKey; });
          }
          return [];
        }
        var trending = items(0);
        var lists = [
          { title: "\u0627\u0644\u0623\u0643\u062b\u0631 \u0631\u0648\u0627\u062c\u0627\u064b \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639", items: trending },
          { title: "\u0627\u0644\u0623\u0639\u0644\u0649 \u062a\u0642\u064a\u064a\u0645\u0627\u064b", items: items(1) },
          { title: "\u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u0639\u0628\u064a\u0629", items: items(2) }
        ];
        grows.forEach(function (g, gi) { lists.push({ title: g.label, items: items(3 + gi) }); });
        var heroItem = trending[0] || items(2)[0] || FALLBACK[t][0];
        if (!trending.length && !items(1).length) {
          // total failure -> fallback
          hasKey = false; loadTab(); return;
        }
        renderLists(lists, heroItem);
      });
    }

    function runSearch(q) {
      if (!hasKey) {
        var fb = FALLBACK[tab].filter(function (m) { return m.title.toLowerCase().indexOf(q.toLowerCase()) >= 0; });
        renderLists([{ title: "\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b", items: fb }], null);
        return;
      }
      spinner("\u062c\u0627\u0631\u064d \u0627\u0644\u0628\u062d\u062b...");
      fetchJson(TMDB_BASE + "/search/" + tab + "?api_key=" + tmdbKey() + "&language=" + LANG + "&query=" + encodeURIComponent(q)).then(function (d) {
        var items = (d.results || []).map(function (x) { return normalize(x, tab); }).filter(function (x) { return x.posterPath || x.trailerKey; });
        renderLists([{ title: "\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b (" + items.length + ")", items: items }], null);
      }).catch(function () {
        renderLists([{ title: "\u062a\u0639\u0630\u0631 \u0627\u0644\u0628\u062d\u062b", items: [] }], null);
      });
    }

    // ---------- detail overlay ----------
    function watch(item) {
      var imdb = item.imdbId || "";
      if (!imdb) { if (showNotification) showNotification("NL CINEMA", "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0639\u0631\u0651\u0641 IMDb \u0644\u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646"); return; }
      var url = "https://www.playimdb.com/title/" + imdb + "/";
      if (window.openNlPlayer) window.openNlPlayer({ url: url, title: item.title });
      else window.open(url, "_blank", "noopener,noreferrer");
    }

    function renderDetail(item) {
      var ov = document.createElement("div");
      ov.style.cssText = "position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto;";
      var bd = backdropSrc(item);
      var castHtml = (item.cast || []).map(function (c) {
        var img = c.profile ? (IMG + "/w185" + c.profile) : "";
        return '<div style="min-width:62px;max-width:62px;text-align:center;">' +
          '<div style="width:46px;height:46px;border-radius:50%;overflow:hidden;background:#333;margin:0 auto 4px;">' + (img ? '<img src="' + esc(img) + '" style="width:100%;height:100%;object-fit:cover;"/>' : '<div style="line-height:46px;font-size:18px;">\uD83D\uDC64</div>') + '</div>' +
          '<div style="font-size:9px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name) + '</div></div>';
      }).join("");
      var genreHtml = (item.genreNames || []).map(function (g) { return '<span style="font-size:10px;background:#222;border:1px solid #333;border-radius:4px;padding:2px 8px;">' + esc(g) + '</span>'; }).join("");
      var meta = item.type === "movie"
        ? (item.runtime ? item.runtime + " \u062f\u0642\u064a\u0642\u0629" : "")
        : (item.seasons ? item.seasons + " \u0645\u0648\u0633\u0645" + (item.episodes ? " \u00b7 " + item.episodes + " \u062d\u0644\u0642\u0629" : "") : "");
      ov.innerHTML =
        '<div style="width:100%;max-width:680px;background:#161616;border:1px solid #333;border-radius:14px;overflow:hidden;">' +
          '<div style="position:relative;height:230px;" >' +
            (bd ? '<img src="' + esc(bd) + '" style="width:100%;height:100%;object-fit:cover;opacity:.85;"/>' : '<div style="width:100%;height:100%;background:#222;"></div>') +
            '<div style="position:absolute;inset:0;background:linear-gradient(to top,#161616,transparent);"></div>' +
            '<button class="nlc-close" style="position:absolute;top:10px;inset-inline-end:10px;width:30px;height:30px;border:0;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;cursor:pointer;font-size:16px;">\u2715</button>' +
          '</div>' +
          '<div style="padding:16px 20px 22px;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
              '<h3 style="margin:0;font-size:20px;font-weight:900;color:#fff;">' + esc(item.title) + '</h3>' +
              '<button class="nlc-watch" style="background:#e50914;color:#fff;border:0;padding:9px 22px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;white-space:nowrap;">\u25B6 \u0634\u0627\u0647\u062f \u0627\u0644\u0622\u0646</button>' +
            '</div>' +
            '<div style="display:flex;gap:12px;font-size:11px;color:#aaa;margin:8px 0;"><span style="color:#f5c518;font-weight:bold;">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</span><span>' + esc(item.year || "") + '</span><span>' + esc(meta) + '</span></div>' +
            '<p style="font-size:12.5px;color:#ddd;line-height:1.8;max-height:120px;overflow-y:auto;">' + esc(item.overview || "\u0627\u0644\u0642\u0635\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629.") + '</p>' +
            (genreHtml ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;">' + genreHtml + '</div>' : "") +
            (item.trailerKey ? '<div style="margin-top:10px;border-radius:8px;overflow:hidden;aspect-ratio:16/9;background:#000;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + esc(item.trailerKey) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' : "") +
            (castHtml ? '<div style="margin-top:14px;"><div style="font-size:11px;color:#888;margin-bottom:6px;">\u0627\u0644\u0623\u0628\u0637\u0627\u0644</div><div style="display:flex;gap:8px;overflow-x:auto;">' + castHtml + '</div></div>' : "") +
          '</div>' +
        '</div>';
      root.appendChild(ov);
      ov.addEventListener("click", function (e) { if (e.target === ov) root.removeChild(ov); });
      ov.querySelector(".nlc-close").addEventListener("click", function () { root.removeChild(ov); });
      ov.querySelector(".nlc-watch").addEventListener("click", function () { watch(item); });
    }

    function openDetail(item) {
      if (!hasKey || !tmdbKey()) { renderDetail(item); return; }
      var append = item.type === "tv" ? "videos,credits,similar,external_ids" : "videos,credits,similar,release_dates";
      fetchJson(TMDB_BASE + "/" + item.type + "/" + item.id + "?api_key=" + tmdbKey() + "&language=" + LANG + "&append_to_response=" + append).then(function (detail) {
        var norm = normalize(detail, item.type);
        var imdb = item.type === "tv" ? (detail.external_ids && detail.external_ids.imdb_id) : detail.imdb_id;
        norm.imdbId = imdb || norm.imdbId || item.imdbId;
        var ok = omdbKey() && norm.imdbId;
        if (ok) {
          fetch((window.location.protocol || "https:") + "//www.omdbapi.com/?i=" + norm.imdbId + "&apikey=" + omdbKey()).then(function (r) { return r.json(); }).then(function (o) {
            if (o && o.imdbRating && o.imdbRating !== "N/A") norm.rating = parseFloat(o.imdbRating);
            renderDetail(norm);
          }).catch(function () { renderDetail(norm); });
        } else {
          renderDetail(norm);
        }
      }).catch(function () { renderDetail(item); });
    }

    setTab("movie");
  }

  window.initMovies = initMovies;
})();
