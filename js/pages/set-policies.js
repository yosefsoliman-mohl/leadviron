// 32 · Contact Policies & Privacy — channel eligibility, quiet hours, suppression, retention.
import { icon, esc, avatar, statusBadge, pageHead, select, toggle, tabs, on, toast, modal, confirm } from '../ui.js';
import { store, leadById, enrichLabel, enrichPct } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

const ui = { tab: 'eligibility', draft: null, leadId: 'LD-1048', channel: 'WhatsApp' };
const PREVIEW_LEADS = ['LD-1048', 'LD-0731', 'LD-0842', 'LD-0912', 'LD-0763', 'LD-1052'];
const CH_ICON = { Email: 'mail', WhatsApp: 'whatsapp', LinkedIn: 'linkedin' };

const clone = (o) => JSON.parse(JSON.stringify(o));

// Applies the draft rules to one lead and channel. Returns rows to show and the verdict.
function evaluate(p, l, ch) {
  const suppressed = l.eligibility === 'Suppressed';
  const reasons = [];
  let rows;
  if (ch === 'Email') {
    const valid = /@.+\./.test(l.email);
    const perm = l.consent.email === 'Eligible';
    rows = [['Email', valid ? 'Valid' : 'Invalid', valid], ['Permission', perm ? 'Recorded' : 'Missing', perm], ['Suppressed', suppressed ? 'Yes' : 'No', !suppressed]];
    if (!valid) reasons.push('Email is not valid');
    if (!perm && p.missingPermission === 'Block channel') reasons.push('No outreach permission recorded');
  } else if (ch === 'WhatsApp') {
    const phone = l.phone && l.phone !== '—';
    const optin = !!l.whatsappOptIn;
    rows = [['Phone', phone ? 'Available' : 'Missing', phone], ['Opt-in', optin ? 'Recorded' : 'Not recorded', optin], ['Suppressed', suppressed ? 'Yes' : 'No', !suppressed]];
    if (!phone) reasons.push('No phone number');
    if (!optin && p.missingPermission === 'Block channel') reasons.push('No WhatsApp opt-in recorded');
  } else {
    rows = [['Profile', l.linkedin ? 'Available' : 'Missing', l.linkedin], ['Manual task', 'Allowed', true], ['Suppressed', suppressed ? 'Yes' : 'No', !suppressed]];
    if (!l.linkedin) reasons.push('LinkedIn profile not found');
  }
  if (suppressed && p.suppressed === 'Block channel') reasons.push('Contact is on the suppression list');
  if (ch !== 'LinkedIn' && p.requireQualified && l.qual !== 'Qualified') reasons.push(`Qualification is “${l.qual}”`);
  const ok = reasons.length === 0;
  return { rows, ok, reasons, verdict: ok ? (ch === 'LinkedIn' ? 'Assisted task only' : 'Eligible') : 'Not eligible' };
}

function eligibilityTab(p) {
  const l = leadById(ui.leadId);
  const ev = evaluate(p, l, ui.channel);
  return `<div class="split wide-side">
    <div class="stack">
      <div class="card card-pad">
        <h2>Campaign enrollment rules</h2><p class="muted">Set the baseline rules for adding leads to outreach campaigns.</p>
        <div class="setting-row mt8"><div class="grow"><div>Require Qualified status for campaign enrollment</div><div class="muted small">Only leads with Qualified status can be enrolled in campaigns.</div></div>${toggle(p.requireQualified, 'data-change="req" aria-label="Require Qualified status"')}</div>
        <div class="setting-row"><div class="grow"><div>Missing permission</div><div class="muted small">When a lead does not have permission for a channel, block or allow.</div></div>${select(['Block channel', 'Allow'], p.missingPermission, 'data-change="p" data-k="missingPermission" style="width:180px"')}</div>
        <div class="setting-row"><div class="grow"><div>Suppressed contact</div><div class="muted small">When a lead is in suppression, block or allow.</div></div>${select(['Block channel', 'Allow'], p.suppressed, 'data-change="p" data-k="suppressed" style="width:180px"')}</div>
      </div>
      <div class="card card-pad">
        <h2>Channel eligibility rules</h2><p class="muted mb12">Contacts must meet all conditions to be eligible for a channel.</p>
        <div class="stack sm">${p.channels.map((c) => `<button class="card row pol-ch ${c.ch === ui.channel ? 'selected' : ''}" data-action="pick-ch" data-ch="${c.ch}" style="padding:10px 14px;text-align:left;width:100%;cursor:pointer">
          <span class="ico-circle">${icon(CH_ICON[c.ch], 20)}</span>
          <span style="width:150px"><span class="strong" style="display:block">${c.ch}</span><span class="muted small">${esc(c.sub)}</span></span>
          <span class="row wrap grow" style="gap:6px">${c.conds.map((x) => `<span class="chip gray" style="padding:3px 10px;font-size:12px">${esc(x)}</span>`).join('')}</span>
          ${icon('arrowRight', 18, 'muted')}<span class="badge" style="height:34px;padding:0 16px">${esc(c.result)}</span></button>`).join('')}</div>
      </div>
    </div>
    <div class="card card-pad">
      <h2>Eligibility preview</h2><p class="muted mb12">See how the rules apply to a specific lead.</p>
      ${select(PREVIEW_LEADS.map((id) => [id, leadById(id).name]), ui.leadId, 'data-change="lead" aria-label="Preview lead"')}
      <div class="row mt12" style="gap:16px">${avatar(l.initials, 'lg')}<div><div class="strong" style="font-size:18px">${esc(l.name)}</div><div class="muted">${esc(l.company || 'Company unknown')} · ${l.id}</div><div class="muted small">${esc([l.title, l.city].filter(Boolean).join(' · ') || 'Role and city unknown')}</div></div></div>
      <div class="divider"></div>
      <div class="kv" style="grid-template-columns:120px 1fr">
        <span class="k">Enrichment</span><span>${statusBadge(`${enrichLabel(l)} (${enrichPct(l)}%)`)}</span>
        <span class="k">Qualification</span><span>${statusBadge(l.qual)}</span>
        <span class="k">Channel</span>${select(['Email', 'WhatsApp', 'LinkedIn'], ui.channel, 'data-change="channel" aria-label="Channel"')}
        ${ev.rows.map(([k, v, good]) => `<span class="k">${k}</span><span>${statusBadge(v, { tone: good ? 'gray' : 'amber' })}</span>`).join('')}
      </div>
      <div class="card mt16" style="background:${ev.ok ? 'var(--blue-50)' : 'var(--ink-50)'};padding:18px 20px;border-color:transparent">
        <div class="row" style="gap:14px"><span style="color:${ev.ok ? 'var(--blue-600)' : 'var(--ink-500)'}">${icon(ev.ok ? 'checkCircle' : 'minusCircle', 38)}</span><span style="font-size:24px;font-weight:600;color:${ev.ok ? 'var(--blue-600)' : 'var(--ink-700)'}">${ev.verdict}</span></div>
        ${ev.reasons.length ? `<ul class="small mt8" style="margin-bottom:0;padding-left:20px">${ev.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        <div class="muted small mt8 row">${icon('info', 15)} Enrichment coverage does not grant contact permission.</div>
      </div>
    </div>
  </div>`;
}

function quietTab(p) {
  const q = p.quietHours;
  return `<div class="card card-pad" style="max-width:760px">
    <div class="row between"><div><h2>Quiet hours</h2><p class="muted">Automated messages wait until quiet hours end. Manual replies are not blocked.</p></div>${toggle(q.enabled, 'data-change="qh-on" aria-label="Enable quiet hours"')}</div>
    <div class="form-grid mt16" style="${q.enabled ? '' : 'opacity:.5;pointer-events:none'}">
      <div class="field"><label>Do not send after</label><input class="input" type="time" data-change="qh" data-k="start" value="${q.start}"></div>
      <div class="field"><label>Resume sending at</label><input class="input" type="time" data-change="qh" data-k="end" value="${q.end}"></div>
      <div class="field"><label>No-send days</label>${select(['Friday', 'Friday & Saturday', 'None'], q.days, 'data-change="qh" data-k="days"')}</div>
      <div class="field"><label>Time zone used</label>${select(['Lead local time', 'Workspace time (Asia/Riyadh)'], q.timezone, 'data-change="qh" data-k="timezone"')}</div>
    </div>
    <div class="callout mt16">${icon('clock', 18)}<span>${q.enabled ? `Messages scheduled between ${q.start} and ${q.end}${q.days !== 'None' ? ` or on ${q.days}` : ''} are held until the next allowed time.` : 'Quiet hours are off. Automated messages can be sent at any time.'}</span></div>
  </div>`;
}

function suppressionTab(p) {
  return `<div class="card card-pad">
    <div class="row between mb12"><div><h2>Suppression list</h2><p class="muted">Contacts and domains that must never receive outreach.</p></div><button class="btn primary" data-action="sup-add">${icon('plus', 17)} Add entry</button></div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Value</th><th>Type</th><th>Reason</th><th>Added</th><th></th></tr></thead>
    <tbody>${p.suppression.map((x, i) => `<tr><td class="strong" style="font-weight:500">${esc(x.value)}</td><td>${statusBadge(x.type, { tone: 'gray' })}</td><td>${esc(x.reason)}</td><td class="muted">${esc(x.added)}</td><td class="r"><button class="btn ghost sm" data-action="sup-del" data-i="${i}">Remove</button></td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">No suppressed contacts.</div></td></tr>'}</tbody></table></div>
    <p class="muted small mt12">${store.s.leads.filter((l) => l.eligibility === 'Suppressed').length} leads in the demo cohort are currently suppressed.</p>
  </div>`;
}

function retentionTab(p) {
  const r = p.retention;
  return `<div class="grid g2" style="align-items:start">
    <div class="card card-pad"><h2>Data retention</h2><p class="muted mb12">How long records are kept before review or deletion.</p>
      <div class="stack sm">
        ${[['leads', 'Inactive lead records'], ['conversations', 'Conversation history'], ['exports', 'Exported files']].map(([k, label]) => `<div class="setting-row"><span class="grow">${label}</span>${select(['30 days', '6 months', '12 months', '24 months', '36 months'], r[k], `data-change="ret" data-k="${k}" style="width:150px"`)}</div>`).join('')}
      </div></div>
    <div class="card card-pad"><div class="row between mb12"><div><h2>Data requests</h2><p class="muted">Access and deletion requests from contacts.</p></div><button class="btn" data-action="dsr-add">${icon('plus', 16)} Log request</button></div>
      <table class="tbl"><thead><tr><th>Request</th><th>Type</th><th>Subject</th><th>Status</th><th></th></tr></thead><tbody>
      ${p.requests.map((x, i) => `<tr><td>${x.id}<div class="muted tiny">${esc(x.received)}</div></td><td>${esc(x.type)}</td><td>${esc(x.subject)}</td><td>${statusBadge(x.status, { tone: x.status === 'Completed' ? 'gray' : '' })}</td><td class="r">${x.status !== 'Completed' ? `<button class="btn sm" data-action="dsr-done" data-i="${i}">Complete</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>
  </div>`;
}

export default {
  title: 'Contact Policies & Privacy',
  render() {
    if (!ui.draft) ui.draft = clone(store.s.policies);
    const p = ui.draft;
    const dirty = JSON.stringify(p) !== JSON.stringify(store.s.policies);
    const body = { eligibility: eligibilityTab, quiet: quietTab, suppression: suppressionTab, retention: retentionTab }[ui.tab](p);
    return `
    ${pageHead({
      title: 'Contact Policies & Privacy', sub: 'Control how leads can be contacted and manage data retention within your workspace.',
      actions: `${select(['Sales outreach', 'Service updates', 'Marketing'].map((x) => [x, `Purpose: ${x}`]), p.purpose, 'data-change="p" data-k="purpose" aria-label="Purpose" style="min-width:210px"')}
        <button class="btn primary" data-action="save">Save policies</button>`,
    })}
    ${settingsTabs('contact-policies')}
    ${tabs([['eligibility', 'Channel Eligibility'], ['quiet', 'Quiet Hours'], ['suppression', 'Suppression'], ['retention', 'Retention & Data Requests']], ui.tab)}
    ${dirty ? `<div class="callout mb12">${icon('info', 18)}<span>You have unsaved policy changes. The preview already uses them.</span><button class="link-btn small" data-action="discard" style="margin-left:auto">Discard</button></div>` : ''}
    ${body}`;
  },
  mount(root, ctx) {
    const re = () => ctx.rerender();
    const p = () => ui.draft;
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; re(); },
        'pick-ch': (el) => { ui.channel = el.dataset.ch; re(); },
        discard: () => { ui.draft = null; re(); },
        save: () => {
          store.update((s) => {
            s.policies = clone(ui.draft);
            s.audit.unshift({ id: `AUD-${930 + s.audit.length}`, time: 'Now', actor: s.me.name, actorRole: s.me.role, action: 'Contact policies updated', item: 'Contact policies', result: 'Success', setting: `Purpose: ${ui.draft.purpose}`, before: '—', after: 'Saved', link: '#/demo/settings/contact-policies' });
          });
          toast('Contact policies saved', 'Demo only — no consent was granted and no outreach started.'); re();
        },
        'sup-add': () => modal({
          title: 'Add suppression entry',
          body: `<div class="stack"><div class="field"><label>Type</label>${select(['Email', 'Phone', 'Domain'], 'Email', 'name="type"')}</div><div class="field"><label>Value</label><input class="input" name="value" placeholder="name@example.com"></div><div class="field"><label>Reason</label><input class="input" name="reason" value="Requested no contact"></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Add', cls: 'primary', value: 1 }],
        }).then(({ value, form }) => {
          if (!value || !form.value.trim()) return;
          p().suppression.unshift({ value: form.value.trim(), type: form.type, reason: form.reason || '—', added: 'Oct 29, 2026' });
          toast('Entry added — save policies to apply'); re();
        }),
        'sup-del': (el) => confirm('Remove entry?', 'This contact could receive outreach again once policies are saved.', 'Remove').then((ok) => { if (ok) { p().suppression.splice(+el.dataset.i, 1); re(); } }),
        'dsr-add': () => modal({
          title: 'Log data request',
          body: `<div class="stack"><div class="field"><label>Type</label>${select(['Data access', 'Correction', 'Deletion'], 'Data access', 'name="type"')}</div><div class="field"><label>Subject</label><input class="input" name="subject" placeholder="Contact name"></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Log request', cls: 'primary', value: 1 }],
        }).then(({ value, form }) => {
          if (!value) return;
          p().requests.unshift({ id: `DSR-${String(p().requests.length + 7).padStart(2, '0')}`, type: form.type, subject: form.subject || 'Unnamed contact', status: 'In review', received: 'Oct 29, 2026' });
          re();
        }),
        'dsr-done': (el) => { p().requests[+el.dataset.i].status = 'Completed'; toast('Request marked complete', 'Simulation — no data was exported or deleted.'); re(); },
      },
      change: {
        p: (el) => { p()[el.dataset.k] = el.value; re(); },
        req: (el) => { p().requireQualified = el.checked; re(); },
        lead: (el) => { ui.leadId = el.value; re(); },
        channel: (el) => { ui.channel = el.value; re(); },
        'qh-on': (el) => { p().quietHours.enabled = el.checked; re(); },
        qh: (el) => { p().quietHours[el.dataset.k] = el.value; re(); },
        ret: (el) => { p().retention[el.dataset.k] = el.value; re(); },
      },
    });
  },
};
