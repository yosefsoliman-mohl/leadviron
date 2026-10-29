// 33 · Audit Log — who changed what, with before/after details.
import { icon, esc, avatar, statusBadge, pageHead, select, searchInput, on, toast, modal, keepFocus } from '../ui.js';
import { store } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

const ui = { q: '', actor: '', action: '', result: '', date: 'Oct 29, 2026', id: 'AUD-0928' };

// On/Off values get a toggle illustration like the reference; anything else shows as text.
function stateBox(label, v) {
  const onOff = v === 'On' || v === 'Off';
  const val = onOff
    ? `<span class="row" style="gap:10px"><label class="toggle" style="pointer-events:none"><input type="checkbox" ${v === 'On' ? 'checked' : ''} disabled tabindex="-1"><span></span></label><span class="strong" style="font-weight:500;${v === 'On' ? 'color:var(--blue-600)' : ''}">${v}</span></span>`
    : `<span class="strong" style="font-weight:500">${esc(v)}</span>`;
  return `<div class="card grow" style="padding:14px 16px;box-shadow:none"><div class="strong mb8" style="font-weight:500">${label}</div>${val}</div>`;
}

function filtered() {
  const q = ui.q.trim().toLowerCase();
  return store.s.audit.filter((a) => (!ui.actor || a.actor === ui.actor) && (!ui.action || a.action === ui.action) && (!ui.result || a.result === ui.result) &&
    (!q || [a.action, a.item, a.actor, a.id, a.setting].join(' ').toLowerCase().includes(q)));
}

export default {
  title: 'Audit Log',
  render() {
    const s = store.s;
    const rows = filtered();
    const a = rows.find((x) => x.id === ui.id) || rows[0];
    const lbl = (t, inner) => `<div class="field audit-filter"><span class="tiny muted" style="margin-bottom:-4px">${t}</span>${inner}</div>`;
    return `
    ${pageHead({ title: 'Audit Log', sub: 'Track important changes to your workspace settings, team and data.', actions: `<button class="btn" data-action="export">${icon('upload', 17)} Export log</button>` })}
    ${settingsTabs('audit')}
    <div class="filters" style="align-items:flex-end">
      ${searchInput('Search actions, items or records...', ui.q, 'data-input="q" id="au-q"')}
      ${lbl('Actor', select([['', 'All actors'], ...new Set(s.audit.map((x) => x.actor))], ui.actor, 'data-change="f" data-k="actor"'))}
      ${lbl('Action', select([['', 'All actions'], ...new Set(s.audit.map((x) => x.action))], ui.action, 'data-change="f" data-k="action"'))}
      ${lbl('Result', select([['', 'All results'], 'Success', 'Blocked'], ui.result, 'data-change="f" data-k="result"'))}
      ${lbl('Date', select(['Oct 29, 2026', 'Oct 28, 2026', 'Last 7 days'], ui.date, 'data-change="f" data-k="date"'))}
    </div>
    <div class="split wide-side">
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th class="w-check"></th><th>Time ${icon('chevDown', 13)}</th><th>Actor</th><th>Action</th><th>Item</th><th>Result</th></tr></thead>
        <tbody>${rows.length ? rows.map((x) => `<tr class="clickable ${a && x.id === a.id ? 'selected' : ''}" data-action="pick" data-id="${x.id}">
          <td><input type="radio" class="check" name="aud" ${a && x.id === a.id ? 'checked' : ''} aria-label="Select ${x.id}" tabindex="-1"></td>
          <td class="nowrap">${esc(x.time)}</td><td>${`<span class="owner">${avatar(x.actor, 'sm', 'gray')}${esc(x.actor)}</span>`}</td>
          <td>${esc(x.action)}</td><td>${esc(x.item)}</td><td>${statusBadge(x.result, { tone: x.result === 'Blocked' ? 'gray' : '' })}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty">No entries match these filters.</div></td></tr>'}</tbody>
      </table></div>
      ${a ? `<div class="card card-pad">
        <div class="row between mb12"><h2>${esc(a.action)}</h2><span class="muted small">${a.id}</span></div>
        <div class="kv" style="grid-template-columns:100px 1fr">
          <span class="k">Actor</span><span class="row">${avatar(a.actor, '', 'gray')}<span><span style="display:block">${esc(a.actor)}</span><span class="muted small">${esc(a.actorRole)}</span></span></span>
          <span class="k">Item</span><span class="v">${esc(a.item)}</span>
          <span class="k">Setting</span><span class="v">${esc(a.setting)}</span>
          <span class="k">Time</span><span class="v">${ui.date.startsWith('Oct') ? ui.date : 'Oct 29, 2026'} · ${esc(a.time)} (Riyadh)</span>
          <span class="k">Result</span><span>${statusBadge(a.result, { tone: a.result === 'Blocked' ? 'gray' : '' })}</span>
        </div>
        <div class="divider"></div>
        <div class="row" style="align-items:stretch">${stateBox('Before', a.before)}<span class="row muted">${icon('arrowRight', 20)}</span>${stateBox('After', a.after)}</div>
        <div class="divider"></div>
        <a class="btn" href="${a.link}">${icon('external', 16)} Open related settings</a>
      </div>` : '<div class="card card-pad empty">Select an entry.</div>'}
    </div>
    <p class="muted small mt12">Showing ${rows.length} of ${s.audit.length} entries · Demo audit data</p>`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#au-q', ctx.rerender);
    on(root, {
      click: {
        pick: (el) => { ui.id = el.dataset.id; re(); },
        export: () => {
          const role = store.s.me.role;
          modal({ title: 'Export audit log', body: `<div class="kv"><span class="k">Rows</span><span class="v">${filtered().length} entries (current filters)</span><span class="k">Format</span><span class="v">CSV</span><span class="k">Permission</span><span class="v">${esc(role)} · Export allowed</span></div><p class="muted small mt12">Exports depend on role permissions. In the demo no file is generated.</p>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Export', cls: 'primary', value: 1 }] })
            .then(({ value }) => value && toast('Export simulated', 'No file was generated in the demo.'));
        },
      },
      change: { f: (el) => { ui[el.dataset.k] = el.value; re(); } },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
