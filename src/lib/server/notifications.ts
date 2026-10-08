import { briefMarkdown } from '../brief';
import { getStore, type Lead, type LeadStore, type NotificationJob } from './store';

type Env = Record<string, string | undefined>;
type Fetcher = typeof fetch;
export class NotConfigured extends Error {}

export function htmlEscape(text: string) {
  return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function notificationsConnected(env: Env = process.env) {
  return Boolean((env.RESEND_API_KEY && env.EMAIL_FROM) || env.SLACK_WEBHOOK_URL || (env.SLACK_BOT_TOKEN && env.SLACK_LEADS_CHANNEL));
}

export function slackPayload(lead: Lead) {
  const text = briefMarkdown(lead.draft, lead.reference);
  const chunks = text.match(/[\s\S]{1,2800}/g) || [];
  return {
    text: `Yeni proje notu / ${lead.reference}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `Bir şeyler oluyor. ${lead.reference}`, emoji: true } },
      ...chunks.map(chunk => ({ type: 'section', text: { type: 'plain_text', text: chunk, emoji: true } })),
    ],
  };
}

async function slackCall(method: string, token: string, body: Record<string, unknown>, fetcher: Fetcher) {
  const response = await fetcher(`https://slack.com/api/${method}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Slack HTTP ${response.status}`);
  const result = await response.json();
  if (!result.ok) throw new Error(`Slack: ${String(result.error || 'unknown_error')}`);
  return result;
}

async function sendEmail(lead: Lead, studio: boolean, env: Env, fetcher: Fetcher) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || (studio && !env.LEAD_NOTIFICATION_EMAIL)) throw new NotConfigured('Email service is not configured.');
  const summary = briefMarkdown(lead.draft, lead.reference);
  const subject = studio ? `Yeni proje notu / ${lead.reference}` : `Güzel bir başlangıç. / ${lead.reference}`;
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${lead.id}/${studio ? 'studio' : 'customer'}` },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [studio ? env.LEAD_NOTIFICATION_EMAIL : lead.draft.email], ...(studio ? { reply_to: lead.draft.email } : {}), subject, text: summary,
      html: `<div style="background:#f1ebf7;color:#32263e;padding:36px;font-family:Arial,sans-serif;max-width:680px;margin:auto;border-radius:14px"><p style="font-size:15px">decentdevs.</p><h1 style="font-size:32px;letter-spacing:-1px">${studio ? 'Yeni bir fikir var.' : 'Güzel bir başlangıç.'}</h1><p style="font-size:14px;line-height:1.8">${studio ? 'Yeni proje talebinin özeti aşağıda.' : `Merhaba ${htmlEscape(lead.draft.name)}, paylaştığın proje notunu kaydettik. Bir kopyası da sende kalsın.`}</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-family:Arial,sans-serif;font-size:13px;line-height:1.8;padding-top:16px;border-top:1px solid #d0bddc">${htmlEscape(summary)}</pre><p style="color:#84718f;font-size:12px;margin-top:30px">Good enough.</p></div>`,
    }), signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Email HTTP ${response.status}`);
}

async function sendSlackNotification(lead: Lead, env: Env, fetcher: Fetcher) {
  const payload = slackPayload(lead);
  if (env.SLACK_WEBHOOK_URL) {
    const url = new URL(env.SLACK_WEBHOOK_URL);
    if (url.protocol !== 'https:' || !['hooks.slack.com', 'hooks.slack-gov.com'].includes(url.hostname)) throw new Error('Invalid Slack webhook configuration.');
    const response = await fetcher(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
    if (!response.ok || (await response.text()).trim() !== 'ok') throw new Error(`Slack webhook HTTP ${response.status}`);
  } else if (env.SLACK_BOT_TOKEN && env.SLACK_LEADS_CHANNEL) {
    await slackCall('chat.postMessage', env.SLACK_BOT_TOKEN, { ...payload, channel: env.SLACK_LEADS_CHANNEL, client_msg_id: lead.id, unfurl_links: false, unfurl_media: false }, fetcher);
  } else throw new NotConfigured('Internal Slack notifications are not configured.');
}

async function inviteCustomer(lead: Lead, store: LeadStore, env: Env, fetcher: Fetcher) {
  if (!lead.draft.slack) return;
  if (env.SLACK_INVITE_MODE !== 'enterprise' || !env.SLACK_ADMIN_TOKEN || !env.SLACK_BOT_TOKEN || !env.SLACK_TEAM_ID) throw new NotConfigured('Slack preference recorded; automatic Enterprise invitations are not configured.');
  let channel = lead.slackChannel;
  if (!channel) {
    const name = `proje-${lead.reference.toLowerCase()}`;
    try {
      const created = await slackCall('conversations.create', env.SLACK_BOT_TOKEN, { name, is_private: true, team_id: env.SLACK_TEAM_ID }, fetcher);
      channel = created.channel.id;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('name_taken')) throw error;
      // Recover a channel created before a lost response or interrupted process.
      let cursor: string | undefined;
      do {
        const listed = await slackCall('conversations.list', env.SLACK_BOT_TOKEN, { types: 'private_channel', exclude_archived: true, limit: 200, ...(cursor ? { cursor } : {}) }, fetcher);
        channel = listed.channels?.find((item: { name: string; id: string }) => item.name === name)?.id || null;
        cursor = listed.response_metadata?.next_cursor;
      } while (!channel && cursor);
      if (!channel) throw new Error('Existing project channel could not be recovered.');
    }
    store.setSlackChannel(lead.id, channel!);
  }
  try {
    await slackCall('admin.users.invite', env.SLACK_ADMIN_TOKEN, { team_id: env.SLACK_TEAM_ID, email: lead.draft.email, channel_ids: channel, is_ultra_restricted: true, real_name: lead.draft.name, custom_message: 'Projenin devamını burada birlikte konuşalım. — Decent Devs' }, fetcher);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already_in_team_invited_user')) return;
    if (!(error instanceof Error) || !error.message.includes('already_in_team')) throw error;
    const member = await slackCall('users.lookupByEmail', env.SLACK_BOT_TOKEN, { email: lead.draft.email }, fetcher);
    try { await slackCall('conversations.invite', env.SLACK_BOT_TOKEN, { channel, users: member.user.id }, fetcher); }
    catch (inviteError) { if (!(inviteError instanceof Error) || !inviteError.message.includes('already_in_channel')) throw inviteError; }
  }
}

export async function deliverJob(job: NotificationJob, lead: Lead, store: LeadStore, env: Env = process.env, fetcher: Fetcher = fetch) {
  switch (job.kind) {
    case 'email': return sendEmail(lead, false, env, fetcher);
    case 'studio-email': return sendEmail(lead, true, env, fetcher);
    case 'slack': return sendSlackNotification(lead, env, fetcher);
    case 'slack-invite': return inviteCustomer(lead, store, env, fetcher);
  }
}

export async function processNotifications(leadId?: string, store = getStore(), env: Env = process.env, fetcher: Fetcher = fetch) {
  const jobs = store.claimJobs(leadId);
  // Bound concurrency so a retry batch cannot flood the providers.
  for (let i = 0; i < jobs.length; i += 4) {
    await Promise.all(jobs.slice(i, i + 4).map(async job => {
      const lead = store.get(job.lead_id);
      if (!lead) return;
      try { await deliverJob(job, lead, store, env, fetcher); store.sent(job); }
      catch (error) { store.defer(job, error instanceof Error ? error.message : 'Delivery failed.', !(error instanceof NotConfigured)); }
    }));
  }
  return jobs.length;
}
