// Renders an IOU reminder shared from the app: https://fundstash.app/iou#d=<encodeURIComponent(JSON)>.
(function () {
  'use strict';

  function decodeDebt(param) {
    if (typeof param !== 'string' || !param) return null;
    try {
      var raw;
      try {
        raw = JSON.parse(param);
      } catch (e) {
        raw = JSON.parse(decodeURIComponent(param));
      }
      if (!raw || raw.v !== 1 || typeof raw.senderName !== 'string' || typeof raw.amount !== 'number' || raw.amount <= 0) return null;
      return {
        id: String(raw.id || '').slice(0, 40),
        senderName: String(raw.senderName).slice(0, 40),
        recipientName: String(raw.recipientName || 'You').slice(0, 40),
        amount: Number(raw.amount),
        currency: typeof raw.currency === 'string' && /^[A-Z]{3}$/.test(raw.currency) ? raw.currency : 'INR',
        description: typeof raw.description === 'string' ? String(raw.description).slice(0, 100) : '',
        type: raw.type === 'borrowed' ? 'borrowed' : 'lent',
        dueDate: typeof raw.dueDate === 'string' ? String(raw.dueDate).slice(0, 40) : undefined,
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
    var root = document.getElementById('iou');
    var title = document.getElementById('title');
    var openBtn = document.getElementById('open-app-btn');
    var param = new URLSearchParams(location.hash.replace(/^#/, '')).get('d');
    var d = decodeDebt(param);
    root.textContent = '';

    if (!d) {
      root.appendChild(el('p', null, 'This link does not contain a valid IOU. Ask your friend to share it again from Fundstash.'));
      if (openBtn) openBtn.style.display = 'none';
      return;
    }

    var isLent = d.type === 'lent'; // Sender lent -> Recipient owes Sender
    var descText = d.description ? ' for "' + d.description + '"' : '';

    if (title) {
      title.textContent = isLent ? 'IOU: You owe ' + d.senderName : 'IOU: ' + d.senderName + ' owes you';
    }

    var card = el('div', 'split-card');
    card.appendChild(el('div', 'eyebrow', isLent ? 'Amount you owe ' + d.senderName : 'Amount ' + d.senderName + ' owes you'));
    card.appendChild(el('div', 'split-total', money(d.amount, d.currency)));
    card.appendChild(el('p', 'note', isLent
      ? d.senderName + ' recorded that you owe them ' + money(d.amount, d.currency) + descText
      : d.senderName + ' noted they owe you ' + money(d.amount, d.currency) + descText));

    if (d.dueDate) {
      card.appendChild(el('p', 'note', 'Due date: ' + new Date(d.dueDate).toLocaleDateString()));
    }
    root.appendChild(card);

    if (openBtn) {
      var appPayload = encodeURIComponent(JSON.stringify({
        v: 1,
        id: d.id,
        senderName: d.senderName,
        recipientName: d.recipientName,
        amount: d.amount,
        currency: d.currency,
        description: d.description,
        type: d.type,
        dueDate: d.dueDate,
      }));
      openBtn.href = 'fundstash://debts?import=' + appPayload;
      openBtn.style.display = 'inline-block';
    }
  }

  window.addEventListener('hashchange', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
