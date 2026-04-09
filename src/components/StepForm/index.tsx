import { useState, useCallback, memo } from 'react';
import ProgressBar from './ProgressBar';
import Step1Child from './steps/Step1Child';
import Step2Level from './steps/Step2Level';
import Step3Goals from './steps/Step3Goals';
import Step4Schedule from './steps/Step4Schedule';
import Step5Complete from './steps/Step5Complete';
import { initialFormData } from '../../types/stepform';
import type { FormData, SectionUpdater } from '../../types/stepform';
import { saveParentApp } from '../storage.js';
import './StepForm.css';

const TOTAL_STEPS = 5;

function StepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 스텝 이동 + 스크롤 최상단
  const go = useCallback((n: number) => {
    setCurrentStep(n);
    window.scrollTo(0, 0);
  }, []);

  // 섹션별 부분 업데이트 (goals 배열 제외)
  const handleUpdate = useCallback<SectionUpdater>(<K extends keyof Omit<FormData, 'goals'>>(
    section: K,
    value: Partial<FormData[K]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...value },
    }));
  }, []);

  // goals 배열 전체 교체
  const handleGoalsUpdate = useCallback((goals: string[]) => {
    setFormData(prev => ({ ...prev, goals }));
  }, []);

  // Step별 섹션 onChange 핸들러 (memo 효과 보장을 위해 각각 메모이제이션)
  const handleChildChange = useCallback(
    (value: Partial<FormData['child']>) => handleUpdate('child', value),
    [handleUpdate]
  );
  const handleLevelChange = useCallback(
    (value: Partial<FormData['koreanLevel']>) => handleUpdate('koreanLevel', value),
    [handleUpdate]
  );
  const handleScheduleChange = useCallback(
    (value: Partial<FormData['schedule']>) => handleUpdate('schedule', value),
    [handleUpdate]
  );
  const handleContactChange = useCallback(
    (value: Partial<FormData['contact']>) => handleUpdate('contact', value),
    [handleUpdate]
  );

  // 폼 제출: localStorage 저장 + 이메일 API 호출
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const { child, koreanLevel, goals, schedule, contact } = formData;
    const country = schedule.isManual ? schedule.countryOther : schedule.country;

    // storage.js 기존 스키마 호환 payload
    const storagePayload = {
      parent_name:     contact.parentName,
      child_name:      contact.childName,
      child_age:       child.age,
      email:           contact.email,
      child_gender:    contact.childGender,
      referral_source: contact.referralSource,
      korean_level:    koreanLevel.level,
      learning_goal:   goals,
      country,
      city:            schedule.city,
      available_days:  [],
      available_times: schedule.timeBlocks,
      local_timezone:  '',
      // v2 신규 구조
      _v: 2,
      child,
      koreanLevel,
      goals,
      schedule,
      contact,
    };

    try {
      saveParentApp(storagePayload);
    } catch {
      setIsSubmitting(false);
      setSubmitError('저장 중 오류가 발생했어요. 다시 시도해 주세요.');
      return;
    }

    // 이메일 발송 (실패해도 제출 완료로 처리)
    const emailPayload = {
      parent_name:    contact.parentName,
      child_name:     contact.childName,
      child_age:      child.age,
      email:          contact.email,
      korean_level:   koreanLevel.level,
      learning_goal:  goals,
      country,
      city:           schedule.city,
      available_days: [],
      available_times: schedule.timeBlocks,
      local_timezone: '',
    };

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });
      if (!res.ok) {
        console.warn('send-email returned', res.status);
      }
    } catch {
      console.warn('send-email network error');
    }

    setIsSubmitting(false);
    go(5);
  }, [formData, go]);

  return (
    <div className="stepform-container">
      {/* 홈 버튼 */}
      <div className="stepform-topbar">
        <a href="#/" className="stepform-back-home" aria-label="홈으로">←</a>
      </div>

      {/* 진행 표시바 (완료 화면에서는 숨김) */}
      {currentStep < TOTAL_STEPS && (
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      )}

      {/* 스텝별 컨텐츠 */}
      {currentStep === 1 && (
        <Step1Child
          data={formData.child}
          onChange={handleChildChange}
          onNext={() => go(2)}
        />
      )}
      {currentStep === 2 && (
        <Step2Level
          data={formData.koreanLevel}
          onChange={handleLevelChange}
          onNext={() => go(3)}
          onBack={() => go(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Goals
          data={formData.goals}
          onChange={handleGoalsUpdate}
          onNext={() => go(4)}
          onBack={() => go(2)}
        />
      )}
      {currentStep === 4 && (
        <>
          <Step4Schedule
            data={formData.schedule}
            onChange={handleScheduleChange}
            contactData={formData.contact}
            onContactChange={handleContactChange}
            onNext={handleSubmit}
            onBack={() => go(3)}
            isSubmitting={isSubmitting}
          />
          {submitError && (
            <div className="stepform-error">{submitError}</div>
          )}
        </>
      )}
      {currentStep === 5 && (
        <Step5Complete formData={formData} />
      )}
    </div>
  );
}

export default memo(StepForm);
