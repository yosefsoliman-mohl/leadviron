// 17 · Template Library — edit LinkedIn, WhatsApp and Email templates with a live personalization preview.
import { icon, esc, statusBadge, pageHead, select, searchInput, on, toast, modal, keepFocus } from '../ui.js';
import { store, leadById, enrichLabel } from '../store.js';

const ui = { q: '', channel: '', purpose: '', language: '', sel: 'tpl-b2b', recipient: 'LD-0912', draft: null };
const CH_ICON = { Email: 'mail', WhatsApp: 'whatsapp', LinkedIn: 'linkedin' };
const RECIPIENTS = ['LD-0912', 'LD-1048', 'LD-0731', 'LD-0842'];

function draft() {
  if (!ui.draft || ui.draft.id !== ui.sel) {
    const t = store.s.templates.find((x) => x.id === ui.sel) || store.s.templates[0];
    ui.sel = t.id;
    ui.draft = { ...t };
  }
  return ui.draft;
}

// Replace variables with the recipient's values; company falls back when unknown.
function personalize(text, l, d) {
  let usedFallback = false;
  const out = String(text || '').replace(/\{\{\s*(first_name|company)\s*\}\}/g, (_, k) => {
    if (k === 'first_name') return l.name.split(' ')[0];
    if (l.company) return l.company;
    usedFallback = true;
    return d.fallback || 'your team';
  });
  return { out, usedFallback };
}

function filtered() {
  const q = ui.q.toLowerCase();
  return store.s.templates.filter((t) => (!ui.channel || t.channel === ui.channel) && (!ui.purpose || t.purpose === ui.purpose) && (!ui.language || t.language === ui.language) && (!q || t.name.toLowerCase().includes(q)));
}

export default {
  title: 'Template Library',
  render() {
    const s = store.s;
    const d = draft();
    const l = leadById(ui.recipient);
    const subj = personalize(d.subject, l, d);
    const body = personalize(d.body, l, d);
    const list = filtered();
    const purposes = [...new Set(s.templates.map((t) => t.purpose))];
    const dirty = JSON.stringify(d) !== JSON.stringify(s.templates.find((t) => t.id === d.id));
    return `
    ${pageHead({ title: 'Template Library', sub: 'Create and manage message templates for your outreach campaigns', actions: `<button class="btn primary" data-action="create">${icon('plus', 18)} Create template</button>` })}
    <div class="filters">
      <div style="flex:0 1 380px">${searchInput('Search templates...', ui.q, 'data-input="q" id="tpl-q"')}</div>
      ${select([['', 'Channel'], 'Email', 'WhatsApp', 'LinkedIn'], ui.channel, 'data-change="channel" aria-label="Channel"')}
      ${select([['', 'Purpose'], ...purposes], ui.purpose, 'data-change="purpose" aria-label="Purpose"')}
      ${select([['', 'Language'], 'English', 'Arabic'], ui.language, 'data-change="language" aria-label="Language"')}
    </div>
    <div class="split3" style="grid-template-columns:300px minmax(0,1fr) minmax(0,1fr)">
      <div class="card" style="overflow:hidden">
        <div class="card-head"><h2>${list.length} templates</h2></div>
        <div class="select-list">${list.map((t) => `<button class="si ${t.id === ui.sel ? 'active' : ''}" data-action="pick" data-id="${t.id}">
          <span class="ico-circle" style="background:var(--ink-100);color:${t.channel === 'LinkedIn' ? '#0a66c2' : 'var(--ink-700)'}">${icon(CH_ICON[t.channel], 20)}</span>
          <span class="grow"><span class="strong" style="font-weight:500;display:block">${esc(t.name)}</span><span class="muted small">${t.channel} • ${t.language}</span></span>${statusBadge(t.status)}</button>`).join('') || '<div class="empty">No templates match.</div>'}</div>
        <div class="muted small" style="padding:12px 16px;border-top:1px solid var(--ink-100)">Showing 1–${list.length} of ${s.templates.length} templates</div>
      </div>
      <div class="card card-pad stack" style="gap:12px">
        <h2>Edit template</h2>
        <div class="field"><label>Template name</label><input class="input" value="${esc(d.name)}" data-input="f" data-k="name"></div>
        <div class="form-grid" style="gap:12px"><div class="field"><label>Channel</label>${select(['Email', 'WhatsApp', 'LinkedIn'], d.channel, 'data-change="f" data-k="channel"')}</div><div class="field"><label>Language</label>${select(['English', 'Arabic'], d.language, 'data-change="f" data-k="language"')}</div></div>
        ${d.channel === 'Email' ? `<div class="field"><label>Subject</label><input class="input" value="${esc(d.subject)}" data-input="f" data-k="subject" id="tpl-subject"></div>` : ''}
        <div class="field"><label>Body</label><textarea class="textarea" rows="8" data-input="f" data-k="body" id="tpl-body">${esc(d.body)}</textarea></div>
        <div class="row wrap"><span class="small muted">Insert personalization</span><button class="chip" data-action="insert" data-v="{{first_name}}" style="color:var(--blue-600)">{{first_name}}</button><button class="chip" data-action="insert" data-v="{{company}}" style="color:var(--blue-600)">{{company}}</button></div>
        <div class="field"><label>Company fallback <span title="Used when the company is unknown">${icon('info', 13, 'muted')}</span></label><input class="input" value="${esc(d.fallback)}" data-input="f" data-k="fallback"></div>
        ${d.channel === 'WhatsApp' ? `<div class="callout">${icon('info', 16)}<span>WhatsApp templates need approval before use outside the customer service window.</span></div>` : ''}
        ${d.channel === 'LinkedIn' ? `<div class="callout">${icon('info', 16)}<span>LinkedIn templates are used for assisted tasks. The owner sends them manually.</span></div>` : ''}
      </div>
      <div class="card card-pad stack" style="gap:12px">
        <h2>Preview</h2>
        <div class="field"><label>Recipient</label>${select(RECIPIENTS.map((id) => [id, leadById(id).name]), ui.recipient, 'data-change="recipient"')}</div>
        <div><span class="badge">${enrichLabel(l)} · ${l.found}/6</span></div>
        ${d.channel === 'Email' ? `<div class="field"><label>Email</label><input class="input" readonly value="${esc(l.email)}"><span class="muted small">Provided by lead</span></div>` : `<div class="field"><label>${d.channel === 'WhatsApp' ? 'Phone' : 'LinkedIn'}</label><input class="input" readonly value="${esc(d.channel === 'WhatsApp' ? l.phone : l.linkedin ? 'Profile available' : 'Profile missing')}"></div>`}
        ${d.channel === 'Email' ? `<div class="field"><div class="row between"><label>Subject</label>${subj.usedFallback ? '<span class="badge">Company fallback used</span>' : ''}</div><div class="input" style="display:flex;align-items:center;background:var(--ink-50)">${esc(subj.out)}</div></div>` : ''}
        <div class="field"><div class="row between"><label>Body</label>${body.usedFallback && !subj.usedFallback ? '<span class="badge">Company fallback used</span>' : ''}</div><div class="cs-msg" style="min-height:160px">${esc(body.out).replace(/\n/g, '<br>')}</div></div>
        <div class="row" style="justify-content:flex-end"><button class="btn" data-action="duplicate">${icon('copy', 16)} Duplicate</button><button class="btn primary" data-action="save">${icon('save', 16)} Save template${dirty ? ' •' : ''}</button></div>
        <p class="muted tiny">Preview only — templates are never sent from this page.</p>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const re = (sel) => keepFocus(document, sel || '#tpl-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; re(); };
    on(root, {
      click: {
        pick: (el) => { ui.sel = el.dataset.id; ui.draft = null; re(); },
        insert: (el) => {
          const ta = document.querySelector('#tpl-body');
          const pos = ta.selectionStart ?? ta.value.length;
          ui.draft.body = ta.value.slice(0, pos) + el.dataset.v + ta.value.slice(ta.selectionEnd ?? pos);
          ctx.rerender();
        },
        save: () => { store.update((s) => { const i = s.templates.findIndex((t) => t.id === ui.draft.id); s.templates[i] = { ...ui.draft }; }); toast(`Template “${ui.draft.name}” saved`, 'Saved in this demo session only.'); ctx.rerender(); },
        duplicate: () => {
          const id = `tpl-${Date.now().toString(36)}`;
          store.update((s) => s.templates.push({ ...ui.draft, id, name: `${ui.draft.name} (copy)`, status: 'Draft' }));
          ui.sel = id; ui.draft = null; toast('Template duplicated', 'Saved as a draft in this demo session.'); ctx.rerender();
        },
        create: () => modal({ title: 'Create template', body: `<div class="stack"><div class="field"><label>Template name</label><input class="input" name="name" placeholder="e.g. Pricing follow-up"></div><div class="form-grid"><div class="field"><label>Channel</label>${select(['Email', 'WhatsApp', 'LinkedIn'], 'Email', 'name="channel"')}</div><div class="field"><label>Purpose</label>${select(['Introduction', 'Follow-up', 'Demo invite', 'Data request'], 'Follow-up', 'name="purpose"')}</div></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Create', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => {
            if (!value) return;
            const id = `tpl-${Date.now().toString(36)}`;
            store.update((s) => s.templates.push({ id, name: form.name.trim() || 'Untitled template', channel: form.channel, language: 'English', purpose: form.purpose, status: 'Draft', subject: form.channel === 'Email' ? 'Hello {{first_name}}' : '', body: 'Hi {{first_name}},\n\n', fallback: 'your team' }));
            ui.sel = id; ui.draft = null; toast('Template created', 'Draft saved in this demo session.'); ctx.rerender();
          }),
      },
      change: {
        channel: set('channel'), purpose: set('purpose'), language: set('language'),
        recipient: (el) => { ui.recipient = el.value; ctx.rerender(); },
        f: (el) => { ui.draft[el.dataset.k] = el.value; ctx.rerender(); },
      },
      input: {
        q: (el) => { ui.q = el.value; re(); },
        f: (el) => { ui.draft[el.dataset.k] = el.value; re(el.id ? `#${el.id}` : `[data-k="${el.dataset.k}"]`); },
      },
    });
  },
};
