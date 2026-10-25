# 유입 경로(UTM) 링크 모음

사이트 주소를 어디에 올리든 아래처럼 꼬리표(UTM)를 붙인 링크를 쓴다.
손님이 이 링크로 들어와 "문자로 문의하기"를 누르면 문자 끝에 `(경로: naver_blog/blog)`처럼 들어온 경로가 붙는다.
처음 들어온 경로를 30일 동안 기억한다. 꼬리표 없이 검색·SNS에서 들어오면 `naver`, `google`, `instagram` 같은 이름이 대신 붙는다.

| 올리는 곳 | 붙여 넣을 링크 |
|---|---|
| 네이버 블로그 글·프로필 | https://sagyedamso.vercel.app/?utm_source=naver_blog&utm_medium=blog |
| 인스타그램 프로필 | https://sagyedamso.vercel.app/?utm_source=instagram&utm_medium=profile |
| 카카오톡으로 직접 보내기 | https://sagyedamso.vercel.app/?utm_source=kakao&utm_medium=message |
| 명함·안내문 QR코드 | https://sagyedamso.vercel.app/?utm_source=qr&utm_medium=print |

새 경로를 만들 때는 `utm_source`(어디서)와 `utm_medium`(어떤 방식)만 바꾸면 된다. 행사·이벤트별로 나누고 싶으면 `&utm_campaign=2026winter`처럼 하나 더 붙인다. 영어·숫자·밑줄만 쓴다.

## 방문 수 보기

Vercel 대시보드 → sagyedamso 프로젝트 → **Analytics**에서 방문 수, 들어온 사이트(Referrers), UTM별 방문을 본다.
처음 한 번 Analytics의 **Enable**을 눌러야 집계가 시작된다.
