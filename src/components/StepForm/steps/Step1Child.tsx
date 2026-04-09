import { memo, useCallback } from 'react';
import type { FormData } from '../../../types/stepform';

type Props = {
  data: FormData['child'];
  onChange: (value: Partial<FormData['child']>) => void;
  onNext: () => void;
};

const AGE_OPTIONS = [
  '만 4세', '만 5세', '만 6세',
  '초1–2 (7–8세)', '초3–4 (9–10세)', '초5–6 (11–13세)',
];

const LANGUAGE_OPTIONS = [
  '한국어', '영어', '일본어', '중국어', '스페인어', '독일어', '기타',
];

const PARENT_OPTIONS = [
  '둘 다 한국어 가능', '한 명만 가능', '둘 다 못해요',
];

const PERSONALITY_OPTIONS = [
  { value: 'social',   emoji: '😊', label: '낯선 어른과도 금방 친해져요' },
  { value: 'shy',      emoji: '🤫', label: '처음엔 수줍어하는 편이에요' },
  { value: 'playful',  emoji: '🎮', label: '게임·놀이로 배우는 걸 좋아해요' },
  { value: 'calm',     emoji: '📖', label: '차분히 앉아서 배우는 걸 좋아해요' },
  { value: 'musical',  emoji: '🎵', label: '노래·율동으로 배우면 잘 따라해요' },
  { value: 'active',   emoji: '⚡', label: '집중 시간이 짧은 편이에요' },
];

function Step1Child({ data, onChange, onNext }: Props) {
  const canProceed = !!(data.age && data.homeLanguage && data.parentKorean);

  const togglePersonality = useCallback((value: string) => {
    const next = data.personality.includes(value)
      ? data.personality.filter(v => v !== value)
      : [...data.personality, value];
    onChange({ personality: next });
  }, [data.personality, onChange]);

  return (
    <div className="stepform-card">
      <h2 className="stepform-step-title">아이에 대해 알려주세요</h2>
      <p className="stepform-step-sub">선생님 매칭의 첫 번째 기준이에요</p>

      {/* 섹션 1 — 아이 나이 */}
      <span className="stepform-field-label">아이 나이</span>
      <div className="stepform-tag-group">
        {AGE_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${data.age === opt ? ' selected' : ''}`}
            onClick={() => onChange({ age: opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 섹션 2 — 가정 언어 */}
      <span className="stepform-field-label">가정에서 주로 쓰는 언어</span>
      <div className="stepform-tag-group">
        {LANGUAGE_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${data.homeLanguage === opt ? ' selected' : ''}`}
            onClick={() => onChange({ homeLanguage: opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 섹션 3 — 부모 한국어 */}
      <span className="stepform-field-label">부모 중 한국어 사용자가 있나요?</span>
      <div className="stepform-tag-group">
        {PARENT_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepform-tag${data.parentKorean === opt ? ' selected' : ''}`}
            onClick={() => onChange({ parentKorean: opt })}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 섹션 4 — 아이 성향 (선택) */}
      <div className="stepform-field-group">
        <span className="stepform-field-label">
          우리 아이는 어떤 편인가요?
          <span className="stepform-optional"> 선택</span>
        </span>
        <p className="stepform-section-sub">선생님 매칭 시 수업 스타일에 참고해요</p>
        <div className="stepform-personality-grid">
          {PERSONALITY_OPTIONS.map(p => (
            <div
              key={p.value}
              className={`stepform-personality-chip${data.personality.includes(p.value) ? ' selected' : ''}`}
              onClick={() => togglePersonality(p.value)}
              role="checkbox"
              aria-checked={data.personality.includes(p.value)}
            >
              <span className="stepform-personality-emoji">{p.emoji}</span>
              <span className="stepform-personality-label">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stepform-nav-row">
        <button
          className="stepform-btn-next stepform-btn-next-solo"
          onClick={onNext}
          disabled={!canProceed}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

export default memo(Step1Child);
