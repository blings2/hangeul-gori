import './style.css';
import { renderHome } from './components/home.js';
import { renderParentForm } from './components/parentForm.js';
import { renderTeacherForm } from './components/teacherForm.js';
import { renderAdminDashboard } from './components/adminDashboard.js';
import { renderSuccess } from './components/success.js';
import { initStorage } from './components/storage.js';

const app = document.querySelector('#app');

function router() {
  const hash = window.location.hash || '#/';
  app.innerHTML = '';
  
  if (hash === '#/') {
    app.appendChild(renderHome());
  } else if (hash === '#/apply') {
    app.appendChild(renderParentForm());
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
