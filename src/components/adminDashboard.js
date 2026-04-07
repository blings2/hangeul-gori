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

  const render = () => {
    const isParents = currentTab === 'parents';
    const data = isParents ? getParentApps() : getTeacherApps();
    const teachersList = getTeacherApps(); // For matching dropdown
    
    container.innerHTML = `
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
        ` + (data.length === 0 ? '<p style="text-align:center; color: var(--text-muted); margin-top: 40px;">현재 접수된 내역이 없습니다.</p>' : '') + `
        ` + data.map(item => {
          
          let statusClass = '';
          if(item.status === '매칭 완료') statusClass = 'matched';
          else if(item.status === '보류') statusClass = 'completed';
          else if(item.status === '매칭 진행중') statusClass = 'pending-match';
          
          const displayDate = new Date(item.created_at).toLocaleString();
          const isExpanded = expandedId === item.id;
          
          let detailsHtml = '';
          let matchUI = '';

          if (isExpanded) {
            if (isParents) {
              const currentMatch = getMatchByParentId(item.id);
              let teacherSelectOptions = '<option value="">선생님 선택 안함</option>';
              teachersList.forEach(t => {
                const selected = (currentMatch && currentMatch.teacher_profile_id === t.id) ? 'selected' : '';
                teacherSelectOptions += `<option value="${t.id}" ${selected}>${t.name} (거주: ${t.country})</option>`;
              });

              matchUI = `
                <div style="background:var(--bg-color); padding:16px; border-radius:8px; margin-top:16px; border:1px solid var(--border);">
                  <strong style="display:block; margin-bottom:8px;">선생님 연결 (매칭)</strong>
                  <div style="display:flex; gap:8px;">
                    <select class="match-select" id="match-select-${item.id}" style="flex:1;">
                      ${teacherSelectOptions}
                    </select>
                    <button class="btn-submit btn-match-save" data-id="${item.id}" style="margin:0; padding:8px 16px;">연결</button>
                  </div>
                  ${currentMatch ? `<p style="margin-top:8px; font-size:13px; color:var(--success);">✅ ${getTeacherById(currentMatch.teacher_profile_id)?.name} 선생님과 연결됨</p>` : ''}
                </div>
              `;

              detailsHtml = `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border);">
                  <p><strong>거주지:</strong> ${item.country}</p>
                  <p><strong>이메일:</strong> <a href="mailto:${item.email}" style="color:var(--primary);">${item.email}</a></p>
                  <p><strong>자녀정보:</strong> ${item.child_name || '-'} (${item.child_age || '-'})</p>
                  <p><strong>한글수준:</strong> ${item.korean_level}</p>
                  <p><strong>수업목표:</strong> ${item.learning_goal}</p>
                  ${item.available_days?.length > 0 ? (() => {
                    const tzInfo = getTimezoneInfo(item.local_timezone || '');
                    const slots  = convertToKST(item.available_days, item.available_times || [], item.local_timezone || '');
                    const tzLabel = tzInfo
                      ? `${tzInfo.city} (${tzInfo.abbr}, ${tzInfo.offsetStr})`
                      : (item.local_timezone || '');
                    const rows = slots.map(s => `
                      <tr>
                        <td style="padding:4px 8px 4px 0; font-size:13px; white-space:nowrap;">${s.local}</td>
                        <td style="padding:4px 0 4px 12px; font-size:13px; white-space:nowrap; border-left:1px solid var(--border);">${s.kst} KST</td>
                      </tr>
                    `).join('');
                    return `
                      <div style="margin:8px 0;">
                        <strong>희망 수업 시간</strong>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${tzLabel}</div>
                        <table style="border-collapse:collapse; margin-top:6px; width:100%;">
                          <thead>
                            <tr>
                              <th style="padding:4px 8px 4px 0; font-size:11px; color:var(--text-muted); font-weight:600; text-align:left;">현지 시간</th>
                              <th style="padding:4px 0 4px 12px; font-size:11px; color:var(--text-muted); font-weight:600; text-align:left; border-left:1px solid var(--border);">한국 시간 (KST)</th>
                            </tr>
                          </thead>
                          <tbody>${rows}</tbody>
                        </table>
                      </div>
                    `;
                  })() : `<p><strong>희망시간:</strong> ${item.preferred_schedule || '이전 형식'}</p>`}
                  ${item.note ? `<p style="margin-top:8px;"><strong>요청사항:</strong></p><div style="white-space: pre-wrap; background: var(--bg-color); padding: 8px; border-radius: 8px; margin-top:4px; font-size:13px;">${item.note}</div>` : ''}
                  
                  ${matchUI}
                  
                  <div style="margin-top:16px;">
                    <label style="display:block; margin-bottom:4px; font-size:14px; font-weight:600;">운영자 메모</label>
                    <textarea id="memo-${item.id}" style="width:100%; min-height:60px; font-size:14px; padding:8px;">${item.admin_note || ''}</textarea>
                    <button class="btn-submit btn-save-memo" data-id="${item.id}" data-type="parent" style="margin-top:8px; padding: 8px 16px; width:100%;">메모 저장</button>
                  </div>
                </div>
              `;
            } else {
              detailsHtml = `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border);">
                  <p><strong>거주지:</strong> ${item.country}</p>
                  <p><strong>이메일:</strong> <a href="mailto:${item.email}" style="color:var(--primary);">${item.email}</a></p>
                  <p><strong>가능연령:</strong> ${item.age_group}</p>
                  <p><strong>수업수준:</strong> ${item.teaching_level}</p>
                  <p><strong>가능시간:</strong> ${item.availability}</p>
                  <p><strong>시범수업 가능:</strong> ${item.trial_available ? '✅ 예' : '❌ 아니오'} | <strong>유아수업 경험:</strong> ${item.early_childhood_experience ? '✅ 예' : '❌ 아니오'}</p>
                  
                  <div style="margin-top:8px">
                    <strong>소개:</strong>
                    <div style="white-space: pre-wrap; background: var(--bg-color); padding: 8px; border-radius: 8px; margin-top:4px; font-size:13px;">${item.bio}</div>
                  </div>
                  <div style="margin-top:8px">
                    <strong>경력:</strong>
                    <div style="white-space: pre-wrap; background: var(--bg-color); padding: 8px; border-radius: 8px; margin-top:4px; font-size:13px;">${item.experience}</div>
                  </div>

                  <div style="margin-top:16px;">
                    <label style="display:block; margin-bottom:4px; font-size:14px; font-weight:600;">운영자 메모</label>
                    <textarea id="memo-${item.id}" style="width:100%; min-height:60px; font-size:14px; padding:8px;">${item.admin_note || ''}</textarea>
                    <button class="btn-submit btn-save-memo" data-id="${item.id}" data-type="teacher" style="margin-top:8px; padding: 8px 16px; width:100%;">메모 저장</button>
                  </div>
                </div>
              `;
            }
          }

          let statusOptionsHtml = STATUS_OPTIONS.map(opt => `<option value="${opt}" ${item.status === opt ? 'selected' : ''}>${opt}</option>`).join('');

          return `
            <div class="list-item" style="padding: 16px; cursor: pointer; border-color: ${isExpanded ? 'var(--primary-dark)' : 'var(--border)'};" data-card-id="${item.id}">
              <div class="list-item-header" style="margin-bottom: ${isExpanded ? '12px' : '0'}; border-bottom: none; padding-bottom: 0;">
                <div>
                  <div class="list-item-title">${isParents ? item.parent_name + ' (부모님)' : item.name + ' (선생님)'}</div>
                  <div class="list-item-date">접수일: ${displayDate.split(' ')[0]}</div>
                </div>
                <select class="status-select status-badge ${statusClass}" data-id="${item.id}" style="border:none; outline:none; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation()">
                  ${statusOptionsHtml}
                </select>
              </div>
              <div class="list-item-details" onclick="event.stopPropagation()">
                ${detailsHtml}
              </div>
              ${!isExpanded ? '<div style="text-align:center; margin-top:8px; color:var(--text-muted); font-size:12px;">클릭하여 자세히 보기</div>' : ''}
            </div>
          `;
        }).reverse().join('') + `
      </div>
    `;

    // Event Listeners
    container.querySelector('#tab-parents').addEventListener('click', () => { currentTab = 'parents'; expandedId = null; render(); });
    container.querySelector('#tab-teachers').addEventListener('click', () => { currentTab = 'teachers'; expandedId = null; render(); });
    
    // Status Change
    container.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        const id = e.target.dataset.id;
        if (isParents) updateParentStatus(id, newStatus);
        else updateTeacherStatus(id, newStatus);
        render(); // re-render to update badges
      });
    });

    // Expand Card
    container.querySelectorAll('.list-item').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.cardId;
        expandedId = expandedId === id ? null : id; // toggle
        render();
      });
    });

    // Save Memo
    container.querySelectorAll('.btn-save-memo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const note = container.querySelector('#memo-' + id).value;
        updateAdminNote(type, id, note);
        alert('메모가 저장되었습니다.');
      });
    });

    // Match Teacher
    container.querySelectorAll('.btn-match-save').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const parentId = btn.dataset.id;
        const teacherId = container.querySelector('#match-select-' + parentId).value;
        if (teacherId) {
          saveMatchRecord(parentId, teacherId, '');
          updateParentStatus(parentId, '매칭 완료');
          alert('선생님이 성공적으로 연결되었습니다.');
        } else {
          alert('선생님을 선택해주세요.');
        }
        render();
      });
    });
  };

  render();
  return container;
}
