import './style.css';
import { renderHome } from './components/home.js';
import { renderTeacherForm } from './components/teacherForm.js';
import { renderAdminDashboard } from './components/adminDashboard.js';
import { renderSuccess } from './components/success.js';
import { initStorage } from './components/storage.js';
import { mountStepForm, unmountStepForm } from './components/StepForm/mount.ts';
import { mountHomeCarousels, unmountHomeCarousels } from './components/homeCarousels.ts';

const app = document.querySelector('#app');

function router() {
  const hash = window.location.hash || '#/';

  // React 루트가 살아있으면 먼저 언마운트 (다른 라우트로 이동 시)
  unmountStepForm();
  unmountHomeCarousels();
  app.innerHTML = '';

  if (hash === '#/') {
    const homeEl = renderHome();
    app.appendChild(homeEl);
    mountHomeCarousels(app);
  } else if (hash === '#/apply') {
    mountStepForm(app);
  } else if (hash === '#/apply/v1') {
    // v1 백업 폼 (레거시 참조용)
    import('./components/applyV1/parentForm.js').then(({ renderParentForm }) => {
      app.appendChild(renderParentForm());
    });
  } else if (hash === '#/teach') {
    app.appendChild(renderTeacherForm());
  } else if (hash === '#/admin') {
    app.appendChild(renderAdminDashboard());
  } else if (hash === '#/success') {
    app.appendChild(renderSuccess());
  } else {
    app.innerHTML = '<h2 style="text-align:center; margin-top:100px;">404 Not Found</h2><a href="#/" style="display:block; text-align:center;">Go Home</a>';
  }
}

function init() {
  initStorage();
  window.addEventListener('hashchange', router);
  router();
}

init();
