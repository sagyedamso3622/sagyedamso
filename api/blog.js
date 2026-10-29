// 네이버 블로그 RSS에서 최근 글을 골라 돌려준다. 키·로그인 없이 공개 RSS만 읽는다.
// ?type=food 또는 ?type=sights 를 붙이면 아래 블로그 카테고리 글만 최대 12개 돌려준다.
const RSS_URL = 'https://rss.blog.naver.com/mou2774.xml';
const TYPES = {
  food: ['제주의맛집', '제주의 멋진까페'],
  sights: ['제주의명소', '제주의 오름', '제주의 녹차밭', '억새명소', '제주의바다,해수욕장',
    '제주의 올레길', '제주의 숲, 힐링', '비올때찾는 실내갈만한곳'],
};

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
    const cats = TYPES[req.query && req.query.type];
    let chunks = xml.split('<item>').slice(1);
    chunks = cats ? chunks.filter((c) => cats.includes(pick(c, 'category'))).slice(0, 12) : chunks.slice(0, 3);
    const items = chunks.map((chunk) => {
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
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ posts: items });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(502).json({ error: '블로그 글을 불러오지 못했어요.' });
  }
};
