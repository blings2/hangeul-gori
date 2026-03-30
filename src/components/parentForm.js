import { saveParentApp } from './storage.js';

export function renderParentForm() {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.innerHTML = `
    <div class="top-bar">
      <a href="#/" class="back-btn">&larr;</a>
    </div>
    <div class="admin-header">
      <h1 class="title">한글 수업 신청</h1>
      <p class="subtitle">아이의 정보를 남겨주시면 적절한 선생님을 찾아 매칭해 드립니다.</p>
    </div>
    
    <form id="parent-form">
      <div class="form-group">
        <label for="p-parent-name">부모 이름</label>
        <input type="text" id="p-parent-name" required placeholder="예: 김부모">
      </div>
      <div class="form-group">
        <label for="p-email">이메일</label>
        <input type="email" id="p-email" required placeholder="example@email.com">
      </div>
      <div class="form-group">
        <label for="p-country">거주 국가</label>
        <input type="text" id="p-country" required placeholder="예: 미국">
      </div>
      <div class="form-group">
        <label for="p-child-name">자녀 이름 또는 닉네임</label>
        <input type="text" id="p-child-name" required placeholder="예: 지민">
      </div>
      <div class="form-group">
        <label for="p-child-age">자녀 나이</label>
        <input type="text" id="p-child-age" required placeholder="예: 7세">
      </div>
      
      <div class="form-group">
        <label for="p-korean-level">자녀의 한글 수준</label>
        <select id="p-korean-level" required>
          <option value="" disabled selected>선택해주세요</option>
          <option value="한글 노출이 거의 없음">한글 노출이 거의 없음</option>
          <option value="간단한 단어 이해 가능">간단한 단어 이해 가능</option>
          <option value="간단한 한국어 대화 가능">간단한 한국어 대화 가능</option>
        </select>
      </div>

      <div class="form-group">
        <label for="p-learning-goal">희망 수업 목표</label>
        <select id="p-learning-goal" required>
          <option value="" disabled selected>선택해주세요</option>
          <option value="한국어에 친숙해지기">한국어에 친숙해지기</option>
          <option value="말하기">말하기</option>
          <option value="읽기 시작">읽기 시작</option>
          <option value="한국 문화 익히기">한국 문화 익히기</option>
        </select>
      </div>

      <div class="form-group">
        <label for="p-preferred-schedule">희망 수업 요일 / 시간대</label>
        <input type="text" id="p-preferred-schedule" required placeholder="예: 주말 오전 (현지시간 기준)">
      </div>
      <div class="form-group">
        <label for="p-note">기타 요청사항</label>
        <textarea id="p-note" placeholder="선생님께 바라는 점을 자유롭게 적어주세요."></textarea>
      </div>

      <button type="submit" class="btn-submit">신청서 제출하기</button>
    </form>
  `;

  const form = container.querySelector('#parent-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      parent_name: document.getElementById('p-parent-name').value,
      email: document.getElementById('p-email').value,
      country: document.getElementById('p-country').value,
      child_name: document.getElementById('p-child-name').value,
      child_age: document.getElementById('p-child-age').value,
      korean_level: document.getElementById('p-korean-level').value,
      learning_goal: document.getElementById('p-learning-goal').value,
      preferred_schedule: document.getElementById('p-preferred-schedule').value,
      note: document.getElementById('p-note').value
    };
    saveParentApp(data);
    window.location.hash = '#/success';
  });

  return container;
}
