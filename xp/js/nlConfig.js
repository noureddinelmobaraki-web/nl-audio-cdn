// NL config — API keys are injected at DEPLOY time by a GitHub Actions workflow
// (a simple placeholder replacement). The placeholders below are safe to commit:
// if they are NOT replaced, the app still loads and falls back to a curated catalog.
//
// Workflow replaces __NL_TMDB_KEY__ and __NL_OMDB_KEY__ with repository secrets.
(function () {
  "use strict";
  var RAW_TMDB = "__NL_TMDB_KEY__";
  var RAW_OMDB = "__NL_OMDB_KEY__";
  // A value is still a placeholder if it begins with a double underscore.
  function isPlaceholder(v) {
    return !v || (v.charAt(0) === "_" && v.charAt(1) === "_");
  }
  window.NL_TMDB_KEY = isPlaceholder(RAW_TMDB) ? "" : RAW_TMDB;
  window.NL_OMDB_KEY = isPlaceholder(RAW_OMDB) ? "" : RAW_OMDB;
})();
