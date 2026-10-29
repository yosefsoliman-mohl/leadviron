// 06 · Web Forms — intake forms, their status and submissions, with a live preview.
import { icon, esc, owner, statusBadge, stat, pageHead, select, searchInput, on, toast, modal, keepFocus } from '../ui.js';
import { store, OWNERS } from '../store.js';

const ui = { q: '', status: '', owner: '', source: '', sel: 'frm-demo', menu: null, period: 'Oct 1 – 29, 2026' };

// Renders a form's fields as a fillable preview (shared with the editor's preview dialog).
export function formPreview(f, { compact = false } = {}) {
  const input = (fd) => {
    if (fd.type === 'consent') return `<label class="row" style="align-items:flex-start;gap:8px;font-size:13px"><input type="checkbox" class="check" name="${fd.id}"> <span>${esc(fd.label)}</span></label>`;
    if (fd.type === 'hidden') return '';
    if (fd.type === 'dropdown') return `<select class="select ${compact ? 'sm' : ''}" name="${fd.id}"><option>Select…</option>${(fd.options || ['Option 1', 'Option 2']).map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
    const ph = fd.type === 'email' ? 'you@company.com' : fd.type === 'phone' ? '+966 5XX XXX XXXX' : compact ? `Your ${fd.label.toLowerCase().replace(' (optional)', '')}` : '';
    return `<input class="input ${compact ? 'sm' : ''}" name="${fd.id}" type="${fd.type === 'email' ? 'email' : 'text'}" placeholder="${esc(ph)}">`;
  };
  return f.fields.map((fd) => (fd.type === 'consent' || fd.type === 'hidden' ? input(fd) : compact
    ? `<div class="row" style="gap:10px"><span class="small" style="width:56px">${esc(fd.label.replace(/^Work |^Full |\s*\(optional\)/g, '').replace('number', ''))}</span><div class="grow">${input(fd)}</div></div>`
    : `<div class="field"><label>${esc(fd.label)}${fd.required ? ' <span class="blue">*</span>' : ''}</label>${input(fd)}</div>`)).join('');
}

export function previewModal(f) {
  return modal({
    title: `Preview · ${f.name}`,
    body: `<form class="stack" data-preview><h3>${esc(f.title)}</h3>${formPreview(f)}<button type="button" class="btn primary block" data-test>Submit test</button><div class="callout hidden" data-ok>${icon('checkCircle', 18)}<span>${esc(f.successMessage)}<br><span class="muted small">Test submission — no lead was created.</span></span></div></form>`,
    buttons: [{ label: 'Close', value: null }],
    onMount: (ov) => ov.querySelector('[data-test]').addEventListener('click', () => ov.querySelector('[data-ok]').classList.remove('hidden')),
  });
}

function filtered() {
  const q = ui.q.toLowerCase();
  return store.s.forms.filter((f) => (!q || f.name.toLowerCase().includes(q)) && (!ui.status || f.status === ui.status) && (!ui.owner || f.owner === ui.owner) && (!ui.source || f.source === ui.source));
}

export default {
  title: 'Web Forms',
  render() {
    const s = store.s;
    const rows = filtered();
    const sel = s.forms.find((f) => f.id === ui.sel) || s.forms[0];
    const total = s.forms.reduce((a, f) => a + f.submissions, 0);
    const url = `forms.leadviron.example/${sel.slug}`;
    return `
    ${pageHead({ title: 'Web Forms', sub: 'Collect and manage inbound inquiries.', actions: `${select(['Oct 1 – 29, 2026', 'Oct 24 – 29, 2026', 'Sep 1 – 30, 2026'], ui.period, 'data-change="period" aria-label="Period"')}<button class="btn primary" data-action="create">${icon('plus', 18)} Create form</button>` })}
    <div class="grid g4">
      ${stat({ icon: 'file', label: 'Total forms', value: s.forms.length })}
      ${stat({ icon: 'play', label: 'Published', value: s.forms.filter((f) => f.status === 'Published').length })}
      ${stat({ icon: 'pause', label: 'Paused', value: s.forms.filter((f) => f.status === 'Paused').length })}
      ${stat({ icon: 'users', label: 'Submissions', value: total })}
    </div>
    <div class="filters mt16">
      ${searchInput('Search forms...', ui.q, 'data-input="q" id="form-q"')}
      ${select([['', 'Status'], 'Published', 'Paused', 'Draft'], ui.status, 'data-change="status" aria-label="Status"')}
      ${select([['', 'Owner'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
      ${select([['', 'Source'], 'Web Forms'], ui.source, 'data-change="source" aria-label="Source"')}
    </div>
    <div class="table-wrap" style="overflow:visible">
      <table class="tbl">
        <thead><tr><th class="w-check"></th><th>Form</th><th>Status</th><th>Owner</th><th>Source</th><th>Submissions</th><th>Last updated</th><th class="c">Actions</th></tr></thead>
        <tbody>${rows.map((f) => `<tr class="clickable ${f.id === sel.id ? 'selected' : ''}" data-action="sel" data-id="${f.id}">
          <td><input type="checkbox" class="check" ${f.id === sel.id ? 'checked' : ''} aria-label="Select ${esc(f.name)}"></td>
          <td class="strong" style="font-weight:500">${esc(f.name)}</td><td>${statusBadge(f.status)}</td><td>${owner(f.owner)}</td><td>${esc(f.source)}</td>
          <td class="num">${f.submissions}</td><td class="muted">${esc(f.updated)}</td>
          <td class="c"><div class="rel" style="display:inline-block"><button class="icon-btn" data-action="menu" data-id="${f.id}" aria-label="Actions for ${esc(f.name)}">${icon('more', 18)}</button>
            <div class="popover ${ui.menu === f.id ? 'open' : ''}" style="min-width:180px;text-align:left">
              <button class="menu-item" data-action="edit" data-id="${f.id}">${icon('edit', 15)} Edit</button>
              <button class="menu-item" data-action="preview" data-id="${f.id}">${icon('eye', 15)} Preview</button>
              <button class="menu-item" data-action="dup" data-id="${f.id}">${icon('copy', 15)} Duplicate</button>
              <button class="menu-item" data-action="toggle" data-id="${f.id}">${icon(f.status === 'Published' ? 'pause' : 'play', 15)} ${f.status === 'Published' ? 'Pause' : 'Publish'}</button>
            </div></div></td></tr>`).join('') || '<tr><td colspan="8"><div class="empty">No forms match these filters.</div></td></tr>'}</tbody>
      </table>
    </div>
    <div class="card mt16" style="padding:20px">
      <div class="split" style="grid-template-columns:minmax(0,1fr) 420px">
        <div>
          <div class="title-row"><h2 style="font-size:22px">${esc(sel.name)}</h2>${statusBadge(sel.status)}</div>
          <div class="row mt12"><input class="input" readonly value="${esc(url)}" style="max-width:480px" aria-label="Form link"><button class="btn" data-action="copy" aria-label="Copy link">${icon('copy', 17)}</button></div>
          <div class="row wrap mt12">
            <button class="btn outline" data-action="preview" data-id="${sel.id}">${icon('eye', 17)} Preview</button>
            <button class="btn outline" data-action="openlink">${icon('external', 17)} Open link</button>
            <a class="btn outline" href="#/demo/leads/forms/${sel.id}/edit">${icon('edit', 17)} Edit</a>
            <button class="btn outline" data-action="dup" data-id="${sel.id}">${icon('copy', 17)} Duplicate</button>
          </div>
          <div class="divider"></div>
          <div class="grid g3">
            <div class="row"><span class="ico-circle">${icon('file', 20)}</span><div><div class="muted small">Submissions</div><div class="strong" style="font-size:18px">${sel.submissions}</div></div></div>
            <div class="row"><span class="ico-circle">${icon('users', 20)}</span><div><div class="muted small">Assigned owner</div><div class="strong" style="font-size:16px">${esc(sel.owner)}</div></div></div>
            <div class="row"><span class="ico-circle">${icon('database', 20)}</span><div><div class="muted small">Source</div><div class="strong" style="font-size:16px">${esc(sel.source)}</div></div></div>
          </div>
        </div>
        <div class="card" style="padding:18px;background:var(--ink-50)">
          <div class="strong">${esc(sel.title)}</div><div class="muted small mb12">Tell us a bit about your needs and we'll be in touch.</div>
          <div class="stack sm">${formPreview(sel, { compact: true })}</div>
          <button class="btn primary block mt12" data-action="preview" data-id="${sel.id}">${sel.slug === 'product-demo' ? 'Request demo' : 'Submit'}</button>
        </div>
      </div>
    </div>
    <div class="row between wrap mt12"><span class="muted">${total} submissions · 120 new leads · 16 updates</span><span class="muted small">Form submissions may include repeat inquiries.</span></div>`;
  },
  mount(root, ctx) {
    const byId = (id) => store.s.forms.find((f) => f.id === id);
    const set = (k) => (el) => { ui[k] = el.value; ctx.rerender(); };
    on(root, {
      click: {
        sel: (el, e) => { if (e.target.closest('.rel')) return; ui.sel = el.dataset.id; ui.menu = null; ctx.rerender(); },
        menu: (el, e) => { e.stopPropagation(); ui.menu = ui.menu === el.dataset.id ? null : el.dataset.id; ctx.rerender(); },
        preview: (el) => { const wasOpen = ui.menu; ui.menu = null; if (wasOpen) ctx.rerender(); previewModal(byId(el.dataset.id)); },
        edit: (el) => { ui.menu = null; ctx.navigate(`/demo/leads/forms/${el.dataset.id}/edit`); },
        copy: () => { navigator.clipboard?.writeText(`https://forms.leadviron.example/${byId(ui.sel).slug}`).catch(() => {}); toast('Link copied', 'Demo link — it does not host a live form.'); },
        openlink: () => previewModal(byId(ui.sel)),
        dup: (el) => {
          const f = byId(el.dataset.id);
          const id = `frm-${Date.now().toString(36)}`;
          store.update((s) => s.forms.push({ ...JSON.parse(JSON.stringify(f)), id, name: `${f.name} (copy)`, status: 'Draft', submissions: 0, updated: 'Oct 29, 2026', slug: `${f.slug}-copy`, draft: 'v0.1', published: null }));
          ui.sel = id; ui.menu = null; toast(`Duplicated “${f.name}”`, 'Saved as a draft in this demo session.'); ctx.rerender();
        },
        toggle: (el) => {
          const f = byId(el.dataset.id); const next = f.status === 'Published' ? 'Paused' : 'Published';
          store.update(() => { byId(f.id).status = next; }); ui.menu = null;
          toast(`${f.name} ${next === 'Published' ? 'published' : 'paused'}`, 'Simulated — no public form was changed.'); ctx.rerender();
        },
        create: () => modal({ title: 'Create form', body: `<div class="stack"><div class="field"><label>Form name</label><input class="input" name="name" placeholder="e.g. Webinar Registration"></div><div class="field"><label>Owner</label>${select(OWNERS, 'Sara Ahmed', 'name="owner"')}</div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Create and edit', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => {
            if (!value) return;
            const name = form.name.trim() || 'Untitled form';
            const id = `frm-${Date.now().toString(36)}`;
            store.update((s) => s.forms.push({ id, name, status: 'Draft', owner: form.owner, source: 'Web Forms', submissions: 0, updated: 'Oct 29, 2026', slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), draft: 'v0.1', published: null, title: name, successMessage: 'Thanks — our team will contact you shortly.', fields: [{ id: 'f1', type: 'text', label: 'Full name', required: true, mapping: 'Full name' }, { id: 'f2', type: 'email', label: 'Work email', required: true, mapping: 'Email' }] }));
            ctx.navigate(`/demo/leads/forms/${id}/edit`);
          }),
      },
      change: { status: set('status'), owner: set('owner'), source: set('source'), period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo totals are fixed sample values.'); } },
      input: { q: (el) => { ui.q = el.value; keepFocus('#form-q', ctx.rerender); } },
    });
  },
};
