// Renders a split shared from the app: https://fundstash.app/split#d=<encodeURIComponent(JSON)>.
// Same rules as src/services/split-link.ts decodeSplit (the link comes from someone else's phone, so validate it).
// Everything is built with textContent: names in the link are never treated as HTML.
(function () {
  'use strict';
  var MAX_PARAM = 16000;
  var MAX_PEOPLE = 30;
  var TIPS = [0, 5, 10, 15, 18];

  function decodeSplit(param) {
    if (typeof param !== 'string' || !param || param.length > MAX_PARAM) return null;
    try {
      // URLSearchParams already undid the app's encodeURIComponent; older double-encoded links need one more pass
      var raw;
      try {
        raw = JSON.parse(param);
      } catch (e) {
        raw = JSON.parse(decodeURIComponent(param));
      }
      if (!raw || raw.v !== 1 || typeof raw.id !== 'string' || !Array.isArray(raw.people) || raw.people.length < 2) return null;
      var total = Number(raw.total);
      if (!(total >= 0) || total > 1e15) return null;
      var people = raw.people
        .filter(function (p) { return p && typeof p.id === 'string' && typeof p.name === 'string' && p.name.trim(); })
        // the sender's own row is called "You" in the app; for the friend reading this page that is the sender
        // sentName is the name as sent, handed back to the app untouched
        .map(function (p) { var n = String(p.name).slice(0, 60); return { id: p.id, name: p.id === 'p1' && /^you$/i.test(n.trim()) ? 'The sender' : n, sentName: n, isPaid: p.isPaid === true }; });
      if (people.length < 2 || people.length > MAX_PEOPLE || !people.some(function (p) { return p.id === raw.payerId; })) return null;
      return {
        id: raw.id.slice(0, 40),
        categoryId: typeof raw.categoryId === 'string' ? raw.categoryId.slice(0, 40) : undefined,
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : undefined,
        description: typeof raw.description === 'string' ? raw.description.slice(0, 120) : '',
        total: total,
        tipPercent: TIPS.indexOf(raw.tipPercent) >= 0 ? raw.tipPercent : 0,
        payerId: raw.payerId,
        currency: typeof raw.currency === 'string' && /^[A-Z]{3}$/.test(raw.currency) ? raw.currency : 'USD',
        people: people,
      };
    } catch (e) {
      return null;
    }
  }

  function money(n, currency) {
    try {
      return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, { style: 'currency', currency: currency }).format(n);
    } catch (e) {
      return currency + ' ' + n.toFixed(2);
    }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render() {
    var root = document.getElementById('split');
    var title = document.getElementById('title');
    var param = new URLSearchParams(location.hash.replace(/^#/, '')).get('d');
    var s = decodeSplit(param);
    root.textContent = '';
    if (!s) {
      root.appendChild(el('p', null, 'This link does not contain a valid split. Ask your friend to share it again from Fundstash.'));
      return;
    }

    var grand = s.total + (s.total * s.tipPercent) / 100;
    var share = grand / s.people.length;
    var payer = s.people.filter(function (p) { return p.id === s.payerId; })[0];
    if (s.description) {
      title.textContent = s.description;
      document.title = s.description + ' — shared bill · Fundstash';
    }

    var card = el('div', 'split-card');
    card.appendChild(el('div', 'eyebrow', 'Total' + (s.tipPercent ? ' incl. ' + s.tipPercent + '% tip' : '')));
    card.appendChild(el('div', 'split-total', money(grand, s.currency)));
    card.appendChild(el('p', 'note', s.people.length + ' people · ' + money(share, s.currency) + ' each · paid by ' + payer.name));
    root.appendChild(card);

    var list = el('div', 'split-card');
    s.people.forEach(function (p) {
      var row = el('div', 'person');
      row.appendChild(el('strong', null, p.name));
      var tag;
      if (p.id === s.payerId) tag = el('span', 'tag payer', 'Paid ' + money(grand, s.currency));
      else if (p.isPaid) tag = el('span', 'tag paid', 'Settled');
      else tag = el('span', 'tag owes', 'Owes ' + payer.name + ' ' + money(share, s.currency));
      row.appendChild(tag);
      list.appendChild(row);
    });
    root.appendChild(list);

    // The installed app takes the same data through its own scheme (and through this URL once app links are verified).
    // Built from the validated split only (never the raw hash), so a malformed link cannot throw here.
    var app = {
      v: 1, id: s.id, description: s.description, total: s.total, tipPercent: s.tipPercent, payerId: s.payerId,
      categoryId: s.categoryId, currency: s.currency, updatedAt: s.updatedAt,
      people: s.people.map(function (p) { return { id: p.id, name: p.sentName, isPaid: p.isPaid }; }),
    };
    document.getElementById('open-app').href = 'fundstash://split-bill?d=' + encodeURIComponent(JSON.stringify(app));
  }

  window.addEventListener('hashchange', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
