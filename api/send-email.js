import { Resend } from 'resend';
import { convertToKST, getTimezoneInfo } from '../src/lib/convertToKST.js';

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
    korean_level,
    learning_goal,
    country,
    city,
    available_days,
    available_times,
    local_timezone,
  } = req.body;

  const from    = process.env.FROM_EMAIL   || 'onboarding@resend.dev';
  const adminTo = process.env.ADMIN_EMAIL;

  const goalsText = Array.isArray(learning_goal)
    ? learning_goal.map(g => `  - ${g}`).join('\n')
    : `  - ${learning_goal}`;

  const tzInfo    = getTimezoneInfo(local_timezone);
  const tzLabel   = tzInfo
    ? `${tzInfo.city} (${tzInfo.abbr}, ${tzInfo.offsetStr})`
    : (local_timezone || '-');
  const slots     = convertToKST(available_days || [], available_times || [], local_timezone || '');
  const scheduleText = slots.length > 0
    ? slots.map(s => `  ${s.local}  →  ${s.kst} KST`).join('\n')
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

── 부모 / 아이 정보 ─────────────────
부모 이름:  ${parent_name}
아이 이름:  ${child_name}
이메일:     ${email}
아이 나이:  ${child_age}
한국어 수준: ${korean_level}

── 학습 목표 ────────────────────────
${goalsText}

── 수업 일정 / 장소 ─────────────────
거주지:      ${country}${city ? ` / ${city}` : ''}
현지 timezone: ${tzLabel}

희망 수업 시간 (현지 / KST):
${scheduleText}
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
