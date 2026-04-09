import { memo, useCallback } from 'react';

type Props = {
  data: string[];
  onChange: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

const IMMEDIATE_GOALS = [
  {
    value: 'listening',
    emoji: '👂',
    label: '한국어를 들으면 어느 정도 알아듣고 싶어요',
    sub: '말을 못해도 괜찮아요. 일단 듣고 이해하는 것부터 시작하고 싶어요',
  },
  {
    value: 'reading',
    emoji: '🔤',
    label: '한글을 소리 내서 읽고 싶어요',
    sub: '뜻은 몰라도 한글 글자를 소리 내서 읽을 수 있었으면 해요',
  },
  {
    value: 'speaking',
    emoji: '🗣️',
    label: '한국어로 간단히 대화하고 싶어요',
    sub: '할머니께 "보고 싶어요", 친척에게 인사 정도는 스스로 할 수 있으면 좋겠어요',
  },
  {
    value: 'conversation',
    emoji: '💬',
    label: '한국어로 자유롭게 대화하고 싶어요',
    sub: '일상적인 주제로 한국어 대화를 자연스럽게 이어갈 수 있으면 해요',
  },
  {
    value: 'writing',
    emoji: '✏️',
    label: '받아쓰기·짧은 글쓰기를 하고 싶어요',
    sub: '띄어쓰기, 맞춤법을 신경 쓰며 짧은 문장을 쓸 수 있으면 해요',
  },
] as const;

const SPECIAL_GOALS = [
  {
    value: 'elementary',
    emoji: '🏫',
    label: '한국 초등학교 입학·전학을 앞두고 있어요',
    sub: '1~2년 내 귀국 예정, 교과 한국어 적응이 필요해요',
    badge: '귀국 D-1년',
  },
  {
    value: 'middle',
    emoji: '📚',
    label: '한국 중학교 진학을 준비하고 있어요',
    sub: '교과 어휘, 받아쓰기, 작문 등 학업 한국어가 필요해요',
    badge: '중등 준비',
  },
  {
    value: 'topik',
    emoji: '🎓',
    label: '한국어 능력 시험(TOPIK)을 준비하고 있어요',
    sub: '체계적인 읽기·쓰기·어휘 학습이 필요해요',
    badge: 'TOPIK',
  },
  {
    value: 'family',
    emoji: '👨‍👩‍👧',
    label: '한국 가족과 더 깊이 소통하고 싶어요',
    sub: '명절, 가족 행사에서 자연스럽게 대화할 수 있으면 해요',
    badge: null,
  },
] as const;

const ADVANCED_GOALS = [
  {
    value: 'books',
    emoji: '📚',
    label: '한국 책을 스스로 읽고 이해하고 싶어요',
    sub: '그림책부터 시작해서 동화나 읽기책을 혼자서 읽을 수 있으면 해요',
    badge: null,
  },
  {
    value: 'return',
    emoji: '✈️',
    label: '한국에 돌아가서 학교에 잘 적응하고 싶어요',
    sub: '귀국 후 초등학교 수업을 따라갈 수 있도록 준비하고 싶어요',
    badge: '귀국 준비',
  },
  {
    value: 'identity',
    emoji: '🌸',
    label: '그냥 한국과 연결되어 있었으면 해요',
    sub: '점수나 목표보다, 한국 문화와 정체성을 자연스럽게 느끼며 자랐으면 해요',
    badge: null,
  },
] as const;

function Step3Goals({ data, onChange, onNext, onBack }: Props) {
  const toggleGoal = useCallback((value: string) => {
    const next = data.includes(value)
      ? data.filter(v => v !== value)
      : [...data, value];
    onChange(next);
  }, [data, onChange]);

  return (
    <div className="stepform-card">
      <h2 className="stepform-step-title">수업으로 무엇을 이루고 싶으세요?</h2>
      <p className="stepform-step-sub">가장 바라는 모습을 골라주세요. 복수 선택 가능해요</p>

      {/* 섹션 1 — 지금 당장의 목표 */}
      <span className="stepform-section-badge immediate">지금 당장의 목표</span>
      <div className="stepform-goal-list">
        {IMMEDIATE_GOALS.map(goal => (
          <div
            key={goal.value}
            className={`stepform-goal-card${data.includes(goal.value) ? ' selected' : ''}`}
            onClick={() => toggleGoal(goal.value)}
            role="checkbox"
            aria-checked={data.includes(goal.value)}
          >
            <span className="stepform-goal-emoji">{goal.emoji}</span>
            <div>
              <div className="stepform-goal-label">{goal.label}</div>
              <div className="stepform-goal-sub">{goal.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 섹션 2 — 조금 더 나아간 목표 */}
      <span className="stepform-section-badge advanced">조금 더 나아간 목표</span>
      <div className="stepform-goal-list">
        {ADVANCED_GOALS.map(goal => (
          <div
            key={goal.value}
            className={`stepform-goal-card${data.includes(goal.value) ? ' selected' : ''}`}
            onClick={() => toggleGoal(goal.value)}
            role="checkbox"
            aria-checked={data.includes(goal.value)}
          >
            <span className="stepform-goal-emoji">{goal.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stepform-goal-label" style={goal.badge ? { paddingRight: 64 } : {}}>
                {goal.label}
              </div>
              <div className="stepform-goal-sub">{goal.sub}</div>
            </div>
            {goal.badge && (
              <span className="stepform-goal-badge">{goal.badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* 섹션 3 — 특별히 준비하고 있어요 */}
      <span className="stepform-section-badge special">특별히 준비하고 있어요</span>
      <p className="stepform-section-sub">해당되는 경우에만 선택해 주세요</p>
      <div className="stepform-goal-list">
        {SPECIAL_GOALS.map(goal => (
          <div
            key={goal.value}
            className={`stepform-goal-card${data.includes(goal.value) ? ' selected' : ''}`}
            onClick={() => toggleGoal(goal.value)}
            role="checkbox"
            aria-checked={data.includes(goal.value)}
          >
            <span className="stepform-goal-emoji">{goal.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stepform-goal-label" style={goal.badge ? { paddingRight: 64 } : {}}>
                {goal.label}
              </div>
              <div className="stepform-goal-sub">{goal.sub}</div>
            </div>
            {goal.badge && (
              <span className="stepform-goal-badge">{goal.badge}</span>
            )}
          </div>
        ))}
      </div>

      <div className="stepform-nav-row">
        <button className="stepform-btn-back" onClick={onBack}>← 이전</button>
        <button
          className="stepform-btn-next"
          onClick={onNext}
          disabled={data.length === 0}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

export default memo(Step3Goals);
