# readin-hwamyeong.kr

부산 북구 화명동 **리드인 화명 용수초점** (독서논술 전문 교실, 원장 이현진) 공식 사이트.

- 도메인: https://readin-hwamyeong.kr/
- 호스팅: GitHub Pages (`reading-level-up/reading-level-up.github.io`)
- CNAME 으로 `readin-hwamyeong.kr` 연결됨

---

## 변경 내역

### 2026-05-02 — 에디토리얼 리뉴얼 (B+ Editorial)
- 기존 광고형 랜딩 ("읽지 못하면, 풀 수도 없습니다") → **에디토리얼 매거진 톤**으로 전면 교체
- 디자인 출처: `design_handoff_readin_hwamyeong/` 폴더 (B+ Editorial 변형)
- 톤: 조용한 권위 + 따뜻한 동네 교실
- 9개 섹션: Nav → Hero → Manifesto → Programs → Director → FAQ → Consult → Location → Footer
- SEO 메타·검증 토큰·JSON-LD 구조 모두 보존, 카피만 새 톤으로 재작성
- 메인 H1 변경: 검색 인덱싱 재조정 1–2주 예상

---

## 기술 스택

- 단일 `index.html` (빌드 시스템 없음)
- React 18.3.1 (production min, unpkg CDN)
- Babel standalone 7.29.0 (런타임 JSX 변환)
- Tailwind CDN (현재 거의 미사용, 향후 하위 페이지 추가 시 활용)
- 폰트: Fraunces · Noto Serif KR · JetBrains Mono (Google Fonts) + Pretendard (jsdelivr)
- 폼 백엔드: Google Apps Script webhook → Google Sheets

## 디자인 토큰

```
--vb-bg:        #F4F1EA  /* 페이지 배경 — 크림 */
--vb-paper:     #EAE3D2  /* 섹션 카드 배경 — 짙은 크림 */
--vb-ink:       #0F1A14  /* 텍스트 메인 */
--vb-accent:    #1D3A2A  /* 메인 그린 */
--vb-accent-2:  #C64A2A  /* 주황 보조 */
--vb-highlight: #E8D56A  /* 노란 highlight */
```

Programs 카드 4단 그라데이션: `#F4D8A8 → #E8A06B → #C66A3D → #7A2F1F`

## 폰트 스택

- display: `'Fraunces', 'Noto Serif KR', serif` (헤드라인·풀쿼트)
- body: `'Pretendard', -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`
- mono: `'JetBrains Mono', monospace` (라벨·메타)

---

## 외부 채널

| 항목 | 현재 값 | 위치 (index.html) |
|---|---|---|
| 네이버 플레이스 | `https://naver.me/GwfEVFn4` | `const NAVER_URL = ...` |
| 카카오톡 채널 | `PENDING` | `const KAKAO_URL = ...` |
| 전화 | `010-2811-4221` | `BIZ.phone` |

### 카카오톡 채널 발급 후 교체 가이드

1. [카카오톡 채널 관리자센터](https://center-pf.kakao.com/) 에서 채널 개설
2. 발급받은 채널 ID (예: `_AbCdEf`) 로 URL 구성: `http://pf.kakao.com/_AbCdEf`
3. `index.html` 상단의 한 줄만 교체:
   ```js
   const KAKAO_URL = "http://pf.kakao.com/_AbCdEf";
   ```
4. 커밋 후 GitHub Pages 자동 배포 (1–2분 소요)

### 네이버 예약 페이지 발급 후 교체 가이드

`NAVER_URL` 한 줄 교체. 동일 방식.

---

## 폼 webhook

Google Apps Script Web App URL:
```
https://script.google.com/macros/s/AKfycbxzTNnRyWYJredeXX7YAYratopWmboyiqNxMt1LXv7PStINtSoD3qBBXoW8DIfCtOAu/exec
```

상담 신청 폼의 카카오/네이버 버튼 클릭 시:
1. 폼 데이터를 webhook 으로 fire-and-forget 전송 (no-cors)
2. 즉시 외부 채널 새 탭으로 이동 (전송 실패해도 이동은 진행)

전송 필드: `name / grade / phone / date(빈값) / time / datetime / message(=concern) / timestamp`

> 시트 컬럼 구조: `Timestamp | Name | Grade | Phone | Preferred Time | Message`
> Apps Script 코드는 `google-apps-script.js` 참고. 컬럼 변경 시 신규 deployment 생성 필요.

---

## SEO 자산 (보존)

- `meta name="google-site-verification"` (Search Console)
- `meta name="naver-site-verification"` (네이버 웹마스터도구)
- `meta name="msvalidate.01"` (Bing)
- `robots.txt` 의 Daum Webmaster Tool 검증 토큰
- JSON-LD: `EducationalOrganization` + `FAQPage` + `WebSite` + `BreadcrumbList`
- `meta name="keywords"` 35개 키워드
- `sitemap.xml` / `feed.xml` / `naver-syndication.xml`

> 검색 트래픽 보호를 위해 `EducationalOrganization.name` 은 기존 "화명 리드인 현대공부방" 그대로 유지.
> 정식 사업자명 "리드인 화명 용수초점" 은 `alternateName` 배열에 추가됨.

---

## TODO

- [ ] **og-image-v2.png** 새 톤에 맞춰 제작 (현재 `assets/og-image.png` 는 기존 광고형 톤 — 카카오톡/네이버에 캐시되어 있을 수 있음, 새 파일명 필수)
- [ ] **카카오톡 채널 ID** 발급 후 `KAKAO_URL` 교체 (위 가이드 참조)
- [ ] **네이버 지도 iframe** 삽입 (현재 Location 섹션 placeholder)
- [ ] **사진 자산** 교체 — 현재 placeholder:
  - Hero 우측 "책장 디테일" (3:4 비율)
  - Director 인물 사진 (이현진 원장, 4:5 비율)
- [ ] **Before/After 케이스 스터디** & **학부모 후기** 섹션 추가 — 데이터 축적 후 `design_handoff_readin_hwamyeong/b-plus-sections.jsx` 의 `BPlusBeforeAfter` / `BPlusReviews` 컴포넌트를 가져와 구현, `FEATURES` 플래그 `true` 로 변경
- [ ] **Lighthouse 점수 측정** — 목표 Performance 80+, SEO 95+, Accessibility 90+

---

## 메모

- **OG 이미지 캐시**: 카카오톡/네이버/페이스북에 기존 `og-image.png` 가 캐시되어 있을 수 있음. 캐시 갱신 위해 새 OG 이미지 만들 때는 반드시 **파일명 변경** (`og-image-v2.png`).
- **검색 인덱싱**: 메인 H1 텍스트 변경 → Google·네이버 인덱싱 재조정 1–2주 예상. `meta keywords` 와 JSON-LD 키워드는 그대로 보존하여 트래픽 dip 최소화.
- **렌더링**: Babel standalone 으로 런타임 JSX 변환. 첫 로드 시 CDN 부하 약간 있음 (캐시 후 빠름). Lighthouse Performance 모바일 점수가 80 미만으로 나올 수 있음 — 디자인 fidelity 우선 결정.
- **`design_handoff_readin_hwamyeong/`** 폴더는 untracked 상태로 두었음. 향후 정리 시 별도 PR 로 git 추가 또는 삭제 결정.

---

## 비즈니스 정보

```
상호:      리드인 화명 용수초점
대표:      이현진
주소:      부산광역시 북구 화명신도시로 48 (현대2차아파트 단지 내)
연락처:    010-2811-4221
운영시간:   월–금 10:00 – 22:00 / 토 10:00 – 14:00 / 일 휴무
사업자등록번호: 699-94-01680
설립:      2009 (EST. 2009)
```
