import { DateTime } from 'luxon';

const TIME_SLOTS = {
  '오전': { label: '오전 9:00–12:00',  start: 9,  end: 12 },
  '오후': { label: '오후 12:00–17:00', start: 12, end: 17 },
  '저녁': { label: '저녁 17:00–21:00', start: 17, end: 21 },
};

const DAY_KR_SHORT = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_KR_FULL  = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

/**
 * IANA timezone에서 도시명 + 현재 오프셋 정보 추출
 * e.g. 'America/Toronto' → { city: 'Toronto', abbr: 'EDT', offsetStr: 'UTC-4' }
 */
export function getTimezoneInfo(timezone) {
  if (!timezone) return null;
  const now = DateTime.now().setZone(timezone);
  if (!now.isValid) return null;

  const city = timezone.split('/').pop().replace(/_/g, ' ');
  const abbr = now.offsetNameShort;           // e.g. 'EDT', 'PST'
  const offsetMin = now.offset;               // e.g. -240
  const offsetHr = offsetMin / 60;
  const offsetStr = `UTC${offsetHr >= 0 ? '+' : ''}${offsetHr}`;

  return { city, abbr, offsetStr };
}

/**
 * 현지 요일/시간대를 KST 기준으로 변환
 * @param {string[]} days     - ['월', '수']
 * @param {string[]} times    - ['오전', '저녁']
 * @param {string}   timezone - IANA timezone string, e.g. 'America/Toronto'
 * @returns {{ local: string, kst: string }[]}
 *   e.g. [{ local: '수요일 오후 12:00–17:00', kst: '수요일 21:00 → 익일 02:00' }]
 */
export function convertToKST(days, times, timezone) {
  if (!days?.length || !times?.length || !timezone) return [];

  const check = DateTime.now().setZone(timezone);
  if (!check.isValid) return [];

  // DST 영향 최소화를 위해 고정 기준일 사용 (2024-01-01 = 월요일)
  const ref = DateTime.fromISO('2024-01-01T00:00:00', { zone: timezone });

  const results = [];

  for (const day of days) {
    const dayIdx = DAY_KR_SHORT.indexOf(day);
    if (dayIdx === -1) continue;
    const weekday = dayIdx + 1; // 1=월 … 7=일

    for (const time of times) {
      const slot = TIME_SLOTS[time];
      if (!slot) continue;

      const localStart = ref.set({ weekday, hour: slot.start, minute: 0, second: 0, millisecond: 0 });
      const localEnd   = ref.set({ weekday, hour: slot.end,   minute: 0, second: 0, millisecond: 0 });

      const kstStart = localStart.setZone('Asia/Seoul');
      const kstEnd   = localEnd.setZone('Asia/Seoul');

      const localDayFull   = DAY_KR_FULL[dayIdx];
      const kstStartDayIdx = (kstStart.weekday - 1 + 7) % 7;

      const kstStartDay = DAY_KR_FULL[kstStartDayIdx];
      const crossDay    = kstEnd.weekday !== kstStart.weekday;
      const kstEndStr   = crossDay
        ? `익일 ${String(kstEnd.hour).padStart(2, '0')}:00`
        : `${String(kstEnd.hour).padStart(2, '0')}:00`;

      results.push({
        local: `${localDayFull} ${slot.label}`,
        kst:   `${kstStartDay} ${String(kstStart.hour).padStart(2, '0')}:00 → ${kstEndStr}`,
      });
    }
  }

  return results;
}
