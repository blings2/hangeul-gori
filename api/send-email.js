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
    korean_exposure,
    kst_summary,
    frequency,
    teacher_prefs,
  } = req.body;

  const from    = process.env.FROM_EMAIL   || 'onboarding@resend.dev';
  const adminTo = process.env.ADMIN_EMAIL;

  const toLines = (arr, fallback = '-') =>
    Array.isArray(arr) && arr.length > 0
      ? arr.map(v => `  - ${v}`).join('\n')
      : `  ${fallback}`;

  const goalsText    = toLines(learning_goal);
  const exposureText = toLines(korean_exposure);
  const teacherText  = toLines(teacher_prefs);

  const timeblocksLabel = {
    morning:   '오전 (08:00–12:00)',
    afternoon: '오후 (12:00–18:00)',
    evening:   '저녁 (18:00–22:00)',
  };
  const timeblocksText = Array.isArray(available_times) && available_times.length > 0
    ? available_times.map(v => `  - ${timeblocksLabel[v] || v}`).join('\n')
    : '  -';

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
부모 이름:      ${parent_name}
아이 이름:      ${child_name}
이메일:         ${email}
아이 성별:      ${child_gender || '-'}
유입 경로:      ${referral_source || '-'}

── 아이 정보 ────────────────────────
나이:           ${child_age || '-'}
가정 언어:      ${home_language || '-'}
부모 한국어:    ${parent_korean || '-'}

── 한국어 실력 ──────────────────────
수준:           ${korean_level || '-'}
노출 환경:
${exposureText}

── 수업 목표 ────────────────────────
${goalsText}

── 수업 환경 ────────────────────────
거주지:         ${country || '-'}${city && city !== country ? ` / ${city}` : ''}
희망 시간대:
${timeblocksText}
KST 기준:       ${kst_summary || '-'}
수업 빈도:      ${frequency || '-'}

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
