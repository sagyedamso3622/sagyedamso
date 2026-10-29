// 페이지 만들기: src/pages/*.html 본문에 공통 머리말·메뉴·문의·바닥글을 씌워 루트에 .html 파일로 쓴다.
// 고친 뒤에는 `node build.mjs`를 한 번 실행하고, 만들어진 .html 파일까지 함께 커밋한다.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://sagyedamso.com';
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

const pages = [
  { slug: 'index', path: '/', title: '사계담소 | 제주 서귀포 안덕면 일주일 살기 돌담집 독채',
    description: '산방산 아래 제주 돌담집 독채 단기임대. 최소 6박, 최대 4인, 6박 7일 80만 원(2인 기준). 사계바다까지 걸어서 15분. 문자 010-4416-3622.' },
  { slug: 'price', path: '/price', label: '요금', heading: '요금과 이용 안내',
    lede: '일주일살이부터 한달살이까지, 머무는 기간에 따라 요금이 다릅니다.',
    description: '사계담소 요금(2인 기준, 공과금 별도): 일주일살이 80만 원, 이주일살이 140만 원, 삼주일살이 170만 원, 한달살이 200만 원. 보증금, 추가 인원, 불멍 화로·바비큐 그릴, 환불 규정.' },
  { slug: 'near', path: '/near', label: '가까운 곳', heading: '가까운 곳',
    lede: '산방산 자락의 돌담집에서 사계바다까지 걸어서 15분입니다.',
    description: '사계담소 위치와 주변: 사계바닷가 걸어서 15분, 용머리해안 차로 3분, 송악산 5분, 운진항 10분.' },
  { slug: 'inside', path: '/inside', label: '집 안', heading: '집 안',
    lede: '오래된 돌담집을 새로 고쳤습니다. 천장 서까래는 그대로 살렸습니다.',
    description: '사계담소 집 안 사진: 서까래가 남은 거실, 침실 두 개, 욕실.' },
  { slug: 'amenities', path: '/amenities', label: '갖춰진 것', heading: '갖춰진 것',
    lede: '살림에 필요한 것은 다 갖춰 두었습니다.',
    description: '사계담소에 갖춰진 것: 빌트인 세탁기, 냉장고, 기본 식기와 냄비, 전자레인지, 전기밥솥, 실내 자쿠지, 욕실 밖 세면대, 공기순환기.' },
  { slug: 'yard', path: '/yard', label: '마당과 주차', heading: '마당과 주차',
    lede: '넓은 자갈 마당과 텃밭, 주차 자리와 전기차 충전기가 있습니다.',
    description: '사계담소 마당과 주차: 야외 테이블, 바비큐 그릴, 불멍 화로, 영업용 싱크대, 텃밭, 주차, 전기차 충전기.' },
  { slug: 'stories', path: '/stories', label: '손님 이야기', heading: '머물다 간 손님 이야기',
    lede: '주인이 블로그에 남긴 손님들의 이야기입니다.',
    description: '사계담소에 머물다 간 손님들의 이야기.' },
  { slug: 'jeju-food', path: '/jeju-food', label: '제주먹거리', group: '제주여행팁', heading: '제주먹거리',
    lede: '주인이 직접 다녀온 제주 맛집과 카페입니다.',
    description: '사계담소 주인이 직접 다녀온 제주 맛집과 카페 이야기. 제주여행팁.' },
  { slug: 'jeju-sights', path: '/jeju-sights', label: '제주볼거리', group: '제주여행팁', heading: '제주볼거리',
    lede: '주인이 직접 걸어 본 제주의 바다, 오름, 숲, 명소입니다.',
    description: '사계담소 주인이 직접 다녀온 제주의 명소, 오름, 숲, 올레길, 비 오는 날 갈 만한 곳. 제주여행팁.' },
  { slug: 'blog', path: '/blog', label: '블로그', heading: '블로그 새 글',
    lede: '사계담소 주변의 바다, 오름, 맛집 이야기를 블로그에 씁니다.',
    description: '사계담소 네이버 블로그 새 글: 제주 서쪽의 바다, 오름, 맛집 이야기.' },
];

const dolldam = read('./src/dolldam.svg').trim();
const mapUrl = 'https://map.naver.com/p/search/%EC%84%9C%EA%B7%80%ED%8F%AC%EC%8B%9C%20%EC%95%88%EB%8D%95%EB%A9%B4%20%EC%82%AC%EA%B3%84%EB%82%A8%EB%A1%9C21%EB%B2%88%EA%B8%B8%2025';

const jsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "사계담소",
  "description": "제주 서귀포시 안덕면 산방산 아래 돌담집 독채 단기임대. 최소 6박, 최대 4인.",
  "telephone": "+82-10-4416-3622",
  "url": "${SITE}/",
  "image": "${SITE}/images/og.jpg",
  "checkinTime": "11:00",
  "checkoutTime": "15:00",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "안덕면 사계남로21번길 25",
    "addressLocality": "서귀포시",
    "addressRegion": "제주특별자치도",
    "addressCountry": "KR"
  },
  "sameAs": ["https://blog.naver.com/mou2774"]
}
</script>`;

// group이 같은 페이지는 메뉴에 묶음 이름 하나로 나오고(첫 페이지로 연결), 컴퓨터 화면에서는 아래로 하위 메뉴가 펼쳐진다
const link = (p, current) => `<a href="${p.path}"${p.slug === current ? ' aria-current="page"' : ''}>${p.label}</a>`;

function nav(current) {
  const links = [];
  for (const p of pages.filter((p) => p.label)) {
    if (!p.group) { links.push(link(p, current)); continue; }
    if (links.some((l) => l.includes(`data-group="${p.group}"`))) continue;
    const members = pages.filter((m) => m.group === p.group);
    const on = members.some((m) => m.slug === current);
    links.push(`<div class="menu-group" data-group="${p.group}">
        <a href="${p.path}"${on ? ' aria-current="page"' : ''}>${p.group}</a>
        <div class="submenu">${members.map((m) => link(m, current)).join('')}</div>
      </div>`);
  }
  return `<header class="site-header">
  <div class="topbar">
    <a class="brand" href="/">사계담소 <span class="brand-en" lang="en">Sagyedamso</span></a>
    <nav class="menu" aria-label="사계담소 둘러보기">
      ${links.join('\n      ')}
    </nav>
  </div>
</header>`;
}

function render(page) {
  const url = SITE + (page.path === '/' ? '/' : page.path);
  const body = read(`./src/pages/${page.slug}.html`).trim().replace('{{dolldam}}', dolldam);
  const isHome = page.slug === 'index';
  const head = isHome ? '' : `<div class="page-head">
    <div class="prose">
      <h1>${page.heading}</h1>
      <p class="lede">${page.lede}</p>
    </div>
  </div>
  ${page.group ? `<nav class="subtabs prose" aria-label="${page.group}">
    ${pages.filter((m) => m.group === page.group).map((m) => link(m, page.slug)).join('\n    ')}
  </nav>
  ` : ''}`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${isHome ? page.title : `${page.heading} | 사계담소`}</title>
<meta name="description" content="${page.description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${isHome ? '사계담소 — 산방산 아래 돌담집 독채' : `${page.heading} — 사계담소`}">
<meta property="og:description" content="${page.description}">
<meta property="og:image" content="${SITE}/images/og.jpg">
<meta property="og:url" content="${url}">
<link rel="canonical" href="${url}">
<meta name="naver-site-verification" content="74a3c3c5181327aea21c7b5313f49a7b306d0e83">
<meta name="google-site-verification" content="6STElPcksTTRS4usHl3cUyyzUYQ0WF5FeCw1yXbTM0w">
<meta name="theme-color" content="#2f302d">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%232f302d'/%3E%3Cpath d='M6 22c2-3 4-4 6-3s3-3 6-3 4 2 8 1v7H6z' fill='%23efefea'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap" rel="stylesheet">
${isHome ? '<link rel="preload" as="image" href="/images/house-evening.webp">\n' : ''}<link rel="stylesheet" href="/style.css">
${isHome ? jsonLd + '\n' : ''}</head>
<body${isHome ? ' class="home"' : ''}>

<!-- 이 파일은 build.mjs가 만든다. 내용은 src/pages/${page.slug}.html 에서 고친다. -->
<a class="skip" href="#main">본문으로 건너뛰기</a>

${nav(page.slug)}

<main id="main">
  ${head}${body}

  <section class="block contact" aria-labelledby="contact-h">
    <div class="prose">
      <h2 id="contact-h">문의는 문자로 받습니다</h2>
      <p>원하시는 날짜와 머무는 기간, 인원을 문자로 보내 주시면 확인 후 답장 드립니다.</p>
      <div class="cta-row">
        <a class="btn btn-dark js-sms" href="sms:010-4416-3622">문자로 문의하기</a>
        <span class="cta-number">010-4416-3622</span>
      </div>
      <dl class="facts address">
        <div><dt>주소</dt><dd>제주특별자치도 서귀포시 안덕면 사계남로21번길 25 <a class="text-link" href="${mapUrl}" target="_blank" rel="noopener">네이버 지도에서 보기</a></dd></div>
      </dl>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="prose">
    <p class="brand">사계담소</p>
    <p>제주특별자치도 서귀포시 안덕면 사계남로21번길 25<br>문자 010-4416-3622<br>사업자등록번호 625-21-02457 (임대업)</p>
    <p><a href="https://blog.naver.com/mou2774" target="_blank" rel="noopener">네이버 블로그</a></p>
  </div>
</footer>

<div class="sticky-cta" id="sticky-cta" aria-hidden="true">
  <a class="btn btn-lamp js-sms" href="sms:010-4416-3622" tabindex="-1">문자로 문의하기</a>
</div>

<script src="/main.js" defer></script>
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

for (const page of pages) {
  writeFileSync(new URL(`./${page.slug}.html`, import.meta.url), render(page));
  console.log(`${page.slug}.html`);
}

// 검색엔진(네이버 서치어드바이저 등)에 알려 줄 사이트맵과 robots.txt
const today = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('./sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(new URL('./robots.txt', import.meta.url), `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml

#DaumWebMasterTool:9e48ff763ab7be8b3ddac2ce136e310fcdb706c5950a0a59c76544b06d641472:/muGpe/rLcLTp+f7AlrcFg==
`);
console.log('sitemap.xml, robots.txt');
