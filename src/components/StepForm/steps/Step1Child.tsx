import { memo } from 'react';
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

function Step1Child({ data, onChange, onNext }: Props) {
  const canProceed = !!(data.age && data.homeLanguage && data.parentKorean);

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
