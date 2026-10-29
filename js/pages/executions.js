// 21 · Execution History — workflow runs with state, current step and next action.
import { icon, esc, avatar, dots, stat, pageHead, select, searchInput, statusBadge, on, keepFocus, pct } from '../ui.js';
import { store, leadById, enrichLabel, enrichPct } from '../store.js';

const ui = { wf: 'wf-enrich', version: 'Published v1.2', state: '', date: '2026-10-29', q: '', sel: 'RUN-1050', sortAsc: false };

function filtered() {
  const q = ui.q.toLowerCase();
  const rows = store.s.runs.filter((r) => {
    const l = leadById(r.leadId);
    return r.workflow === ui.wf && (!ui.version || r.version === ui.version) && (!ui.state || r.state === ui.state) && (!ui.date || r.started.startsWith('Oct 29, 2026')) &&
      (!q || r.id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q) || l.email.includes(q));
  });
  return ui.sortAsc ? rows.slice().reverse() : rows;
}

const stateBadge = (st) => statusBadge(st);
// "Oct 29, 2026 10:50 AM" → date and time on two lines.
const twoLine = (dt) => { const m = String(dt).match(/^(.*\d{4}) (.+)$/); return m ? `${esc(m[1])}<br>${esc(m[2])}` : esc(dt); };

export default {
  title: 'Execution History',
  render(ctx) {
    const s = store.s;
    if (ctx.query.wf && ctx.query.wf !== ui._qwf) { ui._qwf = ctx.query.wf; ui.wf = ctx.query.wf; ui.version = ''; }
    if (ctx.query.run && ctx.query.run !== ui._qrun) { ui._qrun = ctx.query.run; ui.sel = ctx.query.run; }
    const all = s.runs.filter((r) => r.workflow === ui.wf);
    const rows = filtered();
    const wf = s.workflows.find((w) => w.id === ui.wf);
    const n = (st) => all.filter((r) => r.state === st).length;
    const sel = s.runs.find((r) => r.id === ui.sel && r.workflow === ui.wf);
    const sl = sel && leadById(sel.leadId);
    const versions = [...new Set(s.runs.filter((r) => r.workflow === ui.wf).map((r) => r.version))];
    return `
    ${pageHead({ title: 'Execution History', sub: 'Track workflow runs and step outcomes.' })}
    <div class="grid g4">
      ${stat({ icon: 'play', label: 'Recent runs shown', value: `${all.length} <span class="muted" style="font-size:14px;font-weight:400">of ${wf ? wf.runs : 0} workflow runs</span>` })}
      ${stat({ icon: 'users', label: 'Completed', value: `${n('Completed')} <span class="muted" style="font-size:14px;font-weight:400">${pct(n('Completed'), all.length)}%</span>`, action: 'f-completed' })}
      ${stat({ icon: 'circle', label: 'Waiting', value: `${n('Waiting')} <span class="muted" style="font-size:14px;font-weight:400">${pct(n('Waiting'), all.length)}%</span>`, action: 'f-waiting' })}
      ${stat({ icon: 'alertCircle', label: 'Needs attention', value: `${n('Needs attention')} <span class="muted" style="font-size:14px;font-weight:400">${pct(n('Needs attention'), all.length)}%</span>`, action: 'f-attention' })}
    </div>
    <div class="filters mt16">
      ${select(s.workflows.map((w) => [w.id, w.name]), ui.wf, 'data-change="wf" aria-label="Workflow"')}
      ${select([['', 'All versions'], ...versions], ui.version, 'data-change="version" aria-label="Version"')}
      ${select([['', 'All states'], 'Waiting', 'Needs attention', 'Completed'], ui.state, 'data-change="state" aria-label="State"')}
      <div class="search-input" style="flex:0 0 180px">${icon('calendar', 16)}<input class="input" type="date" value="${ui.date}" data-change="date" aria-label="Date"></div>
      ${searchInput('Search by run, name, company, or email...', ui.q, 'data-input="q" id="run-q"')}
    </div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th class="w-check"></th><th>Run</th><th>Lead</th><th>Enrichment</th><th>State</th><th>Current or result step</th><th><button class="link-btn" data-action="sort" style="color:inherit;font-weight:500">Started ${icon(ui.sortAsc ? 'chevUp' : 'arrowDown', 13)}</button></th><th>Next action</th><th></th></tr></thead>
      <tbody>${rows.map((r) => { const l = leadById(r.leadId); return `<tr class="clickable ${r.id === ui.sel ? 'selected' : ''}" data-action="select" data-id="${r.id}">
        <td><input type="checkbox" class="check" data-change="pick" data-id="${r.id}" ${r.id === ui.sel ? 'checked' : ''} aria-label="Select ${r.id}"></td>
        <td><a href="#/demo/workflows/runs/${r.id}" style="${r.id === ui.sel ? '' : 'color:var(--ink-800)'}">${r.id}</a></td>
        <td><div class="cell-person">${avatar(l.initials, 'sm')}<div><a class="nm" href="#/demo/leads/${l.id}" style="color:inherit">${esc(l.name)}</a><div class="co">${esc(l.company || 'Not found')}</div></div></div></td>
        <td><div class="small">${enrichLabel(l)} &nbsp;${enrichPct(l)}%</div>${dots(l.found)}</td>
        <td>${stateBadge(r.state)}</td>
        <td class="muted">${esc(r.step)}</td>
        <td class="small nowrap">${twoLine(r.started)}</td>
        <td class="small nowrap">${r.state === 'Needs attention' ? `<a href="#/demo/workflows/runs/${r.id}">Review</a>` : r.taskId ? `<a href="#/demo/sales/tasks?task=${r.taskId}">View task</a>` : twoLine(r.next)}</td>
        <td>${r.id === ui.sel ? icon('chevRight', 16, 'blue') : ''}</td></tr>`; }).join('') || `<tr><td colspan="9"><div class="empty">${icon('history', 30)}<div>No runs match these filters.</div></div></td></tr>`}</tbody>
    </table></div>
    ${sel ? `<div class="card card-pad mt12"><div class="row wrap" style="gap:22px">
      <div><div class="row"><b style="font-size:17px">${sel.id}</b>${stateBadge(sel.state)}</div><div class="row mt12">${avatar(sl.initials, 'lg')}<div><div class="strong">${esc(sl.name)}</div><div class="muted small">${esc(sl.company || 'Not found')}</div></div></div></div>
      <div class="vdivider"></div><div><div class="muted small">Owner</div><div class="mt8">${avatar(sl.owner, 'sm', 'gray')} ${esc(sl.owner)}</div></div>
      <div class="vdivider"></div><div><div class="muted small">Enrichment</div><div class="row mt8">${enrichLabel(sl)} ${enrichPct(sl)}% ${dots(sl.found)}</div></div>
      <div class="vdivider"></div><div class="grow"><div class="muted small">${sel.state === 'Completed' ? 'Result step' : 'Current step'}</div><div class="strong mt8">${esc(sel.step)}</div>${sel.state === 'Needs attention' ? '<div class="muted small">Provider did not accept message.</div>' : ''}</div>
      <a class="btn primary lg" href="#/demo/workflows/runs/${sel.id}">${sel.state === 'Needs attention' ? 'Review run' : 'Open run'}</a>
    </div></div>` : ''}
    <div class="table-foot"><span class="muted">Showing ${rows.length} recent runs from ${wf ? wf.runs : 0}</span><span class="muted small" style="margin-left:auto">${icon('info', 14)} No external match is an enrichment outcome, not an execution error.</span></div>`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(document, '#run-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; re(); };
    on(root, {
      click: {
        select: (el, e) => { if (e.target.closest('a, input')) return; if (ui.sel === el.dataset.id) ctx.navigate(`/demo/workflows/runs/${el.dataset.id}`); else { ui.sel = el.dataset.id; re(); } },
        sort: () => { ui.sortAsc = !ui.sortAsc; re(); },
        'f-completed': () => { ui.state = 'Completed'; re(); },
        'f-waiting': () => { ui.state = 'Waiting'; re(); },
        'f-attention': () => { ui.state = 'Needs attention'; re(); },
      },
      change: { wf: (el) => { ui.wf = el.value; ui.version = ''; re(); }, version: set('version'), state: set('state'), date: set('date'), pick: (el) => { ui.sel = el.checked ? el.dataset.id : null; re(); } },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
