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
      .hero-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.6; }
      .hero-sub2 { font-size: 12px; color: var(--primary); font-weight: 500; margin-bottom: 24px; }
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
      <div class="hero-text-col">
        <img src="/logo.png" alt="한글고리 로고" class="logo" />
        <h1 class="hero-title">세계 어디서든,<br/>우리 아이의 한국어를<br/>이어갑니다</h1>
        <p class="hero-subtitle">아이 성향에 맞는 어린이 한글 전문 선생님을<br/>집에서 편하게 만나보세요</p>
        <p class="hero-sub2">라이딩 걱정 없이, 검증된 선생님과 1:1 화상 수업</p>
        <div class="hero-actions">
          <a href="#/apply" class="btn btn-primary">선생님 찾기 &rarr;</a>
          <a href="#/teach" class="btn btn-secondary">선생님 등록하기</a>
        </div>
      </div>
      <div class="hero-image-wrap">
        <img src="/hero-child.jpg" alt="집에서 화상수업 중인 아이" />
      </div>
    </header>

    <!-- 2. USER STATUS CARD -->
    <div class="status-card">
      <h3>아직 수업을 시작하지 않았어요</h3>
      <p>아이에게 맞는 한글 수업을 찾고 있다면,<br/>간단한 신청으로 시작해보세요.</p>
      <a href="#/apply" class="status-btn">수업 신청하기 &rarr;</a>
    </div>

    <!-- 3. PAIN POINTS -->
    <section class="pain-section">
      <h2 class="pain-title">이런 고민, 있으신가요?</h2>
      <div class="pain-grid">
        <div class="pain-card"><span class="pain-emoji">🚗</span><span class="pain-text">"한글학교가 너무 멀어서 매주 라이딩이 너무 힘들어요"</span></div>
        <div class="pain-card"><span class="pain-emoji">🌍</span><span class="pain-text">"한국인이 많이 없는 지역에 살고 있어서 한글 교육 시설이 없어요"</span></div>
        <div class="pain-card"><span class="pain-emoji">👩‍🏫</span><span class="pain-text">"아이 성향에 맞는 선생님을 어떻게 찾아야 할지 모르겠어요"</span></div>
        <div class="pain-card"><span class="pain-emoji">👨‍👩‍👧</span><span class="pain-text">"남편이 외국인이라 집에서 한국어를 안 써요"</span></div>
        <div class="pain-card"><span class="pain-emoji">😔</span><span class="pain-text">"아이가 한국 할머니랑 대화를 못해서 너무 속상해요"</span></div>
        <div class="pain-card"><span class="pain-emoji">⏰</span><span class="pain-text">"시간대가 안 맞아서 한국 선생님을 구하기가 너무 어려워요"</span></div>
      </div>
      <p class="pain-footer">한글고리가 이 고민들을 해결해드려요</p>
    </section>

    <!-- 4. HOW IT WORKS -->
    <section class="how-section">
      <h2 class="how-title">이렇게 진행돼요</h2>
      <div class="how-cards-wrap">
        <div class="info-card">
          <div class="info-card-icon">1</div>
          <div class="info-card-content">
            <h4>아이 정보 입력 (5분)</h4>
            <p>나이, 한국어 실력, 학습 목표를 알려주세요. 아이 성향까지 파악해서 딱 맞는 선생님을 찾아드려요</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">2</div>
          <div class="info-card-content">
            <h4>선생님 매칭 (2~3일)</h4>
            <p>담당자가 직접 검토해서 아이에게 맞는 선생님을 연결해드려요. 매칭 결과는 이메일로 안내드려요</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">3</div>
          <div class="info-card-content">
            <h4>집에서 수업 시작</h4>
            <p>Zoom 등 화상통화로 집에서 편하게 시작해요. 라이딩 걱정 없이, 우리 동네 시간대에 맞춰서</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. WHY 한글고리 -->
    <section class="why-section">
      <h2 class="why-title">왜 한글고리인가요?</h2>
      <div class="why-cards-wrap">
        <div class="why-card">
          <div class="why-card-icon">🌱</div>
          <div class="why-card-title">정체성과 헤리티지</div>
          <div class="why-card-desc">한국어는 단순한 언어가 아니에요. 아이가 한국 문화, 가족, 뿌리와 자연스럽게 연결될 수 있도록 도와드려요.</div>
        </div>
        <div class="why-card">
          <div class="why-card-icon">🏠</div>
          <div class="why-card-title">세계 어디서든, 집에서 편하게</div>
          <div class="why-card-desc">뉴욕이든 싱가포르든 런던이든, 라이딩 걱정 없이 거주지 시간대에 맞춰 집에서 수업을 시작할 수 있어요.</div>
        </div>
        <div class="why-card">
          <div class="why-card-icon">👩‍🏫</div>
          <div class="why-card-title">검증된 유아·어린이 전문 선생님</div>
          <div class="why-card-desc">아동 한국어 교육 경험, 화상 수업 환경, 자체 인터뷰를 모두 통과한 믿을 수 있는 선생님들이에요.</div>
        </div>
      </div>
    </section>

    <!-- 6. TEACHER CAROUSEL -->
    <div id="teacher-carousel-root"></div>

    <!-- 7. REVIEW CAROUSEL -->
    <div id="review-carousel-root"></div>

    <!-- 8. FINAL CTA -->
    <section class="final-cta">
      <h2>지금 바로 시작해보세요<br/>아이에게 맞는 선생님을 찾는 데 5분이면 충분해요</h2>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">현재 12개국 가정이 한글고리와 함께하고 있어요</p>
      <a href="#/apply" class="final-btn">무료로 선생님 찾기 &rarr;</a>
    </section>

    <!-- 7. FOOTER -->
    <footer class="home-footer">
      <div class="footer-logo">한글고리</div>
      <a href="#/admin" class="admin-link">운영자 관리 페이지</a>
    </footer>
  `;
  return container;
}

