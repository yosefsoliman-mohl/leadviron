// 18 · Unified Inbox — conversations, lead summary and tasks in one place. Replies are simulated.
import { icon, esc, avatar, select, searchInput, on, toast, modal, keepFocus } from '../ui.js';
import { store, leadById, enrichPct, formatDue, ENRICH_FIELDS, FIELD_LABELS, fieldValue, OWNERS } from '../store.js';

const ui = { q: '', channel: '', team: 'My team', enrich: '', status: 'Open', sel: 'cv-omar', mode: 'reply', text: '' };
const CH_ICON = { Email: 'mail', WhatsApp: 'whatsapp' };
const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function filtered() {
  const q = ui.q.toLowerCase();
  return store.s.conversations.filter((c) => {
    const l = leadById(c.leadId);
    return c.status === ui.status && (!ui.channel || c.channel === ui.channel) && (!ui.enrich || l.enrich === ui.enrich) &&
      (!q || l.name.toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)));
  });
}

const enrichChip = (l) => `<span class="badge" style="font-size:11.5px;height:22px">${l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No external match'} · ${enrichPct(l)}% · ${l.found}/6</span>`;

function thread(c, l) {
  const items = c.messages.map((m) => {
    if (m.from === 'note') return `<div class="bubble note"><div class="bubble-meta">${icon('edit', 12)} Internal note · ${esc(m.who)} · ${esc(m.time)}</div>${esc(m.text)}</div>`;
    const out = m.from === 'agent';
    return `<div class="bubble-meta ${out ? 'out' : ''}">${out ? `${esc(m.who)} · ${esc(m.time)}` : `${esc(m.who)} · ${esc(m.time)}`}${m.simulated ? ' · <span class="badge gray" style="height:18px;font-size:11px">Simulated</span>' : ''}</div><div class="bubble ${out ? 'out' : 'in'}">${esc(m.text)}</div>`;
  }).join('');
  return `<div class="day-sep">Today</div>${items}`;
}

export default {
  title: 'Inbox',
  render(ctx) {
    const s = store.s;
    if (ctx.query.c && ctx.query.c !== ui._qc) { ui._qc = ctx.query.c; ui.sel = ctx.query.c; const cv = s.conversations.find((x) => x.id === ui.sel); if (cv) ui.status = cv.status; }
    const list = filtered();
    const c = s.conversations.find((x) => x.id === ui.sel) || list[0];
    const l = c && leadById(c.leadId);
    const camp = l && s.campaigns.find((x) => x.id === l.inCampaign);
    const task = l && s.tasks.find((t) => t.leadId === l.id && t.status !== 'Done' && t.type === 'Meeting') || (l && s.tasks.find((t) => t.leadId === l.id && t.status !== 'Done'));
    const counts = (st) => s.conversations.filter((x) => x.status === st).length;
    return `
    <div class="page-head"><div class="titles"><h1>Inbox</h1><div class="sub">All your conversations, one workspace</div></div></div>
    <div class="inbox">
      <div class="card" style="overflow:hidden">
        <div style="padding:12px">${searchInput('Search conversations...', ui.q, 'data-input="q" id="inbox-q"')}
          <div class="row wrap mt8" style="gap:6px">${select([['', 'All channels'], 'Email', 'WhatsApp'], ui.channel, 'data-change="channel" aria-label="Channel"', 'sm')}${select(['My team', 'Sales A', 'Sales B'], ui.team, 'data-change="team" aria-label="Team"', 'sm')}${select([['', 'Enrichment: All'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], ui.enrich, 'data-change="enrich" aria-label="Enrichment"', 'sm')}</div></div>
        <div class="tabs" style="margin:0;padding:0 8px">${['Open', 'Pending', 'Resolved'].map((t) => `<button class="tab ${ui.status === t ? 'active' : ''}" data-action="status" data-key="${t}" style="flex:1;justify-content:center">${t} <span class="muted small">${counts(t)}</span></button>`).join('')}</div>
        <div class="conv-list">${list.map((cv) => { const ld = leadById(cv.leadId); const m = cv.messages.filter((x) => x.from !== 'note').slice(-1)[0]; return `<button class="conv ${c && cv.id === c.id ? 'active' : ''}" data-action="open" data-id="${cv.id}">
          <span style="color:var(--blue-600);margin-top:2px">${icon(CH_ICON[cv.channel], 24)}</span>
          <span class="grow" style="min-width:0"><span class="row between"><span class="strong">${esc(ld.name)}</span><span class="muted small">${cv.channel} &nbsp;${esc(cv.time)}</span></span>
            <span class="row between" style="align-items:flex-start"><span class="small" style="color:var(--ink-600)">${esc(ld.company || 'Company unknown')}</span>${enrichChip(ld)}</span>
            <span class="small" style="display:block;color:var(--ink-700);margin-top:2px">${esc(m ? m.text : '')}</span></span>${cv.unread ? '<span class="unread-dot"></span>' : ''}</button>`; }).join('') || `<div class="empty">${icon('inbox', 28)}<div>No ${ui.status.toLowerCase()} conversations.</div></div>`}</div>
      </div>
      ${c ? `<div class="card" style="overflow:hidden">
        <div class="row wrap" style="padding:14px 16px;border-bottom:1px solid var(--ink-100)">
          ${avatar(l.initials, 'lg')}<div class="grow"><div class="row"><a href="#/demo/leads/${l.id}" class="strong nowrap" style="font-size:18px;color:var(--ink-900)">${esc(l.name)}</a><span class="badge">${esc(c.assignee)}</span></div><div class="muted small">${c.channel} · ${c.channel === 'WhatsApp' ? esc(l.phone) : esc(l.email)}</div></div>
          <button class="btn" data-action="reassign">${icon('users', 16)} Reassign</button>
          ${c.status === 'Resolved' ? `<button class="btn" data-action="reopen">${icon('rotate', 16)} Reopen</button>` : `<button class="btn primary" data-action="resolve">${icon('check', 16)} Resolve</button>`}
        </div>
        ${c.automationPaused != null ? `<div class="callout" style="margin:12px 16px 0;align-items:center">${icon(c.automationPaused ? 'pauseCircle' : 'play', 18)}<span class="grow">${c.automationPaused ? 'Automation paused — reply received' : 'Automation active for this lead'}</span><button class="link-btn small" data-action="automation">${c.automationPaused ? 'Resume follow-ups' : 'Pause follow-ups'}</button><a class="small" href="#/demo/workflows/wf-enrich/builder">View workflow</a></div>` : `<div class="callout" style="margin:12px 16px 0;align-items:center">${icon('info', 18)}<span class="grow">No automation running for this conversation.</span><button class="link-btn small" data-action="automation">Pause follow-ups</button></div>`}
        <div class="thread" id="thread">${thread(c, l)}</div>
        <div style="padding:0 16px 16px">
          <div class="tabs" style="margin-bottom:8px">${[['reply', 'Reply'], ['note', 'Internal note']].map(([k, t]) => `<button class="tab ${ui.mode === k ? 'active' : ''}" data-action="mode" data-key="${k}">${t}</button>`).join('')}</div>
          <div class="composer" style="${ui.mode === 'note' ? 'background:var(--amber-50)' : ''}">
            <textarea id="composer" data-input="text" placeholder="${ui.mode === 'note' ? 'Add an internal note — visible to your team only...' : `Reply on ${c.channel}...`}">${esc(ui.text)}</textarea>
            <div class="row" style="justify-content:flex-end"><button class="icon-btn" data-action="attach" aria-label="Attach file">${icon('paperclip', 18)}</button><button class="icon-btn" data-action="template" aria-label="Insert template">${icon('file', 18)}</button><button class="btn primary sm" data-action="send">${ui.mode === 'note' ? 'Add note' : 'Send'}</button></div>
          </div>
          ${ui.mode === 'reply' ? '<p class="muted tiny mt8">Demo simulation — replies are added to this conversation but nothing is sent.</p>' : ''}
        </div>
      </div>
      <div class="stack lead-col" style="gap:12px">
        <div class="card card-pad">
          <h3>Lead summary</h3>
          <div class="row mt12" style="align-items:flex-start">${avatar(l.initials, 'xl')}<div><div class="strong" style="font-size:17px">${esc(l.name)}</div><div class="small" style="color:var(--ink-600)">${esc(l.title || 'Role unknown')}<br>${esc(l.company || 'Company unknown')}<br>${esc(l.city || '')}</div></div></div>
          <div class="kv mt12" style="grid-template-columns:110px 1fr;font-size:13px;gap:7px">
            <span class="k">Qualification</span><span class="v">${esc(l.qual)}</span>
            <span class="k">Score</span><span class="v">${l.score ?? '—'} / 100</span>
            <span class="k">Sales stage</span><span class="v">${esc(l.stage)}</span>
            <span class="k">Original source</span><span class="v">${esc(l.source)}</span>
            <span class="k">Owner</span><span class="v">${esc(l.owner)}</span>
            <span class="k">Campaign</span><span class="v">${camp ? `<a href="#/demo/campaigns/${camp.id}">${esc(camp.name)}</a>` : '—'}</span>
            <span class="k">Email</span><span class="v" style="word-break:break-all"><a href="#/demo/leads/${l.id}">${esc(l.email)}</a></span>
            <span class="k">Phone</span><span class="v">${esc(l.phone)}</span>
          </div>
          ${l.whatsappOptIn ? `<div class="small mt8 row blue" style="color:var(--blue-600)">${icon('whatsapp', 16)} WhatsApp opt-in recorded</div>` : ''}
          <div class="divider"></div>
          <div class="row between"><h3>Enrichment</h3><b>${enrichPct(l)}%</b></div>
          <div class="muted small">${l.enrich === 'complete' ? 'Complete enrichment' : l.enrich === 'partial' ? 'Partial enrichment' : 'No external match'} · ${l.found} of 6 fields</div>
          <div class="grid g2 mt8" style="gap:4px;font-size:11.5px">${ENRICH_FIELDS.map((f) => { const v = fieldValue(l, f); return `<span class="row" style="gap:4px;color:${v ? 'var(--ink-800)' : 'var(--ink-500)'}">${icon(v ? 'checkCircle' : 'minusCircle', 13, v ? 'blue' : '')} ${FIELD_LABELS[f]}${v ? '' : ' — Not found'}</span>`; }).join('')}</div>
          <div class="muted tiny mt8">${icon('info', 12)} Email and phone provided by lead</div>
        </div>
        <div class="card card-pad"><h3>Next task</h3>
          ${task ? `<div class="row mt8" style="align-items:flex-start"><input type="checkbox" class="check" data-change="task-done" data-id="${task.id}" style="width:20px;height:20px;margin-top:2px" aria-label="Mark task done"><div><div class="strong small">${esc(task.title)}</div><div class="muted tiny">${formatDue(task.due).date} · ${formatDue(task.due).time} (Riyadh)<br>${esc(task.owner)}</div></div></div>` : '<p class="muted small mt8">No open tasks.</p>'}
          <a class="btn outline block mt12" href="#/demo/leads/${l.id}">${icon('external', 16)} Open lead profile</a></div>
      </div>` : `<div class="card"><div class="empty">${icon('inbox', 32)}<div>Select a conversation.</div></div></div>`}
    </div>`;
  },
  mount(root, ctx) {
    const th = root.querySelector('#thread');
    if (th) th.scrollTop = th.scrollHeight;
    const conv = () => store.s.conversations.find((x) => x.id === ui.sel);
    const upd = (fn, msg, detail) => { store.update(() => fn(conv())); if (msg) toast(msg, detail); ctx.rerender(); };
    on(root, {
      click: {
        open: (el) => { ui.sel = el.dataset.id; ui.text = ''; store.update(() => { conv().unread = false; }); ctx.rerender(); },
        status: (el) => { ui.status = el.dataset.key; const first = filtered()[0]; if (first) ui.sel = first.id; ctx.rerender(); },
        mode: (el) => { ui.mode = el.dataset.key; ctx.rerender(); },
        send: () => {
          const text = ui.text.trim();
          if (!text) { toast('Write a message first', ''); return; }
          const me = store.s.me.name;
          ui.text = '';
          upd((c) => { c.messages.push({ from: ui.mode === 'note' ? 'note' : 'agent', who: ui.mode === 'note' ? me : c.assignee, time: nowTime(), text, simulated: ui.mode !== 'note' }); c.time = nowTime(); },
            ui.mode === 'note' ? 'Internal note added' : 'Reply added to conversation', ui.mode === 'note' ? 'Visible to your team only.' : 'Demo simulation — nothing was sent.');
        },
        resolve: () => upd((c) => { c.status = 'Resolved'; }, 'Conversation resolved', 'Moved to Resolved in this demo session.'),
        reopen: () => { upd((c) => { c.status = 'Open'; }, 'Conversation reopened', 'Moved back to Open.'); ui.status = 'Open'; ctx.rerender(); },
        automation: () => { const paused = !conv().automationPaused; upd((c) => { c.automationPaused = paused; }, paused ? 'Automated follow-ups paused' : 'Automated follow-ups resumed', 'Demo simulation — no workflow run was changed externally.'); },
        reassign: () => modal({ title: 'Reassign conversation', body: `<div class="field"><label>Assign to</label>${select(OWNERS, conv().assignee, 'name="owner"')}</div><label class="row small mt12"><input type="checkbox" class="check" name="lead" checked> Also make them the lead owner</label>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Reassign', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => value && upd((c) => { c.assignee = form.owner; if (form.lead) leadById(c.leadId).owner = form.owner; }, `Assigned to ${form.owner}`, 'Saved in this demo session.')),
        attach: () => toast('Attachments are disabled in the demo', 'No files are uploaded or sent.'),
        template: () => {
          const c = conv();
          const tpls = store.s.templates.filter((t) => t.channel === c.channel);
          modal({ title: 'Insert template', body: `<div class="field"><label>Template</label>${select(tpls.map((t) => [t.id, t.name]), tpls[0]?.id, 'name="t"')}</div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Insert', cls: 'primary', value: 1 }] })
            .then(({ value, form }) => {
              if (!value || !form.t) return;
              const t = store.s.templates.find((x) => x.id === form.t);
              const l = leadById(c.leadId);
              ui.text = t.body.replace(/\{\{\s*first_name\s*\}\}/g, l.name.split(' ')[0]).replace(/\{\{\s*company\s*\}\}/g, l.company || t.fallback);
              ui.mode = 'reply'; ctx.rerender();
            });
        },
      },
      change: {
        channel: (el) => { ui.channel = el.value; ctx.rerender(); },
        team: (el) => { ui.team = el.value; ctx.rerender(); },
        enrich: (el) => { ui.enrich = el.value; ctx.rerender(); },
        'task-done': (el) => { store.update((s) => { s.tasks.find((t) => t.id === el.dataset.id).status = 'Done'; }); toast('Task completed', 'Saved in this demo session.'); ctx.rerender(); },
      },
      input: {
        q: (el) => { ui.q = el.value; keepFocus(document, '#inbox-q', ctx.rerender); },
        text: (el) => { ui.text = el.value; },
      },
    });
  },
};
