import { saveTeacherApp } from './storage.js';

export function renderTeacherForm() {
  const container = document.createElement('div');
  container.className = 'page-container';

  // ── 상수 ─────────────────────────────────────────────────────────────────────

  const AGE_GROUPS     = ['만 4–5세', '만 6–7세', '초1–2', '초3–4', '초5–6'];
  const TEACH_LEVELS   = ['완전 처음', '자모 단계', '듣기·말하기', '읽기·쓰기', '귀국 준비'];
  const DAYS           = ['월', '화', '수', '목', '금', '토', '일'];
  const TIME_BLOCKS    = [
    { id: 'morning',   label: '오전', range: '09:00–12:00' },
    { id: 'afternoon', label: '오후', range: '13:00–18:00' },
    { id: 'evening',   label: '저녁', range: '19:00–22:00' },
  ];
  const AGREEMENTS = [
    {
      id: 'teaching_policy', required: true,
      title: '수업 운영 원칙 동의',
      text: '한글고리를 통해 배정된 학생과의 모든 수업은 플랫폼이 지정한 화상 채널을 통해 진행하며, 개인 SNS·메신저로 학부모와 직접 연락하거나 플랫폼 외부에서 별도 수업을 운영하지 않습니다.',
    },
    {
      id: 'payment_policy', required: true,
      title: '수업료 및 결제 정책 동의',
      text: '수업료는 한글고리 플랫폼을 통해서만 수수되며, 학부모에게 직접 결제를 요청하지 않습니다. 정산 주기와 수수료율은 플랫폼 운영 정책을 따릅니다.',
    },
    {
      id: 'schedule_policy', required: true,
      title: '일정 변경 및 결석 정책 동의',
      text: '수업 일정 변경 또는 취소가 필요한 경우 최소 24시간 전에 한글고리 운영팀을 통해 요청합니다. 사전 고지 없는 결석 2회 이상 시 파일럿 참여가 중단될 수 있음을 인지합니다.',
    },
    {
      id: 'feedback_policy', required: true,
      title: '수업 후 피드백 제출 동의',
      text: '매 수업 종료 후 24시간 이내에 한글고리가 제공하는 피드백 양식을 작성합니다. 피드백은 학부모 리포트 및 매칭 품질 개선에 활용됩니다.',
    },
    {
      id: 'privacy_policy', required: true,
      title: '아동 보호 및 개인정보 처리 동의',
      text: '수업 중 취득한 아동 및 학부모의 개인정보를 플랫폼 운영 목적 외 제3자에게 제공하거나 별도 수업 홍보에 활용하지 않습니다. 수업 녹화는 학부모의 사전 동의 없이 진행하지 않습니다.',
    },
    {
      id: 'marketing', required: false,
      title: '마케팅 활용 동의',
      text: '한글고리가 서비스 홍보 목적으로 교사 프로필(이름, 경력, 사진)과 수업 후기를 웹사이트 및 SNS에 활용하는 것에 동의합니다. 동의하지 않아도 파일럿 참여에 불이익이 없습니다.',
    },
  ];
  const REQUIRED_IDS = AGREEMENTS.filter(a => a.required).map(a => a.id);

  // ── 상태 ─────────────────────────────────────────────────────────────────────

  const multiSel = {
    age_groups:     new Set(),
    teaching_levels: new Set(),
    available_days:  new Set(),
    time_blocks:     new Set(),
  };

  const optState = {
    trial: false,
    'early-childhood': false,
    'return-student': false,
    english: false,
  };

  const agreeState = {};
  AGREEMENTS.forEach(ag => { agreeState[ag.id] = false; });

  // ── HTML 헬퍼 ─────────────────────────────────────────────────────────────────

  const makeTags = (items, group) => items.map(v =>
    `<button type="button" class="tf-tag" data-group="${group}" data-value="${v}">${v}</button>`
  ).join('');

  const makeDays = () => DAYS.map(d =>
    `<button type="button" class="tf-day-tag" data-group="available_days" data-value="${d}">${d}</button>`
  ).join('');

  const makeTimeBlocks = () => TIME_BLOCKS.map(b =>
    `<button type="button" class="tf-time-block" data-group="time_blocks" data-value="${b.id}">
      <span class="tf-time-label">${b.label}</span>
      <span class="tf-time-range">${b.range}</span>
    </button>`
  ).join('');

  const makeOptRow = (id, label) =>
    `<div class="tf-opt-row" data-opt="${id}" style="user-select:none;">
      <div class="tf-checkbox" id="tf-cb-${id}"></div>
      <span class="tf-check-label">${label}</span>
    </div>`;

  const makeAgreeRow = (ag) =>
    `<div class="tf-agree-row" data-agree="${ag.id}" style="user-select:none;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div class="tf-checkbox" id="tf-cb-${ag.id}" style="margin-top:2px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:600;color:var(--color-text-brand,#4A3728);">${ag.title}</span>
            <span class="tf-badge ${ag.required ? 'req' : 'opt'}">${ag.required ? '필수' : '선택'}</span>
          </div>
          <p style="font-size:12px;color:var(--color-text-sub,#8B6E5A);line-height:1.65;margin:0;">${ag.text}</p>
        </div>
      </div>
    </div>`;

  // ── 렌더 ─────────────────────────────────────────────────────────────────────

  container.innerHTML = `
    <style>
      /* ── 레이아웃 ──────────────────────────────────────────────────────────── */
      .tf-card {
        background: #fff;
        border: 0.5px solid var(--color-surface, #EDE8DF);
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
      }
      .tf-sec-title {
        font-size: 11px;
        font-weight: 500;
        color: var(--color-text-sub, #8B6E5A);
        margin-bottom: 12px;
        letter-spacing: 0.3px;
      }
      .tf-sec-sub {
        font-size: 12px;
        color: var(--color-text-sub, #8B6E5A);
        margin-top: -8px;
        margin-bottom: 14px;
      }
      .tf-field { margin-bottom: 16px; }
      .tf-field:last-child { margin-bottom: 0; }
      /* ── 레이블 ──────────────────────────────────────────────────────────── */
      .tf-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-brand, #4A3728);
        margin-bottom: 7px;
        display: block;
      }
      .tf-opt-label {
        font-size: 11px;
        font-weight: 400;
        color: var(--color-text-sub, #8B6E5A);
        margin-left: 4px;
      }
      /* ── 입력 필드 ───────────────────────────────────────────────────────── */
      .tf-input, .tf-textarea, .tf-select {
        width: 100%;
        box-sizing: border-box;
        padding: 11px 14px;
        border: 0.5px solid #D3D1C7;
        border-radius: 10px;
        font-size: 14px;
        color: var(--color-text-brand, #4A3728);
        background: #fff;
        font-family: var(--font-kr);
        outline: none;
        transition: border-color 0.15s;
      }
      .tf-input:focus, .tf-textarea:focus, .tf-select:focus {
        border-color: var(--color-primary, #B89A6E);
      }
      .tf-textarea {
        min-height: 100px;
        resize: vertical;
      }
      .tf-select {
        appearance: none;
        -webkit-appearance: none;
      }
      /* ── 태그 (텍스트형) ────────────────────────────────────────────────── */
      .tf-tag-group { display: flex; flex-wrap: wrap; gap: 8px; }
      .tf-tag {
        padding: 7px 14px;
        border-radius: 20px;
        border: 0.5px solid var(--color-surface, #EDE8DF);
        background: var(--color-surface, #EDE8DF);
        color: var(--color-text-brand, #4A3728);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s;
        font-family: var(--font-kr);
        user-select: none;
      }
      .tf-tag.selected {
        background: var(--color-primary, #B89A6E);
        border-color: var(--color-primary, #B89A6E);
        color: #fff;
        font-weight: 500;
      }
      /* ── 요일 태그 (원형) ───────────────────────────────────────────────── */
      .tf-day-group { display: flex; gap: 6px; flex-wrap: wrap; }
      .tf-day-tag {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 0.5px solid var(--color-surface, #EDE8DF);
        background: var(--color-surface, #EDE8DF);
        color: var(--color-text-brand, #4A3728);
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        font-family: var(--font-kr);
        user-select: none;
        flex-shrink: 0;
      }
      .tf-day-tag.selected {
        background: var(--color-primary, #B89A6E);
        border-color: var(--color-primary, #B89A6E);
        color: #fff;
        font-weight: 700;
      }
      /* ── 시간 블록 ───────────────────────────────────────────────────────── */
      .tf-time-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .tf-time-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 13px 6px;
        border: 0.5px solid var(--color-surface, #EDE8DF);
        border-radius: 10px;
        cursor: pointer;
        text-align: center;
        background: #fff;
        transition: all 0.15s;
        font-family: var(--font-kr);
        user-select: none;
      }
      .tf-time-block.selected {
        border-color: var(--color-primary, #B89A6E);
        background: var(--color-primary-light, #FAEDE6);
      }
      .tf-time-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-brand, #4A3728);
      }
      .tf-time-range {
        font-size: 11px;
        color: var(--color-text-sub, #8B6E5A);
        margin-top: 3px;
      }
      /* ── 커스텀 체크박스 ─────────────────────────────────────────────────── */
      .tf-checkbox {
        width: 18px;
        height: 18px;
        min-width: 18px;
        border-radius: 4px;
        border: 1.5px solid #D3D1C7;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: transparent;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .tf-checkbox.checked {
        background: var(--color-primary, #B89A6E);
        border-color: var(--color-primary, #B89A6E);
        color: #fff;
      }
      /* ── 추가 옵션 행 ────────────────────────────────────────────────────── */
      .tf-opt-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        cursor: pointer;
        border-bottom: 0.5px solid var(--color-surface, #EDE8DF);
      }
      .tf-opt-row:last-child { border-bottom: none; padding-bottom: 0; }
      .tf-opt-row:first-of-type { padding-top: 0; }
      .tf-check-label {
        font-size: 14px;
        color: var(--color-text-brand, #4A3728);
        line-height: 1.4;
      }
      /* ── 전체 동의 버튼 ──────────────────────────────────────────────────── */
      .tf-agree-all-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 12px 14px;
        border: 0.5px solid var(--color-primary, #B89A6E);
        border-radius: 10px;
        background: var(--color-surface, #EDE8DF);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-brand, #4A3728);
        font-family: var(--font-kr);
        margin-bottom: 10px;
        box-sizing: border-box;
        user-select: none;
        text-align: left;
      }
      /* ── 동의서 항목 행 ──────────────────────────────────────────────────── */
      .tf-agree-row {
        padding: 10px 12px;
        border: 0.5px solid var(--color-surface, #EDE8DF);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .tf-agree-row:last-child { margin-bottom: 0; }
      .tf-agree-row.checked {
        background: var(--color-surface, #EDE8DF);
        border-color: var(--color-primary, #B89A6E);
      }
      /* ── 뱃지 ────────────────────────────────────────────────────────────── */
      .tf-badge {
        font-size: 10px;
        font-weight: 500;
        padding: 2px 7px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .tf-badge.req  { background: #FAEDE6; color: #8c3d16; }
      .tf-badge.opt  { background: var(--color-surface, #EDE8DF); color: var(--color-text-sub, #8B6E5A); }
      /* ── 제출 버튼 ───────────────────────────────────────────────────────── */
      .tf-submit {
        width: 100%;
        padding: 16px;
        background: var(--color-impact, #D4622A);
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        font-family: var(--font-kr);
        transition: opacity 0.2s;
        margin-top: 8px;
        box-sizing: border-box;
      }
      .tf-submit:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    </style>

    <!-- 상단 바 -->
    <div style="padding: 20px 16px 0;">
      <a href="#/" class="back-btn">&larr;</a>
    </div>
    <div style="padding: 20px 16px 12px;">
      <h1 style="font-size:22px;font-weight:800;color:var(--color-text-brand,#4A3728);margin-bottom:6px;letter-spacing:-0.5px;">선생님 등록</h1>
      <p style="font-size:14px;color:var(--color-text-sub,#8B6E5A);line-height:1.5;">해외 아이들에게 따뜻한 한글 선생님이 되어주세요.</p>
    </div>

    <form id="teacher-form" style="padding: 0 16px 80px;">

      <!-- ── 섹션 1: 기본 정보 ──────────────────────────────────────────────── -->
      <div class="tf-card">
        <div class="tf-sec-title">🙋 기본 정보</div>

        <div class="tf-field">
          <label class="tf-label" for="t-name">이름</label>
          <input class="tf-input" type="text" id="t-name" required placeholder="예: 이선생">
        </div>
        <div class="tf-field">
          <label class="tf-label" for="t-email">이메일</label>
          <input class="tf-input" type="email" id="t-email" required placeholder="example@email.com">
        </div>
        <div class="tf-field">
          <label class="tf-label" for="t-country">거주 국가</label>
          <input class="tf-input" type="text" id="t-country" required placeholder="예: 미국, 캐나다, 호주">
        </div>
        <div class="tf-field">
          <label class="tf-label" for="t-kakao">카카오톡 ID <span class="tf-opt-label">선택</span></label>
          <input class="tf-input" type="text" id="t-kakao" placeholder="선택사항 — 운영팀과 빠른 소통에 사용돼요">
        </div>
      </div>

      <!-- ── 섹션 2: 수업 전문성 ────────────────────────────────────────────── -->
      <div class="tf-card">
        <div class="tf-sec-title">📚 수업 전문성</div>

        <div class="tf-field">
          <label class="tf-label" for="t-bio">소개</label>
          <textarea class="tf-textarea" id="t-bio" required placeholder="학부모님과 아이들에게 전하고 싶은 인삿말을 적어주세요"></textarea>
        </div>
        <div class="tf-field">
          <label class="tf-label" for="t-experience">경력</label>
          <textarea class="tf-textarea" id="t-experience" required placeholder="관련 교육 경험, 자격증, 경력 등을 적어주세요"></textarea>
        </div>
        <div class="tf-field">
          <label class="tf-label">가능한 연령대 <span class="tf-opt-label">복수 선택</span></label>
          <div class="tf-tag-group">
            ${makeTags(AGE_GROUPS, 'age_groups')}
          </div>
        </div>
        <div class="tf-field">
          <label class="tf-label">가능한 수업 수준 <span class="tf-opt-label">복수 선택</span></label>
          <div class="tf-tag-group">
            ${makeTags(TEACH_LEVELS, 'teaching_levels')}
          </div>
        </div>
      </div>

      <!-- ── 섹션 3: 수업 가능 시간 ──────────────────────────────────────────── -->
      <div class="tf-card">
        <div class="tf-sec-title">⏰ 수업 가능 시간대</div>
        <p class="tf-sec-sub">거주 국가 현지 시간 기준</p>

        <div class="tf-field">
          <label class="tf-label">가능 요일 <span class="tf-opt-label">복수 선택</span></label>
          <div class="tf-day-group">
            ${makeDays()}
          </div>
        </div>
        <div class="tf-field">
          <label class="tf-label">시간대 <span class="tf-opt-label">복수 선택</span></label>
          <div class="tf-time-grid">
            ${makeTimeBlocks()}
          </div>
        </div>
        <div class="tf-field">
          <label class="tf-label" for="t-weekly">주당 가능 수업 수</label>
          <select class="tf-select" id="t-weekly">
            <option value="">선택해주세요</option>
            <option value="1–2개">1–2개</option>
            <option value="3–4개">3–4개</option>
            <option value="5개 이상">5개 이상</option>
          </select>
        </div>
      </div>

      <!-- ── 섹션 4: 추가 옵션 ──────────────────────────────────────────────── -->
      <div class="tf-card">
        <div class="tf-sec-title">✅ 추가 옵션</div>
        ${makeOptRow('trial',          '시범 수업 가능 (20분 무료 체험)')}
        ${makeOptRow('early-childhood', '유아 수업 경험 있음 (만 4–6세)')}
        ${makeOptRow('return-student',  '귀국 학생 지도 경험 있음')}
        ${makeOptRow('english',         '영어로 설명 가능')}
      </div>

      <!-- ── 섹션 5: 파일럿 동의서 ────────────────────────────────────────────── -->
      <div class="tf-card">
        <div class="tf-sec-title">📋 파일럿 참여 동의서</div>
        <p class="tf-sec-sub">아래 항목을 읽고 동의해주세요</p>

        <button type="button" id="tf-agree-all-btn" class="tf-agree-all-btn">
          <div class="tf-checkbox" id="tf-cb-all"></div>
          전체 동의
        </button>

        <div id="tf-agree-list">
          ${AGREEMENTS.map(makeAgreeRow).join('')}
        </div>
      </div>

      <button type="submit" id="tf-submit" class="tf-submit" disabled>선생님으로 지원하기</button>

    </form>
  `;

  // ── 이벤트: 태그 / 요일 / 시간 블록 ─────────────────────────────────────────

  container.querySelectorAll('.tf-tag, .tf-day-tag, .tf-time-block').forEach(el => {
    el.addEventListener('click', () => {
      const group = el.dataset.group;
      const value = el.dataset.value;
      if (multiSel[group].has(value)) {
        multiSel[group].delete(value);
        el.classList.remove('selected');
      } else {
        multiSel[group].add(value);
        el.classList.add('selected');
      }
    });
  });

  // ── 이벤트: 추가 옵션 체크 ────────────────────────────────────────────────

  container.querySelectorAll('.tf-opt-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.opt;
      optState[id] = !optState[id];
      const cb = container.querySelector(`#tf-cb-${id}`);
      cb.classList.toggle('checked', optState[id]);
      cb.textContent = optState[id] ? '✓' : '';
    });
  });

  // ── 이벤트: 동의서 ────────────────────────────────────────────────────────

  const refreshSubmitBtn = () => {
    const allRequired = REQUIRED_IDS.every(id => agreeState[id]);
    container.querySelector('#tf-submit').disabled = !allRequired;
  };

  const refreshAllCheckBtn = () => {
    const allChecked = AGREEMENTS.every(ag => agreeState[ag.id]);
    const allCb = container.querySelector('#tf-cb-all');
    allCb.classList.toggle('checked', allChecked);
    allCb.textContent = allChecked ? '✓' : '';
  };

  const toggleAgree = (id) => {
    agreeState[id] = !agreeState[id];
    const cb  = container.querySelector(`#tf-cb-${id}`);
    const row = container.querySelector(`[data-agree="${id}"]`);
    if (cb)  { cb.classList.toggle('checked', agreeState[id]); cb.textContent = agreeState[id] ? '✓' : ''; }
    if (row) { row.classList.toggle('checked', agreeState[id]); }
    refreshAllCheckBtn();
    refreshSubmitBtn();
  };

  // 개별 동의 행 클릭
  container.querySelectorAll('.tf-agree-row').forEach(row => {
    row.addEventListener('click', () => toggleAgree(row.dataset.agree));
  });

  // 전체 동의 버튼
  container.querySelector('#tf-agree-all-btn').addEventListener('click', () => {
    const setTo = !AGREEMENTS.every(ag => agreeState[ag.id]); // 하나라도 미체크면 전체 체크
    AGREEMENTS.forEach(ag => {
      agreeState[ag.id] = setTo;
      const cb  = container.querySelector(`#tf-cb-${ag.id}`);
      const row = container.querySelector(`[data-agree="${ag.id}"]`);
      if (cb)  { cb.classList.toggle('checked', setTo); cb.textContent = setTo ? '✓' : ''; }
      if (row) { row.classList.toggle('checked', setTo); }
    });
    refreshAllCheckBtn();
    refreshSubmitBtn();
  });

  // ── 이벤트: 폼 제출 ──────────────────────────────────────────────────────

  container.querySelector('#teacher-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      // 섹션 1
      name:    container.querySelector('#t-name').value,
      email:   container.querySelector('#t-email').value,
      country: container.querySelector('#t-country').value,
      kakao_id: container.querySelector('#t-kakao').value,

      // 섹션 2
      bio:              container.querySelector('#t-bio').value,
      experience:       container.querySelector('#t-experience').value,
      age_groups:       [...multiSel.age_groups],
      teaching_levels:  [...multiSel.teaching_levels],

      // 섹션 3
      available_days:   [...multiSel.available_days],
      time_blocks:      [...multiSel.time_blocks],
      weekly_capacity:  container.querySelector('#t-weekly').value,

      // 섹션 4
      trial_available:              optState['trial'],
      early_childhood_experience:   optState['early-childhood'],
      return_student_experience:    optState['return-student'],
      english_available:            optState['english'],

      // 섹션 5
      agreements: {
        teaching_policy: agreeState.teaching_policy,
        payment_policy:  agreeState.payment_policy,
        schedule_policy: agreeState.schedule_policy,
        feedback_policy: agreeState.feedback_policy,
        privacy_policy:  agreeState.privacy_policy,
        marketing:       agreeState.marketing,
      },

      // 어드민 대시보드 하위 호환 필드
      age_group:      [...multiSel.age_groups].join(', '),
      teaching_level: [...multiSel.teaching_levels].join(', '),
      availability:   [...multiSel.available_days].join(' ') +
                      ([...multiSel.time_blocks].length > 0
                        ? ' / ' + [...multiSel.time_blocks].join(', ')
                        : ''),
    };

    saveTeacherApp(data);
    window.location.hash = '#/success';
  });

  return container;
}
