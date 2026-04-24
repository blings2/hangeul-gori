# 한글고리 (Hanguel Gori)

## 프로젝트 개요
해외에 사는 한국계 가정과 한글 선생님을 연결하는 모바일 웹 기반 수업 매칭 서비스.
타깃: 만 4세 ~ 초등학생 자녀를 둔 해외 거주 한국계 가정.
매칭 후 화상통화로 수업 진행. 초기 단계는 수동 큐레이션 매칭.

## 기술 스택
- Frontend: React 19 + TypeScript + Vite (Next.js 아님)
- Database: Supabase (PostgreSQL)
- Email: Resend (서버리스 함수에서만 호출)
- Timezone: Luxon + 자체 timezoneUtils.ts
- Hosting: Vercel
- 결제 (예정): Stripe / PayPal
- 라우팅: 해시 라우터 (main.js) — 파일 기반 라우팅 없음
- 환경변수: import.meta.env.VITE_ 접두사

## 현재 버전: v2.0 완료
다음 작업: v2.1 About / FAQ 페이지

## 버전 히스토리
- v1.0: 랜딩페이지 + 신청폼 + 어드민
- v1.1: 홈 리팩토링
- v1.2: 4단계 멀티스텝 폼
- v1.3: Resend 이메일 자동화
- v1.4: 시간대 칩 선택 + KST 변환
- v1.5: 스텝폼 깜빡임 수정
- v1.6: 스텝폼 전면 리뉴얼
- v1.7: 어드민 이메일 포맷 + KST 동기화
- v1.8: 홈페이지 콘텐츠 + 캐러셀
- v1.9: Supabase DB 연결 + 반응형 + 스텝폼 v4
  - 가정 언어 "한국어" 추가
  - 한국어 노출 환경 "한국 거주·방문·기관 경험" 추가
  - 시간대 컴포넌트: 국가 드롭다운(가나다순) + 도시 분기 + 오전/오후/저녁 블록 + KST 자동 변환
  - 기타 국가 텍스트박스 + 담당자 수동 처리
- v2.0: 브랜드 컬러 시스템 교체
  - 코랄 #D85A30 → 테라코타 #D4622A
  - 배경 white → 크림 베이지 #F5F0E8
  - 웜 어스톤 브랜드 CSS 변수 시스템 구축 (--color-impact, --color-primary 등 11종)
  - 홈 CTA 버튼 + 섹션 헤드라인 테라코타 적용
  - 섹션 서브텍스트 미드브라운 #8B6E5A 통일

## 로드맵
- v2.1: About / FAQ 페이지
- v2.2: 체험 수업 + Stripe 결제
- v2.3: 부모 / 선생님 계정 시스템
- v2.4: 부모–선생님 채팅
- v2.5: 리뷰 · 평점 시스템
- v3.0: 자동 매칭 알고리즘
- v3.1: 학습 리포트 · 진도 관리
- v3.2: 그룹 수업 · 콘텐츠 상품화

## 폴더 구조
src/
├── components/
│   ├── StepForm/           # React 19 스텝폼
│   │   ├── index.tsx       # 메인 컨테이너 (상태관리)
│   │   ├── mount.ts        # DOM 마운트
│   │   ├── ProgressBar.tsx
│   │   ├── StepForm.css
│   │   └── steps/          # Step1Child ~ Step5Complete
│   ├── applyV1/            # 레거시 백업
│   ├── adminDashboard.js   # 어드민 (Vanilla JS) — 건드리지 말 것
│   ├── home.js             # 홈 (Vanilla JS)
│   ├── homeCarousels.ts    # 캐러셀 마운트/언마운트
│   ├── storage.js          # Supabase + localStorage CRUD
│   ├── success.js
│   └── teacherForm.js
├── data/
│   ├── teachers.ts         # 캐러셀 목 데이터
│   └── reviews.ts
├── lib/
│   ├── supabase.ts
│   ├── timezoneUtils.ts    # 시간대 유틸
│   └── convertToKST.js
├── types/
│   └── stepform.ts         # 타입 정의
├── main.js                 # 해시 라우터 진입점
└── style.css               # 전역 CSS 변수

## API 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/send-email | 학부모 확인 + 어드민 알림 이메일 동시 발송 (Resend, Promise.allSettled) |

## Supabase DB 스키마
테이블: parent_requests (22컬럼)

| 구분 | 필드 |
|------|------|
| 자동 생성 | id (uuid PK), created_at |
| 연락처 | parent_name, child_name, email, child_gender, referral_source |
| 아이 정보 | child_age, home_language, parent_korean, personality[] |
| 한국어 수준 | korean_level, korean_level_sub_answer, korean_exposure[] |
| 수업 목표 | goals[] |
| 수업 환경 | country, city, utc_offset, is_manual, time_blocks[], kst_summary, frequency, teacher_prefs[] |
| 어드민 | status, admin_note |
| 백업 | raw_payload (jsonb) |

미이관 (localStorage만): TeacherProfile, MatchRecord → v2.3 계정 시스템 때 Supabase 이관 예정

## 디자인 토큰
- Impact (CTA): #D4622A (테라코타) — --color-impact
- Primary (골드/탄): #B89A6E — --color-primary
- Primary Light: #FAEDE6 — --color-primary-light
- Primary Dark: #b8521f — --color-primary-dark
- Text Brand (딥 브라운): #4A3728 — --color-text-brand
- Text Sub (미드 브라운): #8B6E5A — --color-text-sub
- Gold: #D4B896 — --color-gold
- Background (크림 베이지): #F5F0E8 — --color-bg / --bg-color
- Surface (연한 베이지): #EDE8DF — --color-surface
- Success (틸): #1D9E75 — --color-success
- Success Light: #E1F5EE — --color-success-light
- Success Dark: #0F6E56
- 모바일 기준 max-width: 480px 중앙 정렬

## 핵심 개발 원칙
- 작업 전 반드시 관련 파일 먼저 파악할 것
- 기존 API endpoint, DB 스키마, 어드민(adminDashboard.js) 건드리지 말 것
- 새 기능은 기존 파일 수정보다 새 파일로 분리
- 기능 추가 시 기존 폼 제출 로직(storage.js) 재사용
- 모바일 우선 레이아웃
- React.memo + useCallback으로 불필요한 리렌더링 방지
- 타입 정의는 types/stepform.ts에 유지

## 주의사항
- Vanilla JS(home.js, adminDashboard.js)와 React(StepForm/) 혼용 구조 — 섞지 말 것
- Resend는 서버리스 함수에서만 호출 (클라이언트 노출 금지)
- KST 변환 공식: ((현지시간 - utcOffset + 9) % 24 + 24) % 24
- 소수점 오프셋 주의: 인도 +5.5, 호주 애들레이드 +9.5/+10.5
- personality[], korean_level_sub_answer 필드는 DB에 있으나 현재 UI 미구현 — 추후 스텝폼에 추가 예정
- TeacherProfile, MatchRecord는 현재 localStorage만 사용 중
