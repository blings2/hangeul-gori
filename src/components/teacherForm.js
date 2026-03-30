import { saveTeacherApp } from './storage.js';

export function renderTeacherForm() {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.innerHTML = `
    <div class="top-bar">
      <a href="#/" class="back-btn">&larr;</a>
    </div>
    <div class="admin-header">
      <h1 class="title">선생님 지원</h1>
      <p class="subtitle">해외 아이들에게 따뜻한 한글 선생님이 되어주세요.</p>
    </div>
    
    <form id="teacher-form">
      <div class="form-group">
        <label for="t-name">이름</label>
        <input type="text" id="t-name" required placeholder="예: 이선생">
      </div>
      <div class="form-group">
        <label for="t-email">이메일</label>
        <input type="email" id="t-email" required placeholder="example@email.com">
      </div>
      <div class="form-group">
        <label for="t-country">거주 국가</label>
        <input type="text" id="t-country" required placeholder="예: 한국">
      </div>
      
      <div class="form-group">
        <label for="t-bio">소개</label>
        <textarea id="t-bio" required placeholder="학부모님과 아이들에게 전하고 싶은 인삿말을 적어주세요."></textarea>
      </div>
      <div class="form-group">
        <label for="t-experience">경력</label>
        <textarea id="t-experience" required placeholder="관련 교육 경험, 경력 등을 적어주세요."></textarea>
      </div>

      <div class="form-group">
        <label for="t-age-group">가능한 연령대</label>
        <input type="text" id="t-age-group" required placeholder="예: 5세~10세">
      </div>
      <div class="form-group">
        <label for="t-teaching-level">가능한 수업 수준</label>
        <input type="text" id="t-teaching-level" required placeholder="예: 입문, 기초 읽기/쓰기">
      </div>
      <div class="form-group">
        <label for="t-availability">가능한 요일 / 시간대</label>
        <input type="text" id="t-availability" required placeholder="거주 국가 시간대 기준으로 적어주세요.">
      </div>

      <div class="form-group" style="flex-direction: row; align-items: center; gap: 12px; margin-top: 8px;">
        <input type="checkbox" id="t-trial" style="width: 20px; height: 20px;">
        <label for="t-trial" style="margin: 0;">시범수업 가능 여부</label>
      </div>

      <div class="form-group" style="flex-direction: row; align-items: center; gap: 12px; margin-top: 4px;">
        <input type="checkbox" id="t-early-childhood" style="width: 20px; height: 20px;">
        <label for="t-early-childhood" style="margin: 0;">유아 수업 경험 여부</label>
      </div>

      <button type="submit" class="btn-submit" style="margin-top: 24px;">선생님으로 지원하기</button>
    </form>
  `;

  const form = container.querySelector('#teacher-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('t-name').value,
      email: document.getElementById('t-email').value,
      country: document.getElementById('t-country').value,
      bio: document.getElementById('t-bio').value,
      experience: document.getElementById('t-experience').value,
      age_group: document.getElementById('t-age-group').value,
      teaching_level: document.getElementById('t-teaching-level').value,
      availability: document.getElementById('t-availability').value,
      trial_available: document.getElementById('t-trial').checked,
      early_childhood_experience: document.getElementById('t-early-childhood').checked
    };
    saveTeacherApp(data);
    window.location.hash = '#/success';
  });

  return container;
}
