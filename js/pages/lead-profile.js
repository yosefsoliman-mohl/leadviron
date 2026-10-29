// 04 · Lead Profile — identity, enrichment, next step, eligibility and tabbed history.
import { icon, esc, avatar, statusBadge, bar, select, tabs, on, toast, modal, source as sourceCell } from '../ui.js';
import { store, leadById, enrichLabel, enrichPct, fieldValue, ENRICH_FIELDS, FIELD_LABELS, OWNERS, STAGES, cohortCounts, formatDue } from '../store.js';

const ui = { tab: 'overview' };
const TABS = [['overview', 'Overview'], ['sources', 'Sources'], ['enrichment', 'Enrichment'], ['qual', 'Qualification & Score'], ['conversations', 'Conversations'], ['tasks', 'Tasks'], ['conversions', 'Conversions'], ['consent', 'Consent']];

function enrichmentTable(l) {
  return `<div class="table-wrap flat"><table class="tbl" style="font-size:13.5px"><thead><tr><th style="background:none;padding-left:0">Field</th><th style="background:none">Value</th><th style="background:none">Status</th>${ui.tab === 'enrichment' ? '<th style="background:none">Source</th><th style="background:none">Confidence</th>' : ''}</tr></thead><tbody>
    ${ENRICH_FIELDS.map((f) => {
      const v = fieldValue(l, f);
      return `<tr><td style="padding-left:0">${FIELD_LABELS[f]}</td>
        <td>${v ? `<span class="strong" style="font-weight:500">${esc(v)}</span>` : '<span class="chip gray" style="padding:2px 12px;min-width:200px">Not found</span>'}</td>
        <td>${v ? `<span class="owner blue">${icon('checkCircle', 18)} <span style="color:var(--blue-600)">Found</span></span>` : `<span class="owner muted">${icon('minusCircle', 18)} Missing</span>`}</td>
        ${ui.tab === 'enrichment' ? `<td class="muted">${v ? 'Demo Provider A' : '—'}</td><td class="muted">${v ? `${88 + (f.length % 9)}%` : '—'}</td>` : ''}</tr>`;
    }).join('')}</tbody></table></div>`;
}

function activity(l) {
  const items = [];
  const conv = store.s.conversations.find((c) => c.leadId === l.id);
  if (conv) { const m = conv.messages[conv.messages.length - 1]; items.push([m.time, conv.channel === 'WhatsApp' ? 'whatsapp' : 'mail', `${conv.channel} ${m.from === 'lead' ? 'reply received' : 'message sent'}`, m.text]); }
  items.push(['10:42 AM', 'database', `Enrichment completed — ${l.found} of 6 fields found`, l.found === 6 ? 'All target fields found.' : l.found ? 'Company, job title and city found. Company size, industry and LinkedIn URL not found.' : 'No external data found. Original contact details retained.']);
  items.push(['Oct 28', 'fileUp', `Lead captured from ${l.source}`, 'Original name, email and phone stored at intake.']);
  return items.map(([t, ic, title, sub]) => `<div class="tl-item"><span class="ico-circle sm">${icon(ic, 16)}</span><div><div><span class="muted small">${esc(t)} ·</span> <span class="strong" style="font-weight:500">${esc(title)}</span></div><div class="muted small">${esc(sub)}</div></div></div>`).join('');
}

function tabBody(l) {
  const s = store.s;
  switch (ui.tab) {
    case 'sources': return `<div class="card card-pad"><h3 class="mb12">Source events</h3><table class="tbl"><thead><tr><th>Event</th><th>Source</th><th>Captured</th><th>Fields provided</th></tr></thead><tbody>
      <tr><td>EVT-${1100 + (parseInt(l.id.slice(3), 10) % 90)}</td><td>${sourceCell(l.source)}</td><td>Oct 28, 2026 · 4:12 PM</td><td>Name, email, phone</td></tr>
      ${s.duplicates.some((d) => d.a.id === l.id) ? `<tr><td>EVT-1203</td><td>CSV import</td><td>Oct 29, 2026 · 10:52 AM</td><td>Name, email, phone, company <span class="badge gray">Possible duplicate</span></td></tr>` : ''}
      </tbody></table><p class="muted small mt12">Original contact details are retained even when enrichment finds nothing.</p></div>`;
    case 'enrichment': return `<div class="card card-pad"><div class="row between mb12"><h3>Enrichment results · ENR-1024</h3>${statusBadge(enrichLabel(l))}</div>${enrichmentTable(l)}<div class="row mt16"><button class="btn" data-action="retry">${icon('refresh', 16)} Retry enrichment</button><a class="btn ghost" href="#/demo/intelligence/enrichment">Open Enrichment Operations</a></div></div>`;
    case 'qual': {
      const b = l.score == null ? null : [Math.round(l.score * 0.42), Math.round(l.score * 0.31), Math.round(l.score * 0.17)];
      return `<div class="grid g2"><div class="card card-pad"><h3>Qualification</h3><div class="mt12">${statusBadge(l.qual)}</div><p class="muted mt12">${esc(l.qualReason || (l.qual === 'Qualified' ? 'Required signals confirmed by B2B qualification rules.' : 'Required information missing.'))}</p><a class="small" href="#/demo/intelligence/qualification">View qualification rules</a></div>
        <div class="card card-pad"><h3>Priority score</h3>${b ? `<div class="value mt8" style="font-size:32px;font-weight:700">${l.score}<span class="muted" style="font-size:18px"> / 100</span></div>
        ${[['Company fit', b[0], 40], ['Role fit', b[1], 30], ['Engagement', b[2], 20], ['Recency', l.score - b[0] - b[1] - b[2], 10]].map(([n, v, m]) => `<div class="row mt8"><span style="width:110px">${n}</span><div class="grow">${bar((v / m) * 100)}</div><span class="num small" style="width:50px;text-align:right">${Math.min(v, m)} / ${m}</span></div>`).join('')}` : '<p class="muted mt8">Not assessed — required inputs unknown.</p>'}<a class="small mt12" style="display:inline-block" href="#/demo/intelligence/scoring">View scoring rules</a></div></div>`;
    }
    case 'conversations': {
      const cs = s.conversations.filter((c) => c.leadId === l.id);
      return `<div class="card card-pad">${cs.length ? cs.map((c) => `<a class="list-item" href="#/demo/conversations?c=${c.id}" style="color:inherit;text-decoration:none"><span class="ico-circle">${icon(c.channel === 'WhatsApp' ? 'whatsapp' : 'mail', 18)}</span><div class="grow"><div class="strong">${c.channel} · ${c.messages.length} messages</div><div class="muted small">${esc(c.messages[c.messages.length - 1].text)}</div></div>${statusBadge(c.status)}${icon('chevRight', 16)}</a>`).join('') : '<div class="empty">No conversations yet.</div>'}</div>`;
    }
    case 'tasks': {
      const ts = s.tasks.filter((t) => t.leadId === l.id);
      return `<div class="card card-pad">${ts.length ? ts.map((t) => { const d = formatDue(t.due); return `<a class="list-item" href="#/demo/sales/tasks?task=${t.id}" style="color:inherit;text-decoration:none"><span class="ico-circle">${icon('calendarCheck', 18)}</span><div class="grow"><div class="strong">${esc(t.title)}</div><div class="muted small">${d.date} · ${d.time} · ${esc(t.owner)}</div></div>${statusBadge(t.status)}</a>`; }).join('') : '<div class="empty">No tasks for this lead.</div>'}<button class="btn mt12" data-action="task">${icon('plus', 16)} Create task</button></div>`;
    }
    case 'conversions': return `<div class="card card-pad">${l.stage === 'Converted' ? `<div class="list-item"><span class="ico-circle">${icon('bars', 18)}</span><div class="grow"><div class="strong">Customer conversion recorded</div><div class="muted small">Oct 27, 2026 · by ${esc(l.owner)}</div></div>${statusBadge('Converted')}</div>` : `<div class="empty">${icon('bars', 30)}<div>No conversion recorded yet.</div><button class="btn sm mt12" data-action="convert">Record conversion</button></div>`}</div>`;
    case 'consent': return `<div class="card card-pad"><table class="tbl"><thead><tr><th>Channel</th><th>Status</th><th>Recorded</th></tr></thead><tbody>
      <tr><td>${icon('mail', 16)} Email</td><td>${esc(l.consent.email)}</td><td class="muted">Web form · Oct 28</td></tr>
      <tr><td>${icon('whatsapp', 16)} WhatsApp</td><td>${esc(l.consent.whatsapp)}</td><td class="muted">${l.whatsappOptIn ? 'Form checkbox · Oct 28' : '—'}</td></tr>
      <tr><td>${icon('linkedin', 16)} LinkedIn</td><td>${esc(l.consent.linkedin)}</td><td class="muted">—</td></tr></tbody></table>
      <div class="callout mt12">${icon('info', 18)}<span>Qualification and enrichment do not grant contact permission. <a href="#/demo/settings/contact-policies">Contact policies</a></span></div></div>`;
    default: return null;
  }
}

export default {
  title: 'Lead profile',
  render(ctx) {
    const l = leadById(ctx.params.leadId);
    if (!l) return `<div class="card card-pad">Lead not found. <a href="#/demo/leads">Back to All Leads</a></div>`;
    const s = store.s;
    const idx = s.leads.indexOf(l);
    const c = cohortCounts();
    const task = s.tasks.find((t) => t.leadId === l.id && t.status !== 'Done' && t.type === 'Meeting') || s.tasks.find((t) => t.leadId === l.id && t.status !== 'Done');
    const conv = s.conversations.find((x) => x.leadId === l.id);
    const pc = enrichPct(l);
    const body = tabBody(l);
    return `
    <nav class="breadcrumb"><a href="#/demo/leads">Leads</a><span>/</span><a href="#/demo/prospecting/lists/lst-ksa">${esc(l.cohort)}</a><span>/</span><span>${esc(l.name)}</span></nav>
    <div class="row wrap" style="gap:18px;margin-bottom:16px">
      ${avatar(l.initials, 'xl')}
      <div class="grow"><div class="title-row"><h1>${esc(l.name)}</h1></div><div class="row wrap mt8" style="font-size:16px;color:var(--ink-600)">${esc([l.title, l.company].filter(Boolean).join(' · ') || 'Company and role unknown')} <span class="chip gray" style="padding:2px 10px">${l.id}</span></div></div>
      <div class="row"><button class="btn" data-action="nav" data-dir="-1" ${idx <= 0 ? 'disabled' : ''} aria-label="Previous lead">${icon('chevLeft', 16)}</button><span class="num" style="min-width:70px;text-align:center">${idx + 1} of ${s.leads.length}</span><button class="btn" data-action="nav" data-dir="1" ${idx >= s.leads.length - 1 ? 'disabled' : ''} aria-label="Next lead">${icon('chevRight', 16)}</button></div>
      <button class="btn" data-action="edit">${icon('edit', 16)} Edit</button>
      <button class="btn" data-action="campaign">${icon('userPlus', 16)} Add to campaign</button>
      <button class="btn primary" data-action="task">${icon('plus', 16)} Create task</button>
    </div>
    <div class="card" style="padding:12px 20px"><div class="kpi-inline">
      <div class="row"><span class="ico-circle">${icon('users', 20)}</span><span class="strong">${esc(l.qual)}</span></div>
      <div class="row"><span class="ico-circle">${icon('target', 20)}</span><div><div class="muted small">Score</div><div class="strong" style="font-size:18px">${l.score ?? '—'} / 100</div></div></div>
      <div class="row"><span class="ico-circle">${icon('bars', 20)}</span><div><div class="muted small">Stage</div>${select(STAGES, l.stage, 'data-change="stage" aria-label="Stage"', 'sm')}</div></div>
      <div class="row"><span class="ico-circle">${icon('user', 20)}</span><div><div class="muted small">Owner</div>${select(OWNERS, l.owner, 'data-change="owner" aria-label="Owner"', 'sm')}</div></div>
    </div></div>
    <div class="mt12">${tabs(TABS, ui.tab)}</div>
    ${body ?? `<div class="split">
      <div class="stack">
        <div class="card card-pad"><div class="row mb12"><h2>Original contact details</h2><span class="muted small">Available before enrichment</span></div>
          <div class="grid g3">
            <div class="row" style="align-items:flex-start">${icon('mail', 22, 'blue')}<div><div class="muted small">Email</div><a href="#" data-action="noop">${esc(l.email)}</a><div class="muted small">Provided by lead</div></div></div>
            <div class="row" style="align-items:flex-start">${icon('phone', 22, 'blue')}<div><div class="muted small">Phone</div><div class="strong" style="font-weight:500">${esc(l.phone)}</div><div class="muted small">Provided by lead</div></div></div>
            <div class="row" style="align-items:flex-start">${icon('megaphone', 22, 'blue')}<div><div class="muted small">Original source</div><div class="strong" style="font-weight:500">${esc(l.source)}</div><div class="muted small">Captured at intake</div></div></div>
          </div></div>
        <div class="card card-pad"><div class="row between"><h2>Enrichment overview</h2>${statusBadge(enrichLabel(l))}</div>
          <div class="row mt8" style="gap:20px"><span style="font-size:44px;font-weight:700;color:var(--blue-600)">${pc}%</span><div class="grow"><div>${l.found} of 6 target fields found</div><div class="mt8" style="max-width:360px">${bar(pc, 'lg')}</div></div></div>
          <div class="mt8">${enrichmentTable(l)}</div>
          ${l.found < 6 ? '<button class="btn outline sm mt12" data-action="review-missing">Review missing fields</button>' : ''}</div>
        <div class="card card-pad"><h2 class="mb8">Recent activity</h2><div class="timeline">${activity(l)}</div></div>
      </div>
      <div class="stack">
        <div class="card card-pad"><div class="row between"><h3>Cohort overview ${icon('info', 15, 'muted')}</h3><div style="text-align:right"><div class="strong">${c.total} leads</div><div class="muted tiny">Selected demo cohort</div></div></div>
          <div class="grid g3 mt12" style="gap:8px">${[['complete', c.complete, 'Full enrichment', 100], ['partial', c.partial, 'Partial enrichment', 50], ['nomatch', c.nomatch, 'No match', 0]].map(([k, n, t, p]) => `<a class="card ${l.enrich === k ? 'selected' : ''}" href="#/demo/leads" data-action="cohort" data-k="${k}" style="padding:10px;color:inherit;text-decoration:none"><div class="strong" style="font-size:18px">${n}</div><div class="tiny">${t}</div><div class="row mt8">${bar(p)}<span class="tiny muted">${p}%</span></div></a>`).join('')}</div>
          <div class="muted small mt8">No match: 10% of cohort (${c.nomatch} of ${c.total})</div></div>
        <div class="card card-pad"><h3>Next step</h3>${task ? `<div class="row mt12" style="align-items:flex-start"><span class="ico-circle">${icon('calendarCheck', 20)}</span><div class="stack sm grow" style="gap:4px"><div class="strong" style="font-size:16px">${esc(task.title)}</div><div class="muted small">${icon('calendar', 14)} ${formatDue(task.due).date} • ${formatDue(task.due).time} (Riyadh)</div><div class="muted small">${icon('user', 14)} ${esc(task.owner)}</div><div class="muted small">${icon('clock', 14)} ${esc(task.status)}</div></div></div><a class="btn primary block mt12" href="#/demo/sales/tasks?task=${task.id}">Open task</a>` : `<p class="muted mt8">No open tasks.</p><button class="btn block mt12" data-action="task">${icon('plus', 16)} Create task</button>`}</div>
        <div class="card card-pad"><h3 class="mb8">Contact eligibility</h3>
          <div class="row between list-item" style="padding:6px 0">${icon('mail', 18, 'blue')}<span class="grow">Email</span><span class="small">${esc(l.consent.email)}</span></div>
          <div class="row between list-item" style="padding:6px 0">${icon('whatsapp', 18, 'blue')}<span class="grow">WhatsApp</span><span class="small">${esc(l.consent.whatsapp)}</span></div>
          <div class="row between list-item" style="padding:6px 0">${icon('linkedin', 18, 'blue')}<span class="grow">LinkedIn</span><span class="small">${esc(l.consent.linkedin)}</span></div>
          ${conv && conv.automationPaused ? `<div class="callout mt8">${icon('pauseCircle', 18)}<span>Automation paused after reply</span></div>` : ''}</div>
      </div>
    </div>`}`;
  },
  mount(root, ctx) {
    const l = leadById(ctx.params.leadId);
    if (!l) return;
    const upd = (fn, msg) => { store.update(() => fn(leadById(l.id))); toast(msg, 'Saved in this demo session only.'); ctx.rerender(); };
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        nav: (el) => { const s = store.s; const i = s.leads.findIndex((x) => x.id === l.id) + +el.dataset.dir; if (s.leads[i]) ctx.navigate(`/demo/leads/${s.leads[i].id}`); },
        noop: () => {},
        cohort: () => ctx.navigate('/demo/leads'),
        'review-missing': () => { ui.tab = 'enrichment'; ctx.rerender(); },
        retry: () => toast('Enrichment retry simulated', 'No paid lookup was made. Demo results unchanged.'),
        convert: () => upd((x) => { x.stage = 'Converted'; }, 'Conversion recorded'),
        edit: () => modal({ title: `Edit ${l.name}`, body: `<div class="form-grid">
            <div class="field"><label>Full name</label><input class="input" name="name" value="${esc(l.name)}"></div>
            <div class="field"><label>Job title</label><input class="input" name="title" value="${esc(l.title || '')}" placeholder="Not found"></div>
            <div class="field"><label>Company</label><input class="input" name="company" value="${esc(l.company || '')}" placeholder="Not found"></div>
            <div class="field"><label>City</label><input class="input" name="city" value="${esc(l.city || '')}" placeholder="Not found"></div></div>
            <p class="muted small mt12">Email and phone provided by the lead are kept as submitted.</p>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Save changes', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => value && upd((x) => { x.name = form.name || x.name; x.title = form.title || null; x.company = form.company || null; x.city = form.city || null; }, 'Lead updated')),
        campaign: () => modal({ title: 'Add to campaign', body: `<div class="stack"><div class="field"><label>Campaign</label>${select(store.s.campaigns.filter((c) => c.status !== 'Completed').map((c) => [c.id, c.name]), l.inCampaign || 'cmp-ksa', 'name="c"')}</div>
            <div class="callout ${l.eligibility === 'Eligible' ? '' : 'warn'}">${icon('info', 18)}<span>${l.eligibility === 'Eligible' ? 'This lead is qualified and channel-eligible.' : `This lead is not eligible (${esc(l.eligibility === 'Not eligible' ? l.qual : l.eligibility)}). It will be listed as excluded.`}</span></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Add to campaign', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; const c = store.s.campaigns.find((x) => x.id === form.c); if (l.eligibility === 'Eligible') upd((x) => { x.inCampaign = c.id; }, `Added to ${c.name}`); else toast(`${l.name} excluded from ${c.name}`, 'Contact policy blocks enrollment. Nothing was sent.'); }),
        task: () => modal({ title: 'Create task', body: `<div class="stack"><div class="field"><label>Task</label><input class="input" name="title" value="Follow-up call"></div>
            <div class="form-grid"><div class="field"><label>Type</label>${select(['Call', 'Email', 'Meeting', 'LinkedIn', 'Review'], 'Call', 'name="type"')}</div><div class="field"><label>Owner</label>${select(OWNERS, l.owner, 'name="owner"')}</div>
            <div class="field"><label>Due date</label><input class="input" type="date" name="date" value="2026-10-30"></div><div class="field"><label>Time</label><input class="input" type="time" name="time" value="11:00"></div></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Create task', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; store.update((s) => s.tasks.push({ id: `TSK-${400 + s.tasks.length}`, title: form.title || 'Follow-up', leadId: l.id, owner: form.owner, due: `${form.date}T${form.time}`, type: form.type, priority: 'Medium', status: 'To do', notes: '' })); toast('Task created', 'Visible in Tasks & Calendar for this session.'); ctx.rerender(); }),
      },
      change: {
        stage: (el) => upd((x) => { x.stage = el.value; }, `Stage changed to ${el.value}`),
        owner: (el) => upd((x) => { x.owner = el.value; }, `Owner changed to ${el.value}`),
      },
    });
  },
};
