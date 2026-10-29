// 네이버 블로그 RSS에서 최근 글을 골라 돌려준다. 키·로그인 없이 공개 RSS만 읽는다.
// ?type=food 또는 ?type=sights 를 붙이면 아래 블로그 카테고리 글을 모두 돌려준다.
// RSS에는 최근 50개만 있어서 그보다 오래된 글은 data/blog-archive.json(scripts/blog-archive.mjs 가 만듦)에서 더한다.
// near-food, near-sights 는 그중 제목·태그에 사계담소 근처 지명이 들어간 글만 고른다.
const ARCHIVE = require('../data/blog-archive.json');
const RSS_URL = 'https://rss.blog.naver.com/mou2774.xml';
const TYPES = {
  food: ['제주의맛집', '제주의 멋진까페'],
  sights: ['제주의명소', '제주의 오름', '제주의 녹차밭', '억새명소', '제주의바다,해수욕장',
    '제주의 올레길', '제주의 숲, 힐링', '비올때찾는 실내갈만한곳'],
};
const NEAR = ['사계', '산방', '송악', '용머리', '형제', '안덕', '대정', '모슬포', '화순', '대평',
  '운진', '가파도', '마라도', '신화월드', '포도뮤지엄', '방주교회', '서광', '덕수', '창천', '감산', '번내'];

const cdata = (s) => String(s || '').replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? cdata(m[1]) : '';
};
const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function toDate(pub) {
  const d = new Date(pub);
  if (isNaN(d)) return '';
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}.${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`;
}

module.exports = async (req, res) => {
  try {
    const r = await fetch(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (sagyedamso site)' } });
    if (!r.ok) throw new Error(`RSS ${r.status}`);
    const xml = await r.text();
    const type = String((req.query && req.query.type) || '');
    const near = type.startsWith('near-');
    const cats = TYPES[near ? type.slice(5) : type];
    const isNear = (c) => NEAR.some((w) => (pick(c, 'title') + pick(c, 'tag')).includes(w));
    let chunks = xml.split('<item>').slice(1);
    chunks = cats
      ? chunks.filter((c) => cats.includes(pick(c, 'category')) && (!near || isNear(c)))
      : chunks.slice(0, 3);
    let items = chunks.map((chunk) => {
      const desc = decode(pick(chunk, 'description'));
      const img = desc.match(/<img[^>]+src="([^"]+)"/);
      const guid = pick(chunk, 'guid');
      return {
        title: decode(pick(chunk, 'title')),
        link: guid.startsWith('https://blog.naver.com/') ? guid : 'https://blog.naver.com/mou2774',
        date: toDate(pick(chunk, 'pubDate')),
        image: img ? img[1].replace(/^http:/, 'https:') : '',
      };
    });
    // RSS에 없는 오래된 글은 미리 모아 둔 목록에서 더한다(근처 글은 제목으로만 고른다)
    if (cats) {
      const seen = new Set(items.map((p) => p.link.split('/').pop()));
      const older = ARCHIVE
        .filter((p) => p.type === (near ? type.slice(5) : type) && !seen.has(p.logNo))
        .filter((p) => !near || NEAR.some((w) => p.title.includes(w)))
        .map((p) => ({ title: p.title, link: `https://blog.naver.com/mou2774/${p.logNo}`, date: p.date, image: p.image }));
      items = items.concat(older).slice(0, 60);
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ posts: items });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(502).json({ error: '블로그 글을 불러오지 못했어요.' });
  }
};
