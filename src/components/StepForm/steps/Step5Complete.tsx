import { memo } from 'react';
import type { FormData } from '../../../types/stepform';

type Props = {
  formData: FormData;
};

const NEXT_STEPS = [
  '매칭된 선생님 프로필 확인',
  '20분 무료 체험 수업 신청',
  '정식 수업 시작',
] as const;

function Step5Complete({ formData }: Props) {
  const { childName, email } = formData.contact;

  return (
    <div className="stepform-card">
      <div className="stepform-complete-wrap">
        <div className="stepform-complete-icon">✓</div>

        <h2 className="stepform-complete-title">
          {childName ? `${childName}의 선생님을 찾고 있어요 🌱` : '신청이 완료되었어요 🌱'}
        </h2>

        <p className="stepform-complete-desc">
          담당자가 직접 검토한 후<br />
          2–3일 내로 <strong>{email}</strong> 주소로<br />
          연락드릴게요.
        </p>

        <div className="stepform-complete-steps">
          <p className="stepform-complete-steps-title">다음 단계 안내</p>
          {NEXT_STEPS.map((step, i) => (
            <div key={i} className="stepform-complete-step-item">
              <span className="stepform-complete-step-num">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <a href="#/" className="stepform-complete-home-btn">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

export default memo(Step5Complete);
