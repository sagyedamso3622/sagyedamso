// 블로그 전체 글 목록 만들기: 네이버 블로그 RSS에는 최근 50개만 있어서, 그보다 오래된 먹거리·볼거리·제주살이 글은
// 이 파일이 data/blog-archive.json 에 모아 둔다(제목·날짜·종류·대표 사진). /api/blog 가 RSS와 합쳐 보여 준다.
// 사장님의 다른 블로그 khj2774(알맹이)는 여러 지역 글이 섞여 있어서, 제목에 제주 지명이 들어간 글만 골라 더한다.
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
  19: 'life',                                   // 제주살아보기
};
// khj2774 는 카테고리로 나눌 수 없어 제목으로 고른다(제주 글이 아니면 넣지 않음)
const OTHER_BLOG = 'khj2774';
const JEJU = /제주|서귀포|애월|성산|우도|한림|협재|금능|함덕|중문|사계해|산방|모슬포|한라봉/;
const SKIP = /제습기|청소/;
function typeByTitle(title) {
  if (!JEJU.test(title) || SKIP.test(title)) return '';
  if (/살아보기|제주살이/.test(title)) return 'life';
  if (/맛집|식당|횟집|고깃집|해물탕|칼국수|정식|카페|까페/.test(title)) return 'food';
  return 'sights';
}
const UA = { 'User-Agent': 'Mozilla/5.0 (sagyedamso site)' };

// 목록은 JSON인데 가끔 JSON으로 읽히지 않는 글자가 섞여 있어, 그때는 필요한 칸만 골라 읽는다
async function listPage(blog, page) {
  const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${blog}&currentPage=${page}&categoryNo=0&countPerPage=30`;
  const text = (await (await fetch(url, { headers: UA })).text()).split("\'").join("'");
  try { return JSON.parse(text); } catch {}
  const postList = [...text.matchAll(/"logNo":"(\d+)","title":"([^"]*)","categoryNo":"(\d+)"[\s\S]*?"addDate":"([^"]*)"/g)]
    .map((m) => ({ logNo: m[1], title: m[2], categoryNo: m[3], addDate: m[4] }));
  return { postList, totalCount: (text.match(/"totalCount":"(\d+)"/) || [])[1] || '0' };
}

async function listAll(blog) {
  const first = await listPage(blog, 1);
  const pages = Math.ceil(+first.totalCount / 30);
  let all = first.postList;
  for (let p = 2; p <= pages; p++) all = all.concat((await listPage(blog, p)).postList);
  return all;
}

async function coverImage(blog, logNo) {
  const html = await (await fetch(`https://m.blog.naver.com/PostView.naver?blogId=${blog}&logNo=${logNo}`, { headers: UA })).text();
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  return m ? m[1].replace(/^http:/, 'https:') : '';
}

// "2026. 10. 4." → "2026.10.4", "7분 전"·"3시간 전" 같은 오늘 글은 오늘 날짜로
function toDate(addDate) {
  const d = addDate.replace(/\s/g, '').replace(/\.$/, '');
  if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(d)) return d;
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}.${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`;
}
const title = (x) => decodeURIComponent(x.title.replace(/\+/g, ' '));

const all = await listAll(BLOG);
const other = await listAll(OTHER_BLOG);
const posts = all
  .filter((x) => TYPE_BY_CATEGORY[x.categoryNo])
  .map((x) => ({ logNo: x.logNo, title: title(x), date: toDate(x.addDate), type: TYPE_BY_CATEGORY[x.categoryNo] }))
  .concat(other
    .map((x) => ({ logNo: x.logNo, blog: OTHER_BLOG, title: title(x), date: toDate(x.addDate), type: typeByTitle(title(x)) }))
    .filter((p) => p.type));

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
    p.image = await coverImage(p.blog || BLOG, p.logNo).catch(() => '');
  }
  await wait(250);
}

// 목록을 하나도 못 받았으면 기존 파일을 지우지 않는다
if (!posts.length) throw new Error('블로그 글 목록을 받지 못했어요.');
writeFileSync(OUT, JSON.stringify(posts, null, 1) + '\n');
console.log(`전체 ${all.length + other.length}개 중 먹거리 ${posts.filter((p) => p.type === 'food').length}개, 볼거리 ${posts.filter((p) => p.type === 'sights').length}개, 제주살이 ${posts.filter((p) => p.type === 'life').length}개`);
