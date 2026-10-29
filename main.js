// 유입 경로: 처음 들어온 경로(UTM 또는 검색·SNS 주소)를 30일 동안 기억한다
var visitSource = (function () {
  var KEY = 'sgd_source', DAYS = 30;
  var q = new URLSearchParams(location.search);
  var clean = function (v) { return String(v || '').replace(/[^\w가-힣.\-]/g, '').slice(0, 40); };
  var now = {
    source: clean(q.get('utm_source')),
    medium: clean(q.get('utm_medium')),
    campaign: clean(q.get('utm_campaign'))
  };
  if (!now.source && document.referrer) {
    var host = '';
    try { host = new URL(document.referrer).hostname; } catch (e) {}
    if (host && host !== location.hostname) {
      var known = [['naver', 'naver'], ['google', 'google'], ['daum', 'daum'], ['kakao', 'kakao'], ['instagram', 'instagram'], ['facebook', 'facebook'], ['youtube', 'youtube']];
      now.source = host;
      for (var i = 0; i < known.length; i++) if (host.indexOf(known[i][0]) > -1) { now.source = known[i][1]; break; }
      now.medium = 'referral';
    }
  }
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (saved && Date.now() - saved.at > DAYS * 864e5) saved = null;
  if (!saved && now.source) {
    saved = { source: now.source, medium: now.medium, campaign: now.campaign, at: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
  }
  return saved;
})();

// 문자 버튼: 날짜·기간·인원을 미리 적어 둔 문자 창을 연다. 유입 경로가 있으면 끝에 붙인다
(function () {
  var body = '사계담소 문의: 원하는 날짜 ○월 ○일부터 ○박, 인원 ○명';
  if (visitSource) {
    body += '\n(경로: ' + [visitSource.source, visitSource.medium, visitSource.campaign].filter(Boolean).join('/') + ')';
  }
  var href = 'sms:010-4416-3622' + (/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?') + 'body=' + encodeURIComponent(body);
  document.querySelectorAll('.js-sms').forEach(function (a) { a.href = href; });
})();

// 휴대폰에서 옆으로 넘기는 메뉴: 지금 보고 있는 페이지 항목이 보이게 맞춘다
(function () {
  var menu = document.querySelector('.menu');
  var cur = menu && menu.querySelector('[aria-current="page"]');
  if (cur && cur.parentNode.classList.contains('menu-group')) cur = cur.parentNode;
  if (cur && menu.scrollWidth > menu.clientWidth) {
    menu.scrollLeft = cur.offsetLeft - (menu.clientWidth - cur.offsetWidth) / 2;
  }
})();

// 첫 화면(하위 페이지는 상단 메뉴)을 지나면 휴대폰 아래에 문의 버튼을 띄운다
(function () {
  var bar = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero') || document.querySelector('.site-header');
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

// 블로그 글: /api/blog 가 네이버 블로그 RSS를 읽어 준다(새 글 3개, 제주여행팁은 data-type 카테고리 글).
// 실패하면 칸을 숨긴 채 링크만 남긴다
(function () {
  var list = document.getElementById('blog-list');
  if (!list || !window.fetch) return;
  var type = list.getAttribute('data-type');
  fetch('/api/blog' + (type ? '?type=' + type : ''))
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var posts = (data && data.posts) || [];
      if (!posts.length) return;
      posts.slice(0, type ? 12 : 3).forEach(function (p) {
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
