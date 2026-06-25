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

    var NLC_CSS = [
      ".nlc-root{display:flex;flex-direction:column;height:100%;width:100%;background:#ECE9D8;color:#000;overflow:hidden;font-family:Tahoma,'Segoe UI',Arial,sans-serif;font-size:11px;}",
      ".nlc-toolbar{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:5px 8px;background:linear-gradient(#FDFDFC,#ECE9D8);border-bottom:1px solid #ACA899;}",
      ".nlc-brand{display:flex;align-items:center;gap:5px;font-weight:900;font-size:14px;color:#0A246A;letter-spacing:.5px;white-space:nowrap;}",
      ".nlc-tabs{display:flex;gap:3px;margin-inline-start:6px;}",
      ".nlc-tab{font:11px Tahoma;padding:4px 16px;background:linear-gradient(#F6F4EC,#D8D4C4);border:1px solid;border-color:#fff #808080 #808080 #fff;border-radius:5px 5px 0 0;cursor:pointer;color:#333;}",
      ".nlc-tab.on{background:#fff;font-weight:bold;color:#0A246A;}",
      ".nlc-search{margin-inline-start:auto;width:190px;max-width:38%;height:22px;padding:0 8px;border:1px solid;border-color:#808080 #fff #fff #808080;background:#fff;font:11px Tahoma;outline:none;color:#000;}",
      ".nlc-note{flex:0 0 auto;padding:6px 12px;background:#FFFFCE;color:#5b4b00;font-size:11px;border-bottom:1px solid #C9C295;}",
      ".nlc-scroll{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;min-height:0;background:#F1EFE3;}",
      ".nlc-sec{padding:2px 12px 12px;}",
      ".nlc-sec-h{display:flex;align-items:center;gap:6px;font-weight:bold;font-size:12px;color:#0A246A;padding:10px 2px 6px;border-bottom:1px solid #C9C295;margin-bottom:9px;}",
      ".nlc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;}",
      ".nlc-card{cursor:pointer;background:#fff;border:1px solid;border-color:#808080 #fff #fff #808080;padding:4px;}",
      ".nlc-card:hover{background:#C1D8F2;border-color:#316AC5;}",
      ".nlc-pwrap{position:relative;width:100%;aspect-ratio:2/3;background:#1a1a1a;overflow:hidden;}",
      ".nlc-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}",
      ".nlc-rate{position:absolute;top:3px;inset-inline-end:3px;background:rgba(0,0,0,.78);color:#f5c518;font-size:10px;font-weight:bold;padding:1px 5px;border-radius:3px;z-index:1;}",
      ".nlc-ctitle{font-size:11px;color:#000;margin-top:4px;font-weight:bold;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}",
      ".nlc-cyear{font-size:10px;color:#5a5a5a;}",
      ".nlc-btn{font:bold 11px Tahoma;padding:5px 16px;background:linear-gradient(#FCFBFA,#E3E0D2);border:1px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;color:#000;border-radius:3px;}",
      ".nlc-btn:active{border-color:#808080 #fff #fff #808080;}",
      ".nlc-hero{position:relative;min-height:172px;display:flex;align-items:flex-end;padding:16px;background:#1a1a1a;background-size:cover;background-position:center;border-bottom:1px solid #ACA899;color:#fff;}",
      ".nlc-hero-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.1));}",
      ".nlc-hero-box{position:relative;z-index:1;max-width:65%;}",
      ".nlc-hero-title{font-size:22px;font-weight:900;text-shadow:0 2px 6px #000;}",
      ".nlc-hero-meta{display:flex;gap:10px;font-size:11px;color:#eee;margin:6px 0;}",
      ".nlc-hero-ov{font-size:11.5px;color:#eee;line-height:1.7;max-height:56px;overflow:hidden;text-shadow:0 1px 3px #000;}",
      ".nlc-hero-watch{margin-top:10px;}",
      ".nlc-star{color:#f5c518;font-weight:bold;}",
      ".nlc-spin{display:flex;flex-direction:column;align-items:center;gap:12px;padding:50px;color:#555;}",
      ".nlc-sp{width:30px;height:30px;border:4px solid #cfc9b0;border-top-color:#0A246A;border-radius:50%;animation:nlcspin 1s linear infinite;}",
      "@keyframes nlcspin{to{transform:rotate(360deg)}}",
      ".nlc-modal{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:14px;}",
      ".nlc-win{display:flex;flex-direction:column;width:100%;max-width:640px;max-height:100%;background:#ECE9D8;border:2px solid #0A246A;border-radius:8px 8px 0 0;box-shadow:0 8px 30px rgba(0,0,0,.55);overflow:hidden;}",
      ".nlc-titlebar{flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:5px 7px;background:linear-gradient(#0A56C8,#0A246A);color:#fff;font-weight:bold;font-size:12px;}",
      ".nlc-tb-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".nlc-close{width:21px;height:21px;border:1px solid #fff;border-radius:3px;background:linear-gradient(#E88,#C0392B);color:#fff;cursor:pointer;font-size:12px;line-height:1;}",
      ".nlc-body{flex:1 1 auto;overflow-y:auto;padding:0 0 16px;}",
      ".nlc-det-hero{height:170px;background:#222;background-size:cover;background-position:center;}",
      ".nlc-det-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px 4px;}",
      ".nlc-det-meta{display:flex;gap:12px;font-size:11px;color:#444;flex-wrap:wrap;}",
      ".nlc-det-ov{font-size:12px;color:#222;line-height:1.8;padding:6px 16px;max-height:140px;overflow-y:auto;margin:0;}",
      ".nlc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 16px;}",
      ".nlc-chips span{font-size:10px;background:#fff;border:1px solid;border-color:#808080 #fff #fff #808080;padding:2px 8px;}",
      ".nlc-trailer{margin:10px 16px;aspect-ratio:16/9;background:#000;border:1px solid #808080;}",
      ".nlc-trailer iframe{width:100%;height:100%;border:0;}",
      ".nlc-cast-h{font-size:11px;color:#0A246A;font-weight:bold;padding:8px 16px 4px;}",
      ".nlc-cast{display:flex;gap:10px;overflow-x:auto;padding:0 16px 6px;}",
      ".nlc-cast-item{min-width:62px;max-width:62px;text-align:center;}",
      ".nlc-cast-img{width:46px;height:46px;border-radius:50%;overflow:hidden;background:#ccc;margin:0 auto 4px;border:1px solid #808080;}",
      ".nlc-cast-img img{width:100%;height:100%;object-fit:cover;}",
      ".nlc-cast-name{font-size:9px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}"
    ].join("");

    if (!document.getElementById("nlc-xp-style")) {
      var st = document.createElement("style");
      st.id = "nlc-xp-style";
      st.textContent = NLC_CSS;
      document.head.appendChild(st);
    }

    root.className = "nlc-root";
    root.style.cssText = "";
    root.setAttribute("dir", "rtl");
    root.innerHTML =
      '<div class="nlc-toolbar">' +
        '<span class="nlc-brand">\uD83C\uDFAC NL CINEMA</span>' +
        '<div class="nlc-tabs">' +
          '<button class="nlc-tab on" data-tab="movie">\u0623\u0641\u0644\u0627\u0645</button>' +
          '<button class="nlc-tab" data-tab="tv">\u0645\u0633\u0644\u0633\u0644\u0627\u062a</button>' +
        '</div>' +
        '<input class="nlc-search" type="text" placeholder="\u0628\u062d\u062b..." />' +
      '</div>' +
      (hasKey ? "" :
        '<div class="nlc-note">\u26A0 \u0645\u0641\u062a\u0627\u062d TMDB \u063a\u064a\u0631 \u0645\u0636\u0628\u0648\u0637 \u0628\u0639\u062f \u2014 \u064a\u064f\u0639\u0631\u0636 \u0643\u062a\u0627\u0644\u0648\u062c \u062a\u062c\u0631\u064a\u0628\u064a.</div>') +
      '<div class="nlc-scroll"></div>';

    var scroll = root.querySelector(".nlc-scroll");
    var searchInput = root.querySelector(".nlc-search");
    var tabBtns = root.querySelectorAll(".nlc-tab");

    function setTab(t) {
      tab = t;
      tabBtns.forEach(function (b) { b.classList.toggle("on", b.dataset.tab === t); });
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
      scroll.innerHTML = '<div class="nlc-spin"><div class="nlc-sp"></div><div>' + esc(msg || "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...") + '</div></div>';
    }

    function card(item) {
      var p = posterSrc(item);
      var d = document.createElement("div");
      d.className = "nlc-card";
      d.innerHTML =
        '<div class="nlc-pwrap">' +
          (p ? '<img class="nlc-poster" src="' + esc(p) + '" loading="lazy" onerror="this.style.display=\'none\'"/>' : "") +
          '<span class="nlc-rate">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</span>' +
        '</div>' +
        '<div class="nlc-ctitle">' + esc(item.title) + '</div>' +
        '<div class="nlc-cyear">' + esc(item.year || "") + '</div>';
      d.addEventListener("click", function () { openDetail(item); });
      return d;
    }

    function sectionEl(title, items) {
      if (!items || !items.length) return null;
      var wrap = document.createElement("div");
      wrap.className = "nlc-sec";
      var h = document.createElement("div");
      h.className = "nlc-sec-h";
      h.innerHTML = '<span>\uD83D\uDCC1</span><span>' + esc(title) + '</span>';
      var grid = document.createElement("div");
      grid.className = "nlc-grid";
      items.slice(0, 18).forEach(function (it) { grid.appendChild(card(it)); });
      wrap.appendChild(h);
      wrap.appendChild(grid);
      return wrap;
    }

    function hero(item) {
      if (!item) return null;
      var bd = backdropSrc(item);
      var h = document.createElement("div");
      h.className = "nlc-hero";
      if (bd) h.style.backgroundImage = "url('" + bd.replace(/'/g, "%27") + "')";
      h.innerHTML =
        '<div class="nlc-hero-veil"></div>' +
        '<div class="nlc-hero-box">' +
          '<div class="nlc-hero-title">' + esc(item.title) + '</div>' +
          '<div class="nlc-hero-meta"><span class="nlc-star">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</span><span>' + esc(item.year || "") + '</span></div>' +
          '<div class="nlc-hero-ov">' + esc(item.overview || "") + '</div>' +
          '<button class="nlc-btn nlc-hero-watch">\u25B6 \u0634\u0627\u0647\u062f \u0627\u0644\u0622\u0646</button>' +
        '</div>';
      h.querySelector(".nlc-hero-watch").addEventListener("click", function () { openDetail(item); });
      return h;
    }

    function renderLists(lists, heroItem) {
      scroll.innerHTML = "";
      var hr = hero(heroItem);
      if (hr) scroll.appendChild(hr);
      lists.forEach(function (l) {
        var r = sectionEl(l.title, l.items);
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

    // Build embeddable in-window sources (providers that allow iframe embedding,
    // unlike playimdb). Movies use the IMDb/TMDB id; TV passes through too. The
    // user can switch sources inside NL PLAYER if one provider is down.
    function buildSources(item) {
      var imdb = item.imdbId || "";
      var tmdb = item.id || "";
      var t = item.type === "tv" ? "tv" : "movie";
      var primary = imdb || tmdb;
      var srcs = [];
      if (primary) {
        srcs.push({ label: "\u0645\u0635\u062f\u0631 1", url: "https://vidsrc.cc/v2/embed/" + t + "/" + primary });
        srcs.push({ label: "\u0645\u0635\u062f\u0631 2", url: "https://vidsrc.to/embed/" + t + "/" + primary });
      }
      if (tmdb) {
        srcs.push({ label: "\u0645\u0635\u062f\u0631 3", url: t === "tv" ? ("https://www.2embed.cc/embedtv/" + tmdb + "&s=1&e=1") : ("https://www.2embed.cc/embed/" + tmdb) });
        srcs.push({ label: "\u0645\u0635\u062f\u0631 4", url: "https://player.vidify.top/embed/" + t + "/" + tmdb });
      }
      return srcs;
    }

    function watch(item) {
      var imdb = item.imdbId || "";
      // External (browser) URL = the exact method the live site uses.
      var ext = imdb ? ("https://www.playimdb.com/title/" + imdb + "/") : "";
      var sources = buildSources(item);
      if (!sources.length && !ext) { if (showNotification) showNotification("NL CINEMA", "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0635\u062f\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646"); return; }
      if (window.openNlPlayer) window.openNlPlayer({ url: ext, title: item.title, sources: sources });
      else if (ext) window.open(ext, "_blank", "noopener,noreferrer");
    }

    function renderDetail(item) {
      var ov = document.createElement("div");
      ov.className = "nlc-modal";
      var bd = backdropSrc(item);
      var castHtml = (item.cast || []).map(function (c) {
        var img = c.profile ? (IMG + "/w185" + c.profile) : "";
        return '<div class="nlc-cast-item"><div class="nlc-cast-img">' + (img ? '<img src="' + esc(img) + '"/>' : '<div style="line-height:46px;font-size:18px;">\uD83D\uDC64</div>') + '</div><div class="nlc-cast-name">' + esc(c.name) + '</div></div>';
      }).join("");
      var genreHtml = (item.genreNames || []).map(function (g) { return '<span>' + esc(g) + '</span>'; }).join("");
      var meta = item.type === "movie"
        ? (item.runtime ? item.runtime + " \u062f\u0642\u064a\u0642\u0629" : "")
        : (item.seasons ? item.seasons + " \u0645\u0648\u0633\u0645" + (item.episodes ? " \u00b7 " + item.episodes + " \u062d\u0644\u0642\u0629" : "") : "");
      ov.innerHTML =
        '<div class="nlc-win">' +
          '<div class="nlc-titlebar"><span>\uD83C\uDFAC</span><span class="nlc-tb-text">' + esc(item.title) + '</span><button class="nlc-close" title="\u0625\u063a\u0644\u0627\u0642">\u2715</button></div>' +
          '<div class="nlc-body">' +
            (bd ? '<div class="nlc-det-hero" style="background-image:url(\'' + bd.replace(/'/g, "%27") + '\')"></div>' : "") +
            '<div class="nlc-det-head">' +
              '<div class="nlc-det-meta"><span class="nlc-star">\u2605 ' + (item.rating ? item.rating.toFixed(1) : "\u2014") + '</span><span>' + esc(item.year || "") + '</span><span>' + esc(meta) + '</span></div>' +
              '<button class="nlc-btn nlc-watch">\u25B6 \u0634\u0627\u0647\u062f \u0627\u0644\u0622\u0646</button>' +
            '</div>' +
            '<p class="nlc-det-ov">' + esc(item.overview || "\u0627\u0644\u0642\u0635\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629.") + '</p>' +
            (genreHtml ? '<div class="nlc-chips">' + genreHtml + '</div>' : "") +
            (item.trailerKey ? '<div class="nlc-trailer"><iframe src="https://www.youtube.com/embed/' + esc(item.trailerKey) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' : "") +
            (castHtml ? '<div class="nlc-cast-h">\u0627\u0644\u0623\u0628\u0637\u0627\u0644</div><div class="nlc-cast">' + castHtml + '</div>' : "") +
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
