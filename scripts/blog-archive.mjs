// 블로그 전체 글 목록 만들기: 네이버 블로그 RSS에는 최근 50개만 있어서, 그보다 오래된 먹거리·볼거리 글은
// 이 파일이 data/blog-archive.json 에 모아 둔다(제목·날짜·종류·대표 사진). /api/blog 가 RSS와 합쳐 보여 준다.
// GitHub Actions(.github/workflows/blog-archive.yml)가 매일 새벽 실행하고, 바뀐 게 있으면 커밋한다.
// 손으로 돌릴 때는 `node scripts/blog-archive.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';

const BLOG = 'mou2774';
// 블로그 카테고리 번호 → 사이트 종류. 번호는 블로그 관리 화면의 카테고리 순서와 무관하게 고정된 값이다.
const TYPE_BY_CATEGORY = {
  17: 'food', 32: 'food',                       // 제주의 멋진까페, 제주의맛집
  30: 'sights', 33: 'sights', 23: 'sights',     // 제주의명소, 제주의 오름, 제주의 녹차밭
  14: 'sights', 16: 'sights', 18: 'sights',     // 억새명소, 제주의바다·해수욕장, 제주의 올레길
  11: 'sights', 26: 'sights',                   // 제주의 숲·힐링, 비올때찾는 실내갈만한곳
  13: 'sights', 24: 'sights', 25: 'sights',     // 유채꽃·메밀꽃·갯무꽃 같은 꽃 명소
};
const UA = { 'User-Agent': 'Mozilla/5.0 (sagyedamso site)' };

async function listPage(page) {
  const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${BLOG}&currentPage=${page}&categoryNo=0&countPerPage=30`;
  const text = (await (await fetch(url, { headers: UA })).text()).split("\\'").join("'");
  return JSON.parse(text);
}

async function coverImage(logNo) {
  const html = await (await fetch(`https://m.blog.naver.com/PostView.naver?blogId=${BLOG}&logNo=${logNo}`, { headers: UA })).text();
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  return m ? m[1].replace(/^http:/, 'https:') : '';
}

const first = await listPage(1);
const pages = Math.ceil(+first.totalCount / 30);
let all = first.postList;
for (let p = 2; p <= pages; p++) all = all.concat((await listPage(p)).postList);

const posts = all
  .filter((x) => TYPE_BY_CATEGORY[x.categoryNo])
  .map((x) => ({
    logNo: x.logNo,
    title: decodeURIComponent(x.title.replace(/\+/g, ' ')),
    date: x.addDate.replace(/\s/g, '').replace(/\.$/, ''),
    type: TYPE_BY_CATEGORY[x.categoryNo],
  }));

// 이미 모아 둔 사진은 다시 받지 않는다
const OUT = new URL('../data/blog-archive.json', import.meta.url);
let saved = [];
try { saved = JSON.parse(readFileSync(OUT, 'utf8')); } catch {}
for (const p of posts) p.image = saved.find((s) => s.logNo === p.logNo)?.image || '';

// 한꺼번에 많이 부르면 네이버가 빈 화면을 주므로 하나씩, 실패한 글은 쉬었다가 다시 부른다
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (const p of posts.filter((p) => !p.image)) {
  for (let tryNo = 0; tryNo < 4 && !p.image; tryNo++) {
    if (tryNo) await wait(1500 * tryNo);
    p.image = await coverImage(p.logNo).catch(() => '');
  }
  await wait(250);
}

// 목록을 하나도 못 받았으면 기존 파일을 지우지 않는다
if (!posts.length) throw new Error('블로그 글 목록을 받지 못했어요.');
writeFileSync(OUT, JSON.stringify(posts, null, 1) + '\n');
console.log(`전체 ${all.length}개 중 먹거리 ${posts.filter((p) => p.type === 'food').length}개, 볼거리 ${posts.filter((p) => p.type === 'sights').length}개`);
