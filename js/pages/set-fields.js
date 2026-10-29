// 31 · Fields & Stages — lead fields, lifecycle stages and sales stages.
import { icon, esc, pageHead, select, toggle, searchInput, on, toast, modal, confirm, keepFocus } from '../ui.js';
import { store } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

const ui = { sub: 'fields', q: '', type: '', fieldId: 'size', draft: null };
const TYPES = ['Text', 'Email', 'Phone', 'Single select', 'Multi select', 'Number', 'URL', 'Date'];
const isSelect = (t) => t === 'Single select' || t === 'Multi select';

function draftFor(id) {
  const f = store.s.fields.find((x) => x.id === id);
  return f ? { ...f, options: [...(f.options || [])], allowUnknown: !!f.allowUnknown, locked: f.enrichment === 'Original data' } : null;
}

function fieldsView(s) {
  const q = ui.q.trim().toLowerCase();
  const rows = s.fields.filter((f) => (!ui.type || f.type === ui.type) && (!q || f.label.toLowerCase().includes(q)));
  const d = ui.draft;
  return `<div class="split wide-side">
    <div class="stack">
      <div class="filters" style="margin-bottom:0">
        ${searchInput('Search fields...', ui.q, 'data-input="q" id="fd-q"')}
        ${select([['', 'Type'], ...TYPES], ui.type, 'data-change="type" aria-label="Type"')}
        <button class="btn primary" data-action="create">${icon('plus', 18)} Create field</button>
      </div>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th style="width:70px"></th><th>Field</th><th>Type</th><th>Required</th><th>Enrichment</th></tr></thead>
        <tbody>${rows.map((f) => {
          const i = s.fields.indexOf(f);
          return `<tr class="clickable ${d && d.id === f.id ? 'selected' : ''}" data-action="pick" data-id="${f.id}">
          <td class="nowrap"><button class="icon-btn" style="width:26px;height:26px" data-action="move" data-id="${f.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('chevUp', 14)}</button><button class="icon-btn" style="width:26px;height:26px" data-action="move" data-id="${f.id}" data-dir="1" ${i === s.fields.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('chevDown', 14)}</button></td>
          <td class="strong" style="font-weight:500">${esc(f.label)}</td><td>${esc(f.type)}</td><td>${f.required ? 'Yes' : 'No'}</td><td>${esc(f.enrichment)}</td></tr>`;
        }).join('') || '<tr><td colspan="5"><div class="empty">No fields match.</div></td></tr>'}</tbody>
      </table></div>
      <div class="callout">${icon('info', 22)}<div><div class="strong">Missing optional fields do not block lead creation.</div>
        <div class="small mt8">The six external target fields are: <b>Company, Job title, City, Company size, Industry</b> and <b>LinkedIn URL</b>. Email and phone are not counted as target fields.</div></div></div>
    </div>
    ${d ? `<div class="card card-pad">
      <h2 class="mb12">${esc(d.label || 'New field')}</h2>
      <div class="kv" style="grid-template-columns:110px 1fr">
        <span class="k">Label</span><input class="input" data-input="label" value="${esc(d.label)}">
        <span class="k">Type</span>${select(TYPES, d.type, `data-change="ftype" ${d.locked ? 'disabled' : ''}`)}
      </div>
      ${isSelect(d.type) ? `<div class="kv mt12" style="grid-template-columns:110px 1fr;align-items:start"><span class="k" style="padding-top:8px">Options</span><div class="stack sm">
        ${d.options.map((o, i) => `<div class="row"><span class="stack" style="gap:0"><button class="icon-btn" style="width:22px;height:18px" data-action="opt-move" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move option up">${icon('chevUp', 12)}</button><button class="icon-btn" style="width:22px;height:18px" data-action="opt-move" data-i="${i}" data-dir="1" ${i === d.options.length - 1 ? 'disabled' : ''} aria-label="Move option down">${icon('chevDown', 12)}</button></span>
          <input class="input sm grow" data-input="opt" data-i="${i}" value="${esc(o)}"><button class="icon-btn" data-action="opt-del" data-i="${i}" aria-label="Remove option">${icon('trash', 16)}</button></div>`).join('')}
        <div><button class="btn soft sm" data-action="opt-add">${icon('plus', 15)} Add option</button></div></div></div>` : ''}
      <div class="mt12">
        ${[['required', 'Required'], ['allowUnknown', 'Allow unknown value'], ['show', 'Show in lead tables'], ['target', 'Enrichment target']].map(([k, label]) => `<div class="setting-row"><span class="grow">${label}</span>${toggle(k === 'target' ? d.enrichment === 'Target field' : d[k], `data-change="flag" data-k="${k}" aria-label="${label}" ${(k === 'required' && d.enrichment === 'Target field') || (k === 'target' && d.locked) ? 'disabled' : ''}`)}</div>`).join('')}
        ${d.enrichment === 'Target field' ? '<p class="muted small">Enrichment targets stay optional so missing values never block a lead.</p>' : ''}
      </div>
      <div class="row mt16" style="justify-content:space-between">${d.isNew || d.locked ? '<span></span>' : `<button class="btn danger" data-action="delete">${icon('trash', 16)} Delete</button>`}<span class="row"><button class="btn" data-action="cancel">Cancel</button><button class="btn primary" data-action="save">Save field</button></span></div>
    </div>` : `<div class="card card-pad empty">Select a field to edit.</div>`}
  </div>`;
}

function stagesView(s, key, title, hint) {
  const list = s[key];
  return `<div class="card card-pad" style="max-width:720px">
    <div class="row between"><h2>${title}</h2><button class="btn primary sm" data-action="stage-add" data-key="${key}">${icon('plus', 15)} Add stage</button></div>
    <p class="muted mb12">${hint}</p>
    ${list.map((st, i) => `<div class="list-item"><span class="badge gray" style="min-width:28px;justify-content:center">${i + 1}</span>
      <input class="input sm grow" data-input="stage" data-key="${key}" data-i="${i}" value="${esc(st)}" aria-label="Stage name">
      <button class="icon-btn" data-action="stage-move" data-key="${key}" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('chevUp', 16)}</button>
      <button class="icon-btn" data-action="stage-move" data-key="${key}" data-i="${i}" data-dir="1" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('chevDown', 16)}</button>
      <button class="icon-btn" data-action="stage-del" data-key="${key}" data-i="${i}" aria-label="Remove stage">${icon('trash', 16)}</button></div>`).join('')}
    ${key === 'salesStages' ? `<div class="callout mt12">${icon('info', 18)}<span>Sales Pipeline columns follow this order. Lead counts per stage: ${['New 30', 'Contacting 32', 'Engaged 26', 'Follow-up 14', 'Converted 6', 'Closed 12'].join(' · ')}.</span></div>` : ''}
  </div>`;
}

export default {
  title: 'Fields & Stages',
  render() {
    const s = store.s;
    if (ui.draft === null && ui.fieldId) ui.draft = draftFor(ui.fieldId);
    const subs = [['fields', 'Fields'], ['lifecycle', 'Lifecycle'], ['stages', 'Sales Stages']];
    return `
    ${pageHead({ title: 'Settings' })}
    ${settingsTabs('fields-stages')}
    <div class="seg mb16">${subs.map(([k, l]) => `<button class="${ui.sub === k ? 'active' : ''}" data-action="sub" data-k="${k}">${l}</button>`).join('')}</div>
    ${ui.sub === 'fields' ? fieldsView(s)
      : ui.sub === 'lifecycle' ? stagesView(s, 'lifecycle', 'Lifecycle stages', 'Where a lead is in its overall relationship with your organization.')
      : stagesView(s, 'salesStages', 'Sales stages', 'Columns of the Sales Pipeline, in order.')}`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#fd-q', ctx.rerender);
    const move = (arr, i, dir) => { const j = i + dir; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
    on(root, {
      click: {
        sub: (el) => { ui.sub = el.dataset.k; re(); },
        pick: (el, e) => { if (e.target.closest('button')) return; ui.fieldId = el.dataset.id; ui.draft = draftFor(el.dataset.id); re(); },
        move: (el) => { store.update((s) => { const i = s.fields.findIndex((f) => f.id === el.dataset.id); move(s.fields, i, +el.dataset.dir); }); re(); },
        create: () => { ui.fieldId = null; ui.draft = { id: `custom_${Date.now()}`, label: 'New field', type: 'Text', required: false, enrichment: 'Custom field', show: true, allowUnknown: true, options: [], isNew: true }; re(); },
        cancel: () => { ui.draft = ui.fieldId ? draftFor(ui.fieldId) : null; re(); },
        save: () => {
          const d = ui.draft;
          if (!d.label.trim()) { toast('Field not saved', 'Label is required.'); return; }
          const { isNew, locked, ...f } = d;
          if (!isSelect(f.type)) delete f.options; else f.options = f.options.filter((o) => o.trim());
          store.update((s) => {
            const i = s.fields.findIndex((x) => x.id === f.id);
            const before = i >= 0 ? s.fields[i] : null;
            if (i >= 0) s.fields[i] = f; else s.fields.push(f);
            if (before && before.show !== f.show) s.audit.unshift({ id: `AUD-${930 + s.audit.length}`, time: 'Now', actor: s.me.name, actorRole: s.me.role, action: 'Field display updated', item: f.label, result: 'Success', setting: 'Show in lead tables', before: before.show ? 'On' : 'Off', after: f.show ? 'On' : 'Off', link: '#/demo/settings/fields-stages' });
          });
          ui.fieldId = f.id; ui.draft = null;
          toast(`Field “${f.label}” saved`, 'Demo only — no database schema was changed.'); re();
        },
        delete: () => confirm('Delete field?', `Remove “${esc(ui.draft.label)}” from lead records in this demo session?`, 'Delete').then((ok) => {
          if (!ok) return;
          store.update((s) => { s.fields = s.fields.filter((f) => f.id !== ui.draft.id); });
          toast('Field deleted'); ui.fieldId = null; ui.draft = null; re();
        }),
        'opt-add': () => { ui.draft.options.push(''); re(); setTimeout(() => { const ins = root.querySelectorAll('[data-input="opt"]'); ins[ins.length - 1]?.focus(); }); },
        'opt-del': (el) => { ui.draft.options.splice(+el.dataset.i, 1); re(); },
        'opt-move': (el) => { move(ui.draft.options, +el.dataset.i, +el.dataset.dir); re(); },
        'stage-move': (el) => { store.update((s) => move(s[el.dataset.key], +el.dataset.i, +el.dataset.dir)); toast('Stage order updated', 'Saved in this demo session.'); re(); },
        'stage-add': (el) => { store.update((s) => s[el.dataset.key].push('New stage')); re(); },
        'stage-del': (el) => {
          const key = el.dataset.key; const name = store.s[key][+el.dataset.i];
          confirm('Remove stage?', `Remove “${esc(name)}”? Leads in this stage would need to be moved first in the operational release.`, 'Remove').then((ok) => {
            if (ok) { store.update((s) => s[key].splice(+el.dataset.i, 1)); toast(`Stage “${name}” removed`); re(); }
          });
        },
      },
      change: {
        type: (el) => { ui.type = el.value; re(); },
        ftype: (el) => { ui.draft.type = el.value; if (isSelect(el.value) && !ui.draft.options.length) ui.draft.options = ['Option 1']; re(); },
        flag: (el) => {
          const k = el.dataset.k;
          if (k === 'target') { ui.draft.enrichment = el.checked ? 'Target field' : 'Custom field'; if (el.checked) ui.draft.required = false; }
          else ui.draft[k] = el.checked;
          re();
        },
      },
      input: {
        q: (el) => { ui.q = el.value; re(); },
        label: (el) => { ui.draft.label = el.value; },
        opt: (el) => { ui.draft.options[+el.dataset.i] = el.value; },
        stage: (el) => { store.update((s) => { s[el.dataset.key][+el.dataset.i] = el.value; }); },
      },
    });
  },
};
