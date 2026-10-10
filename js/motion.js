/* Scroll choreography: native scrolling + GSAP ScrollTrigger. Degrades to a static, fully readable page. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce');
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // ---- nav background once the page moves
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // ---- story: which step is on screen (works with or without animation)
  var story = document.getElementById('story');
  var steps = story ? Array.prototype.slice.call(story.querySelectorAll('.step')) : [];
  var shots = story ? Array.prototype.slice.call(story.querySelectorAll('.screen img')) : [];
  var dots = story ? Array.prototype.slice.call(story.querySelectorAll('.progress i')) : [];
  var chips = story ? Array.prototype.slice.call(story.querySelectorAll('.chip')) : [];
  var current = -1;
  function setStep(i) {
    if (i === current || !steps[i]) return;
    current = i;
    var id = steps[i].getAttribute('data-screen');
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k <= i); });
    shots.forEach(function (img) { img.classList.toggle('on', img.getAttribute('data-id') === id); });
    var data = [];
    try { data = JSON.parse(steps[i].getAttribute('data-chips') || '[]'); } catch (e) { data = []; }
    chips.forEach(function (c, k) {
      c.classList.remove('on');
      var parts = (data[k] || '').split('|');
      c.textContent = parts[0] || '';
      if (parts[1]) {
        var s = document.createElement('small');
        s.textContent = parts[1];
        c.appendChild(s);
      }
      if (data[k]) setTimeout(function () { if (current === i) c.classList.add('on'); }, 180 + k * 140);
    });
  }
  if (steps.length) setStep(0);

  if (!hasGsap) {
    root.classList.add('reduce'); // reveal everything
    return;
  }
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  // ---- story progress drives the step and the phone's 3D sway
  if (story && steps.length) {
    var device = document.getElementById('story-device');
    ST.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        var n = steps.length;
        setStep(Math.min(n - 1, Math.floor(self.progress * n * 0.999)));
        if (!reduce && device) {
          var p = self.progress;
          var ry = Math.sin(p * Math.PI * n) * 14;
          var rx = 6 - p * 8;
          device.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) translateZ(0)';
        }
      },
    });
  }

  if (reduce) return;

  // ---- hero entrance
  gsap.from('.hero h1 .line > span', { yPercent: 110, rotate: 4, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
  gsap.from('[data-hero]', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.35 });
  gsap.to('.hero-copy', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ---- reveals: IntersectionObserver, so they also fire after a hash jump or a restored scroll position
  var queue = [];
  var flushing = false;
  function flush() {
    flushing = false;
    gsap.to(queue.splice(0), { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true, clearProps: 'transform' });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      queue.push(e.target);
    });
    if (queue.length && !flushing) {
      flushing = true;
      requestAnimationFrame(flush);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  // ---- tour video lifts into place
  var frame = document.getElementById('tour-frame');
  if (frame) {
    gsap.fromTo(frame, { rotateX: 26, scale: 0.88, y: 40 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 30%', scrub: 1 } });
  }

  // ---- final phones fan out
  var fan = Array.prototype.slice.call(document.querySelectorAll('#fan .device'));
  if (fan.length) {
    var mid = (fan.length - 1) / 2;
    var fw = fan[0].offsetWidth || 220;
    fan.forEach(function (d, i) {
      var o = i - mid;
      gsap.fromTo(
        d,
        { rotate: 0, x: 0, y: 120, z: -Math.abs(o) * 60 },
        { rotate: o * 11, x: o * Math.min(fw * 0.82, window.innerWidth / 5.4), y: Math.abs(o) * fw * 0.15, z: -Math.abs(o) * 60, ease: 'none', scrollTrigger: { trigger: '#fan', start: 'top 95%', end: 'top 35%', scrub: 1 } }
      );
      d.style.zIndex = String(10 - Math.abs(Math.round(o)));
    });
  }

  // ---- 3D tilt + spotlight on cards, glare on the story phone
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  if (fine) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
        // through GSAP so the tilt never fights the reveal tween over `transform`
        gsap.to(el, { rotateY: (x - 0.5) * 8, rotateX: (0.5 - y) * 8, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }); });
    });
    var glare = document.querySelector('#story-device .glare');
    if (glare) {
      window.addEventListener('pointermove', function (e) {
        glare.style.setProperty('--gx', (e.clientX / window.innerWidth) * 100 + '%');
        glare.style.setProperty('--gy', (e.clientY / window.innerHeight) * 100 + '%');
      }, { passive: true });
    }
  }
})();
