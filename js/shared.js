// Dialogs reused by several pages.
import { icon, select, toast, modal } from './ui.js';
import { store, OWNERS, SOURCES } from './store.js';

export function addLeadModal() {
  return modal({
    title: 'Add lead',
    body: `<div class="stack">
      <div class="callout">${icon('info', 18)}<span>Original contact details are kept. Enrichment will look for company, job title, city, company size, industry and LinkedIn URL.</span></div>
      <div class="form-grid">
        <div class="field"><label>Full name *</label><input class="input" name="name" placeholder="e.g. Rami Nasser"></div>
        <div class="field"><label>Email</label><input class="input" name="email" placeholder="name@company.com"></div>
        <div class="field"><label>Phone</label><input class="input" name="phone" placeholder="+966 5X XXX XXXX"></div>
        <div class="field"><label>Source</label>${select(SOURCES, 'Web Forms', 'name="source"')}</div>
        <div class="field"><label>Owner</label>${select(OWNERS, 'Sara Ahmed', 'name="owner"')}</div>
      </div></div>`,
    buttons: [{ label: 'Cancel', value: null }, { label: 'Add lead', cls: 'primary', value: 'add' }],
  }).then(({ value, form }) => {
    if (value !== 'add') return null;
    if (!form.name.trim()) { toast('Lead not added', 'Full name is required.'); return null; }
    const id = `LD-${3000 + Math.floor(Math.random() * 900)}`;
    const name = form.name.trim();
    const parts = name.split(/\s+/);
    store.update((s) => {
      s.leads.unshift({ id, name, initials: parts.map((w) => w[0]).slice(0, 2).join('').toUpperCase(), email: form.email || `${parts[0].toLowerCase()}@example.com`, phone: form.phone || '—', source: form.source, owner: form.owner, enrich: 'nomatch', found: 0, company: null, title: null, city: null, size: null, industry: null, linkedin: false, qual: 'Needs information', score: null, stage: 'New', activity: 'Created • Now', cohort: 'KSA Business Prospects', eligibility: 'Not eligible', consent: { email: 'No permission', whatsapp: 'No opt-in', linkedin: 'Profile missing' }, isNew: true });
    });
    toast(`${name} added`, 'Saved in this demo session only. Enrichment not run.');
    return id;
  });
}
