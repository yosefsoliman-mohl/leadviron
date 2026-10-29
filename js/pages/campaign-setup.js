// 15 · Campaign Setup — five-step wizard. Launch is simulated and only adds a Scheduled campaign to the session.
import { icon, esc, avatar, statusBadge, dots, bar, select, toggle, on, toast, modal } from '../ui.js';
import { store, enrichLabel, enrichPct } from '../store.js';

const STEPS = ['Audience', 'Channels', 'Messages & Workflow', 'Schedule', 'Review'];
const GOALS = ['Generate qualified conversations', 'Book discovery calls', 'Convert demo requests', 'Collect missing details', 'Nurture after demo'];
const fresh = () => ({
  step: 0, name: 'KSA Logistics Outreach', goal: GOALS[0], list: 'lst-ksa', qualOnly: true, requirePerm: true, excludeSupp: true, showAll: false,
  channels: { Email: true, WhatsApp: true, 'LinkedIn tasks': true },
  tpl: { Email: 'tpl-b2b', WhatsApp: 'tpl-wa', 'LinkedIn tasks': 'tpl-li' },
  workflow: 'wf-enrich', stopOnReply: true, waitDays: '2',
  start: '2026-10-30', end: '2026-11-13', window: '09:00 – 17:00', days: 'Sunday – Thursday', tz: 'Asia/Riyadh (lead local time)', dailyCap: '40',
});
let ui = fresh();

// Leads that make up a list. Dynamic lists filter by enrichment; static lists use the cohort.
function listLeads() {
  const s = store.s;
  const list = s.lists.find((l) => l.id === ui.list);
  if (list.filter) return s.leads.filter((l) => l.enrich === list.filter);
  if (list.id === 'lst-priority') return s.leads.filter((l) => l.qual === 'Qualified').sort((a, b) => b.score - a.score).slice(0, 42);
  return s.leads;
}

function audience() {
  const leads = listLeads();
  const out = { leads, eligible: [], excluded: [], reasons: { qual: 0, perm: 0, supp: 0 }, why: new Map() };
  leads.forEach((l) => {
    let why = null;
    if (ui.qualOnly && l.qual !== 'Qualified') why = 'qual';
    else if (ui.requirePerm && l.eligibility === 'Missing permission') why = 'perm';
    else if (ui.excludeSupp && l.eligibility === 'Suppressed') why = 'supp';
    if (why) { out.excluded.push(l); out.reasons[why]++; out.why.set(l.id, why); } else out.eligible.push(l);
  });
  return out;
}

function stepper() {
  return `<div class="row cs-steps">${STEPS.map((s, i) => `
    <button class="cs-step ${i === ui.step ? 'active' : i < ui.step ? 'done' : ''}" data-action="goto" data-i="${i}">
      <span class="cs-num">${i < ui.step ? icon('check', 16) : i + 1}</span><span>${s}</span></button>${i < STEPS.length - 1 ? '<span class="cs-line"></span>' : ''}`).join('')}</div>`;
}

function audienceStep(a) {
  const c = { complete: 0, partial: 0, nomatch: 0 };
  a.leads.forEach((l) => c[l.enrich]++);
  const sample = ui.showAll ? a.leads.slice(0, 30) : ['LD-0731', 'LD-1048', 'LD-0763', 'LD-1052', 'LD-0912'].map((id) => a.leads.find((l) => l.id === id)).filter(Boolean);
  const rows = sample.length ? sample : a.leads.slice(0, 5);
  return `<div class="card card-pad">
    <h2>Audience configuration</h2><p class="muted">Define who to reach and set the eligibility filters for this campaign.</p>
    <div class="row wrap mt16" style="align-items:flex-end;gap:12px">
      <div class="field grow" style="min-width:220px"><label>Campaign goal</label>${select(GOALS, ui.goal, 'data-change="goal"')}</div>
      <div class="field grow" style="min-width:200px"><label>Select lead list</label>${select(store.s.lists.map((l) => [l.id, l.name]), ui.list, 'data-change="list"')}</div>
      <button class="btn outline" data-action="add-list">${icon('plus', 16)} Add audience / list</button>
    </div>
    <div class="muted small mt8" style="margin-left:calc(50% - 40px)">${a.leads.length} selected records</div>
    <div class="label mt12">Selected cohort</div>
    <div class="card mt8" style="padding:14px 18px"><div class="kpi-inline">
      <div class="row"><span class="ico-circle">${icon('users', 20)}</span><span class="value num" style="font-size:20px;font-weight:700">${c.complete}</span><div><div class="strong">Complete</div><div class="muted small">100% · 6/6 fields</div>${dots(6)}</div></div>
      <div class="row"><span class="ico-circle">${icon('halfCircle', 20)}</span><span class="num" style="font-size:20px;font-weight:700">${c.partial}</span><div><div class="strong">Partial</div><div class="muted small">50% · 3/6 fields</div>${dots(3)}</div></div>
      <div class="row"><span class="ico-circle">${icon('dashedCircle', 20)}</span><span class="num" style="font-size:20px;font-weight:700">${c.nomatch}</span><div><div class="strong">No match</div><div class="muted small">0% · 0/6 fields</div>${dots(0)}</div></div>
    </div></div>
    <div class="label mt16">Filters</div>
    <div class="row wrap mt8" style="gap:24px;align-items:flex-end">
      <div class="field" style="min-width:240px"><label class="muted small">Qualification</label>${select([['1', 'Qualified only'], ['0', 'All qualification statuses']], ui.qualOnly ? '1' : '0', 'data-change="qual"')}</div>
      <div class="stack sm">
        <label class="row small"><input type="checkbox" class="check" data-change="perm" ${ui.requirePerm ? 'checked' : ''}> Require channel permission <span title="Leads need recorded permission for at least one selected channel">${icon('info', 14, 'muted')}</span></label>
        <label class="row small"><input type="checkbox" class="check" data-change="supp" ${ui.excludeSupp ? 'checked' : ''}> Exclude suppressed contacts <span title="Suppressed contacts are never messaged">${icon('info', 14, 'muted')}</span></label>
      </div>
    </div>
    ${!ui.requirePerm || !ui.excludeSupp ? `<div class="callout warn mt12">${icon('alert', 18)}<span>Workspace contact policies still block channels without permission and suppressed contacts at send time. <a href="#/demo/settings/contact-policies">Contact policies</a></span></div>` : ''}
    <div class="row between mt16"><div class="label">Audience preview <span class="muted">(${rows.length} of ${a.leads.length})</span></div><button class="link-btn small" data-action="show-all">${ui.showAll ? 'Show sample' : 'Show more'}</button></div>
    <div class="table-wrap mt8"><table class="tbl"><thead><tr><th>Contact</th><th>Enrichment</th><th>Qualification</th><th>Eligibility</th></tr></thead><tbody>
      ${rows.map((l) => `<tr><td><div class="cell-person">${avatar(l.initials, 'sm')}<div><a class="nm" href="#/demo/leads/${l.id}" style="color:inherit">${esc(l.name)}</a><div class="co">${esc(l.company || 'Not found')}</div></div></div></td>
        <td><div class="row nowrap">${dots(l.found)}<span class="small">${enrichLabel(l)} (${enrichPct(l)}%)</span></div></td>
        <td>${statusBadge(l.qual, { tone: l.qual === 'Qualified' ? '' : 'gray' })}</td>
        <td>${a.why.has(l.id) ? `<span class="badge gray" title="${{ qual: 'Qualification pending or failed', perm: 'Missing channel permission', supp: 'Suppressed contact' }[a.why.get(l.id)]}">Excluded</span>` : '<span class="badge">Eligible</span>'}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}

function preview(a) {
  const n = a.leads.length, e = a.eligible.length, x = a.excluded.length;
  const ec = a.eligible.filter((l) => l.enrich === 'complete').length;
  const pct = (v, t) => (t ? Math.round((v / t) * 100) : 0);
  return `<div class="card card-pad">
    <h2>Audience preview</h2><p class="muted">Overview of eligibility for this campaign.</p>
    <div class="grid g3 mt12" style="gap:8px">
      ${[['users', n, 'Selected records', store.s.lists.find((l) => l.id === ui.list).name], ['send', e, 'Eligible', `${pct(e, n)}% of selected`], ['user', x, 'Excluded', `${pct(x, n)}% of selected`]].map(([ic, v, l, m]) => `<div class="card" style="padding:12px"><span class="ico-circle sm">${icon(ic, 17)}</span><div class="num mt8" style="font-size:22px;font-weight:700">${v}</div><div class="small">${l}</div><div class="muted tiny">${esc(m)}</div></div>`).join('')}
    </div>
    <div class="mt16">${bar(pct(e, n), 'lg')}</div>
    <div class="row small mt8" style="gap:16px"><span class="row" style="gap:6px"><i class="cs-dot"></i>${e} eligible (${pct(e, n)}%)</span><span class="row muted" style="gap:6px"><i class="cs-dot gray"></i>${x} excluded (${pct(x, n)}%)</span></div>
    <div class="callout mt12" style="display:block"><div class="strong small">Eligible breakdown by enrichment</div><div class="row mt8"><span class="num strong" style="font-size:20px">${ec}</span><span class="small">Complete (100%)</span><span class="vdivider" style="margin:0 12px"></span><span class="num strong" style="font-size:20px">${e - ec}</span><span class="small">Partial (50%)</span></div></div>
    <div class="card mt12" style="padding:12px 14px"><div class="strong small mb8">Exclusion breakdown</div>
      ${[['users', a.reasons.qual, 'Qualification pending or failed'], ['shieldCheck', a.reasons.perm, 'Missing channel permission'], ['user', a.reasons.supp, 'Suppressed contacts']].map(([ic, v, l]) => `<div class="row" style="padding:6px 0"><span class="ico-circle sm gray">${icon(ic, 15)}</span><span class="num strong" style="width:28px">${v}</span><span class="grow small">${l}</span><span class="muted small">${pct(v, x)}% of excluded</span></div>`).join('')}</div>
    <p class="muted tiny mt12">${icon('info', 13)} Excluded contacts will not be included in this campaign, but remain in your workspace.</p></div>`;
}

function channelsStep(a) {
  const s = store.s;
  const optIn = a.eligible.filter((l) => l.whatsappOptIn).length;
  const rows = [
    ['Email', 'mail', 'Campaign messages from Upshifters outreach', a.eligible.length, s.integrations.find((i) => i.id === 'email').status],
    ['WhatsApp', 'whatsapp', 'Approved templates; free-form only inside the service window', Math.max(optIn, Math.round(a.eligible.length * 0.4)), s.integrations.find((i) => i.id === 'whatsapp').status],
    ['LinkedIn tasks', 'linkedin', 'Assisted tasks for owners — no automated messages', a.eligible.filter((l) => l.linkedin).length, 'Enabled'],
  ];
  return `<div class="card card-pad"><h2>Channels</h2><p class="muted">Choose how eligible contacts are reached. Each contact still needs permission per channel.</p>
    <div class="stack mt16">${rows.map(([ch, ic, sub, n, st]) => `<div class="card" style="padding:14px 16px;${ui.channels[ch] ? 'border-color:var(--blue-300)' : ''}"><div class="row">
      <span class="ico-circle">${icon(ic, 20)}</span><div class="grow"><div class="strong">${ch}</div><div class="muted small">${sub}</div></div>
      <div style="text-align:right;margin-right:12px"><div class="num strong">${n}</div><div class="muted tiny">channel-eligible</div></div>
      ${statusBadge(st, { tone: st === 'Needs authorization' ? 'amber' : '' })}${toggle(ui.channels[ch], `data-change="channel" data-ch="${ch}" aria-label="${ch}"`)}</div>
      ${ch === 'Email' && st !== 'Connected' && ui.channels.Email ? `<div class="callout warn mt12">${icon('alert', 16)}<span>Email connection needs authorization. Sends will wait until it is reconnected. <a href="#/demo/settings/integrations/email">Review connection</a></span></div>` : ''}</div>`).join('')}</div></div>`;
}

function messagesStep() {
  const s = store.s;
  const chosen = Object.keys(ui.channels).filter((c) => ui.channels[c]);
  const tplFor = (ch) => s.templates.filter((t) => (ch === 'LinkedIn tasks' ? t.channel === 'LinkedIn' : t.channel === ch));
  return `<div class="card card-pad"><h2>Messages & Workflow</h2><p class="muted">Pick a template per channel and the workflow that sequences them.</p>
    <div class="stack mt16">${chosen.length ? chosen.map((ch) => { const t = s.templates.find((x) => x.id === ui.tpl[ch]); return `<div class="card" style="padding:14px 16px"><div class="row wrap">
      <span class="ico-circle">${icon(ch === 'Email' ? 'mail' : ch === 'WhatsApp' ? 'whatsapp' : 'linkedin', 18)}</span><div class="strong" style="width:120px">${ch}</div>
      <div class="grow">${select(tplFor(ch).map((x) => [x.id, `${x.name} · ${x.status}`]), ui.tpl[ch], `data-change="tpl" data-ch="${ch}"`)}</div><a class="btn sm" href="#/demo/campaigns/templates">Edit templates</a></div>
      ${t ? `<div class="cs-msg mt12">${t.subject ? `<div class="strong small mb8">${esc(t.subject)}</div>` : ''}${esc(t.body).replace(/\n/g, '<br>')}</div>` : ''}</div>`; }).join('') : '<div class="empty">Select at least one channel in step 2.</div>'}
    </div>
    <div class="divider"></div>
    <div class="form-grid">
      <div class="field"><label>Workflow</label>${select(s.workflows.filter((w) => w.status !== 'Draft').map((w) => [w.id, `${w.name} · ${w.published}`]), ui.workflow, 'data-change="workflow"')}</div>
      <div class="field"><label>Wait for reply before next step</label>${select([['1', '1 day'], ['2', '2 days'], ['3', '3 days']], ui.waitDays, 'data-change="wait"')}</div>
    </div>
    <div class="setting-row mt8"><div class="grow"><div>Stop automated follow-ups after a reply</div><div class="muted small">The conversation moves to the owner in Unified Inbox.</div></div>${toggle(ui.stopOnReply, 'data-change="stop"')}</div>
    <a class="small" href="#/demo/workflows/${ui.workflow}/builder">Open workflow in builder ${icon('external', 13)}</a></div>`;
}

function scheduleStep(a) {
  const daily = +ui.dailyCap || 1;
  return `<div class="card card-pad"><h2>Schedule</h2><p class="muted">Set when outreach starts and the hours messages may be sent.</p>
    <div class="form-grid mt16">
      <div class="field"><label>Start date</label><input class="input" type="date" value="${ui.start}" data-change="start"></div>
      <div class="field"><label>End date</label><input class="input" type="date" value="${ui.end}" data-change="end"></div>
      <div class="field"><label>Sending window</label>${select(['08:00 – 16:00', '09:00 – 17:00', '10:00 – 18:00'], ui.window, 'data-change="window"')}</div>
      <div class="field"><label>Sending days</label>${select(['Sunday – Thursday', 'Every day'], ui.days, 'data-change="days"')}</div>
      <div class="field"><label>Time zone</label>${select(['Asia/Riyadh (lead local time)', 'Asia/Riyadh (workspace)'], ui.tz, 'data-change="tz"')}</div>
      <div class="field"><label>Daily first-outreach limit</label><input class="input" type="number" min="1" value="${esc(ui.dailyCap)}" data-change="cap"></div>
    </div>
    <div class="callout mt16">${icon('clock', 18)}<span>At ${daily} new contacts per day, first outreach to ${a.eligible.length} eligible contacts finishes in about <b>${Math.ceil(a.eligible.length / daily)} sending day(s)</b>. Quiet hours from Contact Policies (21:00 – 08:00) always apply.</span></div></div>`;
}

function reviewStep(a) {
  const chosen = Object.keys(ui.channels).filter((c) => ui.channels[c]);
  const s = store.s;
  const wf = s.workflows.find((w) => w.id === ui.workflow);
  const row = (k, v, step) => `<div class="setting-row"><div class="muted" style="width:170px">${k}</div><div class="grow strong" style="font-weight:500">${v}</div><button class="link-btn small" data-action="goto" data-i="${step}">Edit</button></div>`;
  return `<div class="card card-pad"><h2>Review</h2><p class="muted">Check the campaign before launch. Launching in the demo only schedules it in this session.</p>
    <div class="field mt16" style="max-width:420px"><label>Campaign name</label><input class="input" value="${esc(ui.name)}" data-input="name"></div>
    <div class="mt12">
      ${row('Goal', esc(ui.goal), 0)}
      ${row('Audience', `${esc(s.lists.find((l) => l.id === ui.list).name)} · ${a.eligible.length} eligible of ${a.leads.length}`, 0)}
      ${row('Channels', chosen.join(' · ') || '<span class="muted">None selected</span>', 1)}
      ${row('Templates', chosen.map((c) => esc(s.templates.find((t) => t.id === ui.tpl[c])?.name || '—')).join(' · ') || '—', 2)}
      ${row('Workflow', `${esc(wf.name)} · ${wf.published}`, 2)}
      ${row('Schedule', `${ui.start} → ${ui.end} · ${ui.window} · ${ui.days}`, 3)}
    </div>
    ${!chosen.length ? `<div class="callout warn mt12">${icon('alert', 18)}<span>Select at least one channel before launching.</span></div>` : ''}
    <div class="callout mt12">${icon('info', 18)}<span>Demo simulation — launching will not send messages. Qualification does not grant contact permission; channel eligibility is checked again at send time.</span></div></div>`;
}

export default {
  title: 'Campaign Setup',
  render() {
    const a = audience();
    const body = [audienceStep, channelsStep, messagesStep, scheduleStep, reviewStep][ui.step](a);
    const last = ui.step === STEPS.length - 1;
    return `
    <div class="page-head"><div class="titles"><h1>Campaign Setup</h1><div class="row mt8"><span class="sub" style="margin:0">${esc(ui.name)}</span><span class="vdivider"></span><span class="badge gray">Draft</span></div></div>
      <div class="actions"><button class="btn ghost" data-action="restart">${icon('rotate', 16)} Start over</button></div></div>
    ${stepper()}
    <div class="split mt16">${body}${preview(a)}</div>
    <div class="row between mt16 cs-foot">
      <button class="btn" data-action="back">${icon('arrowLeft', 16)} ${ui.step ? 'Back' : 'Campaigns'}</button>
      <div class="row"><button class="btn" data-action="save">Save draft</button>
      ${last ? `<button class="btn primary" data-action="launch" ${Object.values(ui.channels).some(Boolean) ? '' : 'disabled'}>${icon('send', 16)} Launch campaign</button>` : `<button class="btn primary" data-action="next">Continue ${icon('arrowRight', 16)}</button>`}</div>
    </div>`;
  },
  mount(root, ctx) {
    const re = () => ctx.rerender();
    const set = (k, cast = (v) => v) => (el) => { ui[k] = cast(el.value); re(); };
    on(root, {
      click: {
        goto: (el) => { ui.step = +el.dataset.i; re(); },
        next: () => { ui.step = Math.min(ui.step + 1, STEPS.length - 1); re(); },
        back: () => { if (ui.step) { ui.step--; re(); } else ctx.navigate('/demo/campaigns'); },
        'show-all': () => { ui.showAll = !ui.showAll; re(); },
        restart: () => { ui = fresh(); re(); },
        'add-list': () => modal({ title: 'Add audience / list', body: `<div class="field"><label>Lead list</label>${select(store.s.lists.map((l) => [l.id, `${l.name} · ${l.people} people`]), ui.list, 'name="list"')}</div><p class="muted small mt8">The demo uses one list per campaign. Lists may overlap.</p>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Use list', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (value) { ui.list = form.list; re(); } }),
        save: () => {
          const a = audience();
          const existing = store.s.campaigns.find((c) => c.name === ui.name && c.status === 'Draft');
          store.update((s) => {
            const rec = { name: ui.name, goal: ui.goal, dates: 'Not scheduled', channels: Object.keys(ui.channels).filter((c) => ui.channels[c]), audience: a.eligible.length, status: 'Draft', reached: 0, replies: 0, conversions: 0, owner: 'Sara Ahmed', list: ui.list };
            if (existing) Object.assign(s.campaigns.find((c) => c.id === existing.id), rec);
            else s.campaigns.push({ id: `cmp-draft-${Date.now().toString(36)}`, ...rec });
          });
          toast('Draft saved', 'Saved in this demo session. Nothing was scheduled.');
        },
        launch: () => {
          const a = audience();
          const id = `cmp-new-${Date.now().toString(36)}`;
          const fmtD = (d) => new Date(`${d}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          store.update((s) => s.campaigns.unshift({ id, name: ui.name, goal: ui.goal, dates: `${fmtD(ui.start)} – ${fmtD(ui.end)}`, channels: Object.keys(ui.channels).filter((c) => ui.channels[c]), audience: a.eligible.length, status: 'Scheduled', reached: 0, replies: 0, conversions: 0, owner: 'Sara Ahmed', list: ui.list }));
          toast(`${ui.name} scheduled`, 'Demo simulation — no messages will be sent.');
          ui = fresh();
          ctx.navigate(`/demo/campaigns/${id}`);
        },
      },
      change: {
        goal: set('goal'), list: set('list'), workflow: set('workflow'), wait: set('waitDays'),
        start: set('start'), end: set('end'), window: set('window'), days: set('days'), tz: set('tz'), cap: set('dailyCap'),
        qual: (el) => { ui.qualOnly = el.value === '1'; re(); },
        perm: (el) => { ui.requirePerm = el.checked; re(); },
        supp: (el) => { ui.excludeSupp = el.checked; re(); },
        stop: (el) => { ui.stopOnReply = el.checked; },
        channel: (el) => { ui.channels[el.dataset.ch] = el.checked; re(); },
        tpl: (el) => { ui.tpl[el.dataset.ch] = el.value; re(); },
      },
      input: { name: (el) => { ui.name = el.value; root.querySelector('.page-head .sub').textContent = el.value; } },
    });
  },
};
