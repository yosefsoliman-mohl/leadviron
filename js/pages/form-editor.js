// 07 · Form Editor — add, reorder and configure fields; preview; save draft / publish (simulated).
import { icon, esc, pageHead, select, toggle, on, toast, modal, confirm } from '../ui.js';
import { store, OWNERS, SOURCES } from '../store.js';
import { previewModal } from './forms.js';

const ui = { sel: null, device: 'desktop', libQ: '', formId: null };

const LIB = [
  ['text', 'Short text', 'type'], ['email', 'Email', 'mail'], ['phone', 'Phone', 'phone'],
  ['dropdown', 'Dropdown', 'dropdown'], ['consent', 'Consent', 'checkSquare'], ['hidden', 'Hidden field', 'eyeOff'],
];
const TYPE_LABEL = { text: 'Short text', email: 'Email', phone: 'Phone', dropdown: 'Dropdown', consent: 'Consent', hidden: 'Hidden field' };
const MAPPINGS = ['Full name', 'Email', 'Phone', 'Company', 'Job title', 'City', 'Notes', 'WhatsApp opt-in', 'UTM source'];

const formOf = (id) => store.s.forms.find((f) => f.id === id);
const bump = (v) => { const m = /v(\d+)\.(\d+)/.exec(v || 'v1.0'); return m ? `v${m[1]}.${+m[2] + 1}` : 'v0.1'; };

function fieldPreview(fd, selected) {
  let control = '';
  if (fd.type === 'phone') control = `<div class="row"><select class="select" style="width:96px" tabindex="-1"><option>+966</option></select><input class="input" tabindex="-1"></div>`;
  else if (fd.type === 'consent') control = '';
  else if (fd.type === 'dropdown') control = `<select class="select" tabindex="-1"><option>Select…</option>${(fd.options || []).map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (fd.type === 'hidden') control = `<div class="chip gray">${icon('eyeOff', 14)} Hidden · maps to ${esc(fd.mapping || '—')}</div>`;
  else control = '<input class="input" tabindex="-1">';
  const label = fd.type === 'consent'
    ? `<label class="row" style="gap:10px;align-items:flex-start"><input type="checkbox" class="check" tabindex="-1"> <span>${esc(fd.label)}</span></label>`
    : `<div class="label" style="font-size:14px">${esc(fd.label)}${fd.required ? ' <span class="blue">*</span>' : ''}</div>`;
  return `<div class="fe-field ${selected ? 'selected' : ''}" draggable="true" data-action="pick" data-id="${fd.id}" data-drag="${fd.id}" role="button" tabindex="0" aria-label="Field ${esc(fd.label)}">
    <span class="fe-grip drag">${icon('grip', 16)}</span>${label}${control ? `<div class="mt8">${control}</div>` : ''}</div>`;
}

function settingsPanel(f, fd) {
  if (!fd) return `<div class="card card-pad"><h2>Field settings</h2><p class="muted mt12">Select a field in the preview to edit it.</p></div>`;
  const row = (label, ctrl) => `<div class="fe-set"><span>${label}</span><div>${ctrl}</div></div>`;
  return `<div class="card card-pad">
    <div class="row between"><h2>Field settings</h2><button class="icon-btn" data-action="del" aria-label="Delete field">${icon('trash', 18)}</button></div>
    <div class="stack sm mt12">
      ${row('Label', `<input class="input" data-input="label" id="fe-label" value="${esc(fd.label)}">`)}
      ${row('Type', `<select class="select" disabled><option>${TYPE_LABEL[fd.type]}</option></select>`)}
      ${fd.type === 'phone' ? row('Default country', select(['Saudi Arabia (+966)', 'United Arab Emirates (+971)', 'Egypt (+20)'], fd.country || 'Saudi Arabia (+966)', 'data-change="prop" data-k="country"')) : ''}
      ${fd.type === 'dropdown' ? row('Options', `<input class="input" data-change="options" value="${esc((fd.options || []).join(', '))}" placeholder="Comma separated">`) : ''}
      ${fd.type !== 'hidden' ? row('Always required', toggle(fd.required, 'data-change="required"')) : ''}
      ${fd.type !== 'hidden' && !fd.required ? row('Required when', select(['Never', 'WhatsApp opt-in = Yes', 'Company provided'], fd.requiredWhen || 'Never', 'data-change="prop" data-k="requiredWhen"')) : ''}
      ${['text', 'email', 'phone'].includes(fd.type) ? row('Validation', select(fd.type === 'phone' ? ['International phone number', 'Saudi mobile only', 'None'] : fd.type === 'email' ? ['Valid email', 'Business email only', 'None'] : ['None', 'Max 100 characters'], fd.validation || (fd.type === 'phone' ? 'International phone number' : fd.type === 'email' ? 'Valid email' : 'None'), 'data-change="prop" data-k="validation"')) : ''}
      ${row('Field mapping', select(MAPPINGS, fd.mapping || 'Notes', 'data-change="prop" data-k="mapping"'))}
    </div>
    <div class="row mt12"><button class="btn sm" data-action="move" data-dir="-1">${icon('chevUp', 15)} Move up</button><button class="btn sm" data-action="move" data-dir="1">${icon('chevDown', 15)} Move down</button></div>
  </div>
  <div class="card card-pad">
    <h2>Form settings</h2>
    <div class="stack sm mt12">
      ${row('Success message', `<input class="input sm" data-change="form" data-k="successMessage" value="${esc(f.successMessage)}">`)}
      ${row('Lead source', select(SOURCES, f.source, 'data-change="form" data-k="source"', 'sm'))}
      ${row('Assigned owner', select(OWNERS, f.owner, 'data-change="form" data-k="owner"', 'sm'))}
    </div>
  </div>`;
}

export default {
  title: 'Form Editor',
  render(ctx) {
    const f = formOf(ctx.params.formId);
    if (!f) return `<div class="card card-pad">Form not found. <a href="#/demo/leads/forms">Back to Web Forms</a></div>`;
    if (ui.formId !== f.id) { ui.formId = f.id; ui.sel = (f.fields.find((x) => x.type === 'phone') || f.fields[0])?.id; }
    const fd = f.fields.find((x) => x.id === ui.sel);
    const lib = LIB.filter(([, l]) => l.toLowerCase().includes(ui.libQ.toLowerCase()));
    const ver = [f.draft ? `Draft ${f.draft}` : null, f.published ? `Published ${f.published}` : 'Not published'].filter(Boolean).join(' · ');
    const phoneRule = f.fields.some((x) => x.type === 'phone' && x.requiredWhen === 'WhatsApp opt-in = Yes');
    return `
    <nav class="breadcrumb"><a href="#/demo/leads">Leads</a><span>/</span><a href="#/demo/leads/forms">Web Forms</a><span>/</span><span>${esc(f.name)}</span></nav>
    ${pageHead({
      title: 'Form Editor', sub: `${esc(f.name)} · ${ver}${f.dirty ? ' · <span class="blue">Unsaved changes</span>' : ''}`,
      actions: `<button class="btn" data-action="preview">${icon('eye', 17)} Preview</button><button class="btn" data-action="save">${icon('save', 17)} Save draft</button><button class="btn primary" data-action="publish">${icon('upload', 17)} Publish</button>
        <div class="row" style="width:100%;justify-content:flex-end"><button class="btn" data-action="share">${icon('link', 16)} Share link</button><button class="btn" data-action="embed">${icon('code', 16)} Embed</button></div>`,
    })}
    <div class="split3" style="grid-template-columns:260px minmax(0,1fr) 400px">
      <div class="card card-pad">
        <h2 class="mb12">Field library</h2>
        <div class="search-input">${icon('search', 16)}<input class="input" placeholder="Search fields..." data-input="libq" id="fe-libq" value="${esc(ui.libQ)}"></div>
        <div class="stack sm mt12">${lib.map(([t, l, ic]) => `<button class="fe-lib" draggable="true" data-lib="${t}" data-action="add" data-type="${t}" title="Click or drag to add">${icon('grip', 15, 'drag')} ${icon(ic, 18)} ${l}</button>`).join('') || '<div class="muted small">No fields match.</div>'}</div>
        <div class="divider"></div>
        <button class="menu-item" data-action="formsettings">${icon('settings', 17)} <span class="grow">Form settings</span>${icon('chevRight', 16)}</button>
        <p class="muted tiny mt8">Click a field to add it, or drag it onto the preview.</p>
      </div>
      <div class="card card-pad">
        <div class="row between"><h2>Form preview</h2><div class="seg"><button class="${ui.device === 'desktop' ? 'active' : ''}" data-action="device" data-d="desktop" aria-label="Desktop preview">${icon('monitor', 17)}</button><button class="${ui.device === 'mobile' ? 'active' : ''}" data-action="device" data-d="mobile" aria-label="Mobile preview">${icon('smartphone', 17)}</button></div></div>
        <div class="fe-canvas mt12 ${ui.device}" data-drop="end">
          <h2 style="font-size:20px;margin-bottom:14px"><input class="fe-title" data-change="form" data-k="title" value="${esc(f.title)}" aria-label="Form title"></h2>
          <div class="stack sm">${f.fields.map((x) => fieldPreview(x, x.id === ui.sel)).join('')}</div>
          ${phoneRule ? '<p class="muted small mt8">Phone is required when WhatsApp is selected.</p>' : ''}
          <button class="btn primary block lg mt16" tabindex="-1">${f.slug === 'product-demo' ? 'Request demo' : 'Submit'}</button>
        </div>
      </div>
      <div class="stack">${settingsPanel(f, fd)}</div>
    </div>`;
  },
  mount(root, ctx) {
    const id = ctx.params.formId;
    if (!formOf(id)) return;
    const edit = (fn) => { store.update((s) => { const f = s.forms.find((x) => x.id === id); fn(f); f.dirty = true; }); };
    const fld = (f) => f.fields.find((x) => x.id === ui.sel);
    const addField = (type, beforeId) => {
      const nid = `f${Date.now().toString(36)}`;
      const defaults = { text: 'Short text', email: 'Email', phone: 'Phone number', dropdown: 'Dropdown', consent: 'I agree to be contacted about my inquiry.', hidden: 'UTM source' };
      const maps = { text: 'Notes', email: 'Email', phone: 'Phone', dropdown: 'Notes', consent: 'WhatsApp opt-in', hidden: 'UTM source' };
      edit((f) => {
        const item = { id: nid, type, label: defaults[type], required: false, mapping: maps[type], options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined };
        const i = beforeId ? f.fields.findIndex((x) => x.id === beforeId) : -1;
        i >= 0 ? f.fields.splice(i, 0, item) : f.fields.push(item);
      });
      ui.sel = nid; ctx.rerender();
    };
    on(root, {
      click: {
        pick: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        add: (el) => addField(el.dataset.type),
        device: (el) => { ui.device = el.dataset.d; ctx.rerender(); },
        del: () => confirm('Delete field?', 'The field is removed from the draft. Earlier submissions keep their values.', 'Delete').then((ok) => {
          if (!ok) return; edit((f) => { f.fields = f.fields.filter((x) => x.id !== ui.sel); }); ui.sel = formOf(id).fields[0]?.id; ctx.rerender();
        }),
        move: (el) => { edit((f) => { const i = f.fields.findIndex((x) => x.id === ui.sel); const j = i + +el.dataset.dir; if (i >= 0 && j >= 0 && j < f.fields.length) [f.fields[i], f.fields[j]] = [f.fields[j], f.fields[i]]; }); ctx.rerender(); },
        preview: () => previewModal(formOf(id)),
        save: () => { store.update((s) => { const f = s.forms.find((x) => x.id === id); f.draft = f.dirty ? bump(f.draft || f.published) : (f.draft || bump(f.published)); f.dirty = false; f.updated = 'Oct 29, 2026'; }); toast(`Draft ${formOf(id).draft} saved`, 'Saved in this demo session. The published form is unchanged.'); ctx.rerender(); },
        publish: () => confirm('Publish form?', `Publishing makes ${esc(formOf(id).draft ? `draft ${formOf(id).draft}` : 'this version')} the live version. In the demo this is simulated and no real form receives data.`, 'Publish').then((ok) => {
          if (!ok) return;
          store.update((s) => { const f = s.forms.find((x) => x.id === id); f.published = f.draft || bump(f.published); f.draft = null; f.dirty = false; f.status = 'Published'; f.updated = 'Oct 29, 2026'; });
          toast(`${formOf(id).name} published ${formOf(id).published}`, 'Demo simulation — no public form was changed.'); ctx.rerender();
        }),
        share: () => { const f = formOf(id); modal({ title: 'Share link', body: `<div class="row"><input class="input" readonly value="https://forms.leadviron.example/${esc(f.slug)}"><button class="btn" data-copy>${icon('copy', 16)}</button></div><p class="muted small mt8">Demo link — it does not host a live form.</p>`, buttons: [{ label: 'Done', cls: 'primary', value: 1 }], onMount: (ov) => ov.querySelector('[data-copy]').addEventListener('click', () => { navigator.clipboard?.writeText(`https://forms.leadviron.example/${f.slug}`).catch(() => {}); toast('Link copied', ''); }) }); },
        embed: () => { const f = formOf(id); modal({ title: 'Embed form', body: `<div class="code">&lt;script src="https://forms.leadviron.example/embed.js" data-form="${esc(f.slug)}" async&gt;&lt;/script&gt;</div><p class="muted small mt8">Paste on any page. Demo snippet only.</p>`, buttons: [{ label: 'Done', cls: 'primary', value: 1 }] }); },
        formsettings: () => root.querySelector('[data-k="successMessage"]')?.focus(),
      },
      change: {
        required: (el) => { edit((f) => { fld(f).required = el.checked; }); ctx.rerender(); },
        prop: (el) => { edit((f) => { fld(f)[el.dataset.k] = el.value === 'Never' ? null : el.value; }); ctx.rerender(); },
        options: (el) => { edit((f) => { fld(f).options = el.value.split(',').map((x) => x.trim()).filter(Boolean); }); ctx.rerender(); },
        form: (el) => { edit((f) => { f[el.dataset.k] = el.value; }); ctx.rerender(); },
      },
      input: {
        label: (el) => { edit((f) => { fld(f).label = el.value; }); const pos = el.selectionStart; ctx.rerender(); const n = document.getElementById('fe-label'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } },
        libq: (el) => { ui.libQ = el.value; const pos = el.selectionStart; ctx.rerender(); const n = document.getElementById('fe-libq'); n.focus(); n.setSelectionRange(pos, pos); },
      },
    });

    // Drag from the library to add, drag fields to reorder.
    let drag = null;
    root.addEventListener('dragstart', (e) => {
      const lib = e.target.closest('[data-lib]'); const fdEl = e.target.closest('[data-drag]');
      drag = lib ? { lib: lib.dataset.lib } : fdEl ? { id: fdEl.dataset.drag } : null;
      if (drag) e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', 'field'); } catch (_) { /* ignore */ }
    });
    root.addEventListener('dragover', (e) => {
      if (!drag || !e.target.closest('.fe-canvas')) return;
      e.preventDefault();
      root.querySelectorAll('.fe-field.drop-before').forEach((x) => x.classList.remove('drop-before'));
      e.target.closest('.fe-field')?.classList.add('drop-before');
    });
    root.addEventListener('drop', (e) => {
      if (!drag || !e.target.closest('.fe-canvas')) return;
      e.preventDefault();
      const before = e.target.closest('.fe-field')?.dataset.id || null;
      if (drag.lib) addField(drag.lib, before);
      else if (drag.id !== before) {
        edit((f) => {
          const item = f.fields.find((x) => x.id === drag.id);
          f.fields = f.fields.filter((x) => x.id !== drag.id);
          const i = before ? f.fields.findIndex((x) => x.id === before) : -1;
          i >= 0 ? f.fields.splice(i, 0, item) : f.fields.push(item);
        });
        ui.sel = drag.id; ctx.rerender();
      }
      drag = null;
    });
    root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.drop-before').forEach((x) => x.classList.remove('drop-before')); });
  },
};
