// 문자 버튼: 날짜·기간·인원을 미리 적어 둔 문자 창을 연다
(function () {
  var body = '사계담소 문의: 원하는 날짜 ○월 ○일부터 ○박, 인원 ○명';
  var href = 'sms:010-4416-3622' + (/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?') + 'body=' + encodeURIComponent(body);
  document.querySelectorAll('.js-sms').forEach(function (a) { a.href = href; });
})();

// 첫 화면을 지나면 휴대폰 아래에 문의 버튼을 띄운다
(function () {
  var bar = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero');
  var contact = document.querySelector('.contact');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  var heroVisible = true, contactVisible = false;
  function update() {
    var on = !heroVisible && !contactVisible;
    bar.classList.toggle('on', on);
    bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    bar.querySelector('a').tabIndex = on ? 0 : -1;
  }
  new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(hero);
  if (contact) new IntersectionObserver(function (e) { contactVisible = e[0].isIntersecting; update(); }).observe(contact);
})();

// 블로그 새 글 3개: /api/blog 가 네이버 블로그 RSS를 읽어 준다. 실패하면 칸을 숨긴 채 링크만 남긴다
(function () {
  var list = document.getElementById('blog-list');
  if (!list || !window.fetch) return;
  fetch('/api/blog')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var posts = (data && data.posts) || [];
      if (!posts.length) return;
      posts.slice(0, 3).forEach(function (p) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
        if (p.image) {
          var img = document.createElement('img');
          img.src = p.image; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
          img.onerror = function () { img.remove(); };
          a.appendChild(img);
        }
        var t = document.createElement('span'); t.className = 't'; t.textContent = p.title;
        var d = document.createElement('span'); d.className = 'd'; d.textContent = p.date || '';
        a.appendChild(t); a.appendChild(d);
        li.appendChild(a); list.appendChild(li);
      });
      list.hidden = false;
    })
    .catch(function () {});
})();
