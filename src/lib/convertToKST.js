import { DateTime } from 'luxon';

// 시간 슬롯 정의 (현지 기준)
const TIME_SLOTS = {
  '오전': { start: 9,  end: 12 },
  '오후': { start: 12, end: 17 },
  '저녁': { start: 17, end: 21 },
};

// 한국 요일 배열 (Luxon weekday: 1=월 … 7=일)
const DAY_KR = ['월', '화', '수', '목', '금', '토', '일'];

/**
 * 현지 요일/시간대를 KST 기준 문자열 배열로 변환
 * @param {string[]} days       - 예: ['월', '수']
 * @param {string[]} times      - 예: ['오전', '저녁']
 * @param {string}   timezone   - IANA timezone string, 예: 'America/Los_Angeles'
 * @returns {string[]}          - 예: ['월 오전 (현지) → 화 02시–05시 KST']
 */
export function convertToKST(days, times, timezone) {
  if (!days?.length || !times?.length || !timezone) return [];

  // 유효한 timezone인지 확인
  const check = DateTime.now().setZone(timezone);
  if (!check.isValid) return [];

  // DST 영향 최소화를 위해 고정 기준일 사용 (2024-01-01 = 월요일)
  const ref = DateTime.fromISO('2024-01-01T00:00:00', { zone: timezone });

  const results = [];

  for (const day of days) {
    const weekday = DAY_KR.indexOf(day) + 1; // 1~7
    if (weekday === 0) continue;

    for (const time of times) {
      const slot = TIME_SLOTS[time];
      if (!slot) continue;

      const localStart = ref.set({ weekday, hour: slot.start, minute: 0, second: 0, millisecond: 0 });
      const localEnd   = ref.set({ weekday, hour: slot.end,   minute: 0, second: 0, millisecond: 0 });

      const kstStart = localStart.setZone('Asia/Seoul');
      const kstEnd   = localEnd.setZone('Asia/Seoul');

      const kstStartDay = DAY_KR[(kstStart.weekday - 1 + 7) % 7];
      const kstEndDay   = DAY_KR[(kstEnd.weekday   - 1 + 7) % 7];

      // 자정을 넘어가면 종료 요일도 표기
      const endStr = kstEnd.weekday !== kstStart.weekday
        ? `${kstEndDay} ${kstEnd.hour}시`
        : `${kstEnd.hour}시`;

      results.push(`${day} ${time} → ${kstStartDay} ${kstStart.hour}시–${endStr} KST`);
    }
  }

  return results;
}
