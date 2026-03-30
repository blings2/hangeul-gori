export function renderHome() {
  const container = document.createElement('div');
  container.className = 'page-container home-page';
  container.innerHTML = `
    <style>
      .home-page { padding: 0; background: var(--bg-color); }
      .home-hero { padding: 60px 24px; text-align: center; background: var(--surface); border-bottom: 1px solid var(--border); }
      .logo { font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 40px; letter-spacing: -0.5px; }
      .hero-title { font-size: 28px; line-height: 1.4; color: var(--text-main); margin-bottom: 16px; font-weight: 700; letter-spacing: -0.5px; }
      .hero-subtitle { font-size: 15px; color: var(--text-muted); line-height: 1.6; margin-bottom: 40px; }
      .hero-actions { display: flex; flex-direction: column; gap: 12px; }
      .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 16px; border-radius: var(--radius-md); font-weight: 700; text-decoration: none; display: block; text-align: center; box-shadow: var(--shadow-sm); transition: var(--transition); }
      .btn-primary:active { transform: translateY(2px); }
      .btn-secondary { background: var(--surface); color: var(--primary-dark); border: 1.5px solid var(--primary); padding: 16px; border-radius: var(--radius-md); font-weight: 700; text-decoration: none; display: block; text-align: center; transition: var(--transition); }
      .btn-secondary:active { background: var(--bg-color); }
      
      .home-section { padding: 48px 24px; border-bottom: 1px solid var(--border); }
      .section-title { font-size: 22px; font-weight: 700; margin-bottom: 24px; color: var(--text-main); line-height: 1.4; letter-spacing: -0.5px; }
      
      .problem-list { list-style: none; padding: 0; margin: 0 0 24px 0; display: flex; flex-direction: column; gap: 14px; }
      .problem-list li { position: relative; padding-left: 28px; font-size: 15px; color: var(--text-muted); line-height: 1.5; }
      .problem-list li::before { content: '✓'; position: absolute; left: 0; top: 0; color: var(--primary); font-weight: bold; font-size: 16px; }
      .section-closing { font-weight: 600; color: var(--primary-dark); font-size: 16px; margin-top: 16px; }
      
      .info-section { background: var(--surface); }
      .section-text { font-size: 15px; color: var(--text-muted); line-height: 1.6; }
      
      .steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
      .steps-list li { display: flex; align-items: center; gap: 16px; background: var(--surface); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      .step-num { width: 32px; height: 32px; background: var(--secondary); color: var(--primary-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
      .steps-list p { margin: 0; font-weight: 600; font-size: 16px; color: var(--text-main); }
      
      .cta-section { text-align: center; padding: 60px 24px; background: linear-gradient(135deg, var(--bg-color), var(--secondary)); border: none; }
      .cta-section .section-title { margin-bottom: 8px; }
      
      .home-footer { padding: 40px 24px; text-align: center; background: var(--surface); }
      .footer-logo { font-size: 16px; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; letter-spacing: -0.5px; }
      .home-footer p { font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }
      .admin-link { font-size: 12px; color: #ccc; text-decoration: none; }
    </style>

    <!-- 1. HERO SECTION -->
    <header class="home-hero">
      <div class="logo">우리한글</div>
      <h1 class="hero-title">해외에 살아도,<br/>우리 아이의 한글은<br/>이어질 수 있어요</h1>
      <p class="hero-subtitle">
        해외에 사는 한국계 가정과 어린이 한글 선생님을 연결하는<br/>간단하고 따뜻한 한글 수업 매칭 서비스입니다.
      </p>
      <div class="hero-actions">
        <a href="#/apply" class="btn-primary">수업 신청하기 &rarr;</a>
        <a href="#/teach" class="btn-secondary">선생님 등록하기 &rarr;</a>
      </div>
    </header>

    <!-- 2. PROBLEM SECTION -->
    <section class="home-section problem-section">
      <h2 class="section-title">이런 고민, 해보신 적 있나요?</h2>
      <ul class="problem-list">
        <li>집에서는 영어가 더 편해서 아이가 한국어를 점점 멀게 느껴요</li>
        <li>한글학교나 수업을 찾고 싶어도 시간과 거리, 방식이 잘 맞지 않아요</li>
        <li>국제결혼·다문화 가정에서는 한국어를 이어가기 더 어려워요</li>
        <li>아이가 어릴 때부터 한글과 한국 문화를 친근하게 느끼게 해주고 싶어요</li>
      </ul>
      <p class="section-closing">우리한글은 이런 부모님의 고민에서 시작했습니다.</p>
    </section>

    <!-- 3. SERVICE INTRO -->
    <section class="home-section info-section">
      <h2 class="section-title">우리한글은 무엇을 도와주나요?</h2>
      <p class="section-text">
        우리한글은 해외에 사는 가정이 아이에게 맞는 한글 선생님을 더 쉽게 찾을 수 있도록 돕는 서비스입니다.<br/><br/>
        부모님의 수업 요청을 받고 적절한 선생님과 연결해드립니다.
      </p>
    </section>

    <!-- 4. HOW IT WORKS -->
    <section class="home-section steps-section">
      <h2 class="section-title">이용 방법은 간단해요</h2>
      <ol class="steps-list">
        <li>
          <div class="step-num">1</div>
          <p>수업 신청서를 작성해요</p>
        </li>
        <li>
          <div class="step-num">2</div>
          <p>운영자가 내용을 확인해요</p>
        </li>
        <li>
          <div class="step-num">3</div>
          <p>선생님과 연결해요</p>
        </li>
      </ol>
    </section>

    <!-- 5. CTA SECTION -->
    <section class="home-section cta-section">
      <h2 class="section-title">우리 아이에게 맞는 한글 수업,<br/>가볍게 시작해보세요</h2>
      <a href="#/apply" class="btn-primary" style="margin-top: 32px; display: inline-block; padding-left: 32px; padding-right: 32px;">수업 신청하기 &rarr;</a>
    </section>

    <!-- 6. FOOTER -->
    <footer class="home-footer">
      <div class="footer-logo">우리한글</div>
      <p>해외에서도 아이의 한글이 자연스럽게 이어질 수 있도록.</p>
      <a href="#/admin" class="admin-link">운영자 관리 페이지</a>
    </footer>
  `;
  return container;
}
