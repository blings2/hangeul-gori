// ─── DST 판단 ─────────────────────────────────────────────────────────────────

/** year/month(0-indexed)의 마지막 일요일 반환 */
function getLastSunday(year: number, month: number): Date {
  const d = new Date(year, month + 1, 0); // 해당 월 마지막 날
  d.setDate(d.getDate() - d.getDay());     // 직전 일요일
  return d;
}

/** 북반구 DST 여부: 3월 마지막 일요일 ~ 10월 마지막 일요일 */
export function isDSTNorthern(): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const start = getLastSunday(y, 2); // 3월 마지막 일요일
  const end   = getLastSunday(y, 9); // 10월 마지막 일요일
  return now >= start && now < end;
}

/** 남반구 DST 여부: 북반구의 반대 */
export function isDSTSouthern(): boolean {
  return !isDSTNorthern();
}

// ─── KST 변환 ─────────────────────────────────────────────────────────────────

/**
 * 현지 시간(시) → KST(시)
 * KST = UTC+9 → ((localHour - utcOffset + 9) % 24 + 24) % 24
 */
export function toKST(localHour: number, utcOffset: number): number {
  return ((localHour - utcOffset + 9) % 24 + 24) % 24;
}

/**
 * 현지 시작~종료 시간을 "HH:MM–HH:MM KST" 문자열로 변환.
 * 자정을 넘어가면 "(+1일)" 표기 추가.
 */
export function formatKSTRange(
  startHour: number,
  endHour: number,
  utcOffset: number
): string {
  const kstStart = toKST(startHour, utcOffset);
  const kstEnd   = toKST(endHour,   utcOffset);
  const s = `${String(kstStart).padStart(2, '0')}:00`;
  const e = `${String(kstEnd).padStart(2, '0')}:00`;
  const overnight = kstEnd <= kstStart;
  return overnight ? `${s}–${e} KST (+1일)` : `${s}–${e} KST`;
}

/** 선택된 시간 블록들을 요약 문자열로 조합 */
export function buildKstSummary(
  timeBlocks: string[],
  utcOffset: number
): string {
  return timeBlocks
    .map(block => {
      const slot = TIME_BLOCKS.find(t => t.value === block);
      if (!slot) return '';
      return `${slot.label}(${formatKSTRange(slot.start, slot.end, utcOffset)})`;
    })
    .filter(Boolean)
    .join(' / ');
}

// ─── 시간 블록 ─────────────────────────────────────────────────────────────────

export const TIME_BLOCKS = [
  { value: 'morning',   label: '오전', localRange: '08:00–12:00', start: 8,  end: 12 },
  { value: 'afternoon', label: '오후', localRange: '12:00–18:00', start: 12, end: 18 },
  { value: 'evening',   label: '저녁', localRange: '18:00–22:00', start: 18, end: 22 },
] as const;

// ─── 국가 데이터 ───────────────────────────────────────────────────────────────

export type City = { label: string; utcOffset: number };

export type CountryEntry =
  | { label: string; utcOffset: number;  cities?: undefined; isManual?: false }
  | { label: string; utcOffset?: undefined; cities: City[]; isManual?: false }
  | { label: string; utcOffset: null;    cities?: undefined; isManual: true  };

// 현재 날짜 기준 DST 플래그 (모듈 로드 시 1회 계산)
const dst  = isDSTNorthern();
const dstS = isDSTSouthern();

export const COUNTRIES: CountryEntry[] = [
  { label: '가나',              utcOffset: 0 },
  { label: '과테말라',          utcOffset: -6 },
  { label: '그리스',            utcOffset: dst ? 3 : 2 },
  { label: '나이지리아',        utcOffset: 1 },
  { label: '남아프리카공화국',  utcOffset: 2 },
  { label: '네덜란드',          utcOffset: dst ? 2 : 1 },
  { label: '노르웨이',          utcOffset: dst ? 2 : 1 },
  { label: '뉴질랜드',          utcOffset: dstS ? 13 : 12 },
  { label: '대만',              utcOffset: 8 },
  { label: '덴마크',            utcOffset: dst ? 2 : 1 },
  { label: '독일',              utcOffset: dst ? 2 : 1 },
  { label: '러시아', cities: [
    { label: '모스크바',       utcOffset: 3  },
    { label: '블라디보스토크', utcOffset: 10 },
  ]},
  { label: '말레이시아',        utcOffset: 8 },
  { label: '멕시코', cities: [
    { label: '멕시코시티', utcOffset: dst ? -5 : -6 },
    { label: '티후아나',   utcOffset: dst ? -7 : -8 },
  ]},
  { label: '모로코',            utcOffset: 1 },
  { label: '미국', cities: [
    { label: '뉴욕',        utcOffset: dst ? -4 : -5  },
    { label: '시카고',      utcOffset: dst ? -5 : -6  },
    { label: '덴버',        utcOffset: -7              },
    { label: '로스앤젤레스', utcOffset: dst ? -7 : -8 },
    { label: '호놀룰루',    utcOffset: -10             },
  ]},
  { label: '바레인',            utcOffset: 3 },
  { label: '베트남',            utcOffset: 7 },
  { label: '벨기에',            utcOffset: dst ? 2 : 1 },
  { label: '브라질', cities: [
    { label: '상파울루', utcOffset: -3 },
    { label: '마나우스', utcOffset: -4 },
  ]},
  { label: '사우디아라비아',    utcOffset: 3 },
  { label: '스웨덴',            utcOffset: dst ? 2 : 1 },
  { label: '스위스',            utcOffset: dst ? 2 : 1 },
  { label: '스페인',            utcOffset: dst ? 2 : 1 },
  { label: '싱가포르',          utcOffset: 8 },
  { label: '아랍에미리트',      utcOffset: 4 },
  { label: '아르헨티나',        utcOffset: -3 },
  { label: '아일랜드',          utcOffset: dst ? 1 : 0 },
  { label: '영국',              utcOffset: dst ? 1 : 0 },
  { label: '오스트리아',        utcOffset: dst ? 2 : 1 },
  { label: '이스라엘',          utcOffset: dst ? 3 : 2 },
  { label: '이탈리아',          utcOffset: dst ? 2 : 1 },
  { label: '인도',              utcOffset: 5.5 },
  { label: '인도네시아', cities: [
    { label: '자카르타', utcOffset: 7 },
    { label: '발리',     utcOffset: 8 },
  ]},
  { label: '일본',              utcOffset: 9 },
  { label: '중국',              utcOffset: 8 },
  { label: '체코',              utcOffset: dst ? 2 : 1 },
  { label: '칠레',              utcOffset: dstS ? -3 : -4 },
  { label: '캄보디아',          utcOffset: 7 },
  { label: '캐나다', cities: [
    { label: '토론토', utcOffset: dst ? -4 : -5  },
    { label: '밴쿠버', utcOffset: dst ? -7 : -8  },
    { label: '캘거리', utcOffset: -7              },
  ]},
  { label: '케냐',              utcOffset: 3 },
  { label: '콜롬비아',          utcOffset: -5 },
  { label: '쿠웨이트',          utcOffset: 3 },
  { label: '태국',              utcOffset: 7 },
  { label: '터키',              utcOffset: 3 },
  { label: '포르투갈',          utcOffset: dst ? 1 : 0 },
  { label: '폴란드',            utcOffset: dst ? 2 : 1 },
  { label: '프랑스',            utcOffset: dst ? 2 : 1 },
  { label: '필리핀',            utcOffset: 8 },
  { label: '핀란드',            utcOffset: dst ? 3 : 2 },
  { label: '헝가리',            utcOffset: dst ? 2 : 1 },
  { label: '홍콩',              utcOffset: 8 },
  { label: '호주', cities: [
    { label: '시드니',    utcOffset: dstS ? 11   : 10  },
    { label: '브리즈번',  utcOffset: 10                 },
    { label: '퍼스',      utcOffset: 8                  },
    { label: '애들레이드', utcOffset: dstS ? 10.5 : 9.5 },
  ]},
  // 맨 마지막 고정
  { label: '기타 (목록에 없어요)', utcOffset: null, isManual: true },
];
