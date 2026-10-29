// 16 · Campaign Details — progress, results and execution, with tabs for audience, workflow, messages and results.
import { icon, esc, avatar, owner, statusBadge, dots, bar, tabs, on, toast, confirm, modal, searchInput, keepFocus, pct, select } from '../ui.js';
import { store, campaignById, leadById, enrichLabel, enrichPct } from '../store.js';

const ui = { tab: 'overview', q: '', state: '', id: null };
const CH_ICON = { Email: 'mail', WhatsApp: 'whatsapp', 'LinkedIn tasks': 'linkedin' };
const STATUS_ICON = { Running: 'play', Scheduled: 'calendar', Paused: 'pause', Draft: 'file', Completed: 'check' };

// Enrolled leads: the session's enrolled set for KSA, otherwise eligible leads from the campaign's list.
function enrolled(c) {
  const s = store.s;
  let leads = s.leads.filter((l) => l.inCampaign === c.id);
  if (!leads.length) {
    const list = s.lists.find((l) => l.id === c.list);
    const pool = s.leads.filter((l) => l.qual === 'Qualified' && (!list || !list.filter || l.enrich === list.filter));
    leads = pool.slice(0, c.audience);
  }
  // Named leads with real conversations first, so replies line up with Conversations.
  const withConv = new Set(s.conversations.map((x) => x.leadId));
  leads = [...leads.filter((l) => withConv.has(l.id)), ...leads.filter((l) => !withConv.has(l.id))];
  return leads.map((l, i) => ({ l, state: l.stage === 'Converted' || i < c.conversions ? 'Converted' : i < c.replies ? 'Replied' : i < c.reached ? 'Reached' : 'Awaiting outreach' }));
}

function channelStats(c) {
  if (c.channelStats) return c.channelStats;
  const chs = c.channels.filter((x) => x !== 'LinkedIn tasks');
  return chs.map((ch, i) => {
    const share = (v) => (i === 0 ? Math.ceil(v / chs.length) : Math.floor(v / chs.length));
    return { ch, sent: share(c.reached), delivered: share(c.reached), read: ch === 'WhatsApp' ? share(c.reached) : null, reached: share(c.reached), replies: share(c.replies), conv: share(c.conversions), cost: null };
  });
}

function activity(c) {
  if (c.id === 'cmp-ksa') return [
    ['whatsapp', 'Omar Ali replied on WhatsApp', 'Tomorrow at 2:00 PM Riyadh time works for me.', 'Oct 29, 2026 10:48 AM', '#/demo/conversations?c=cv-omar'],
    ['pauseCircle', 'Automated follow-ups paused for Omar Ali', 'Paused after reply', 'Oct 29, 2026 10:48 AM', '#/demo/leads/LD-1048'],
    ['calendar', 'Demo scheduling task assigned to Sara Ahmed', 'Omar Ali requested a demo tomorrow 2 PM Riyadh', 'Oct 29, 2026 10:49 AM', '#/demo/sales/tasks?task=TSK-308'],
  ];
  if (!c.reached) return [['calendar', c.status === 'Draft' ? 'Draft saved' : 'Campaign scheduled', c.dates, 'Oct 29, 2026', null]];
  return [['reply', `${c.replies} replies received`, 'Replies routed to Conversations', c.dates, '#/demo/conversations'], ['send', `${c.reached} contacts reached`, c.channels.join(' · '), c.dates, null]];
}

function overview(c, rows) {
  const s = store.s;
  const list = s.lists.find((l) => l.id === c.list);
  const comp = rows.filter((r) => r.l.enrich === 'complete').length;
  const awaiting = c.audience - c.reached;
  const stats = channelStats(c);
  return `<div class="split wide-side">
    <div class="stack">
      <div class="grid g3">
        <div class="card stat"><div class="ico">${icon('users', 24)}</div><div><div class="label">Enrolled</div><div class="value num">${c.audience}</div></div></div>
        <div class="card stat"><div class="ico">${icon('send', 24)}</div><div><div class="label">Contacts reached</div><div class="value num">${c.reached}</div></div></div>
        <div class="card stat" style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px"><div class="ico">${icon('message', 22)}</div><div><div class="label">Replies</div><div class="value num" style="font-size:22px">${c.replies}</div></div><div class="ico">${icon('bars', 22)}</div><div><div class="label">Conversions</div><div class="value num" style="font-size:22px">${c.conversions}</div></div></div>
      </div>
      <div class="card card-pad">
        <div class="row between wrap"><div><h2>Campaign progress</h2><div class="mt8"><b style="font-size:16px">${c.reached} of ${c.audience}</b> contacts reached</div><div class="muted small">${pct(c.reached, c.audience)}% outreach progress</div></div>
          <div class="row small" style="color:var(--ink-600)">${icon('users', 17, 'blue')} ${awaiting} awaiting first outreach</div></div>
        <div class="chevrons mt16">
          <div><b>${c.audience}</b>Enrolled</div><div><b>${c.reached}</b>Reached</div><div><b>${c.replies}</b>Replied</div><div><b>${c.conversions}</b>Converted</div>
        </div>
        <div class="table-wrap mt16"><div class="strong" style="padding:10px 14px">Channel performance</div><table class="tbl"><thead><tr><th>Channel</th><th class="c">Reached</th><th class="c">Replies</th><th class="c">Conversions</th></tr></thead><tbody>
          ${stats.map((x) => `<tr><td><span class="owner">${icon(CH_ICON[x.ch] || 'mail', 18, 'blue')} ${x.ch}</span></td><td class="c num">${x.reached}</td><td class="c num">${x.replies}</td><td class="c num">${x.conv}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No message channels selected.</td></tr>'}</tbody></table></div>
        <div class="card mt12" style="padding:14px 16px"><div class="row wrap"><div><div class="strong">Reply rate</div><div class="row"><span style="font-size:26px;font-weight:700">${c.reached ? pct(c.replies, c.reached, 1) : '0.0'}%</span><span class="muted small">${c.replies} of ${c.reached} reached contacts</span></div></div><div class="grow" style="min-width:160px;margin-left:24px">${bar(c.reached ? (c.replies / c.reached) * 100 : 0, 'lg')}</div></div></div>
      </div>
    </div>
    <div class="stack">
      <div class="card card-pad"><div class="row between"><h3>Enrolled audience</h3><button class="btn soft sm" data-action="tab" data-key="audience">View audience</button></div>
        <div class="grid g2 mt12" style="gap:8px">
          <div class="card row" style="padding:12px"><span class="ico-circle">${icon('users', 18)}</span><div><b style="font-size:18px">${comp}</b><div class="small">Complete</div><div class="muted tiny">100% · 6/6 fields</div></div></div>
          <div class="card row" style="padding:12px"><span class="ico-circle">${icon('halfCircle', 18)}</span><div><b style="font-size:18px">${rows.length - comp}</b><div class="small">Partial</div><div class="muted tiny">50% · 3/6 fields</div></div></div>
        </div>
        ${list ? `<a class="card row mt8" href="#/demo/prospecting/lists/${list.id}" style="padding:12px;color:inherit;text-decoration:none">${icon('database', 22, 'blue')}<div class="grow"><div class="muted tiny">Source</div><div class="small strong" style="font-weight:500">${esc(list.name)}</div><div class="muted tiny">${list.people} source records · ${c.audience} eligible</div></div>${icon('chevRight', 16)}</a>` : ''}</div>
      ${c.channels.includes('LinkedIn tasks') ? `<div class="card card-pad"><div class="row between"><h3>LinkedIn task activity</h3><a class="btn soft sm" href="#/demo/sales/tasks">View tasks</a></div>
        <a class="row mt12" href="#/demo/sales/tasks" style="color:inherit;text-decoration:none"><span style="color:#0a66c2">${icon('linkedin', 38)}</span><div class="grow"><b style="font-size:20px">${c.linkedinTasks || 0}</b><div class="muted small">Assisted tasks completed</div></div>${icon('chevRight', 16)}</a></div>` : ''}
      <div class="card card-pad"><div class="row between"><h3>Recent activity</h3><button class="btn soft sm" data-action="tab" data-key="messages">View all</button></div>
        ${activity(c).map(([ic, t, sub, at, href]) => `<${href ? `a href="${href}"` : 'div'} class="list-item" style="color:inherit;text-decoration:none;align-items:flex-start"><span class="ico-circle sm">${icon(ic, 16)}</span><div class="grow"><div class="small strong" style="font-weight:500">${esc(t)}</div><div class="muted tiny">${esc(sub)}</div></div><div class="muted tiny" style="text-align:right;max-width:90px">${esc(at)}</div></${href ? 'a' : 'div'}>`).join('')}</div>
    </div></div>`;
}

function audienceTab(rows) {
  const q = ui.q.toLowerCase();
  const view = rows.filter((r) => (!ui.state || r.state === ui.state) && (!q || r.l.name.toLowerCase().includes(q) || (r.l.company || '').toLowerCase().includes(q)));
  return `<div class="filters">${searchInput('Search enrolled contacts...', ui.q, 'data-input="q" id="aud-q"')}${select([['', 'All states'], 'Awaiting outreach', 'Reached', 'Replied', 'Converted'], ui.state, 'data-change="state" aria-label="State"')}</div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Contact</th><th>Enrichment</th><th>Qualification</th><th>Outreach state</th><th>Owner</th></tr></thead><tbody>
    ${view.slice(0, 40).map(({ l, state }) => `<tr class="clickable" data-action="lead" data-id="${l.id}"><td><div class="cell-person">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td>
      <td><div class="row nowrap">${dots(l.found)}<span class="small">${enrichLabel(l)} ${enrichPct(l)}%</span></div></td><td>${statusBadge(l.qual)}</td>
      <td>${statusBadge(state, { tone: state === 'Awaiting outreach' ? 'gray' : '' })}</td><td>${owner(l.owner)}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">No contacts match.</div></td></tr>'}
    </tbody></table></div><p class="muted small mt8">Showing ${Math.min(40, view.length)} of ${view.length} enrolled contacts. Excluded contacts are not listed.</p>`;
}

function workflowTab(c) {
  const steps = [
    ['bolt', 'Enrollment', `${c.audience} eligible contacts enrolled from list`],
    ['shieldCheck', 'Eligibility check', 'Qualification + channel permission + suppression'],
    ...c.channels.filter((x) => x !== 'LinkedIn tasks').map((ch) => [CH_ICON[ch], `Send ${ch} message`, ch === 'WhatsApp' ? 'Approved template · WhatsApp Demo Invite' : 'Template · B2B Introduction']),
    ['clock', 'Wait for reply', 'Up to 2 days'],
    ...(c.channels.includes('LinkedIn tasks') ? [['linkedin', 'Create LinkedIn task', 'Assisted — owner sends manually']] : []),
    ['user', 'Hand off to sales on reply', 'Automated follow-ups stop after a reply'],
  ];
  return `<div class="card card-pad"><div class="row between"><h2>Campaign sequence</h2><a class="btn" href="#/demo/workflows/wf-enrich/builder">${icon('flow', 16)} Open in Workflow Builder</a></div>
    <div class="mt12">${steps.map(([ic, t, d], i) => `<div class="run-step"><span class="ic" style="background:var(--blue-50);color:var(--blue-600)">${icon(ic, 16)}</span><div class="grow"><div class="strong">${i + 1}. ${esc(t)}</div><div class="muted small">${esc(d)}</div></div></div>`).join('')}</div></div>`;
}

function messagesTab(c, rows) {
  const s = store.s;
  const tpls = s.templates.filter((t) => c.channels.some((ch) => ch.startsWith(t.channel)));
  const ids = new Set(rows.map((r) => r.l.id));
  const convs = s.conversations.filter((x) => ids.has(x.leadId));
  return `<div class="split"><div class="card card-pad"><h2 class="mb12">Replies</h2>
      ${convs.length ? convs.map((cv) => { const l = leadById(cv.leadId); const m = cv.messages[cv.messages.length - 1]; return `<a class="list-item" href="#/demo/conversations?c=${cv.id}" style="color:inherit;text-decoration:none">${avatar(l.initials)}<div class="grow"><div class="row"><span class="strong">${esc(l.name)}</span><span class="muted small">${cv.channel} · ${esc(cv.time)}</span></div><div class="muted small">${esc(m.text)}</div></div>${statusBadge(cv.status)}${icon('chevRight', 16)}</a>`; }).join('') : `<div class="empty">${icon('message', 30)}<div>No replies yet.</div></div>`}</div>
    <div class="card card-pad"><div class="row between mb12"><h3>Messages used</h3><a class="small" href="#/demo/campaigns/templates">Template Library</a></div>
      ${tpls.map((t) => `<div class="list-item"><span class="ico-circle sm">${icon(t.channel === 'Email' ? 'mail' : t.channel === 'WhatsApp' ? 'whatsapp' : 'linkedin', 15)}</span><div class="grow"><div class="small strong">${esc(t.name)}</div><div class="muted tiny">${t.channel} · ${t.language}</div></div>${statusBadge(t.status)}</div>`).join('')}</div></div>`;
}

function resultsTab(c, rows) {
  const stats = channelStats(c);
  const conv = rows.filter((r) => r.state === 'Converted');
  return `<div class="stack"><div class="table-wrap"><table class="tbl"><thead><tr><th>Channel</th><th class="c">Sent</th><th class="c">Delivered</th><th class="c">Read</th><th class="c">Replied</th><th class="c">Converted</th><th class="c">Reply rate</th><th class="r">Recorded cost</th></tr></thead><tbody>
    ${stats.map((x) => `<tr><td><span class="owner">${icon(CH_ICON[x.ch] || 'mail', 18, 'blue')} ${x.ch}</span></td><td class="c">${x.sent}</td><td class="c">${x.delivered}</td><td class="c">${x.read ?? '—'}</td><td class="c">${x.replies}</td><td class="c">${x.conv}</td><td class="c">${x.delivered ? pct(x.replies, x.delivered, 1) : '0.0'}%</td><td class="r">${x.cost ? `SAR ${x.cost}` : '—'}</td></tr>`).join('')}
    </tbody></table></div><p class="muted small">Reply rate = replied / delivered. — means unavailable. <a href="#/demo/analytics/outreach">Outreach Performance</a></p>
    <div class="card card-pad"><h3 class="mb8">Conversions (${conv.length})</h3>${conv.length ? conv.map(({ l }) => `<a class="list-item" href="#/demo/leads/${l.id}" style="color:inherit;text-decoration:none">${avatar(l.initials, 'sm')}<span class="grow">${esc(l.name)} <span class="muted small">${esc(l.company || '')}</span></span>${owner(l.owner)}</a>`).join('') : '<p class="muted">No conversions recorded yet.</p>'}</div></div>`;
}

export default {
  title: 'Campaign Details',
  render(ctx) {
    const c = campaignById(ctx.params.campaignId);
    if (!c) return `<div class="card card-pad">Campaign not found. <a href="#/demo/campaigns">Back to Campaigns</a></div>`;
    if (ui.id !== c.id) Object.assign(ui, { id: c.id, tab: 'overview', q: '', state: '' });
    const rows = enrolled(c);
    const primary = c.status === 'Running' ? `<button class="btn primary" data-action="pause">${icon('pause', 16)} Pause campaign</button>`
      : c.status === 'Paused' ? `<button class="btn primary" data-action="resume">${icon('play', 16)} Resume campaign</button>`
      : c.status === 'Draft' ? `<a class="btn primary" href="#/demo/campaigns/new">${icon('edit', 16)} Continue setup</a>`
      : c.status === 'Scheduled' ? `<button class="btn primary" data-action="unschedule">${icon('x', 16)} Cancel schedule</button>`
      : `<button class="btn primary" data-action="duplicate">${icon('copy', 16)} Duplicate</button>`;
    const body = { overview: () => overview(c, rows), audience: () => audienceTab(rows), workflow: () => workflowTab(c), messages: () => messagesTab(c, rows), results: () => resultsTab(c, rows) }[ui.tab]();
    return `
    <nav class="breadcrumb"><a href="#/demo/campaigns">Lead Generation</a><span>/</span><a href="#/demo/campaigns">Outreach</a><span>/</span><span>${esc(c.name)}</span></nav>
    <div class="page-head"><div class="titles">
      <div class="title-row"><h1>${esc(c.name)}</h1><span class="badge pill" style="height:28px;padding:0 12px">${c.status === 'Running' ? '<span class="bdot"></span>' : icon(STATUS_ICON[c.status], 14)} ${c.status}</span></div>
      <div class="row wrap mt8"><span class="muted">Owner: ${esc(c.owner)}</span>${c.channels.map((ch) => `<span class="chip">${ch === 'LinkedIn tasks' ? `<span style="color:#0a66c2">${icon('linkedin', 16)}</span>` : icon(CH_ICON[ch], 16, 'blue')} ${ch}</span>`).join('')}<span class="muted small">${esc(c.dates)}</span></div></div>
      <div class="actions"><button class="btn" data-action="edit">${icon('edit', 16)} Edit</button>${primary}</div></div>
    ${tabs([['overview', 'Overview'], ['audience', 'Audience'], ['workflow', 'Workflow'], ['messages', 'Messages & Replies'], ['results', 'Results']], ui.tab)}
    ${body}`;
  },
  mount(root, ctx) {
    const c = campaignById(ctx.params.campaignId);
    if (!c) return;
    const setStatus = (st, msg) => { store.update(() => { campaignById(c.id).status = st; }); toast(msg, 'Demo simulation — no live campaign was affected.'); ctx.rerender(); };
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        lead: (el) => ctx.navigate(`/demo/leads/${el.dataset.id}`),
        pause: () => confirm('Pause campaign?', 'Scheduled outreach stops until you resume. Replies keep arriving in Conversations.', 'Pause campaign').then((ok) => ok && setStatus('Paused', 'Campaign paused')),
        resume: () => setStatus('Running', 'Campaign resumed'),
        unschedule: () => confirm('Cancel schedule?', 'The campaign returns to Draft. No messages have been sent.', 'Cancel schedule').then((ok) => ok && setStatus('Draft', 'Schedule cancelled')),
        duplicate: () => { const id = `cmp-copy-${Date.now().toString(36)}`; store.update((s) => s.campaigns.push({ ...c, id, name: `${c.name} (copy)`, status: 'Draft', dates: 'Not scheduled', reached: 0, replies: 0, conversions: 0, channelStats: undefined })); toast('Campaign duplicated', 'Saved as a draft in this demo session.'); ctx.navigate(`/demo/campaigns/${id}`); },
        edit: () => modal({ title: 'Edit campaign', body: `<div class="stack"><div class="field"><label>Campaign name</label><input class="input" name="name" value="${esc(c.name)}"></div><div class="field"><label>Goal</label><input class="input" name="goal" value="${esc(c.goal || '')}"></div><div class="field"><label>Schedule</label><input class="input" name="dates" value="${esc(c.dates)}"></div><p class="muted small">Audience and channel changes are made in Campaign Setup.</p></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Save changes', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; store.update(() => Object.assign(campaignById(c.id), { name: form.name || c.name, goal: form.goal, dates: form.dates || c.dates })); toast('Campaign updated', 'Saved in this demo session only.'); ctx.rerender(); }),
      },
      change: { state: (el) => { ui.state = el.value; ctx.rerender(); } },
      input: { q: (el) => { ui.q = el.value; keepFocus(document, '#aud-q', ctx.rerender); } },
    });
  },
};
