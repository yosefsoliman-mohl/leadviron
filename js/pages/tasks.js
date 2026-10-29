// 24 · Tasks & Calendar — list and month views, detail panel, complete / reschedule within the session.
import { icon, esc, avatar, owner, statusBadge, dots, select, searchInput, tabs, on, toast, modal, keepFocus } from '../ui.js';
import { store, leadById, enrichLabel, enrichPct, formatDue, DEMO_TODAY, OWNERS } from '../store.js';

const TOMORROW = '2026-10-30';
const TYPES = ['Call', 'Email', 'Meeting', 'LinkedIn', 'Review', 'Research'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const ui = { view: 'list', q: '', owner: '', type: '', priority: '', enrich: '', sel: 'TSK-308', panelTab: 'details', sortDesc: false, month: '2026-10', _taskQ: null };

const day = (t) => t.due.slice(0, 10);
const isDone = (t) => t.status === 'Done';
const isOverdue = (t) => !isDone(t) && day(t) < DEMO_TODAY;
const TYPE_ICON = { Call: 'phone', Email: 'mail', Meeting: 'calendar', LinkedIn: 'linkedin', Review: 'file', Research: 'search' };

function filtered() {
  const q = ui.q.trim().toLowerCase();
  return store.s.tasks.filter((t) => {
    const l = leadById(t.leadId) || {};
    return (!ui.owner || t.owner === ui.owner) && (!ui.type || t.type === ui.type) && (!ui.priority || t.priority === ui.priority) &&
      (!ui.enrich || l.enrich === ui.enrich) &&
      (!q || t.title.toLowerCase().includes(q) || (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q));
  }).sort((a, b) => (ui.sortDesc ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due)));
}

function statusCell(t) {
  if (isDone(t)) return statusBadge('Done');
  if (isOverdue(t)) return statusBadge('Overdue', { tone: 'amber' });
  return statusBadge(t.status);
}

function enrichCell(l) {
  return `<div class="small"><span class="${l.enrich === 'partial' ? 'blue' : ''}" style="${l.enrich === 'partial' ? 'color:var(--blue-600)' : ''}">${enrichLabel(l)}</span></div><div class="row" style="gap:8px"><span class="num small" style="width:34px">${enrichPct(l)}%</span>${dots(l.found)}</div>`;
}

function row(t) {
  const l = leadById(t.leadId);
  const d = formatDue(t.due);
  return `<tr class="clickable task-row ${ui.sel === t.id ? 'selected' : ''} ${isDone(t) ? 'task-done' : ''}" data-action="select" data-id="${t.id}">
    <td><input type="checkbox" class="check" data-change="pick" data-id="${t.id}" ${ui.sel === t.id ? 'checked' : ''} aria-label="Select ${esc(t.title)}"></td>
    <td><div class="cell-person">${avatar(l.initials, '')}<div><div class="task-title">${esc(t.title)}</div><div class="co">${esc(l.name)} · ${esc(l.company || 'Not found')}</div></div></div></td>
    <td>${enrichCell(l)}</td>
    <td>${owner(t.owner)}</td>
    <td class="nowrap small">${d.date}<br>${d.time}</td>
    <td>${statusCell(t)}</td></tr>`;
}

function listView(rows) {
  const groups = [
    ['Overdue', rows.filter(isOverdue)],
    ['Today', rows.filter((t) => !isDone(t) && day(t) === DEMO_TODAY)],
    ['Tomorrow', rows.filter((t) => !isDone(t) && day(t) === TOMORROW)],
    ['Later', rows.filter((t) => !isDone(t) && day(t) > TOMORROW)],
    ['Completed', rows.filter(isDone)],
  ].filter(([, r]) => r.length);
  return `<div class="table-wrap"><table class="tbl">
    <thead><tr><th class="w-check"></th><th>Task & lead</th><th>Enrichment</th><th>Owner</th><th><button class="link-btn" style="color:inherit;font-weight:500" data-action="sort">Due ${icon(ui.sortDesc ? 'chevUp' : 'chevDown', 14)}</button></th><th>Status</th></tr></thead>
    <tbody>${groups.length ? groups.map(([g, r]) => `<tr class="group"><td colspan="6">${g} (${r.length})</td></tr>${r.map(row).join('')}`).join('') : `<tr><td colspan="6"><div class="empty">${icon('calendar', 30)}<div>No tasks match these filters.</div></div></td></tr>`}</tbody>
  </table></div>`;
}

function calendarView(rows) {
  const [y, m] = ui.month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const start = new Date(y, m - 1, 1 - first.getDay()); // weeks start on Sunday
  const label = first.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weeks = Math.ceil((first.getDay() + new Date(y, m, 0).getDate()) / 7);
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const items = rows.filter((t) => day(t) === iso);
    cells += `<div class="cal-day ${d.getMonth() !== m - 1 ? 'out' : ''} ${iso === DEMO_TODAY ? 'today' : ''}"><span class="d">${d.getDate()}</span>
      ${items.map((t) => `<button class="cal-chip ${isDone(t) ? 'done' : isOverdue(t) ? 'overdue' : ''} ${ui.sel === t.id ? 'active' : ''}" data-action="select" data-id="${t.id}" title="${esc(t.title)} · ${esc(leadById(t.leadId).name)} · ${formatDue(t.due).time}">${formatDue(t.due).time.replace(':00', '')} ${esc(t.title)}</button>`).join('')}</div>`;
  }
  return `<div class="card"><div class="card-head"><button class="icon-btn" data-action="month" data-dir="-1" aria-label="Previous month">${icon('chevLeft', 18)}</button><h2 style="flex:0 0 auto;min-width:170px;text-align:center">${label}</h2><button class="icon-btn" data-action="month" data-dir="1" aria-label="Next month">${icon('chevRight', 18)}</button><span class="grow"></span><button class="btn sm" data-action="today">Today</button></div>
    <div style="overflow-x:auto"><div class="cal" style="min-width:640px">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="cal-dow">${d}</div>`).join('')}${cells}</div></div></div>`;
}

function panel(t) {
  const l = leadById(t.leadId);
  const d = formatDue(t.due);
  const conv = store.s.conversations.find((c) => c.leadId === l.id);
  const details = `<div class="stack sm" style="gap:4px">
      <div class="setting-row">${icon('database', 18, 'muted')}<span style="width:120px">Enrichment</span><span class="grow">${enrichLabel(l)} (${enrichPct(l)}%) ${dots(l.found)}</span></div>
      <div class="setting-row">${icon('calendar', 18, 'muted')}<span style="width:120px">Due date</span><span class="grow">${d.date} · ${d.time} (Riyadh)</span></div>
      <div class="setting-row">${icon('user', 18, 'muted')}<span style="width:120px">Assigned to</span><span class="grow">${select(OWNERS, t.owner, 'data-change="task-owner" aria-label="Assigned to"', 'sm')}</span></div>
      <div class="setting-row">${icon('list', 18, 'muted')}<span style="width:120px">Status</span><span class="grow">${select(['To do', 'In progress', 'Done'], t.status, 'data-change="status" aria-label="Status"', 'sm')}</span></div>
      ${t.type === 'Meeting' ? `<div class="setting-row">${icon('calendarCheck', 18, 'muted')}<span style="width:120px">Meeting status</span><span class="grow">${select(['Requested', 'Booked', 'Completed', 'Cancelled'], t.meeting || 'Requested', 'data-change="meeting" aria-label="Meeting status"', 'sm')}</span></div>` : ''}
    </div>
    ${t.type === 'Meeting' && conv ? `<div class="callout mt12">${icon('info', 18)}<span>Customer requested this time in ${esc(conv.channel)}. <a href="#/demo/conversations?c=${conv.id}">Open conversation</a></span></div>` : ''}
    <div class="divider"></div>
    <div class="row" style="align-items:flex-start">${icon('file', 18, 'muted')}<div><div class="strong" style="font-weight:500">Task notes</div><div class="muted small mt8" style="white-space:pre-wrap">${esc(t.notes || 'No notes.')}</div></div></div>`;
  const info = `<div class="kv">
      <span class="k">Name</span><span class="v">${esc(l.name)}</span>
      <span class="k">Company</span><span class="v">${esc(l.company || 'Not found')}</span>
      <span class="k">Job title</span><span class="v">${esc(l.title || 'Not found')}</span>
      <span class="k">Email</span><span class="v">${esc(l.email)}</span>
      <span class="k">Phone</span><span class="v">${esc(l.phone)}</span>
      <span class="k">Source</span><span class="v">${esc(l.source)}</span>
      <span class="k">Stage</span><span class="v">${statusBadge(l.stage)}</span>
      <span class="k">Qualification</span><span class="v">${statusBadge(l.qual)}</span>
      <span class="k">Score</span><span class="v">${l.score ?? '—'}${l.score != null ? ' / 100' : ''}</span>
    </div>${conv ? `<a class="btn sm mt12" href="#/demo/conversations?c=${conv.id}">${icon('message', 15)} Open conversation</a>` : ''}`;
  return `<aside class="card card-pad" aria-label="Task details">
    <div class="row" style="align-items:flex-start"><span class="ico-circle lg">${icon(TYPE_ICON[t.type] || 'calendar', 24)}</span>
      <div class="grow"><h2>${esc(t.title)}</h2><div class="muted">${esc(l.name)} · ${esc(l.company || 'Company unknown')}</div><div class="muted small">Lead ID ${l.id}</div></div>
      <button class="icon-btn" data-action="close" aria-label="Close details">${icon('x', 18)}</button></div>
    <div class="mt12">${tabs([['details', 'Details'], ['lead', 'Lead info']], ui.panelTab, 'ptab')}</div>
    ${ui.panelTab === 'details' ? details : info}
    <div class="row wrap mt16">
      <button class="btn primary" data-action="complete" ${isDone(t) ? 'disabled' : ''}>${icon('check', 16)} ${isDone(t) ? 'Completed' : 'Mark complete'}</button>
      <button class="btn outline" data-action="reschedule">${icon('calendar', 16)} Reschedule</button>
      <a class="btn outline" href="#/demo/leads/${l.id}">${icon('external', 16)} Open lead</a>
    </div></aside>`;
}

function taskModal() {
  const named = store.s.leads.slice(0, 12);
  return modal({
    title: 'Create task',
    body: `<div class="stack"><div class="field"><label>Task</label><input class="input" name="title" value="Follow-up call"></div>
      <div class="field"><label>Lead</label>${select(named.map((l) => [l.id, `${l.name} · ${l.company || 'Company unknown'}`]), 'LD-1048', 'name="lead"')}</div>
      <div class="form-grid">
        <div class="field"><label>Type</label>${select(TYPES, 'Call', 'name="type"')}</div>
        <div class="field"><label>Priority</label>${select(PRIORITIES, 'Medium', 'name="priority"')}</div>
        <div class="field"><label>Owner</label>${select(OWNERS, 'Sara Ahmed', 'name="owner"')}</div>
        <div class="field"><label>Due date</label><input class="input" type="date" name="date" value="${TOMORROW}"></div>
        <div class="field"><label>Time</label><input class="input" type="time" name="time" value="11:00"></div>
      </div>
      <div class="field"><label>Notes</label><textarea class="textarea" name="notes" style="min-height:70px"></textarea></div></div>`,
    buttons: [{ label: 'Cancel', value: null }, { label: 'Create task', cls: 'primary', value: 1 }],
  });
}

export default {
  title: 'Tasks & Calendar',
  render(ctx) {
    if (ctx.query.task && ctx.query.task !== ui._taskQ) { ui._taskQ = ctx.query.task; ui.sel = ctx.query.task; ui.panelTab = 'details'; }
    const rows = filtered();
    const sel = ui.sel && store.s.tasks.find((t) => t.id === ui.sel);
    const main = ui.view === 'list' ? listView(rows) : calendarView(rows);
    return `
    <div class="page-head" style="margin-bottom:8px"><div class="titles"><h1>Tasks & Calendar</h1></div>
      <div class="actions"><button class="btn primary" data-action="create">${icon('plus', 18)} Create task</button></div></div>
    ${tabs([['list', 'List'], ['calendar', 'Calendar']], ui.view, 'view')}
    <div class="filters">
      ${searchInput('Search tasks, leads, or companies...', ui.q, 'data-input="q" id="task-q"')}
      ${select([['', 'My team'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
      ${select([['', 'Task type'], ...TYPES], ui.type, 'data-change="type" aria-label="Task type"')}
      ${select([['', 'Priority'], ...PRIORITIES], ui.priority, 'data-change="priority" aria-label="Priority"')}
      ${select([['', 'Enrichment filters'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], ui.enrich, 'data-change="enrich" aria-label="Enrichment"')}
    </div>
    ${sel ? `<div class="split">${main}${panel(sel)}</div>` : main}`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#task-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; re(); };
    const cur = () => store.s.tasks.find((t) => t.id === ui.sel);
    const upd = (fn, msg) => { store.update((s) => fn(s.tasks.find((t) => t.id === ui.sel))); toast(msg, 'Saved in this demo session only.'); ctx.rerender(); };
    on(root, {
      click: {
        view: (el) => { ui.view = el.dataset.key; ctx.rerender(); },
        ptab: (el) => { ui.panelTab = el.dataset.key; ctx.rerender(); },
        select: (el, e) => { if (e.target.closest('input')) return; ui.sel = el.dataset.id; ctx.rerender(); },
        close: () => { ui.sel = null; ctx.rerender(); },
        sort: () => { ui.sortDesc = !ui.sortDesc; ctx.rerender(); },
        month: (el) => { const [y, m] = ui.month.split('-').map(Number); const d = new Date(y, m - 1 + +el.dataset.dir, 1); ui.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; ctx.rerender(); },
        today: () => { ui.month = DEMO_TODAY.slice(0, 7); ctx.rerender(); },
        complete: () => upd((t) => { t.status = 'Done'; if (t.type === 'Meeting') t.meeting = t.meeting === 'Requested' ? 'Booked' : t.meeting; }, `“${cur().title}” marked complete`),
        reschedule: () => {
          const t = cur();
          modal({ title: 'Reschedule task', body: `<div class="form-grid"><div class="field"><label>Date</label><input class="input" type="date" name="date" value="${day(t)}"></div><div class="field"><label>Time</label><input class="input" type="time" name="time" value="${t.due.slice(11, 16)}"></div></div><p class="muted small mt12">The lead is not notified. Times are shown in Riyadh time.</p>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Reschedule', cls: 'primary', value: 1 }] })
            .then(({ value, form }) => { if (value && form.date && form.time) { upd((x) => { x.due = `${form.date}T${form.time}`; }, `Rescheduled to ${formatDue(`${form.date}T${form.time}`).date} · ${formatDue(`${form.date}T${form.time}`).time}`); } });
        },
        create: () => taskModal().then(({ value, form }) => {
          if (!value) return;
          const id = `TSK-${400 + store.s.tasks.length}`;
          store.update((s) => s.tasks.push({ id, title: form.title.trim() || 'Follow-up', leadId: form.lead, owner: form.owner, due: `${form.date || TOMORROW}T${form.time || '11:00'}`, type: form.type, priority: form.priority, status: 'To do', meeting: form.type === 'Meeting' ? 'Requested' : undefined, notes: form.notes }));
          ui.sel = id; ui.panelTab = 'details';
          toast('Task created', 'Saved in this demo session only.');
          ctx.rerender();
        }),
      },
      change: {
        owner: set('owner'), type: set('type'), priority: set('priority'), enrich: set('enrich'),
        pick: (el) => { ui.sel = el.checked ? el.dataset.id : null; ctx.rerender(); },
        status: (el) => upd((t) => { t.status = el.value; }, `Status set to ${el.value}`),
        meeting: (el) => upd((t) => { t.meeting = el.value; }, `Meeting status set to ${el.value}`),
        'task-owner': (el) => upd((t) => { t.owner = el.value; }, `Task assigned to ${el.value}`),
      },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
