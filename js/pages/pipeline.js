// 23 · Sales Pipeline — Kanban by sales stage with drag-and-drop and a "Move to…" menu.
import { icon, esc, avatar, owner, statusBadge, select, on, toast, modal } from '../ui.js';
import { store, leadById, enrichLabel, enrichPct, OWNERS, SOURCES, STAGES, COHORT } from '../store.js';
import { addLeadModal } from '../shared.js';

const ui = { owner: '', source: '', enrich: '', menu: null, open: new Set() };
const SHOWN = 3;

// Leads featured in the reference screen, shown first in their column.
const PINNED = ['LD-1052', 'LD-1063', 'LD-0912', 'LD-0731', 'LD-0915', 'LD-0927', 'LD-1048', 'LD-0954', 'LD-0842', 'LD-0688', 'LD-0701', 'LD-0763'];
const NEXT = {
  'LD-1052': ['file', 'Review missing fields'], 'LD-1063': ['file', 'Request details'], 'LD-0912': ['search', 'Research data'],
  'LD-0731': ['linkedin', 'LinkedIn introduction'], 'LD-0915': ['mail', 'Follow up'], 'LD-0927': ['mail', 'Await reply'],
  'LD-1048': ['calendar', 'Schedule demo: Tomorrow 2 PM'], 'LD-0954': ['phone', 'Sales follow-up'], 'LD-0842': ['phone', 'Follow-up call'],
};
const STAGE_NEXT = { New: ['file', 'Review lead'], Contacting: ['mail', 'Await reply'], Engaged: ['phone', 'Sales follow-up'], 'Follow-up': ['phone', 'Follow-up call'] };

function nextAction(l) {
  if (l.stage === 'Converted') return ['file', 'Conversion recorded'];
  if (l.stage === 'Closed') return ['file', l.qual === 'Disqualified' ? 'Not qualified' : 'Closed'];
  return NEXT[l.id] || STAGE_NEXT[l.stage];
}

function enrichChip(l) {
  return `<span class="badge ${l.enrich === 'nomatch' ? 'gray' : ''}">${enrichLabel(l)} ${enrichPct(l)}%</span>`;
}

function filtered() {
  return store.s.leads.filter((l) => (!ui.owner || l.owner === ui.owner) && (!ui.source || l.source === ui.source) && (!ui.enrich || l.enrich === ui.enrich));
}

function rank(l) { const i = PINNED.indexOf(l.id); return i < 0 ? 1000 : i; }

function card(l) {
  const [ic, label] = nextAction(l);
  const menuOpen = ui.menu === l.id;
  return `<div class="kb-card" draggable="true" data-lead="${l.id}" data-action="card" data-id="${l.id}" role="button" tabindex="0" aria-label="${esc(l.name)}, ${esc(l.stage)}">
    <div class="kb-menu">
      <button class="icon-btn" role="button" data-action="menu" data-id="${l.id}" aria-label="Actions for ${esc(l.name)}" aria-expanded="${menuOpen}">${icon('more', 18)}</button>
      <div class="popover ${menuOpen ? 'kb-show' : ''}">
        <div class="menu-label">Move to…</div>
        ${STAGES.filter((s) => s !== l.stage).map((s) => `<button class="menu-item" role="button" data-action="move" data-id="${l.id}" data-stage="${s}">${icon('arrowRight', 15)} ${s}</button>`).join('')}
        <div class="menu-sep"></div>
        <a class="menu-item" href="#/demo/leads/${l.id}">${icon('external', 15)} Open profile</a>
        ${l.stage !== 'Converted' ? `<button class="menu-item" role="button" data-action="convert" data-id="${l.id}">${icon('bars', 15)} Record conversion</button>` : ''}
      </div>
    </div>
    <div class="nm" style="padding-right:26px">${esc(l.name)}</div>
    <div class="co">${esc(l.company || 'Company unknown')}</div>
    <div class="meta"><span>Score</span><span>Enrichment</span><span class="sc num">${l.score ?? '—'}</span><span>${enrichChip(l)}</span></div>
    <div class="mt8">${owner(l.owner)}</div>
    <div class="kb-next">${icon(ic, 16)}<span>${esc(label)}</span></div>
  </div>`;
}

function moveLead(id, stage) {
  const l = leadById(id);
  if (!l || l.stage === stage) return;
  store.update(() => { leadById(id).stage = stage; });
  if (stage === 'Converted') toast(`Conversion recorded for ${l.name}`, 'Demo simulation — no external record was changed.');
  else toast(`${l.name} moved to ${stage}`, 'Saved in this demo session only.');
}

function summary(ctx, id) {
  const l = leadById(id);
  const [ic, label] = nextAction(l);
  const task = store.s.tasks.find((t) => t.leadId === id && t.status !== 'Done');
  const buttons = [{ label: 'Close', value: null }];
  if (l.stage !== 'Converted') buttons.push({ label: 'Record conversion', value: 'convert' });
  buttons.push({ label: 'Open profile', cls: 'primary', value: 'open' });
  modal({
    title: l.name,
    body: `<div class="row mb12">${avatar(l.initials, 'lg')}<div><div class="strong">${esc([l.title, l.company].filter(Boolean).join(' · ') || 'Company and role unknown')}</div><div class="muted small">${l.id} · ${esc(l.source)}</div></div></div>
      <div class="kv">
        <span class="k">Stage</span><span class="v">${statusBadge(l.stage)}</span>
        <span class="k">Score</span><span class="v">${l.score ?? 'Not assessed'}${l.score != null ? ' / 100' : ''}</span>
        <span class="k">Qualification</span><span class="v">${statusBadge(l.qual)}</span>
        <span class="k">Enrichment</span><span class="v">${enrichChip(l)} <span class="muted small">${l.found}/6 fields</span></span>
        <span class="k">Owner</span><span class="v">${owner(l.owner)}</span>
        <span class="k">Next action</span><span class="v">${icon(ic, 15)} ${esc(label)}</span>
        <span class="k">Contact</span><span class="v">${esc(l.email)} · ${esc(l.phone)}</span>
      </div>
      ${task ? `<div class="callout mt16">${icon('calendarCheck', 18)}<span>Open task: <a href="#/demo/sales/tasks?task=${task.id}">${esc(task.title)}</a></span></div>` : ''}`,
    buttons,
  }).then(({ value }) => {
    if (value === 'open') ctx.navigate(`/demo/leads/${id}`);
    if (value === 'convert') { moveLead(id, 'Converted'); ctx.rerender(); }
  });
}

export default {
  title: 'Sales Pipeline',
  render() {
    const rows = filtered();
    const cols = STAGES.map((stage) => {
      const leads = rows.filter((l) => l.stage === stage).sort((a, b) => rank(a) - rank(b));
      const expanded = ui.open.has(stage);
      const shown = expanded ? leads : leads.slice(0, SHOWN);
      const more = leads.length - shown.length;
      return `<section class="kb-col" data-stage="${stage}" aria-label="${stage} column">
        <div class="kb-head"><div class="grow"><div class="t">${stage}</div><div class="n"><b class="num">${leads.length}</b>leads</div></div>
          <button class="icon-btn" data-action="col" data-stage="${stage}" aria-label="${stage} column options">${icon('more', 18)}</button></div>
        <div class="kb-cards">${shown.map(card).join('') || '<div class="muted small" style="padding:12px;text-align:center">Drop leads here</div>'}</div>
        ${more > 0 ? `<button class="btn ghost sm kb-more" data-action="expand" data-stage="${stage}">+${more} more</button>` : expanded && leads.length > SHOWN ? `<button class="btn ghost sm kb-more" data-action="expand" data-stage="${stage}">Show less</button>` : ''}
      </section>`;
    }).join('');
    return `
    <div class="page-head"><div class="titles"><h1>Sales Pipeline</h1><div class="sub">${COHORT} · ${rows.length} leads</div></div>
      <div class="actions">
        ${select([['', 'All owners'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
        ${select([['', 'Source'], ...SOURCES], ui.source, 'data-change="source" aria-label="Source"')}
        ${select([['', 'Enrichment'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], ui.enrich, 'data-change="enrich" aria-label="Enrichment"')}
        <button class="btn primary" data-action="add">${icon('plus', 18)} Add lead</button>
      </div></div>
    <div class="kanban">${cols}</div>
    <p class="muted small mt8">Drag cards between stages, or use the card menu to move a lead. Changes stay in this demo session.</p>`;
  },
  mount(root, ctx) {
    const set = (k) => (el) => { ui[k] = el.value; ctx.rerender(); };
    on(root, {
      click: {
        card: (el) => summary(ctx, el.dataset.id),
        menu: (el) => { ui.menu = ui.menu === el.dataset.id ? null : el.dataset.id; ctx.rerender(); },
        move: (el) => { ui.menu = null; moveLead(el.dataset.id, el.dataset.stage); ctx.rerender(); },
        convert: (el) => { ui.menu = null; moveLead(el.dataset.id, 'Converted'); ctx.rerender(); },
        expand: (el) => { const s = el.dataset.stage; ui.open.has(s) ? ui.open.delete(s) : ui.open.add(s); ctx.rerender(); },
        col: (el) => {
          const stage = el.dataset.stage;
          const n = filtered().filter((l) => l.stage === stage).length;
          modal({ title: `${stage} · ${n} leads`, body: `<p class="muted">Stage settings are managed in <a href="#/demo/settings/fields-stages">Fields & Stages</a>. Open the full list of leads in this stage from All Leads.</p>`, buttons: [{ label: 'Close', value: null }, { label: 'Open All Leads', cls: 'primary', value: 1 }] })
            .then(({ value }) => value && ctx.navigate('/demo/leads'));
        },
        add: () => addLeadModal().then((id) => id && ctx.rerender()),
      },
      change: { owner: set('owner'), source: set('source'), enrich: set('enrich') },
    });
    // Close an open card menu on any click outside an action.
    root.addEventListener('click', (e) => { if (ui.menu && !e.target.closest('[data-action]') && !e.target.closest('.popover')) { ui.menu = null; ctx.rerender(); } });

    // HTML5 drag and drop between columns.
    let dragId = null;
    root.addEventListener('dragstart', (e) => {
      const c = e.target.closest('[data-lead]');
      if (!c) return;
      dragId = c.dataset.lead;
      c.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);
    });
    root.addEventListener('dragend', (e) => { e.target.closest?.('[data-lead]')?.classList.remove('dragging'); root.querySelectorAll('.kb-col.drop').forEach((c) => c.classList.remove('drop')); });
    root.addEventListener('dragover', (e) => {
      const col = e.target.closest('.kb-col');
      if (!col || !dragId) return;
      e.preventDefault();
      root.querySelectorAll('.kb-col.drop').forEach((c) => c !== col && c.classList.remove('drop'));
      col.classList.add('drop');
    });
    root.addEventListener('drop', (e) => {
      const col = e.target.closest('.kb-col');
      if (!col || !dragId) return;
      e.preventDefault();
      const id = dragId; dragId = null;
      moveLead(id, col.dataset.stage);
      ctx.rerender();
    });
  },
};
