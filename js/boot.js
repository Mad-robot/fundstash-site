// Runs before first paint (an external file, so the strict CSP needs no inline script): page capability flags.
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('reduce');
  try {
    var c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) d.classList.add('no-webgl');
  } catch (e) {
    d.classList.add('no-webgl');
  }
})();
