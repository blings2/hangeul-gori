export function renderSuccess() {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.textAlign = 'center';

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="width: 80px; height: 80px; background: var(--success); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto; box-shadow: var(--shadow-sm);">
        ✓
      </div>
    </div>
    <h1 class="title">정상적으로<br/>접수되었습니다</h1>
    <p class="subtitle" style="margin-bottom: 40px; line-height: 1.5;">운영자가 내용 확인 후<br/>안내 연락을 드리겠습니다.</p>
    
    <a href="#/" class="btn-submit" style="text-decoration: none; padding: 16px 32px; display: inline-block;">홈으로 돌아가기</a>
  `;
  return container;
}
