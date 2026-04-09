import { memo, useCallback } from 'react';
import type { FormData } from '../../../types/stepform';

type Props = {
  data: FormData['koreanLevel'];
  onChange: (value: Partial<FormData['koreanLevel']>) => void;
  onNext: () => void;
  onBack: () => void;
};

const LEVELS = [
  {
    value: 'zero',
    icon: '🌱',
    name: '완전 처음',
    desc: '한글도 몰라요',
    detail: [
      '"한글을 전혀 모르는 단계예요"',
      'ㄱㄴㄷ 자음·모음부터 시작',
      '놀이·그림책 중심 수업 추천',
      '만 4–6세에 가장 많이 시작하는 단계예요',
    ],
  },
  {
    value: 'alpha',
    icon: '🔤',
    name: '자모 단계',
    desc: '가나다 배우는 중',
    detail: [
      '"가나다는 알지만 읽기가 아직 불안정해요"',
      '받침 있는 단어 읽기 연습 필요',
      '파닉스·음절 조합 중심 선생님 추천',
      '소리 내어 읽기 연습이 핵심이에요',
    ],
  },
  {
    value: 'listen',
    icon: '👂',
    name: '듣기 위주',
    desc: '듣는데 말은 어려워요',
    detail: [
      '"한국어는 꽤 알아듣는데 말이 잘 안 나와요"',
      '집에서 한국어를 자주 들어왔을 가능성이 높아요',
      '말문 트기 중심 수업 추천',
      '이미 기초가 쌓여있어서 빠르게 느는 단계예요',
    ],
  },
  {
    value: 'speak',
    icon: '🗣️',
    name: '말하기 가능',
    desc: '간단한 대화 돼요',
    detail: [
      '"간단한 대화는 되는데 읽기·쓰기가 약해요"',
      '회화는 되지만 문자 연결이 필요한 단계',
      '읽기·쓰기 병행 수업 추천',
      '어휘 확장과 문장 만들기가 다음 목표예요',
    ],
  },
  {
    value: 'read',
    icon: '📖',
    name: '읽기·쓰기',
    desc: '읽고 쓸 수 있어요',
    detail: [
      '"읽고 쓰는 게 어느 정도 돼요"',
      '맞춤법·띄어쓰기·작문 강화 단계',
      '책 읽기 및 독해 수업 추천',
      '귀국 학교 적응 준비도 가능한 수준이에요',
    ],
  },
] as const;

const EXPOSURE_OPTIONS = [
  { value: 'parents', label: '엄마·아빠가 한국어로 말을 걸어요',    sub: '하루에 몇 마디라도 한국어로 대화해요' },
  { value: 'books',   label: '잠자리에서 한국 책을 읽어줘요',        sub: '그림책·동화책을 한국어로 읽어주는 편이에요' },
  { value: 'video',   label: '할머니·할아버지와 영상통화를 해요',     sub: '한국 조부모님과 주기적으로 화상 통화해요' },
  { value: 'youtube', label: '한국 유튜브·TV 프로그램을 봐요',        sub: '뽀로로, 타요, 코코멜론 한국어 버전 등' },
  { value: 'lived',   label: '한국에서 살았거나 자주 방문했어요',     sub: '한국 유치원·기관에 다닌 경험이 있어요' },
  { value: 'school',  label: '한글학교나 다른 수업을 받은 적 있어요', sub: '주말 한글학교, 온라인 수업 등 경험이 있어요' },
  { value: 'none',    label: '한국어 노출이 거의 없었어요',           sub: '이번이 사실상 처음 시작이에요' },
];

function Step2Level({ data, onChange, onNext, onBack }: Props) {
  const toggleExposure = useCallback((value: string) => {
    const next = data.exposure.includes(value)
      ? data.exposure.filter(v => v !== value)
      : [...data.exposure, value];
    onChange({ exposure: next });
  }, [data.exposure, onChange]);

  return (
    <div className="stepform-card">
      <h2 className="stepform-step-title">한국어 실력</h2>
      <p className="stepform-step-sub">지금 아이의 수준에 가장 가까운 단계를 골라주세요</p>

      {/* 섹션 1 — 레벨 그리드 */}
      <span className="stepform-field-label">아이의 현재 한국어 수준</span>
      <div className="stepform-level-grid">
        {LEVELS.map(level => (
          <div
            key={level.value}
            className={`stepform-level-card${data.level === level.value ? ' selected' : ''}`}
            onClick={() => onChange({ level: level.value })}
            role="button"
            aria-pressed={data.level === level.value}
          >
            <span className="stepform-level-icon">{level.icon}</span>
            <span className="stepform-level-name">{level.name}</span>
            <span className="stepform-level-desc">{level.desc}</span>
          </div>
        ))}
      </div>

      {/* 설명 박스 — 모두 DOM에 유지, CSS transition으로 슬라이드 */}
      {LEVELS.map(level => (
        <div
          key={level.value}
          className={`stepform-level-detail${data.level === level.value ? ' visible' : ''}`}
          aria-hidden={data.level !== level.value}
        >
          <ul>
            {level.detail.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      ))}

      {/* 섹션 2 — 노출 환경 (복수 선택, 선택 안 해도 통과) */}
      <span className="stepform-field-label">
        한국어 노출 환경{' '}
        <span style={{ fontWeight: 400 }}>(선택 · 복수 가능)</span>
      </span>
      <div className="stepform-checkbox-list">
        {EXPOSURE_OPTIONS.map(opt => (
          <div
            key={opt.value}
            className={`stepform-checkbox-item${data.exposure.includes(opt.value) ? ' selected' : ''}`}
            onClick={() => toggleExposure(opt.value)}
            role="checkbox"
            aria-checked={data.exposure.includes(opt.value)}
          >
            <div className="stepform-checkbox-box">
              {data.exposure.includes(opt.value) ? '✓' : ''}
            </div>
            <div>
              <div className="stepform-checkbox-label">{opt.label}</div>
              <div className="stepform-checkbox-sub">{opt.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stepform-nav-row">
        <button className="stepform-btn-back" onClick={onBack}>← 이전</button>
        <button
          className="stepform-btn-next"
          onClick={onNext}
          disabled={!data.level}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

export default memo(Step2Level);
