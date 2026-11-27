(function () {
  var form = document.getElementById('quote-form');
  if (!form || !window.fetch) return;
  var status = document.getElementById('quote-status');
  var btn = form.querySelector('button[type="submit"]');
  var email = form.elements['email'];
  var phone = form.elements['phone'];
  var src = form.elements['source'];
  if (src) src.value = location.hostname;

  function contactCheck() {
    var ok = (email.value.trim() !== '' || phone.value.trim() !== '');
    email.setCustomValidity(ok ? '' : 'Add an email or a phone number so we can reach you.');
    return ok;
  }
  email.addEventListener('input', contactCheck);
  phone.addEventListener('input', contactCheck);

  function show(kind, msg) {
    status.className = 'quote-status ' + kind;
    status.textContent = msg;
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    contactCheck();
    if (!form.reportValidity()) return;
    if (form.elements['_honey'].value) { show('ok', 'Thanks! Your quote request is in.'); form.reset(); return; }
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.type !== 'submit') data[el.name] = el.value;
    });
    if (data.email) data._replyto = data.email;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.hidden = true;
    fetch(form.getAttribute('data-endpoint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
    }).then(function (res) {
      if (res.ok && (res.j.success === true || res.j.success === 'true')) {
        form.reset();
        if (src) src.value = location.hostname;
        show('ok', 'Thanks! Your quote request is in. We will reply soon. Need it faster? Call (424) 424-2034.');
      } else {
        throw new Error('send failed');
      }
    }).catch(function () {
      show('err', 'Sorry, that did not send. Please call (424) 424-2034 or email sales@neonshellagency.com.');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Get my quote';
    });
  });
})();
