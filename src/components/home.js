export function renderHome() {
  const container = document.createElement('div');
  container.className = 'page-container home-page';
  container.innerHTML = `
    <style>
      .home-page { padding: 0; background: var(--bg-color); padding-bottom: 60px; }
      
      /* Header & Hero */
      .home-header { padding: 40px 24px 32px; background: var(--surface); text-align: center; border-bottom: 1px solid var(--border); }
      .logo { max-width: 120px; height: auto; margin: 0 auto 24px auto; display: block; }
      .hero-title { font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 12px; line-height: 1.3; letter-spacing: -0.5px; }
      .hero-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
      .hero-actions { display: flex; gap: 12px; flex-direction: row; justify-content: center; }
      .hero-actions .btn { flex: 1; padding: 14px 16px; border-radius: var(--radius-sm); font-weight: 700; font-size: 14px; text-decoration: none; text-align: center; transition: var(--transition); }
      .hero-actions .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: var(--shadow-sm); }
      .hero-actions .btn-secondary { background: var(--surface); color: var(--primary-dark); border: 1.5px solid var(--primary); }
      
      /* Sections common */
      .section-container { padding: 32px 24px 0 24px; }
      .section-title { font-size: 18px; font-weight: 700; color: var(--primary-dark); margin-bottom: 16px; letter-spacing: -0.5px; }
      
      /* User Status Card */
      .status-card { background: var(--surface); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); text-align: center; margin-top: -20px; position: relative; z-index: 10; margin-left: 24px; margin-right: 24px; }
      .status-card h3 { font-size: 16px; color: var(--text-main); font-weight: 700; margin-bottom: 8px; }
      .status-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; }
      .status-btn { display: inline-block; background: var(--secondary); color: var(--primary-dark); padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-decoration: none; transition: var(--transition); }
      .status-btn:active { background: #dcd0c6; }
      
      /* Cards common */
      .info-card { background: var(--surface); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
      .info-card-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: var(--primary-dark); flex-shrink: 0; }
      .info-card-content h4 { font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
      .info-card-content p { font-size: 13px; color: var(--text-muted); margin: 0; }
      
      /* Trust Block */
      .trust-card { background: var(--surface); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
      .trust-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
      .trust-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: var(--text-main); line-height: 1.4; }
      .trust-list li::before { content: '✓'; color: var(--success); font-weight: 800; font-size: 14px; }
      
      /* Teacher Preview */
      .teacher-card { background: var(--surface); border-radius: var(--radius-md); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
      .teacher-header { display: flex; align-items: center; gap: 12px; }
      .teacher-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 20px; }
      .teacher-name { font-size: 15px; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 2px; }
      .teacher-exp { font-size: 12px; color: var(--primary); font-weight: 600; }
      .teacher-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 4px 0; }
      .teacher-badges { display: flex; gap: 8px; flex-wrap: wrap; }
      .badge { background: var(--bg-color); padding: 4px 10px; border-radius: 12px; font-size: 11px; color: var(--text-muted); font-weight: 600; border: 1px solid var(--border); }
      
      /* Final CTA */
      .final-cta { text-align: center; margin-top: 40px; padding: 32px 24px; }
      .final-cta h2 { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 16px; line-height: 1.4; }
      .final-btn { display: inline-block; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 14px 32px; border-radius: var(--radius-sm); font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: var(--shadow-sm); }
      
      /* Footer */
      .home-footer { padding: 20px 24px 40px; text-align: center; }
      .footer-logo { font-size: 14px; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; }
      .admin-link { font-size: 12px; color: #ccc; text-decoration: none; }
    </style>

    <!-- 1. COMPACT HERO -->
    <header class="home-header">
      <img src="/logo.png" alt="한글고리 로고" class="logo" />
      <h1 class="hero-title">해외에서도, 우리 아이의 한글을 이어가세요</h1>
      <p class="hero-subtitle">아이에게 맞는 한글 선생님을 연결해드립니다</p>
      <div class="hero-actions">
        <a href="#/apply" class="btn btn-primary">수업 신청하기 &rarr;</a>
        <a href="#/teach" class="btn btn-secondary">선생님 등록하기</a>
      </div>
    </header>

    <!-- 2. USER STATUS CARD -->
    <div class="status-card">
      <h3>아직 수업을 시작하지 않았어요</h3>
      <p>아이에게 맞는 한글 수업을 찾고 있다면,<br/>간단한 신청으로 시작해보세요.</p>
      <a href="#/apply" class="status-btn">수업 신청하기 &rarr;</a>
    </div>

    <!-- 3. HOW IT WORKS -->
    <section class="section-container">
      <h2 class="section-title">이렇게 진행돼요</h2>
      <div class="info-card">
        <div class="info-card-icon">1</div>
        <div class="info-card-content">
          <h4>수업 신청</h4>
          <p>간단한 정보 입력</p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon">2</div>
        <div class="info-card-content">
          <h4>선생님 매칭</h4>
          <p>운영자가 확인</p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon">3</div>
        <div class="info-card-content">
          <h4>수업 시작</h4>
          <p>맞는 선생님과 연결</p>
        </div>
      </div>
    </section>

    <!-- 4. TRUST BLOCK -->
    <section class="section-container">
      <h2 class="section-title">우리한글은 이렇게 연결합니다</h2>
      <div class="trust-card">
        <ul class="trust-list">
          <li>어린이 수업 경험 있는 선생님 중심</li>
          <li>아이 나이와 수준 기반 매칭</li>
          <li>운영자가 직접 확인 후 연결</li>
        </ul>
      </div>
    </section>

    <!-- 5. TEACHER PREVIEW -->
    <section class="section-container">
      <h2 class="section-title">이런 선생님과 연결됩니다</h2>
      
      <div class="teacher-card">
        <div class="teacher-header">
          <div class="teacher-avatar">👩🏻‍🏫</div>
          <div>
            <span class="teacher-name">김선생님</span>
            <span class="teacher-exp">유아 한국어 수업 5년</span>
          </div>
        </div>
        <p class="teacher-desc">"아이의 눈높이에 맞춰 놀이하듯 즐겁게 한글을 가르칩니다. 아이가 한글 시간을 기다릴 수 있도록 재미있는 수업을 만들어요."</p>
        <div class="teacher-badges">
          <span class="badge">놀이 기반</span>
          <span class="badge">친근한 소통</span>
        </div>
      </div>
      
      <div class="teacher-card">
        <div class="teacher-header">
          <div class="teacher-avatar">👨🏻‍🏫</div>
          <div>
            <span class="teacher-name">이선생님</span>
            <span class="teacher-exp">초등 국어 교육 전공</span>
          </div>
        </div>
        <p class="teacher-desc">"체계적인 커리큘럼으로 아이의 읽기와 쓰기 실력을 탄탄하게 키워줍니다. 학령기 아이들에게 맞는 맞춤형 지도를 제공합니다."</p>
        <div class="teacher-badges">
          <span class="badge">체계적인 수업</span>
          <span class="badge">초등 대비</span>
        </div>
      </div>
    </section>

    <!-- 6. FINAL CTA -->
    <section class="final-cta">
      <h2>우리 아이에게 맞는 한글 수업,<br/>가볍게 시작해보세요</h2>
      <a href="#/apply" class="final-btn">수업 신청하기 &rarr;</a>
    </section>

    <!-- 7. FOOTER -->
    <footer class="home-footer">
      <div class="footer-logo">한글고리</div>
      <a href="#/admin" class="admin-link">운영자 관리 페이지</a>
    </footer>
  `;
  return container;
}

