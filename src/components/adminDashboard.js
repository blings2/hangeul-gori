import { getParentApps, getTeacherApps, updateParentStatus, updateTeacherStatus, updateAdminNote, getMatchByParentId, getTeacherById, saveMatchRecord } from './storage.js';
import { convertToKST, getTimezoneInfo } from '../lib/convertToKST.js';

export function renderAdminDashboard() {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.style.paddingLeft = '16px';
  container.style.paddingRight = '16px';

  let currentTab = 'parents';
  let expandedId = null;

  const STATUS_OPTIONS = ['신규 접수', '검토중', '매칭 진행중', '매칭 완료', '보류'];

  // ── 라벨 맵 ───────────────────────────────────────────────────────────────────

  const LEVEL_LABELS = {
    zero:   '완전 처음 (한글도 몰라요)',
    alpha:  '자모 단계 (가나다 배우는 중)',
    listen: '듣기 위주 (듣는데 말은 어려워요)',
    speak:  '말하기 가능 (간단한 대화 돼요)',
    read:   '읽기·쓰기 (읽고 쓸 수 있어요)',
  };

  const EXPOSURE_LABELS = {
    parents: '부모가 한국어로 말 걸어요',
    books:   '잠자리에서 한국 책 읽어줘요',
    video:   '조부모와 영상통화 해요',
    youtube: '한국 유튜브·TV 봐요',
    lived:   '한국 거주·방문 경험 있어요',
    school:  '한글학교 다닌 적 있어요',
    none:    '노출 거의 없었어요',
  };

  const GOAL_LABELS = {
    listening:    '듣기 이해',
    reading:      '한글 읽기',
    speaking:     '간단한 대화',
    conversation: '자유로운 대화',
    writing:      '받아쓰기·글쓰기',
    books:        '책 스스로 읽기',
    return:       '귀국 학교 적응',
    identity:     '한국 문화 연결',
    elementary:   '초등학교 준비',
    middle:       '중학교 준비',
    topik:        'TOPIK 준비',
    family:       '가족과 소통',
  };

  const TIMEBLOCK_LABELS = {
    morning:   '오전 (08:00–12:00)',
    afternoon: '오후 (12:00–18:00)',
    evening:   '저녁 (18:00–22:00)',
  };

  const PERSONALITY_LABELS = {
    social:   '낯선 어른과도 금방 친해져요',
    shy:      '처음엔 수줍어하는 편이에요',
    playful:  '게임·놀이로 배우는 걸 좋아해요',
    calm:     '차분히 앉아서 배우는 걸 좋아해요',
    musical:  '노래·율동으로 배우면 잘 따라해요',
    active:   '집중 시간이 짧은 편이에요',
  };

  const TEACHER_TIMEBLOCK_LABELS = {
    morning:   '오전 (09:00–12:00)',
    afternoon: '오후 (13:00–18:00)',
    evening:   '저녁 (19:00–22:00)',
  };

  const AGREE_LABELS = {
    teaching_policy: '수업 운영 원칙',
    payment_policy:  '결제 정책',
    schedule_policy: '일정 변경 정책',
    feedback_policy: '피드백 제출',
    privacy_policy:  '아동 보호·개인정보',
    marketing:       '마케팅 활용 (선택)',
  };

  const REQUIRED_AGREE_IDS = ['teaching_policy', 'payment_policy', 'schedule_policy', 'feedback_policy', 'privacy_policy'];

  // ── 헬퍼 ─────────────────────────────────────────────────────────────────────

  const lbl = (map, key) => (key ? (map[key] || key) : '-');

  const tags = (arr, map = {}) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>';
    return arr.map(v => `<span class="adm-tag">${map[v] || v}</span>`).join('');
  };

  const render = async () => {
    const isParents = currentTab === 'parents';
    const data = isParents ? await getParentApps() : getTeacherApps();
    const teachersList = getTeacherApps(); // For matching dropdown

    container.innerHTML = `
      <style>
        /* ── 카드 기본 ──────────────────────────────────────────────────────── */
        .adm-card {
          background: #fff;
          border: 0.5px solid var(--color-surface, #EDE8DF);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 12px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .adm-card.expanded {
          border-color: var(--color-impact, #D4622A);
          cursor: default;
        }
        /* ── 카드 헤더 ──────────────────────────────────────────────────────── */
        .adm-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .adm-card-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-brand, #4A3728);
          margin-bottom: 3px;
        }
        .adm-card-date {
          font-size: 12px;
          color: var(--color-text-sub, #8B6E5A);
        }
        .adm-status-select {
          border: 0.5px solid var(--color-surface, #EDE8DF);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-brand, #4A3728);
          background: var(--color-surface, #EDE8DF);
          cursor: pointer;
          flex-shrink: 0;
          width: fit-content;
          min-width: 100px;
          max-width: 140px;
          outline: none;
          font-family: var(--font-kr);
        }
        .adm-card-hint {
          text-align: center;
          margin-top: 10px;
          color: var(--color-text-sub, #8B6E5A);
          font-size: 12px;
        }
        /* ── 섹션 ────────────────────────────────────────────────────────────── */
        .adm-section {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--color-surface, #EDE8DF);
        }
        .adm-section-title {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-text-sub, #8B6E5A);
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }
        /* ── 그리드 2열 ──────────────────────────────────────────────────────── */
        .adm-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 12px;
          margin-bottom: 4px;
        }
        .adm-cell-label {
          color: var(--color-text-sub, #8B6E5A);
          font-size: 11px;
          margin-bottom: 1px;
        }
        .adm-cell-value {
          color: var(--color-text-brand, #4A3728);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
        }
        /* ── 태그 ────────────────────────────────────────────────────────────── */
        .adm-tag {
          display: inline-block;
          background: var(--color-surface, #EDE8DF);
          color: var(--color-text-brand, #4A3728);
          border-radius: 12px;
          padding: 3px 10px;
          font-size: 11px;
          margin: 2px 2px 2px 0;
        }
        /* ── 특수 표시 ───────────────────────────────────────────────────────── */
        .adm-kst {
          display: inline-block;
          background: var(--color-primary-light, #FAEDE6);
          color: var(--color-impact, #D4622A);
          font-weight: 500;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          margin-top: 6px;
        }
        .adm-manual-badge {
          display: inline-block;
          background: #FFF3CD;
          color: #856404;
          border-radius: 8px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          margin-top: 4px;
        }
        .adm-level-value {
          font-size: 13px;
          color: var(--color-text-brand, #4A3728);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .adm-sub-answer {
          font-size: 12px;
          color: var(--color-text-sub, #8B6E5A);
          margin-bottom: 8px;
          font-style: italic;
        }
      </style>

      <div class="top-bar">
        <a href="#/" class="back-btn">&larr;</a>
      </div>
      <div class="admin-header">
        <h1 class="title">운영자 대시보드</h1>
        <p class="subtitle">모든 신청 내역과 매칭 상태를 관리할 수 있습니다.</p>
      </div>

      <div class="tabs">
        <button class="tab-btn ${isParents ? 'active' : ''}" id="tab-parents">학부모 신청</button>
        <button class="tab-btn ${!isParents ? 'active' : ''}" id="tab-teachers">선생님 지원</button>
      </div>

      <div class="list-container">
        ${data.length === 0 ? '<p style="text-align:center; color: var(--text-muted); margin-top: 40px;">현재 접수된 내역이 없습니다.</p>' : ''}
        ${data.map(item => {

          let statusClass = '';
          if (item.status === '매칭 완료') statusClass = 'matched';
          else if (item.status === '보류') statusClass = 'completed';
          else if (item.status === '매칭 진행중') statusClass = 'pending-match';

          const dateOnly = item.created_at
            ? new Date(item.created_at).toLocaleDateString('ko-KR')
            : '-';
          const isExpanded = expandedId === item.id;

          let detailsHtml = '';

          if (isExpanded) {
            if (isParents) {

              // ── 매칭 UI (섹션 8에서 사용) ──────────────────────────────────
              const currentMatch = getMatchByParentId(item.id);
              let teacherSelectOptions = '<option value="">선생님 선택 안함</option>';
              teachersList.forEach(t => {
                const selected = (currentMatch && currentMatch.teacher_profile_id === t.id) ? 'selected' : '';
                teacherSelectOptions += `<option value="${t.id}" ${selected}>${t.name} (거주: ${t.country})</option>`;
              });
              const matchUI = `
                <div style="background:var(--bg-color);padding:14px;border-radius:8px;border:1px solid var(--border);">
                  <div style="font-size:13px;font-weight:600;color:var(--color-text-brand,#4A3728);margin-bottom:8px;">선생님 연결</div>
                  <div style="display:flex;gap:8px;">
                    <select class="match-select" id="match-select-${item.id}" style="flex:1;">
                      ${teacherSelectOptions}
                    </select>
                    <button class="btn-submit btn-match-save" data-id="${item.id}" style="margin:0;padding:8px 16px;">연결</button>
                  </div>
                  ${currentMatch ? `<p style="margin-top:8px;font-size:13px;color:var(--success);">✅ ${getTeacherById(currentMatch.teacher_profile_id)?.name} 선생님과 연결됨</p>` : ''}
                </div>
              `;

              // goals: 신규(item.goals) + 레거시(item.learning_goal) 양쪽 처리
              const goalsArr = Array.isArray(item.goals) && item.goals.length > 0
                ? item.goals
                : (Array.isArray(item.learning_goal) ? item.learning_goal
                    : (item.learning_goal ? [item.learning_goal] : []));

              // ── 섹션 1: 🧒 아이 정보 ────────────────────────────────────────
              const sec1 = `
                <div class="adm-section">
                  <div class="adm-section-title">🧒 아이 정보</div>
                  <div class="adm-grid2">
                    <div><div class="adm-cell-label">이름</div><div class="adm-cell-value">${item.child_name || '-'}</div></div>
                    <div><div class="adm-cell-label">나이</div><div class="adm-cell-value">${item.child_age || '-'}</div></div>
                    <div><div class="adm-cell-label">성별</div><div class="adm-cell-value">${item.child_gender || '-'}</div></div>
                    <div><div class="adm-cell-label">가정 언어</div><div class="adm-cell-value">${item.home_language || '-'}</div></div>
                    <div><div class="adm-cell-label">부모 한국어</div><div class="adm-cell-value">${item.parent_korean || '-'}</div></div>
                  </div>
                </div>
              `;

              // ── 섹션 2: 🗣️ 한국어 실력 ──────────────────────────────────────
              const sec2 = `
                <div class="adm-section">
                  <div class="adm-section-title">🗣️ 한국어 실력</div>
                  <div class="adm-level-value">${lbl(LEVEL_LABELS, item.korean_level)}</div>
                  ${item.korean_level_sub_answer ? `<div class="adm-sub-answer">↳ ${item.korean_level_sub_answer}</div>` : ''}
                  <div>${tags(item.korean_exposure, EXPOSURE_LABELS)}</div>
                </div>
              `;

              // ── 섹션 3: 🎯 수업 목표 ─────────────────────────────────────────
              const sec3 = `
                <div class="adm-section">
                  <div class="adm-section-title">🎯 수업 목표</div>
                  <div>${tags(goalsArr, GOAL_LABELS)}</div>
                </div>
              `;

              // ── 섹션 4: ⏰ 수업 환경 ─────────────────────────────────────────
              const locationStr = [
                item.country,
                item.city && item.city !== item.country ? item.city : null,
              ].filter(Boolean).join(' / ');
              const sec4 = `
                <div class="adm-section">
                  <div class="adm-section-title">⏰ 수업 환경</div>
                  <div class="adm-grid2" style="margin-bottom:8px;">
                    <div><div class="adm-cell-label">거주지</div><div class="adm-cell-value">${locationStr || '-'}</div></div>
                    <div><div class="adm-cell-label">수업 빈도</div><div class="adm-cell-value">${item.frequency || '-'}</div></div>
                  </div>
                  <div class="adm-cell-label" style="margin-bottom:4px;">희망 시간대 (현지)</div>
                  <div>${tags(item.time_blocks, TIMEBLOCK_LABELS)}</div>
                  ${item.kst_summary ? `<div class="adm-kst">🇰🇷 KST ${item.kst_summary}</div>` : ''}
                  ${item.is_manual ? `<div class="adm-manual-badge">⚠️ 담당자 시간 확인 필요</div>` : ''}
                </div>
              `;

              // ── 섹션 5: 👩‍🏫 선생님 선호 (있을 때만) ────────────────────────
              const sec5 = Array.isArray(item.teacher_prefs) && item.teacher_prefs.length > 0 ? `
                <div class="adm-section">
                  <div class="adm-section-title">👩‍🏫 선생님 선호</div>
                  <div>${tags(item.teacher_prefs)}</div>
                </div>
              ` : '';

              // ── 섹션 6: 🧠 아이 성향 (있을 때만) ────────────────────────────
              const sec6 = Array.isArray(item.personality) && item.personality.length > 0 ? `
                <div class="adm-section">
                  <div class="adm-section-title">🧠 아이 성향</div>
                  <div>${tags(item.personality, PERSONALITY_LABELS)}</div>
                </div>
              ` : '';

              // ── 섹션 7: 📬 연락처 ────────────────────────────────────────────
              const sec7 = `
                <div class="adm-section">
                  <div class="adm-section-title">📬 연락처</div>
                  <div class="adm-grid2">
                    <div>
                      <div class="adm-cell-label">이메일</div>
                      <div class="adm-cell-value">
                        <a href="mailto:${item.email}" style="color:var(--color-impact,#D4622A);word-break:break-all;">${item.email || '-'}</a>
                      </div>
                    </div>
                    <div>
                      <div class="adm-cell-label">유입경로</div>
                      <div class="adm-cell-value">${item.referral_source || '-'}</div>
                    </div>
                  </div>
                </div>
              `;

              // ── 섹션 8: 🔗 선생님 연결 ───────────────────────────────────────
              const sec8 = `
                <div class="adm-section">
                  <div class="adm-section-title">🔗 선생님 연결</div>
                  ${matchUI}
                </div>
              `;

              // ── 섹션 9: 📝 운영자 메모 ───────────────────────────────────────
              const sec9 = `
                <div class="adm-section">
                  <div class="adm-section-title">📝 운영자 메모</div>
                  <textarea id="memo-${item.id}" style="width:100%;min-height:60px;font-size:14px;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:var(--font-kr);">${item.admin_note || ''}</textarea>
                  <button class="btn-submit btn-save-memo" data-id="${item.id}" data-type="parent" style="margin-top:8px;padding:8px 16px;width:100%;">메모 저장</button>
                </div>
              `;

              detailsHtml = sec1 + sec2 + sec3 + sec4 + sec5 + sec6 + sec7 + sec8 + sec9;

            } else {
              // ── 선생님 탭: 리뉴얼 렌더링 ────────────────────────────────────

              const tTag = (arr) => {
                if (!Array.isArray(arr) || arr.length === 0)
                  return '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>';
                return arr.map(v => `<span class="adm-tag">${v}</span>`).join('');
              };
              const tTagMapped = (arr, map) => {
                if (!Array.isArray(arr) || arr.length === 0)
                  return '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>';
                return arr.map(v => `<span class="adm-tag">${map[v] || v}</span>`).join('');
              };

              // ── 섹션 1: 기본 정보 ──────────────────────────────────────────
              const tsec1 = `
                <div class="adm-section">
                  <div class="adm-section-title">📋 기본 정보</div>
                  <div class="adm-grid2">
                    <div><div class="adm-cell-label">거주지</div><div class="adm-cell-value">${item.country || '-'}</div></div>
                    <div><div class="adm-cell-label">이메일</div><div class="adm-cell-value"><a href="mailto:${item.email}" style="color:var(--color-impact,#D4622A);word-break:break-all;font-size:12px;">${item.email || '-'}</a></div></div>
                    ${item.kakao_id ? `<div style="grid-column:1/-1;"><div class="adm-cell-label">카카오톡 ID</div><div class="adm-cell-value">${item.kakao_id}</div></div>` : ''}
                  </div>
                </div>
              `;

              // ── 섹션 2: 수업 전문성 ────────────────────────────────────────
              const ageDisplay = Array.isArray(item.age_groups) && item.age_groups.length > 0
                ? tTag(item.age_groups)
                : (item.age_group ? `<span class="adm-tag">${item.age_group}</span>` : '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>');
              const levelDisplay = Array.isArray(item.teaching_levels) && item.teaching_levels.length > 0
                ? tTag(item.teaching_levels)
                : (item.teaching_level ? `<span class="adm-tag">${item.teaching_level}</span>` : '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>');
              const tsec2 = `
                <div class="adm-section">
                  <div class="adm-section-title">📚 수업 전문성</div>
                  <div style="margin-bottom:8px;">
                    <div class="adm-cell-label" style="margin-bottom:4px;">가능 연령대</div>
                    <div>${ageDisplay}</div>
                  </div>
                  <div style="margin-bottom:10px;">
                    <div class="adm-cell-label" style="margin-bottom:4px;">수업 수준</div>
                    <div>${levelDisplay}</div>
                  </div>
                  ${item.bio ? `<div style="margin-bottom:8px;"><div class="adm-cell-label" style="margin-bottom:4px;">소개</div><div style="font-size:13px;color:var(--color-text-brand,#4A3728);line-height:1.6;white-space:pre-wrap;background:var(--bg-color);padding:10px 12px;border-radius:8px;">${item.bio}</div></div>` : ''}
                  ${item.experience ? `<div><div class="adm-cell-label" style="margin-bottom:4px;">경력</div><div style="font-size:13px;color:var(--color-text-brand,#4A3728);line-height:1.6;white-space:pre-wrap;background:var(--bg-color);padding:10px 12px;border-radius:8px;">${item.experience}</div></div>` : ''}
                </div>
              `;

              // ── 섹션 3: 수업 가능 시간 ────────────────────────────────────
              const daysDisplay = Array.isArray(item.available_days) && item.available_days.length > 0
                ? tTag(item.available_days)
                : (item.availability ? `<span class="adm-tag">${item.availability}</span>` : '<span style="color:var(--color-text-sub,#8B6E5A);font-size:12px;">-</span>');
              const tsec3 = `
                <div class="adm-section">
                  <div class="adm-section-title">⏰ 수업 가능 시간</div>
                  <div class="adm-grid2" style="margin-bottom:8px;">
                    <div>
                      <div class="adm-cell-label">가능 요일</div>
                      <div style="margin-top:4px;">${daysDisplay}</div>
                    </div>
                    <div>
                      <div class="adm-cell-label">주당 수업 수</div>
                      <div class="adm-cell-value">${item.weekly_capacity || '-'}</div>
                    </div>
                  </div>
                  <div class="adm-cell-label" style="margin-bottom:4px;">시간대</div>
                  <div>${tTagMapped(item.time_blocks, TEACHER_TIMEBLOCK_LABELS)}</div>
                </div>
              `;

              // ── 섹션 4: 추가 옵션 ─────────────────────────────────────────
              const optItems = [
                { key: 'trial_available',            label: '시범 수업 가능' },
                { key: 'early_childhood_experience', label: '유아 수업 경험' },
                { key: 'return_student_experience',  label: '귀국 학생 경험' },
                { key: 'english_available',          label: '영어 설명 가능' },
              ].filter(o => item[o.key]);
              const tsec4 = optItems.length > 0 ? `
                <div class="adm-section">
                  <div class="adm-section-title">✅ 추가 옵션</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${optItems.map(o => `<span class="adm-tag">✓ ${o.label}</span>`).join('')}
                  </div>
                </div>
              ` : '';

              // ── 섹션 5: 동의서 체결 현황 ──────────────────────────────────
              let tsec5 = '';
              if (item.agreements && typeof item.agreements === 'object') {
                const allRequired = REQUIRED_AGREE_IDS.every(id => item.agreements[id]);
                const badge = allRequired
                  ? `<span style="display:inline-block;background:#E1F5EE;color:#0F6E56;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;margin-bottom:10px;">동의서 완료</span>`
                  : `<span style="display:inline-block;background:#FAEDE6;color:#8c3d16;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;margin-bottom:10px;">동의서 미완료</span>`;
                const agreeRows = Object.entries(AGREE_LABELS).map(([id, label]) => {
                  const checked = !!item.agreements[id];
                  return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:4px;">
                    <span style="color:${checked ? '#1D9E75' : '#C0B8B0'};font-weight:700;">${checked ? '✓' : '—'}</span>
                    <span style="color:${checked ? 'var(--color-text-brand,#4A3728)' : 'var(--color-text-sub,#8B6E5A)'};">${label}</span>
                  </div>`;
                }).join('');
                tsec5 = `
                  <div class="adm-section">
                    <div class="adm-section-title">📋 동의서 체결 현황</div>
                    ${badge}
                    ${agreeRows}
                  </div>
                `;
              }

              // ── 섹션 6: 운영자 메모 (기존 유지) ───────────────────────────
              const tsec6 = `
                <div class="adm-section">
                  <div class="adm-section-title">📝 운영자 메모</div>
                  <textarea id="memo-${item.id}" style="width:100%;min-height:60px;font-size:14px;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:var(--font-kr);">${item.admin_note || ''}</textarea>
                  <button class="btn-submit btn-save-memo" data-id="${item.id}" data-type="teacher" style="margin-top:8px;padding:8px 16px;width:100%;">메모 저장</button>
                </div>
              `;

              detailsHtml = tsec1 + tsec2 + tsec3 + tsec4 + tsec5 + tsec6;
            }
          }

          let statusOptionsHtml = STATUS_OPTIONS.map(opt =>
            `<option value="${opt}" ${item.status === opt ? 'selected' : ''}>${opt}</option>`
          ).join('');

          if (isParents) {
            return `
              <div class="adm-card ${isExpanded ? 'expanded' : ''}" data-card-id="${item.id}">
                <div class="adm-card-header">
                  <div>
                    <div class="adm-card-name">${item.parent_name || '-'}</div>
                    <div class="adm-card-date">${dateOnly}</div>
                  </div>
                  <select class="status-select adm-status-select ${statusClass}" data-id="${item.id}" onclick="event.stopPropagation()">
                    ${statusOptionsHtml}
                  </select>
                </div>
                <div onclick="event.stopPropagation()">
                  ${detailsHtml}
                </div>
                ${!isExpanded ? '<div class="adm-card-hint">클릭하여 자세히 보기</div>' : ''}
              </div>
            `;
          } else {
            return `
              <div class="adm-card ${isExpanded ? 'expanded' : ''}" data-card-id="${item.id}">
                <div class="adm-card-header">
                  <div>
                    <div class="adm-card-name">${item.name || '-'} <span style="font-size:12px;font-weight:400;color:var(--color-text-sub,#8B6E5A);">(선생님)</span></div>
                    <div class="adm-card-date">${dateOnly}</div>
                  </div>
                  <select class="status-select adm-status-select ${statusClass}" data-id="${item.id}" onclick="event.stopPropagation()">
                    ${statusOptionsHtml}
                  </select>
                </div>
                <div onclick="event.stopPropagation()">
                  ${detailsHtml}
                </div>
                ${!isExpanded ? '<div class="adm-card-hint">클릭하여 자세히 보기</div>' : ''}
              </div>
            `;
          }
        }).reverse().join('')}
      </div>
    `;

    // ── 이벤트 리스너 ─────────────────────────────────────────────────────────

    container.querySelector('#tab-parents').addEventListener('click', async () => {
      currentTab = 'parents'; expandedId = null; await render();
    });
    container.querySelector('#tab-teachers').addEventListener('click', async () => {
      currentTab = 'teachers'; expandedId = null; await render();
    });

    // 상태 변경
    container.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        const id = e.target.dataset.id;
        if (isParents) await updateParentStatus(id, newStatus);
        else updateTeacherStatus(id, newStatus);
        await render();
      });
    });

    // 카드 펼치기 / 접기
    container.querySelectorAll('.adm-card, .list-item').forEach(card => {
      card.addEventListener('click', async () => {
        const id = card.dataset.cardId;
        expandedId = expandedId === id ? null : id;
        await render();
      });
    });

    // 메모 저장
    container.querySelectorAll('.btn-save-memo').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const note = container.querySelector('#memo-' + id).value;
        await updateAdminNote(type, id, note);
        alert('메모가 저장되었습니다.');
      });
    });

    // 선생님 연결 (매칭)
    container.querySelectorAll('.btn-match-save').forEach(btn => {
      btn.addEventListener('click', async () => {
        const parentId = btn.dataset.id;
        const teacherId = container.querySelector('#match-select-' + parentId).value;
        if (teacherId) {
          saveMatchRecord(parentId, teacherId, '');
          await updateParentStatus(parentId, '매칭 완료');
          alert('선생님이 성공적으로 연결되었습니다.');
        } else {
          alert('선생님을 선택해주세요.');
        }
        await render();
      });
    });
  };

  render().catch(e => console.error('[admin] render failed:', e));
  return container;
}
