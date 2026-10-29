// 05 · Duplicate Review — compare two records, choose values, merge or keep separate (session only).
import { icon, esc, avatar, dots, pageHead, tabs, searchInput, on, toast, statusBadge, sourceIcon, keepFocus } from '../ui.js';
import { store, leadById } from '../store.js';
import { leadSettingsTabs, leadSettingsCrumbs } from './settings-tabs.js';

const ui = { tab: 'matches', q: '', sel: null, choice: {} };

// Fields compared side by side. `pick` fields can be chosen per record when the values differ.
const ROWS = [
  ['name', 'Name', true], ['email', 'Email', true], ['phone', 'Phone', true], ['company', 'Company', true], ['title', 'Job title', true],
  ['city', 'City'], ['size', 'Company size'], ['industry', 'Industry'], ['linkedin', 'LinkedIn URL'], ['source', 'Source event'], ['enrich', 'Enrichment'],
];

function record(r) {
  const l = leadById(r.id);
  const found = l ? l.found : 3;
  return { ...r, size: l?.size || null, industry: l?.industry || null, linkedin: l?.linkedin ? 'Available' : null, found };
}
const enrichTxt = (found) => `${found === 6 ? 'Complete' : found ? 'Partial' : 'No match'} · ${Math.round((found / 6) * 100)}% · ${found}/6`;

function list() {
  const q = ui.q.trim().toLowerCase();
  return store.s.duplicates.filter((d) => !q || [d.a.name, d.b.name, d.a.company, d.b.company, d.a.email, d.b.email].join(' ').toLowerCase().includes(q));
}

function merged(d) {
  const a = record(d.a), b = record(d.b);
  const ch = ui.choice[d.id] || {};
  const out = {};
  ROWS.forEach(([k]) => { out[k] = (ch[k] === 'b' ? b[k] : a[k]) ?? (ch[k] === 'b' ? a[k] : b[k]); });
  out.found = Math.max(a.found, b.found);
  return { a, b, ch, out };
}

function compare(d) {
  const { a, b, ch, out } = merged(d);
  const cell = (rec, side, k, pick) => {
    const v = k === 'enrich' ? `${enrichTxt(rec.found)}<div class="mt8">${dots(rec.found)}</div>` : rec[k] ? esc(rec[k]) : '<span class="muted">Not found</span>';
    const differs = pick && a[k] !== b[k] && a[k] && b[k];
    const checked = (ch[k] || 'a') === side;
    return `<td>${differs ? `<label class="row" style="cursor:pointer"><input type="radio" class="check" name="${d.id}-${k}" data-change="pick" data-k="${k}" data-side="${side}" ${checked ? 'checked' : ''}> <span>${v}</span></label>` : `<span style="padding-left:${a[k] !== b[k] || !pick ? 0 : 27}px;display:inline-block">${v}</span>`}</td>`;
  };
  return `<div class="card card-pad">
    <h2 class="mb12" style="font-size:20px">Compare records</h2>
    <div class="table-wrap flat"><table class="tbl dup-compare">
      <thead><tr><th style="background:none"></th><th style="background:none"><span class="strong">Record A · ${esc(a.id)}</span> <span class="badge solid">Primary</span></th><th style="background:none"><span class="strong">Record B · ${esc(b.id)}</span></th></tr></thead>
      <tbody>${ROWS.map(([k, label, pick]) => `<tr><td class="muted">${label}</td>${cell(a, 'a', k, pick)}${cell(b, 'b', k, pick)}</tr>`).join('')}</tbody>
    </table></div>
  </div>
  <div class="card card-pad mt16">
    <div class="row between wrap"><h3>Proposed merged record (preview)</h3><span class="muted small">${icon('info', 14, 'blue')} Source events, activities and consent history retained.</span></div>
    <div class="row wrap mt12" style="gap:24px">
      <div class="row">${avatar(out.name, 'lg')}<div><div class="strong">${esc(out.name)}</div><div class="muted small">${esc(out.company || 'Company unknown')}</div></div></div>
      <div class="vdivider"></div>
      <div><div class="muted small">Original source</div><div class="owner">${sourceIcon(a.source)} ${esc(a.source)}</div></div>
      <div class="vdivider"></div>
      <div><div class="muted small">Source events</div><div class="owner">${icon('database', 18, 'blue')} 2 source events</div></div>
      <div class="vdivider"></div>
      <div><div class="muted small">Enrichment</div><div class="row">${enrichTxt(out.found).replace(/ · \d+\/6$/, '')} · ${out.found}/6 ${dots(out.found)}</div></div>
    </div>
    <div class="row wrap mt16">
      <button class="btn primary lg" data-action="merge">Merge</button>
      <button class="btn lg" data-action="separate">${icon('upload', 16)} Keep separate</button>
      <button class="btn ghost" data-action="later">Review later</button>
    </div>
  </div>`;
}

export default {
  title: 'Duplicate Review',
  render() {
    const s = store.s;
    const items = list();
    if (!ui.sel || !s.duplicates.some((d) => d.id === ui.sel)) ui.sel = items[0]?.id || null;
    const sel = s.duplicates.find((d) => d.id === ui.sel);
    const head = leadSettingsTabs('duplicates') + pageHead({ crumbs: leadSettingsCrumbs('Duplicate Review'), title: 'Duplicate Review', sub: 'Review matching records before merging' });
    const t = tabs([['matches', 'Potential matches', s.duplicates.length], ['history', 'Merge history', s.mergeHistory.length]], ui.tab);
    if (ui.tab === 'history') {
      return `${head}${t}<div class="table-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Kept record</th><th>Other record</th><th>Decision</th><th>By</th><th>When</th></tr></thead><tbody>
        ${s.mergeHistory.map((m) => `<tr><td class="muted">${m.id}</td><td class="strong" style="font-weight:500">${esc(m.kept)}</td><td>${esc(m.merged)}</td><td>${statusBadge(m.action, { tone: m.action === 'Merged' ? '' : 'gray' })}</td><td>${esc(m.by)}</td><td class="muted">${esc(m.at)}</td></tr>`).join('')}
      </tbody></table></div><p class="muted small mt12">Merges keep every source event, activity and consent record from both sides.</p>`;
    }
    return `${head}${t}
    <div class="split3 dup-grid" style="--cols:360px minmax(0,1fr)">
      <div class="card" style="padding:12px">
        ${searchInput('Search by name, email or company...', ui.q, 'data-input="q" id="dup-q"')}
        <div class="muted small" style="padding:10px 4px">${items.length} potential matches</div>
        <div class="stack sm">${items.map((d) => `<button class="dup-item ${d.id === ui.sel ? 'active' : ''}" data-action="sel" data-id="${d.id}">
          ${avatar(d.a.name, 'lg')}<div class="grow" style="text-align:left"><div class="strong">${esc(d.a.name)} <span class="muted">/</span> ${esc(d.b.name)}</div><div class="muted small">${esc(d.a.company)}</div><div class="muted small">${esc(d.reason)}</div></div>${icon('chevRight', 18)}</button>`).join('') || `<div class="empty">${icon('checkCircle', 30)}<div>No open duplicates. Nice work.</div></div>`}</div>
      </div>
      <div>${sel ? compare(sel) : `<div class="card"><div class="empty">${icon('merge', 32)}<div>All potential matches reviewed.</div><a class="btn sm mt12" href="#/demo/leads">Back to All Leads</a></div></div>`}</div>
    </div>`;
  },
  mount(root, ctx) {
    const resolve = (action) => {
      const d = store.s.duplicates.find((x) => x.id === ui.sel);
      if (!d) return;
      const { out } = merged(d);
      store.update((s) => {
        s.duplicates = s.duplicates.filter((x) => x.id !== d.id);
        s.mergeHistory.unshift({ id: `MRG-${13 + s.mergeHistory.length}`, kept: `${out.name} (${d.a.id})`, merged: `${d.b.name} (${d.b.id})`, by: s.me.name, at: 'Oct 29, 2026 · Now', action });
        if (action === 'Merged') {
          const l = s.leads.find((x) => x.id === d.a.id);
          if (l) ['name', 'company', 'title'].forEach((k) => { if (out[k]) l[k] = out[k]; });
        }
      });
      delete ui.choice[d.id];
      ui.sel = null;
      toast(action === 'Merged' ? `Merged into ${d.a.id}` : `${d.a.name} and ${d.b.name} kept separate`, 'Recorded in merge history for this demo session.');
      ctx.rerender();
    };
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        sel: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        merge: () => resolve('Merged'),
        separate: () => resolve('Kept separate'),
        later: () => {
          store.update((s) => { const i = s.duplicates.findIndex((x) => x.id === ui.sel); if (i >= 0) s.duplicates.push(s.duplicates.splice(i, 1)[0]); });
          ui.sel = null; toast('Moved to the end of the queue', 'You can review it later in this session.'); ctx.rerender();
        },
      },
      change: { pick: (el) => { ui.choice[ui.sel] = { ...(ui.choice[ui.sel] || {}), [el.dataset.k]: el.dataset.side }; ctx.rerender(); } },
      input: { q: (el) => { ui.q = el.value; keepFocus('#dup-q', ctx.rerender); } },
    });
  },
};
