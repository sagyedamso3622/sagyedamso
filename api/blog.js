// 네이버 블로그 RSS에서 최근 글 3개를 골라 돌려준다. 키·로그인 없이 공개 RSS만 읽는다.
const RSS_URL = 'https://rss.blog.naver.com/mou2774.xml';

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
    const items = xml.split('<item>').slice(1, 4).map((chunk) => {
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
