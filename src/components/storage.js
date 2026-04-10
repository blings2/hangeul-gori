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

export async function saveParentApp(data) {
  const { supabase } = await import('../lib/supabase.ts');

  const payload = {
    // 연락처
    parent_name:             data.contact?.parentName     || data.parent_name     || '',
    child_name:              data.contact?.childName      || data.child_name      || '',
    email:                   data.contact?.email          || data.email           || '',
    child_gender:            data.contact?.childGender    || data.child_gender    || '',
    referral_source:         data.contact?.referralSource || data.referral_source || '',

    // 아이 정보
    child_age:               data.child?.age              || data.child_age       || '',
    home_language:           data.child?.homeLanguage     || '',
    parent_korean:           data.child?.parentKorean     || '',
    personality:             data.child?.personality      || [],

    // 한국어 실력
    korean_level:            data.koreanLevel?.level      || data.korean_level    || '',
    korean_level_sub_answer: data.koreanLevel?.subAnswer  || '',
    korean_exposure:         data.koreanLevel?.exposure   || [],

    // 수업 목표
    goals:                   data.goals || data.learning_goal || [],

    // 수업 환경
    country: data.schedule?.isManual
      ? (data.schedule?.countryOther || data.country || '')
      : (data.schedule?.country      || data.country || ''),
    city:                    data.schedule?.city          || data.city            || '',
    utc_offset:              data.schedule?.utcOffset     ?? null,
    is_manual:               data.schedule?.isManual      || false,
    time_blocks:             data.schedule?.timeBlocks    || [],
    kst_summary:             data.schedule?.kstSummary    || '',
    frequency:               data.schedule?.frequency     || '',
    teacher_prefs:           data.schedule?.teacherPrefs  || [],

    // 어드민 기본값
    status:                  '신규 접수',
    admin_note:              '',

    // 전체 payload 백업
    raw_payload:             data,
  };

  // 1. Supabase 저장 (메인)
  const { error } = await supabase
    .from('parent_requests')
    .insert(payload);

  if (error) {
    console.error('[saveParentApp] Supabase 저장 실패:', error);
    throw error;
  }

  // 2. localStorage 백업 (실패해도 무시)
  try {
    const apps = JSON.parse(localStorage.getItem('ParentRequest') || '[]');
    apps.push({
      ...payload,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('ParentRequest', JSON.stringify(apps));
  } catch (e) {
    console.warn('[saveParentApp] localStorage 백업 실패 (무시됨):', e);
  }
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

export async function getParentApps() {
  try {
    const { supabase } = await import('../lib/supabase.ts');
    const { data, error } = await supabase
      .from('parent_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[getParentApps] Supabase 읽기 실패, localStorage fallback:', e);
    return JSON.parse(localStorage.getItem('ParentRequest') || '[]');
  }
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

export async function updateParentStatus(id, newStatus) {
  try {
    const { supabase } = await import('../lib/supabase.ts');
    const { error } = await supabase
      .from('parent_requests')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) throw error;
  } catch (e) {
    console.error('[updateParentStatus] Supabase 업데이트 실패, localStorage fallback:', e);
    const apps = JSON.parse(localStorage.getItem('ParentRequest') || '[]');
    const idx = apps.findIndex(a => a.id === id);
    if (idx > -1) {
      apps[idx].status = newStatus;
      localStorage.setItem('ParentRequest', JSON.stringify(apps));
    }
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

export async function updateAdminNote(type, id, note) {
  if (type === 'parent') {
    try {
      const { supabase } = await import('../lib/supabase.ts');
      const { error } = await supabase
        .from('parent_requests')
        .update({ admin_note: note })
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error('[updateAdminNote] Supabase 업데이트 실패, localStorage fallback:', e);
    }
  }
  // teacher 또는 Supabase 실패 시 localStorage
  const key = type === 'parent' ? 'ParentRequest' : 'TeacherProfile';
  const apps = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = apps.findIndex(a => a.id === id);
  if (idx > -1) {
    apps[idx].admin_note = note;
    localStorage.setItem(key, JSON.stringify(apps));
  }
}
