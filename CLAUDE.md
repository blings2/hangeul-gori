# 한글고리 (Hanguel Gori) — CLAUDE.md

## 프로젝트 개요

해외에 거주하는 한국 가정의 자녀와 한글 선생님을 매칭해주는 서비스.
학부모가 수업을 신청하고, 선생님이 지원하면, 운영자가 어드민 대시보드에서 직접 매칭·관리한다.

- 배포 URL: https://hangeul-gori.vercel.app
- 현재 버전: **v1.5**

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 번들러 | Vite |
| 프레임워크 | **없음** — 순수 Vanilla JS (ES Modules) |
| 라우팅 | Hash-based SPA (`#/`, `#/apply`, `#/teach`, `#/admin`, `#/success`) |
| 스타일 | 단일 CSS 파일 (`src/style.css`) + 컴포넌트 내 인라인 `<style>` |
| 데이터 저장소 | `localStorage` (서버 DB 없음) |
| 이메일 발송 | [Resend](https://resend.com) (`resend` npm 패키지) |
| 날짜/시간 | [Luxon](https://moment.github.io/luxon/) (타임존 변환) |
| 서버리스 함수 | Vercel Functions (`api/send-email.js`) |
| 배포 | Vercel (`vercel.json`) |

---

## 폴더 구조

```
/
├── api/
│   └── send-email.js          # Vercel 서버리스 함수 — 학부모/운영자 이메일 발송
├── src/
│   ├── components/
│   │   ├── home.js            # 홈 페이지 렌더러
│   │   ├── parentForm.js      # 학부모 수업 신청 폼 (멀티스텝)
│   │   ├── teacherForm.js     # 선생님 등록 폼
│   │   ├── adminDashboard.js  # 운영자 대시보드 (매칭/상태 관리)
│   │   ├── storage.js         # localStorage CRUD 레이어
│   │   └── success.js         # 신청 완료 페이지
│   ├── lib/
│   │   └── convertToKST.js    # Luxon 기반 타임존 → KST 변환 유틸
│   ├── assets/                # 이미지 등 정적 에셋
│   ├── main.js                # 진입점 — 해시 라우터 초기화
│   └── style.css              # 전역 CSS 변수 및 공통 스타일
├── public/                    # Vite public 디렉터리 (logo.png 등)
├── dist/                      # 빌드 산출물 (커밋 금지)
├── index.html
├── vercel.json
└── package.json
```

---

## 데이터 스키마 (localStorage)

### `ParentRequest` — 학부모 신청
```js
{
  id: string,                  // Date.now().toString()
  parent_name: string,
  child_name: string,
  child_age: string,
  child_gender: string,
  email: string,
  country: string,
  city: string,
  korean_level: string,
  korean_level_note: string,
  learning_goal: string[],
  learning_goal_note: string,
  available_days: string[],    // ['월', '수', ...]
  available_times: string[],   // ['오전', '오후', '저녁']
  local_timezone: string,      // IANA timezone (e.g. 'America/New_York')
  referral_source: string,
  note: string,
  status: string,              // 신규 접수 | 검토중 | 매칭 진행중 | 매칭 완료 | 보류
  admin_note: string,
  created_at: string,          // ISO 8601
}
```

### `TeacherProfile` — 선생님 지원
```js
{
  id: string,
  name: string,
  email: string,
  country: string,
  age_group: string,
  teaching_level: string,
  availability: string,
  trial_available: boolean,
  early_childhood_experience: boolean,
  bio: string,
  experience: string,
  status: string,
  admin_note: string,
  created_at: string,
}
```

### `MatchRecord` — 매칭 기록
```js
{
  id: string,
  parent_request_id: string,
  teacher_profile_id: string,
  admin_note: string,
  status: 'Active',
  created_at: string,
}
```

---

## 핵심 개발 원칙

### 1. 기존 API · DB 스키마 · 어드민 건드리지 말 것
- `api/send-email.js`의 엔드포인트 경로 및 request body 구조를 변경하지 않는다.
- `localStorage` 키 이름(`ParentRequest`, `TeacherProfile`, `MatchRecord`)과 각 필드명을 유지한다.
- `adminDashboard.js`의 상태값 (`신규 접수`, `검토중`, `매칭 진행중`, `매칭 완료`, `보류`) 및 UI 흐름을 건드리지 않는다.
- `storage.js`의 공개 함수 시그니처를 변경하지 않는다.

### 2. 기능 추가 시 기존 폼 제출 로직 재사용
- `saveParentApp()` / `saveTeacherApp()` — 스토리지 저장
- `api/send-email.js` 호출 패턴 — 이메일 발송
- 새 폼이나 데이터 수집 기능 추가 시 위 함수들을 그대로 활용하고, 중복 구현하지 않는다.

### 3. 모바일 우선 레이아웃
- 기본 스타일을 모바일(좁은 화면)에 맞게 작성한다.
- 데스크탑 확장이 필요하면 `@media (min-width: ...)` 미디어 쿼리를 추가한다.
- `src/style.css`의 CSS 변수(`--primary`, `--surface`, `--border`, `--radius-md` 등)를 재사용한다.

### 4. 타입 정의 유지
- 프로젝트는 TypeScript를 사용하지 않지만 위 **데이터 스키마** 섹션이 사실상 타입 명세다.
- 새 필드를 추가할 때는 이 문서의 스키마를 업데이트하고, 스토리지 초기값(`initStorage`)도 함께 검토한다.
- JSDoc `@param` / `@returns` 주석이 있는 함수(`convertToKST`, `getTimezoneInfo`)의 시그니처를 유지한다.
