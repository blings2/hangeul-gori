import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    parent_name,
    child_name,
    child_age,
    email,
    child_gender,
    referral_source,
    korean_level,
    learning_goal,
    country,
    city,
    available_times,
    // 어드민 이메일용 신규 필드
    home_language,
    parent_korean,
    personality,
    korean_exposure,
    sub_answer,
    kst_summary,
    frequency,
    teacher_prefs,
  } = req.body;

  const from    = process.env.FROM_EMAIL   || 'onboarding@resend.dev';
  const adminTo = process.env.ADMIN_EMAIL;

  // ── 변환 맵 ──────────────────────────────────────────────────────────────────

  const LEVEL_LABELS = {
    zero:   '완전 처음 (한글도 몰라요)',
    alpha:  '자모 단계 (가나다 배우는 중)',
    listen: '듣기 위주 (듣는데 말은 어려워요)',
    speak:  '말하기 가능 (간단한 대화 돼요)',
    read:   '읽기·쓰기 (읽고 쓸 수 있어요)',
  };

  const EXPOSURE_LABELS = {
    parents: '엄마·아빠가 한국어로 말을 걸어요',
    books:   '잠자리에서 한국 책을 읽어줘요',
    video:   '할머니·할아버지와 영상통화를 해요',
    youtube: '한국 유튜브·TV 프로그램을 봐요',
    lived:   '한국에서 살았거나 자주 방문했어요',
    school:  '한글학교나 다른 수업을 받은 적 있어요',
    none:    '한국어 노출이 거의 없었어요',
  };

  const GOAL_LABELS = {
    listening:    '한국어를 들으면 어느 정도 알아듣고 싶어요',
    reading:      '한글을 소리 내서 읽고 싶어요',
    speaking:     '한국어로 간단히 대화하고 싶어요',
    conversation: '한국어로 자유롭게 대화하고 싶어요',
    writing:      '받아쓰기·짧은 글쓰기를 하고 싶어요',
    books:        '한국 책을 스스로 읽고 이해하고 싶어요',
    return:       '한국에 돌아가서 학교에 잘 적응하고 싶어요',
    identity:     '그냥 한국과 연결되어 있었으면 해요',
    elementary:   '한국 초등학교 입학·전학을 앞두고 있어요',
    middle:       '한국 중학교 진학을 준비하고 있어요',
    topik:        '한국어 능력 시험(TOPIK)을 준비하고 있어요',
    family:       '한국 가족과 더 깊이 소통하고 싶어요',
  };

  const PERSONALITY_LABELS = {
    social:   '낯선 어른과도 금방 친해져요',
    shy:      '처음엔 수줍어하는 편이에요',
    playful:  '게임·놀이로 배우는 걸 좋아해요',
    calm:     '차분히 앉아서 배우는 걸 좋아해요',
    musical:  '노래·율동으로 배우면 잘 따라해요',
    active:   '집중 시간이 짧은 편이에요',
  };

  const TIMEBLOCK_LABELS = {
    morning:   '오전 (08:00–12:00)',
    afternoon: '오후 (12:00–18:00)',
    evening:   '저녁 (18:00–22:00)',
  };

  // ── 헬퍼 ──────────────────────────────────────────────────────────────────────

  const toLines = (arr, labelMap = {}) => {
    if (!Array.isArray(arr) || arr.length === 0) return '  미입력';
    return arr.map(v => `  - ${labelMap[v] || v}`).join('\n');
  };

  const goalsText       = toLines(learning_goal,  GOAL_LABELS);
  const exposureText    = toLines(korean_exposure, EXPOSURE_LABELS);
  const personalityText = toLines(personality,     PERSONALITY_LABELS);
  const timeblocksText  = toLines(available_times, TIMEBLOCK_LABELS);
  const teacherText     = toLines(teacher_prefs);

  const parentEmailText = `
안녕하세요, ${parent_name}님 👋

${child_name}의 한글 수업 신청이 잘 접수되었어요.
담당자가 직접 검토한 후 2~3일 내로 이 이메일 주소로 연락드릴게요.

── 신청 내용 요약 ──────────────────
아이 이름:    ${child_name}
나이:         ${child_age}
한국어 수준:  ${korean_level}
────────────────────────────────────

궁금한 점이 있으시면 언제든지 회신해 주세요.

한글고리 드림 🌱
`.trim();

  const adminEmailText = `
새 수업 신청이 들어왔어요.

── 연락처 ───────────────────────────
부모 이름:    ${parent_name || '미입력'}
아이 이름:    ${child_name || '미입력'}
이메일:       ${email || '미입력'}
아이 성별:    ${child_gender || '미입력'}
유입 경로:    ${referral_source || '미입력'}

── 아이 정보 ────────────────────────
나이:         ${child_age || '미입력'}
가정 언어:    ${home_language || '미입력'}
부모 한국어:  ${parent_korean || '미입력'}
아이 성향:
${personalityText}

── 한국어 실력 ──────────────────────
수준:         ${LEVEL_LABELS[korean_level] || korean_level || '미입력'}
보조 답변:    ${sub_answer || '미입력'}
노출 환경:
${exposureText}

── 수업 목표 ────────────────────────
${goalsText}

── 수업 환경 ────────────────────────
거주지:       ${country || '미입력'}${city && city !== country ? ` / ${city}` : ''}
희망 시간대:
${timeblocksText}
KST 기준:     ${kst_summary || '미입력'}
수업 빈도:    ${frequency || '미입력'}

── 선생님 선호 ──────────────────────
${teacherText}
────────────────────────────────────

어드민 대시보드: https://hangeul-gori.vercel.app/#/admin
`.trim();

  // Resend 무료 플랜 제한:
  // FROM_EMAIL이 onboarding@resend.dev인 경우 계정 소유자 이메일(ADMIN_EMAIL)로만 발송 가능.
  // 외부 유저 이메일로 보내려면 resend.com/domains 에서 도메인 연결 후
  // FROM_EMAIL을 해당 도메인 주소(예: noreply@yourdomain.com)로 교체해야 함.
  //
  // 도메인 연결 전 임시 테스트: .env.local에 PARENT_EMAIL_OVERRIDE=your@email.com 설정 시
  // 유저 확인 이메일을 해당 주소로 리다이렉트하여 수신 여부 확인 가능.
  const parentTo = process.env.PARENT_EMAIL_OVERRIDE || email;

  const [parentResult, adminResult] = await Promise.allSettled([
    resend.emails.send({
      from,
      to:      parentTo,
      subject: `${child_name}의 선생님을 찾기 시작했어요`,
      text:    parentEmailText,
    }),
    adminTo
      ? resend.emails.send({
          from,
          to:      adminTo,
          subject: `새 신청이 들어왔어요 - ${child_name}`,
          text:    adminEmailText,
        })
      : Promise.resolve({ status: 'skipped' }),
  ]);

  // NOTE: Resend SDK는 API 오류 시 reject 대신 { data: null, error: {...} }로 resolve함.
  // status === 'rejected'는 네트워크 오류 등 SDK 자체 예외에만 해당되므로
  // Resend API 레벨 오류는 반드시 result.value.error 를 별도로 체크해야 함.
  if (parentResult.status === 'rejected') {
    console.error('[send-email] parent email exception:', JSON.stringify(parentResult.reason));
  } else if (parentResult.value?.error) {
    console.error('[send-email] parent email failed (Resend API error):', JSON.stringify(parentResult.value.error));
  } else {
    console.log('[send-email] parent email sent:', JSON.stringify(parentResult.value?.data));
  }

  if (adminResult.status === 'rejected') {
    console.error('[send-email] admin email exception:', JSON.stringify(adminResult.reason));
  } else if (adminResult.value?.error) {
    console.error('[send-email] admin email failed (Resend API error):', JSON.stringify(adminResult.value.error));
  } else {
    console.log('[send-email] admin email sent:', JSON.stringify(adminResult.value?.data));
  }

  const parentOk = parentResult.status === 'fulfilled' && !parentResult.value?.error;
  const adminOk  = adminResult.status  === 'fulfilled' && !adminResult.value?.error;

  return res.status(200).json({
    parent: parentOk  ? 'fulfilled' : 'failed',
    admin:  adminOk   ? 'fulfilled' : (adminTo ? 'failed' : 'skipped'),
    ...(parentResult.value?.error && { parent_error: parentResult.value.error }),
    ...(adminResult.value?.error  && { admin_error:  adminResult.value.error  }),
  });
}
