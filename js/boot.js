// Runs before first paint (an external file, so the strict CSP needs no inline script): page capability flags.
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('reduce');
  try {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) d.classList.add('no-webgl');
    // release the test context so it does not count against the browser's live-context limit
    var ext = gl && gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  } catch (e) {
    d.classList.add('no-webgl');
  }
})();
