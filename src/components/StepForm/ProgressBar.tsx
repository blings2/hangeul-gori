import { memo } from 'react';

type ProgressBarProps = {
  currentStep: number; // 1–5
  totalSteps: number;  // 5
};

const STEP_LABELS = ['아이 정보', '한국어 실력', '수업 목표', '수업 환경', '완료'];

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  // 완료 구간 진행선 너비: (완료된 스텝 수 / 전체 구간 수) × 100%
  // 현재 스텝이 n이면 n-1개의 구간이 완료됨
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="stepform-pb">
      {/* 배경 선 */}
      <div className="stepform-pb-bg-line" />

      {/* 진행 선 */}
      <div
        className="stepform-pb-progress-line"
        style={{ width: `${progressPct}%` }}
      />

      {/* 도트 행 */}
      <div className="stepform-pb-dots">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isDone    = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div
              key={step}
              className={`stepform-pb-dot${isDone ? ' done' : isCurrent ? ' active' : ''}`}
              aria-label={`${STEP_LABELS[i]}${isDone ? ' (완료)' : isCurrent ? ' (현재)' : ''}`}
            >
              {isDone ? '✓' : step}
            </div>
          );
        })}
      </div>

      {/* 라벨 행 */}
      <div className="stepform-pb-labels">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isDone    = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <span
              key={step}
              className={`stepform-pb-label${isDone ? ' done' : isCurrent ? ' active' : ''}`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ProgressBar);
