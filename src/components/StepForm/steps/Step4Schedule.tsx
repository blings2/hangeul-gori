import { memo, useCallback, useMemo } from 'react';
import type { FormData } from '../../../types/stepform';
import {
  COUNTRIES,
  TIME_BLOCKS,
  formatKSTRange,
  buildKstSummary,
  type CountryEntry,
  type City,
} from '../../../lib/timezoneUtils';

type Props = {
  data: FormData['schedule'];
  onChange: (value: Partial<FormData['schedule']>) => void;
  contactData: FormData['contact'];
  onContactChange: (value: Partial<FormData['contact']>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

const FREQUENCY_OPTIONS = ['주 1회', '주 2회', '격주', '우선 체험 후 결정'] as const;

const TEACHER_PREF_OPTIONS = [
  '유아·어린이 수업 경험',
  '놀이 중심 수업',
  '귀국 학생 경험',
  '영어로 설명 가능',
  '숙제·복습 자료 제공',
  '상관없어요',
] as const;

// 도시 목록을 가진 국가인지 타입 가드
function hasCities(c: CountryEntry): c is { label: string; cities: City[] } {
  return 'cities' in c && Array.isArray(c.cities);
}

const GENDER_OPTIONS = ['남자아이', '여자아이', '말하고 싶지 않아요'] as const;
const REFERRAL_OPTIONS = ['인스타그램', '유튜브', '지인 추천', '블로그·카페', '기타'] as const;

function Step4Schedule({ data, onChange, contactData, onContactChange, onNext, onBack, isSubmitting }: Props) {
  const selectedCountry = useMemo(
    () => COUNTRIES.find(c => c.label === data.country),
    [data.country]
  );

  // 국가 변경: 관련 필드 초기화
  const handleCountryChange = useCallback((countryLabel: string) => {
    const country = COUNTRIES.find(c => c.label === countryLabel);
    if (!country) return;
    const isManual = country.isManual ?? false;
    const withCities = hasCities(country);
    onChange({
      country:      countryLabel,
      city:         withCities ? '' : countryLabel,
      utcOffset:    withCities || isManual ? null : (country as { utcOffset: number }).utcOffset,
      isManual,
      timeBlocks:   [],
      kstSummary:   '',
      countryOther: '',
    });
  }, [onChange]);

  // 도시 변경: utcOffset 갱신 + 시간 블록 초기화
  const handleCityChange = useCallback((cityLabel: string) => {
    if (!selectedCountry || !hasCities(selectedCountry)) return;
    const city = selectedCountry.cities.find(c => c.label === cityLabel);
    onChange({
      city:       cityLabel,
      utcOffset:  city?.utcOffset ?? null,
      timeBlocks: [],
      kstSummary: '',
    });
  }, [selectedCountry, onChange]);

  // 시간 블록 토글
  const toggleTimeBlock = useCallback((value: string) => {
    const next = data.timeBlocks.includes(value)
      ? data.timeBlocks.filter(v => v !== value)
      : [...data.timeBlocks, value];
    const summary = data.utcOffset !== null
      ? buildKstSummary(next, data.utcOffset)
      : '';
    onChange({ timeBlocks: next, kstSummary: summary });
  }, [data.timeBlocks, data.utcOffset, onChange]);

  // 선생님 선호 토글
  const toggleTeacherPref = useCallback((value: string) => {
    const next = data.teacherPrefs.includes(value)
      ? data.teacherPrefs.filter(v => v !== value)
      : [...data.teacherPrefs, value];
    onChange({ teacherPrefs: next });
  }, [data.teacherPrefs, onChange]);

  // 제출 버튼 활성화 조건
  const scheduleValid = data.isManual
    ? data.countryOther.trim() !== '' && data.frequency !== ''
    : data.utcOffset !== null && data.timeBlocks.length > 0 && data.frequency !== '';
  const contactValid =
    contactData.parentName.trim() !== '' &&
    contactData.childName.trim() !== '' &&
    contactData.email.trim() !== '';
  const canSubmit = scheduleValid && contactValid;

  return (
    <div className="stepform-card">
      <h2 className="stepform-step-title">어디서, 언제 수업하시나요?</h2>
      <p className="stepform-step-sub">현지 시간 기준으로 선택해 주세요</p>

      {/* ── 국가 선택 ── */}
      <span className="stepform-field-label">거주 국가</span>
      <select
        className="stepform-select"
        value={data.country}
        onChange={e => handleCountryChange(e.target.value)}
      >
        <option value="">국가를 선택해 주세요</option>
        {COUNTRIES.map(c => (
          <option key={c.label} value={c.label}>{c.label}</option>
        ))}
      </select>

      {/* ── 도시 선택 (도시 있는 국가만) ── */}
      {selectedCountry && hasCities(selectedCountry) && (
        <>
          <span className="stepform-field-label">도시</span>
          <select
            className="stepform-select"
            value={data.city}
            onChange={e => handleCityChange(e.target.value)}
          >
            <option value="">도시를 선택해 주세요</option>
            {selectedCountry.cities.map(c => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
        </>
      )}

      {/* ── 기타 국가: 텍스트 입력 + 안내 ── */}
      {data.isManual && (
        <div className="stepform-manual-wrap">
          <input
            className="stepform-input"
            type="text"
            placeholder="거주 국가를 직접 입력해 주세요"
            value={data.countryOther}
            onChange={e => onChange({ countryOther: e.target.value })}
          />
          <p className="stepform-manual-notice">
            목록에 없는 국가는 매칭 담당자가 직접 시간대를 확인하고 연락드려요
          </p>
        </div>
      )}

      {/* ── 시간 블록 (국가+도시 선택 완료 시만) ── */}
      {data.utcOffset !== null && !data.isManual && (
        <div className="stepform-field-group">
          <span className="stepform-field-label">
            희망 수업 시간대{' '}
            <span style={{ fontWeight: 400 }}>(복수 선택)</span>
          </span>
          <div className="stepform-timeblock-grid">
            {TIME_BLOCKS.map(block => {
              const kstRange = formatKSTRange(block.start, block.end, data.utcOffset!);
              const selected = data.timeBlocks.includes(block.value);
              return (
                <div
                  key={block.value}
                  className={`stepform-timeblock-card${selected ? ' selected' : ''}`}
                  onClick={() => toggleTimeBlock(block.value)}
                  role="checkbox"
                  aria-checked={selected}
                >
                  <span className="stepform-timeblock-label">{block.label}</span>
                  <span className="stepform-timeblock-local">{block.localRange}</span>
                  <span className="stepform-timeblock-kst">{kstRange}</span>
                </div>
              );
            })}
          </div>
          <p className="stepform-hint">선택하신 시간은 현지 시간 기준이에요</p>
        </div>
      )}

      {/* ── 수업 빈도 ── */}
      <span className="stepform-field-label">수업 빈도</span>
      <div className="stepform-tag-group">
        {FREQUENCY_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${data.frequency === opt ? ' selected' : ''}`}
            onClick={() => onChange({ frequency: opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ── 선생님 선호 (복수 선택) ── */}
      <span className="stepform-field-label">
        선생님 선호{' '}
        <span style={{ fontWeight: 400, color: '#9E9890', fontSize: '11px' }}>
          (선택 · 복수 가능)
        </span>
      </span>
      <div className="stepform-tag-group">
        {TEACHER_PREF_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${data.teacherPrefs.includes(opt) ? ' selected' : ''}`}
            onClick={() => toggleTeacherPref(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ── 구분선 + 연락처 섹션 ── */}
      <hr className="stepform-divider" />
      <div className="stepform-contact-intro">
        <p className="stepform-contact-intro-title">마지막으로 연락처를 알려주세요</p>
        <p className="stepform-contact-intro-sub">매칭 결과를 이메일로 보내드려요. 2–3일 내로 연락드릴게요.</p>
      </div>

      <span className="stepform-field-label">부모님 성함</span>
      <input
        className="stepform-input"
        type="text"
        placeholder="홍길동"
        value={contactData.parentName}
        onChange={e => onContactChange({ parentName: e.target.value })}
      />

      <span className="stepform-field-label">자녀 이름</span>
      <input
        className="stepform-input"
        type="text"
        placeholder="한글 또는 영문"
        value={contactData.childName}
        onChange={e => onContactChange({ childName: e.target.value })}
      />

      <span className="stepform-field-label">이메일</span>
      <input
        className="stepform-input"
        type="email"
        placeholder="example@email.com"
        value={contactData.email}
        onChange={e => onContactChange({ email: e.target.value })}
      />

      <span className="stepform-field-label">
        자녀 성별{' '}
        <span className="stepform-optional">(선택)</span>
      </span>
      <div className="stepform-tag-group">
        {GENDER_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${contactData.childGender === opt ? ' selected' : ''}`}
            onClick={() => onContactChange({ childGender: contactData.childGender === opt ? '' : opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      <span className="stepform-field-label">
        어떻게 알게 되셨나요?{' '}
        <span className="stepform-optional">(선택)</span>
      </span>
      <div className="stepform-tag-group">
        {REFERRAL_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${contactData.referralSource === opt ? ' selected' : ''}`}
            onClick={() => onContactChange({ referralSource: contactData.referralSource === opt ? '' : opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="stepform-nav-row">
        <button className="stepform-btn-back" onClick={onBack} disabled={isSubmitting}>← 이전</button>
        <button
          className="stepform-btn-next"
          onClick={onNext}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? '신청 중...' : '선생님 찾아주세요 →'}
        </button>
      </div>
    </div>
  );
}

export default memo(Step4Schedule);
