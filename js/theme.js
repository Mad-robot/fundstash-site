// Theme choice: System (default), Light or Dark. Loaded in <head> without defer so the saved
// choice is applied before first paint; the button is wired once the page has parsed.
(function () {
  var d = document.documentElement;
  var KEY = 'fs-theme';
  var ORDER = ['system', 'light', 'dark'];
  var LABEL = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };
  var media = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;

  function saved() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) >= 0 ? v : 'system';
    } catch (e) {
      return 'system';
    }
  }

  function apply(choice) {
    d.setAttribute('data-theme-choice', choice);
    if (choice === 'system') d.removeAttribute('data-theme');
    else d.setAttribute('data-theme', choice);
    var light = choice === 'light' || (choice === 'system' && !!media && media.matches);
    // app screenshots: <source media> follows the system; a picked theme forces it on or off
    var sources = document.querySelectorAll('source[data-theme-src]');
    for (var j = 0; j < sources.length; j++) sources[j].media = choice === 'system' ? '(prefers-color-scheme: light)' : choice === 'light' ? 'all' : 'not all';
    // browser chrome colour follows the effective theme
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', light ? '#F8FAFC' : '#05080F');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-label', LABEL[choice] + ' (click to change)');
    document.dispatchEvent(new CustomEvent('fs-theme', { detail: { light: light } }));
  }

  var current = saved();
  apply(current);
  if (media && media.addEventListener) media.addEventListener('change', function () { apply(current); });

  document.addEventListener('DOMContentLoaded', function () {
    apply(current); // metas and the button exist now
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
      try { localStorage.setItem(KEY, current); } catch (e) { /* storage blocked: applies until the page closes */ }
      apply(current);
    });
  });
})();
