// 29 · Organization & General — workspace details, regional and general preferences.
import { esc, pageHead, select, toggle, on, toast } from '../ui.js';
import { store } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

// Unsaved edits live here until "Save changes".
const ui = { draft: null };

const OPTS = {
  industry: ['Marketing & advertising', 'Software & technology', 'Logistics', 'Retail', 'Professional services'],
  currency: ['SAR', 'AED', 'USD', 'EUR'],
  timezone: ['Asia/Riyadh (UTC+03:00)', 'Asia/Dubai (UTC+04:00)', 'Africa/Cairo (UTC+02:00)', 'Europe/London (UTC+00:00)'],
  language: ['English', 'Arabic'],
  dateFormat: ['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  weekStart: ['Sunday', 'Monday', 'Saturday'],
  landing: ['Dashboard', 'All Leads', 'Inbox', 'Sales Pipeline'],
  leadView: ['All leads', 'My leads', 'Qualified leads'],
};

const sel = (k, d) => select(OPTS[k], d[k], `data-change="f" data-k="${k}" aria-label="${k}"`);

export default {
  title: 'Organization & General',
  render() {
    const d = ui.draft || (ui.draft = { ...store.s.org });
    const dirty = Object.keys(d).some((k) => d[k] !== store.s.org[k]);
    const sample = { 'DD MMM YYYY': '29 Oct 2026', 'MM/DD/YYYY': '10/29/2026', 'YYYY-MM-DD': '2026-10-29' }[d.dateFormat];
    return `
    ${pageHead({ title: 'Organization & General', sub: 'Manage workspace details and preferences.' })}
    ${settingsTabs('general')}
    <div class="stack">
      <div class="card card-pad">
        <h2>Organization details</h2><p class="muted mb12">Basic information about your workspace.</p>
        <div class="form-grid">
          <div class="field"><label>Organization name</label><input class="input" data-input="f" data-k="name" value="${esc(d.name)}"></div>
          <div class="field"><label>Workspace slug</label><input class="input" data-input="f" data-k="slug" value="${esc(d.slug)}"></div>
          <div class="field"><label>Industry</label>${sel('industry', d)}</div>
          <div class="field"><label>Reporting currency</label>${sel('currency', d)}</div>
        </div>
      </div>
      <div class="card card-pad">
        <h2>Regional preferences</h2><p class="muted mb12">Set your time zone, language and date preferences.</p>
        <div class="form-grid">
          <div class="field"><label>Time zone</label>${sel('timezone', d)}</div>
          <div class="field"><label>Language</label>${sel('language', d)}</div>
          <div class="field"><label>Date format</label>${sel('dateFormat', d)}<span class="muted small">Preview: ${sample}</span></div>
          <div class="field"><label>Week starts on</label>${sel('weekStart', d)}</div>
        </div>
      </div>
      <div class="card card-pad">
        <h2>General preferences</h2><p class="muted mb12">Manage default views and notification settings.</p>
        <div class="form-grid">
          <div class="field"><label>Default landing page</label>${sel('landing', d)}</div>
          <div class="field"><label>Default lead view</label>${sel('leadView', d)}</div>
        </div>
        <div class="row wrap mt16">
          <span class="label">In-app notifications</span>${toggle(d.notifications, 'data-change="notif" aria-label="In-app notifications"')}
          <span class="muted small grow">Receive in-app notifications about important activity.</span>
          ${dirty ? '<button class="btn" data-action="discard">Discard</button>' : ''}
          <button class="btn primary" data-action="save" ${dirty ? '' : 'disabled'}>Save changes</button>
        </div>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const touch = () => {
      const d = ui.draft;
      const dirty = Object.keys(d).some((k) => d[k] !== store.s.org[k]);
      root.querySelector('[data-action="save"]').disabled = !dirty;
    };
    on(root, {
      click: {
        save: () => { store.update((s) => { s.org = { ...ui.draft }; }); toast('Settings saved', 'Demo only — no organization or account was updated.'); ui.draft = null; ctx.rerender(); },
        discard: () => { ui.draft = null; ctx.rerender(); },
      },
      change: {
        f: (el) => { ui.draft[el.dataset.k] = el.value; ctx.rerender(); },
        notif: (el) => { ui.draft.notifications = el.checked; ctx.rerender(); },
      },
      input: { f: (el) => { ui.draft[el.dataset.k] = el.value; touch(); } },
    });
  },
};
