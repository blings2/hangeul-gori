import { saveParentApp } from './storage.js';

export function renderParentForm() {
  const container = document.createElement('div');
  container.className = 'page-container apply-multistep';

  let currentStep = 1; // 1 | 2 | 3 | 4 | 'done'
  let formData = {
    child_age: '',
    korean_level: '',
    korean_level_note: '',
    learning_goal: [],
    learning_goal_note: '',
    country: '',
    country_other: '',
    city: '',
    city_other: '',
    preferred_schedule: '',
    parent_name: '',
    child_name: '',
    email: '',
    child_gender: '',
    referral_source: '',
  };

  const CITY_MAP = {
    '미국':     ['뉴욕', '로스앤젤레스', '샌프란시스코', '시애틀', '시카고', '휴스턴', '기타'],
    '캐나다':   ['토론토', '밴쿠버', '몬트리올', '기타'],
    '영국':     ['런던', '맨체스터', '버밍엄', '기타'],
    '호주':     ['시드니', '멜버른', '브리즈번', '퍼스', '기타'],
    '뉴질랜드': ['오클랜드', '웰링턴', '크라이스트처치', '기타'],
    '독일':     ['베를린', '뮌헨', '프랑크푸르트', '함부르크', '기타'],
    '프랑스':   ['파리', '리옹', '마르세유', '기타'],
    '싱가포르': ['싱가포르'],
    '일본':     ['도쿄', '오사카', '후쿠오카', '기타'],
    '기타':     [],
  };

  // ─── helpers ──────────────────────────────────────────────────────────────

  const canGoNext = () => {
    if (currentStep === 1) return !!(formData.child_age && formData.korean_level);
    if (currentStep === 2) return formData.learning_goal.length > 0;
    if (currentStep === 3) {
      const countryOtherOk = formData.country !== '기타' || formData.country_other.trim();
      const showCity       = formData.country && formData.country !== '기타';
      const cityOk         = (showCity && formData.city) || formData.country === '기타';
      const cityOtherOk    = formData.city !== '기타' || formData.city_other.trim();
      return !!(formData.country && countryOtherOk && cityOk && cityOtherOk && formData.preferred_schedule.trim());
    }
    return false;
  };

  const canSubmitFinal = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    return !!(formData.parent_name.trim() && formData.child_name.trim() && emailValid);
  };

  // ─── step HTML builders ───────────────────────────────────────────────────

  const step1Html = () => {
    const ages   = ['3세','4세','5세','6세','7세','8세','9세','10세'];
    const ageLabel = a => `만 ${a}`;
    const levels = [
      '한국어를 거의 접해본 적이 없어요',
      '간단한 단어나 표현을 이해해요',
      '짧은 문장으로 말할 수 있어요',
      '간단한 대화를 할 수 있어요',
    ];
    return `
      <div class="ms-step-header">
        <h1 class="ms-title">아이에 대해<br/>알려주세요</h1>
      </div>

      <div class="ms-field">
        <label class="ms-label">아이 나이</label>
        <select class="ms-select" id="child_age">
          <option value="" disabled ${!formData.child_age ? 'selected' : ''}>나이를 선택해 주세요 (만 나이 기준)</option>
          ${ages.map(a => `<option value="${a}" ${formData.child_age === a ? 'selected' : ''}>${ageLabel(a)}</option>`).join('')}
        </select>
      </div>

      <div class="ms-field">
        <label class="ms-label">아이의 한국어 수준</label>
        <div class="ms-chips">
          ${levels.map(opt => `
            <div class="ms-chip ${formData.korean_level === opt ? 'selected' : ''}"
                 data-field="korean_level" data-value="${opt}">
              <span class="ms-chip-check">✓</span>${opt}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ms-field">
        <label class="ms-label">추가로 알려주실 것이 있으신가요? <span class="ms-optional">(선택)</span></label>
        <textarea class="ms-textarea" id="korean_level_note"
          placeholder="예: 한국 할머니와 가끔 통화해요, 한글 동화책을 읽어준 적 있어요…">${formData.korean_level_note}</textarea>
      </div>

      <button class="ms-btn-next ${canGoNext() ? '' : 'disabled'}" id="btn-next"
        ${canGoNext() ? '' : 'disabled'}>다음 →</button>
    `;
  };

  const step2Html = () => {
    const goals = [
      '한국어를 자연스럽게 익히게 하고 싶어요',
      '말하기를 중심으로 배우고 싶어요',
      '읽기와 기초 학습을 시작하고 싶어요',
      '한국 문화를 함께 접하게 해주고 싶어요',
      '가족과 한국어로 소통할 수 있기를 바라요',
    ];
    return `
      <div class="ms-step-header">
        <h1 class="ms-title">어떤 것을<br/>배우길 원하시나요?</h1>
      </div>

      <div class="ms-field">
        <label class="ms-label">수업 목표 <span class="ms-optional">(복수 선택 가능)</span></label>
        <div class="ms-chips">
          ${goals.map(opt => `
            <div class="ms-chip ${formData.learning_goal.includes(opt) ? 'selected' : ''}"
                 data-field="learning_goal" data-value="${opt}">
              <span class="ms-chip-check">✓</span>${opt}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ms-field">
        <label class="ms-label">추가로 바라시는 점이 있으신가요? <span class="ms-optional">(선택)</span></label>
        <textarea class="ms-textarea" id="learning_goal_note"
          placeholder="예: 외할머니에게 편지를 쓸 수 있으면 좋겠어요…">${formData.learning_goal_note}</textarea>
      </div>

      <div class="ms-btn-row">
        <button class="ms-btn-back" id="btn-back">← 이전</button>
        <button class="ms-btn-next ${canGoNext() ? '' : 'disabled'}" id="btn-next"
          ${canGoNext() ? '' : 'disabled'} style="flex:1;">다음 →</button>
      </div>
    `;
  };

  const step3Html = () => {
    const countries    = ['미국','캐나다','영국','호주','뉴질랜드','독일','프랑스','싱가포르','일본','기타'];
    const cities       = formData.country && formData.country !== '기타' ? (CITY_MAP[formData.country] || []) : [];
    const showCtryOther = formData.country === '기타';
    const showCitySelect = !!(formData.country && formData.country !== '기타');
    const showCityOther  = formData.city === '기타';

    return `
      <div class="ms-step-header">
        <h1 class="ms-title">어디서, 언제<br/>수업하시나요?</h1>
      </div>

      <div class="ms-field">
        <label class="ms-label">거주 국가</label>
        <select class="ms-select" id="country">
          <option value="" disabled ${!formData.country ? 'selected' : ''}>선택해주세요</option>
          ${countries.map(c => `<option value="${c}" ${formData.country === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <div class="ms-slide-in ${showCtryOther ? 'visible' : ''}">
          <input class="ms-input" id="country_other" type="text"
            placeholder="거주 국가를 직접 입력해 주세요"
            value="${formData.country_other}" />
        </div>
      </div>

      <div class="ms-field">
        <label class="ms-label">도시</label>
        ${showCitySelect ? `
          <select class="ms-select" id="city">
            <option value="" disabled ${!formData.city ? 'selected' : ''}>선택해주세요</option>
            ${cities.map(c => `<option value="${c}" ${formData.city === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        ` : `
          <select class="ms-select" id="city" disabled>
            <option>${showCtryOther ? '국가를 입력해 주세요' : '국가를 먼저 선택해 주세요'}</option>
          </select>
        `}
        <div class="ms-slide-in ${showCityOther ? 'visible' : ''}">
          <input class="ms-input" id="city_other" type="text"
            placeholder="도시를 직접 입력해 주세요"
            value="${formData.city_other}" />
        </div>
      </div>

      <div class="ms-field">
        <label class="ms-label">희망 수업 시간대</label>
        <input class="ms-input" id="preferred_schedule" type="text"
          placeholder="예: 주말 오전, 평일 오후 3시 이후…"
          value="${formData.preferred_schedule}" />
        <p class="ms-hint">입력하신 시간은 한국 시간 기준으로 변환되어 선생님과 매칭됩니다</p>
      </div>

      <div class="ms-btn-row">
        <button class="ms-btn-back" id="btn-back">← 이전</button>
        <button class="ms-btn-next ${canGoNext() ? '' : 'disabled'}" id="btn-next"
          ${canGoNext() ? '' : 'disabled'} style="flex:1;">다음 →</button>
      </div>
    `;
  };

  const step4Html = () => {
    const genderOptions    = ['남자아이', '여자아이'];
    const referralOptions  = ['인스타그램/SNS', '지인 소개', '검색(구글·네이버 등)', '커뮤니티/카페', '기타'];
    return `
      <div class="ms-step-header">
        <h1 class="ms-title">매칭을<br/>시작할게요</h1>
      </div>

      <div class="ms-transition-card">
        작성해주신 내용을 바탕으로 우리 아이에게 꼭 맞는 선생님을 찾아드릴게요.
        마지막으로 연락받으실 정보를 알려주세요.
      </div>

      <div class="ms-field">
        <label class="ms-label">부모님 성함</label>
        <input class="ms-input" id="parent_name" type="text"
          placeholder="성함을 입력해 주세요"
          value="${formData.parent_name}" />
      </div>

      <div class="ms-field">
        <label class="ms-label">아이 이름</label>
        <input class="ms-input" id="child_name" type="text"
          placeholder="선생님이 수업에서 부를 이름이에요"
          value="${formData.child_name}" />
      </div>

      <div class="ms-field">
        <label class="ms-label">이메일 주소</label>
        <input class="ms-input" id="email" type="email"
          placeholder="매칭 결과를 이 이메일 주소로 안내드려요"
          value="${formData.email}" />
      </div>

      <div class="ms-field">
        <label class="ms-label">아이 성별 <span class="ms-optional">(선택)</span></label>
        <div class="ms-chips ms-chips-row">
          ${genderOptions.map(opt => `
            <div class="ms-chip ${formData.child_gender === opt ? 'selected' : ''}"
                 data-field="child_gender" data-value="${opt}">
              <span class="ms-chip-check">✓</span>${opt}
            </div>
          `).join('')}
        </div>
        <p class="ms-hint">선생님 매칭 시 참고합니다</p>
      </div>

      <div class="ms-field">
        <label class="ms-label">어떻게 알게 되셨나요? <span class="ms-optional">(선택)</span></label>
        <select class="ms-select" id="referral_source">
          <option value="" ${!formData.referral_source ? 'selected' : ''}>선택해주세요</option>
          ${referralOptions.map(o => `<option value="${o}" ${formData.referral_source === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>

      <div class="ms-btn-row">
        <button class="ms-btn-back" id="btn-back">← 이전</button>
        <button class="ms-btn-next ${canSubmitFinal() ? '' : 'disabled'}" id="btn-submit"
          ${canSubmitFinal() ? '' : 'disabled'} style="flex:1;">선생님 찾아주세요 →</button>
      </div>
    `;
  };

  const doneHtml = () => `
    <div class="ms-done">
      <div class="ms-done-icon">✓</div>
      <h1 class="ms-done-title">신청이 완료되었어요 🌱</h1>
      <p class="ms-done-body">
        <strong>${formData.child_name}</strong>의 선생님을 찾고 있어요.<br/>
        담당자가 직접 검토한 후 2~3일 내로<br/>
        <strong>${formData.email}</strong> 주소로 연락드릴게요.
      </p>
      <a href="#/" class="ms-btn-next" style="text-decoration:none; display:inline-block; text-align:center; margin-top:32px;">홈으로 돌아가기</a>
    </div>
  `;

  // ─── main render ──────────────────────────────────────────────────────────

  const render = () => {
    const pct = currentStep === 'done' ? 100 : Math.round((currentStep / 4) * 100);

    container.innerHTML = `
      <style>
        /* Override page-container padding */
        .apply-multistep { padding: 0 !important; background: var(--bg-color); }

        /* Top bar */
        .ms-top-bar { display: flex; align-items: center; padding: 20px 20px 0; }
        .ms-back-home {
          background: var(--surface); border: 1px solid var(--border);
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: var(--primary-dark); font-size: 20px;
          box-shadow: var(--shadow-sm); transition: var(--transition);
        }
        .ms-back-home:hover { background: var(--secondary); }

        /* Progress bar */
        .ms-progress-wrap { padding: 20px 20px 0; }
        .ms-progress-label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; }
        .ms-progress-track { height: 6px; background: var(--secondary); border-radius: 3px; overflow: hidden; }
        .ms-progress-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Form card */
        .ms-form-card {
          margin: 20px 16px 40px;
          background: var(--surface); border-radius: var(--radius-lg);
          padding: 28px 24px 32px;
          box-shadow: var(--shadow-sm); border: 1px solid var(--border);
          animation: fadeIn 0.35s ease backwards;
        }

        /* Step header */
        .ms-step-header { margin-bottom: 28px; }
        .ms-title { font-size: 24px; font-weight: 800; color: var(--primary-dark); line-height: 1.35; letter-spacing: -0.5px; }

        /* Fields */
        .ms-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .ms-label { font-size: 14px; font-weight: 700; color: var(--primary-dark); }
        .ms-optional { font-weight: 400; color: var(--text-muted); font-size: 13px; }
        .ms-hint { font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-top: 2px; }

        /* Inputs */
        .ms-select, .ms-input {
          font-family: var(--font-kr); font-size: 16px;
          padding: 14px 16px; width: 100%;
          border-radius: var(--radius-md); border: 1.5px solid var(--border);
          background: var(--bg-color); color: var(--text-main);
          outline: none; transition: var(--transition);
        }
        .ms-select:focus, .ms-input:focus {
          border-color: var(--primary); background: var(--surface);
          box-shadow: 0 0 0 4px rgba(163,130,106,0.1);
        }
        .ms-select:disabled { opacity: 0.45; cursor: not-allowed; }
        .ms-textarea {
          font-family: var(--font-kr); font-size: 15px;
          padding: 14px 16px; width: 100%; min-height: 90px; resize: vertical;
          border-radius: var(--radius-md); border: 1.5px solid var(--border);
          background: var(--bg-color); color: var(--text-main);
          outline: none; transition: var(--transition);
        }
        .ms-textarea:focus {
          border-color: var(--primary); background: var(--surface);
          box-shadow: 0 0 0 4px rgba(163,130,106,0.1);
        }

        /* Chips */
        .ms-chips { display: flex; flex-direction: column; gap: 10px; }
        .ms-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; border-radius: var(--radius-md);
          border: 1.5px solid var(--border); background: var(--bg-color);
          color: var(--text-main); font-size: 14px; font-weight: 500;
          cursor: pointer; transition: var(--transition); user-select: none;
        }
        .ms-chip:active { transform: scale(0.985); }
        .ms-chip.selected {
          border-color: var(--primary); background: #faf4f0;
          color: var(--primary-dark); font-weight: 700;
        }
        .ms-chip-check {
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          border: 1.5px solid var(--border); background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: transparent; transition: var(--transition);
        }
        .ms-chip.selected .ms-chip-check {
          background: var(--primary); border-color: var(--primary); color: white;
        }

        /* Slide-in for 기타 inputs */
        .ms-slide-in {
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 0.35s cubic-bezier(0.25,0.8,0.25,1), opacity 0.3s ease;
        }
        .ms-slide-in.visible { max-height: 70px; opacity: 1; }
        .ms-slide-in .ms-input { margin-top: 8px; }

        /* Buttons */
        .ms-btn-next {
          width: 100%; padding: 16px; border: none; border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white; font-family: var(--font-kr); font-size: 16px; font-weight: 700;
          cursor: pointer; transition: var(--transition); box-shadow: var(--shadow-sm);
        }
        .ms-btn-next:hover:not(.disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .ms-btn-next.disabled { opacity: 0.38; cursor: not-allowed; }
        .ms-btn-back {
          padding: 16px 20px; border-radius: var(--radius-md);
          border: 1px solid var(--border); background: var(--surface);
          color: var(--text-muted); font-family: var(--font-kr);
          font-size: 15px; font-weight: 600; cursor: pointer; transition: var(--transition);
        }
        .ms-btn-back:hover { background: var(--secondary); }
        .ms-btn-row { display: flex; gap: 12px; margin-top: 8px; }

        /* Transition card (step 4 top banner) */
        .ms-transition-card {
          background: linear-gradient(135deg, #fdf6f0, #faf0e8);
          border: 1px solid var(--secondary); border-radius: var(--radius-md);
          padding: 16px 18px; margin-bottom: 28px;
          font-size: 14px; color: var(--primary-dark); line-height: 1.65; font-weight: 500;
        }

        /* Chips row (horizontal for short options like gender) */
        .ms-chips-row { flex-direction: row; }
        .ms-chips-row .ms-chip { flex: 1; justify-content: center; }

        /* Done screen */
        .ms-done { text-align: center; padding: 8px 0 8px; }
        .ms-done-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: var(--success); color: white; font-size: 36px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px; box-shadow: var(--shadow-sm);
        }
        .ms-done-title { font-size: 22px; font-weight: 800; color: var(--primary-dark); margin-bottom: 14px; }
        .ms-done-body { font-size: 15px; color: var(--text-muted); line-height: 1.65; }
      </style>

      <div class="ms-top-bar">
        <a href="#/" class="ms-back-home">←</a>
      </div>

      ${currentStep !== 'done' ? `
        <div class="ms-progress-wrap">
          <div class="ms-progress-label">4단계 중 ${currentStep}단계</div>
          <div class="ms-progress-track">
            <div class="ms-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
      ` : ''}

      <div class="ms-form-card">
        ${currentStep === 1    ? step1Html()
        : currentStep === 2   ? step2Html()
        : currentStep === 3   ? step3Html()
        : currentStep === 4   ? step4Html()
        : doneHtml()}
      </div>
    `;

    attachListeners();
  };

  // ─── event listeners ──────────────────────────────────────────────────────

  const attachListeners = () => {
    // Chip clicks (single-select & multi-select)
    container.querySelectorAll('.ms-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const { field, value } = chip.dataset;
        if (field === 'korean_level') {
          formData.korean_level = value;
        } else if (field === 'learning_goal') {
          const idx = formData.learning_goal.indexOf(value);
          idx > -1 ? formData.learning_goal.splice(idx, 1) : formData.learning_goal.push(value);
        } else if (field === 'child_gender') {
          formData.child_gender = formData.child_gender === value ? '' : value;
        }
        render();
      });
    });

    // Select: child_age
    const elChildAge = container.querySelector('#child_age');
    if (elChildAge) elChildAge.addEventListener('change', e => { formData.child_age = e.target.value; render(); });

    // Textarea: korean_level_note (no re-render needed)
    const elLevelNote = container.querySelector('#korean_level_note');
    if (elLevelNote) elLevelNote.addEventListener('input', e => { formData.korean_level_note = e.target.value; });

    // Textarea: learning_goal_note
    const elGoalNote = container.querySelector('#learning_goal_note');
    if (elGoalNote) elGoalNote.addEventListener('input', e => { formData.learning_goal_note = e.target.value; });

    // Select: country — reset city on change
    const elCountry = container.querySelector('#country');
    if (elCountry) elCountry.addEventListener('change', e => {
      formData.country = e.target.value;
      formData.city = '';
      formData.city_other = '';
      render();
    });

    // Input: country_other
    const elCountryOther = container.querySelector('#country_other');
    if (elCountryOther) elCountryOther.addEventListener('input', e => {
      formData.country_other = e.target.value;
      syncActionBtn();
    });

    // Select: city
    const elCity = container.querySelector('#city');
    if (elCity && !elCity.disabled) elCity.addEventListener('change', e => {
      formData.city = e.target.value;
      formData.city_other = '';
      render();
    });

    // Input: city_other
    const elCityOther = container.querySelector('#city_other');
    if (elCityOther) elCityOther.addEventListener('input', e => {
      formData.city_other = e.target.value;
      syncActionBtn();
    });

    // Input: preferred_schedule
    const elSchedule = container.querySelector('#preferred_schedule');
    if (elSchedule) elSchedule.addEventListener('input', e => {
      formData.preferred_schedule = e.target.value;
      syncActionBtn();
    });

    // Step 4 inputs
    const elParentName = container.querySelector('#parent_name');
    if (elParentName) elParentName.addEventListener('input', e => { formData.parent_name = e.target.value; syncActionBtn(); });

    const elChildName = container.querySelector('#child_name');
    if (elChildName) elChildName.addEventListener('input', e => { formData.child_name = e.target.value; syncActionBtn(); });

    const elEmail = container.querySelector('#email');
    if (elEmail) elEmail.addEventListener('input', e => { formData.email = e.target.value; syncActionBtn(); });

    const elReferral = container.querySelector('#referral_source');
    if (elReferral) elReferral.addEventListener('change', e => { formData.referral_source = e.target.value; });

    // Navigation: next / back
    const btnNext = container.querySelector('#btn-next');
    if (btnNext) btnNext.addEventListener('click', () => {
      if (!btnNext.disabled) { currentStep++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

    const btnBack = container.querySelector('#btn-back');
    if (btnBack) btnBack.addEventListener('click', () => {
      currentStep--;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Submit
    const btnSubmit = container.querySelector('#btn-submit');
    if (btnSubmit) btnSubmit.addEventListener('click', () => {
      if (btnSubmit.disabled) return;
      const payload = { ...formData };
      payload.country = payload.country === '기타' ? payload.country_other : payload.country;
      payload.city    = payload.city    === '기타' ? payload.city_other    : payload.city;
      delete payload.country_other;
      delete payload.city_other;
      saveParentApp(payload);
      currentStep = 'done';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Sync action button without full re-render (used for text inputs)
  const syncActionBtn = () => {
    if (currentStep === 3) {
      const btn = container.querySelector('#btn-next');
      if (!btn) return;
      const ok = canGoNext();
      btn.disabled = !ok;
      btn.classList.toggle('disabled', !ok);
    } else if (currentStep === 4) {
      const btn = container.querySelector('#btn-submit');
      if (!btn) return;
      const ok = canSubmitFinal();
      btn.disabled = !ok;
      btn.classList.toggle('disabled', !ok);
    }
  };

  render();
  return container;
}
