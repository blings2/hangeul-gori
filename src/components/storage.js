export function initStorage() {
  if (!localStorage.getItem('ParentRequest')) {
    localStorage.setItem('ParentRequest', JSON.stringify([]));
  }
  if (!localStorage.getItem('TeacherProfile')) {
    localStorage.setItem('TeacherProfile', JSON.stringify([]));
  }
  if (!localStorage.getItem('MatchRecord')) {
    localStorage.setItem('MatchRecord', JSON.stringify([]));
  }
}

export function saveParentApp(data) {
  const apps = JSON.parse(localStorage.getItem('ParentRequest'));
  const newApp = {
    ...data,
    id: Date.now().toString(),
    status: '신규 접수',
    admin_note: '',
    created_at: new Date().toISOString()
  };
  apps.push(newApp);
  localStorage.setItem('ParentRequest', JSON.stringify(apps));
}

export function saveTeacherApp(data) {
  const apps = JSON.parse(localStorage.getItem('TeacherProfile'));
  const newApp = {
    ...data,
    id: Date.now().toString(),
    status: '신규 접수',
    admin_note: '',
    created_at: new Date().toISOString()
  };
  apps.push(newApp);
  localStorage.setItem('TeacherProfile', JSON.stringify(apps));
}

export function saveMatchRecord(parentId, teacherId, adminNote = '') {
  const records = JSON.parse(localStorage.getItem('MatchRecord'));
  // Remove existing match for this parent if needed
  const filtered = records.filter(r => r.parent_request_id !== parentId);
  filtered.push({
    id: Date.now().toString(),
    parent_request_id: parentId,
    teacher_profile_id: teacherId,
    admin_note: adminNote,
    status: 'Active',
    created_at: new Date().toISOString()
  });
  localStorage.setItem('MatchRecord', JSON.stringify(filtered));
}

export function getParentApps() {
  return JSON.parse(localStorage.getItem('ParentRequest')) || [];
}

export function getTeacherApps() {
  return JSON.parse(localStorage.getItem('TeacherProfile')) || [];
}

export function getMatchRecords() {
  return JSON.parse(localStorage.getItem('MatchRecord')) || [];
}

export function getMatchByParentId(parentId) {
  const records = getMatchRecords();
  return records.find(r => r.parent_request_id === parentId);
}

export function getTeacherById(teacherId) {
  return getTeacherApps().find(t => t.id === teacherId);
}

export function updateParentStatus(id, newStatus) {
  const apps = getParentApps();
  const idx = apps.findIndex(a => a.id === id);
  if (idx > -1) {
    apps[idx].status = newStatus;
    localStorage.setItem('ParentRequest', JSON.stringify(apps));
  }
}

export function updateTeacherStatus(id, newStatus) {
  const apps = getTeacherApps();
  const idx = apps.findIndex(a => a.id === id);
  if (idx > -1) {
    apps[idx].status = newStatus;
    localStorage.setItem('TeacherProfile', JSON.stringify(apps));
  }
}

export function updateAdminNote(type, id, note) {
  const key = type === 'parent' ? 'ParentRequest' : 'TeacherProfile';
  const apps = JSON.parse(localStorage.getItem(key)) || [];
  const idx = apps.findIndex(a => a.id === id);
  if (idx > -1) {
    apps[idx].admin_note = note;
    localStorage.setItem(key, JSON.stringify(apps));
  }
}
