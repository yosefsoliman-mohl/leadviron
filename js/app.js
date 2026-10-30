// App shell + hash router.
// Each page module exports default { title, render(ctx) => html, mount?(root, ctx) }.
import { store } from './store.js';
import { icon, esc, toast, confirm, avatar } from './ui.js';
import { enhanceTables } from './table-sort.js';

const ROUTES = [
  ['/', 'landing', { bare: true }],
  ['/login', 'login', { bare: true }],
  ['/demo/dashboard', 'dashboard'],
  // Lead Generation
  ['/demo/campaigns', 'campaigns'],
  ['/demo/campaigns/new', 'campaign-setup'],
  ['/demo/campaigns/templates', 'templates'],
  ['/demo/campaigns/:campaignId', 'campaign'],
  ['/demo/generation/upload', 'upload-list'],
  ['/demo/prospecting/lists', 'prospect-lists'],
  ['/demo/prospecting/lists/:listId', 'prospect-list'],
  ['/demo/generation/social', 'social-leads'],
  // Leads and intelligence
  ['/demo/leads', 'leads'],
  ['/demo/leads/:leadId', 'lead-profile'],
  ['/demo/intelligence/enrichment', 'enrichment'],
  ['/demo/intelligence/qualification', 'qualification'],
  ['/demo/intelligence/scoring', 'scoring'],
  ['/demo/workflows', 'workflows'],
  ['/demo/workflows/history', 'executions'],
  ['/demo/workflows/runs/:runId', 'run'],
  ['/demo/workflows/:workflowId/builder', 'workflow-builder'],
  ['/demo/conversations', 'inbox'],
  ['/demo/sales/pipeline', 'pipeline'],
  ['/demo/sales/tasks', 'tasks'],
  ['/demo/analytics/acquisition', 'an-acquisition'],
  ['/demo/analytics/outreach', 'an-outreach'],
  ['/demo/analytics/sales-team', 'an-sales-team'],
  ['/demo/analytics/data-quality', 'an-data-quality'],
  // Settings (incl. Lead Settings and Integrations)
  ['/demo/settings/general', 'set-general'],
  ['/demo/settings/team', 'set-team'],
  ['/demo/settings/fields-stages', 'set-fields'],
  ['/demo/settings/contact-policies', 'set-policies'],
  ['/demo/settings/audit', 'set-audit'],
  ['/demo/settings/web-forms', 'forms'],
  ['/demo/settings/web-forms/:formId/edit', 'form-editor'],
  ['/demo/settings/duplicates', 'duplicates'],
  ['/demo/settings/ingestion', 'ingestion'],
  ['/demo/settings/workspace-setup', 'set-workspace', { bare: true }],
  ['/demo/settings/integrations', 'integrations'],
  ['/demo/settings/integrations/:connectionId', 'connection'],
].map(([path, page, opts = {}]) => {
  const keys = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  return { path, page, re, keys, ...opts };
});

// Older paths from the first demo release keep working.
const MOVED = [
  ['/demo/inbox', '/demo/conversations'],
  ['/demo/leads/forms', '/demo/settings/web-forms'],
  ['/demo/leads/duplicates', '/demo/settings/duplicates'],
  ['/demo/leads/ingestion', '/demo/settings/ingestion'],
];

const under = (...prefixes) => (p) => prefixes.some((x) => p === x || p.startsWith(`${x}/`));

// Sidebar order follows the lead journey; supporting tools live under Settings.
const NAV = [
  { label: 'Dashboard', icon: 'home', href: '#/demo/dashboard', match: under('/demo/dashboard') },
  { label: 'Lead Generation', icon: 'zap', match: under('/demo/campaigns', '/demo/generation', '/demo/prospecting'), children: [
    ['Outreach', '#/demo/campaigns', under('/demo/campaigns')],
    ['Upload List', '#/demo/generation/upload', under('/demo/generation/upload', '/demo/prospecting')],
    ['From Social Media', '#/demo/generation/social'],
  ] },
  { label: 'All Leads', icon: 'users', href: '#/demo/leads', match: under('/demo/leads') },
  { label: 'Lead Enrichment', icon: 'database', href: '#/demo/intelligence/enrichment', match: under('/demo/intelligence/enrichment') },
  { label: 'Lead Qualifying', icon: 'target', href: '#/demo/intelligence/qualification', match: under('/demo/intelligence/qualification') },
  { label: 'Lead Scoring', icon: 'star', href: '#/demo/intelligence/scoring', match: under('/demo/intelligence/scoring') },
  { label: 'Workflows', icon: 'flow', match: under('/demo/workflows'), children: [
    ['All Workflows', '#/demo/workflows', (p) => p === '/demo/workflows' || p.endsWith('/builder')],
    ['Execution History', '#/demo/workflows/history', under('/demo/workflows/history', '/demo/workflows/runs')],
  ] },
  { label: 'Conversations', icon: 'message', href: '#/demo/conversations', match: under('/demo/conversations') },
  { label: 'Sales Workspace', icon: 'grid', match: under('/demo/sales'), children: [
    ['Sales Pipeline', '#/demo/sales/pipeline'],
    ['Tasks & Calendar', '#/demo/sales/tasks'],
  ] },
  { label: 'Analytics', icon: 'bars', match: under('/demo/analytics'), children: [
    ['Funnel & Acquisition', '#/demo/analytics/acquisition'],
    ['Outreach Performance', '#/demo/analytics/outreach'],
    ['Sales & Team', '#/demo/analytics/sales-team'],
    ['Data Quality', '#/demo/analytics/data-quality'],
  ] },
];
// A child without an href is a section label.
const SETTINGS_NAV = { label: 'Settings', icon: 'settings', match: under('/demo/settings'), children: [
  ['Organization'],
  ['General', '#/demo/settings/general'],
  ['Team & Permissions', '#/demo/settings/team'],
  ['Fields & Stages', '#/demo/settings/fields-stages'],
  ['Contact Policies', '#/demo/settings/contact-policies'],
  ['Audit Log', '#/demo/settings/audit'],
  ['Lead Settings'],
  ['Web Forms', '#/demo/settings/web-forms', under('/demo/settings/web-forms')],
  ['Duplicate Review', '#/demo/settings/duplicates'],
  ['Ingestion Monitor', '#/demo/settings/ingestion'],
  ['Connections'],
  ['Integrations', '#/demo/settings/integrations', under('/demo/settings/integrations')],
  ['Workspace Setup', '#/demo/settings/workspace-setup'],
] };

const app = document.getElementById('app');
const openGroups = new Set();
let current = null; // { route, params, query, mod }

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function navigate(href) { location.hash = href.replace(/^#/, ''); }

function navGroup(g, path) {
  const active = g.match(path);
  if (!g.children) {
    return `<a class="nav-item ${active ? 'active' : ''}" href="${g.href}">${icon(g.icon, 20)}<span>${g.label}</span></a>`;
  }
  const open = active || openGroups.has(g.label);
  const subs = g.children.map(([label, href, test]) => {
    if (!href) return `<div class="nav-label">${label}</div>`;
    const p = href.slice(1);
    const on = test ? test(path) : path === p;
    return `<a class="${on ? 'active' : ''}" href="${href}">${label}</a>`;
  }).join('');
  return `<div class="nav-group ${open ? 'open' : ''}">
    <button class="nav-item ${active ? 'active' : ''}" data-group="${g.label}" aria-expanded="${open}">${icon(g.icon, 20)}<span>${g.label}</span>${icon('chevRight', 16, 'chev')}</button>
    <div class="nav-sub">${subs}</div>
  </div>`;
}

// Settings sits last in the scrolling list so its long submenu never squeezes the main sections.
const navHtml = (path) => `${NAV.map((g) => navGroup(g, path)).join('')}<div class="nav-settings">${navGroup(SETTINGS_NAV, path)}</div>`;

function shell(path) {
  const s = store.s;
  const unread = s.notifications.filter((n) => n.unread).length;
  return `<div class="app" id="shell">
    <aside class="sidebar" aria-label="Main navigation">
      <div class="sidebar-logo"><a href="#/demo/dashboard" aria-label="Leadviron home"><img src="assets/logo.png" alt="Leadviron"></a></div>
      <nav class="nav">${navHtml(path)}</nav>
      <div class="sidebar-foot"><div class="powered">Powered by <b>Upshifters</b></div></div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-toggle" data-shell="menu" aria-label="Open navigation">${icon('menu', 20)}</button>
        <div class="rel">
          <button class="org-switch" data-shell="org">${esc(s.org.name)} ${icon('chevDown', 16)}</button>
          <div class="popover left" id="pop-org">
            <div class="menu-label">Workspace</div>
            <button class="menu-item" data-shell="close">${icon('check', 16)} ${esc(s.org.name)}</button>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#/demo/settings/workspace-setup">${icon('plus', 16)} Set up a workspace</a>
          </div>
        </div>
        <span class="demo-badge" title="All data in this demo is fictional sample data">Demo data</span>
        <div class="topbar-spacer"></div>
        <div class="global-search rel">
          ${icon('search', 17)}
          <input type="search" id="global-q" placeholder="Search leads, companies, campaigns..." autocomplete="off" aria-label="Search">
          <div class="popover" id="pop-search" style="left:0;right:0"></div>
        </div>
        <div class="rel">
          <button class="icon-btn" data-shell="bell" aria-label="Notifications">${icon('bell', 20)}${unread ? '<span class="dot"></span>' : ''}</button>
          <div class="popover" id="pop-bell" style="width:340px">
            <div class="row between" style="padding:6px 10px"><b>Notifications</b><button class="link-btn small" data-shell="readall">Mark all read</button></div>
            ${s.notifications.map((n) => `<a class="menu-item" href="${n.href}" style="align-items:flex-start">
              <span class="ico-circle sm ${n.unread ? '' : 'gray'}">${icon(n.unread ? 'bell' : 'check', 15)}</span>
              <span><span class="strong" style="font-weight:${n.unread ? 600 : 500}">${esc(n.text)}</span><br><span class="muted small">${esc(n.sub)}</span></span></a>`).join('')}
          </div>
        </div>
        <div class="rel">
          <button class="icon-btn" data-shell="me" aria-label="Account menu">${avatar(s.me.initials, '')}</button>
          <div class="popover" id="pop-me">
            <div style="padding:8px 10px"><div class="strong">${esc(s.me.name)}</div><div class="muted small">${esc(s.me.role)} · Demo session</div></div>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#/demo/settings/general">${icon('settings', 16)} Settings</a>
            <a class="menu-item" href="#/demo/settings/integrations">${icon('layers', 16)} Integrations</a>
            <button class="menu-item" data-shell="reset">${icon('rotate', 16)} Reset Demo</button>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#/login">${icon('logout', 16)} Exit demo</a>
          </div>
        </div>
      </header>
      <main class="content" id="page" tabindex="-1"></main>
    </div>
  </div>`;
}

function closePops(except) {
  document.querySelectorAll('.topbar .popover.open').forEach((p) => { if (p !== except) p.classList.remove('open'); });
}

function wireShell() {
  const root = document.getElementById('shell');
  root.addEventListener('click', (e) => {
    const g = e.target.closest('[data-group]');
    if (g) {
      const label = g.dataset.group;
      const wrap = g.parentElement;
      const willOpen = !wrap.classList.contains('open');
      wrap.classList.toggle('open', willOpen);
      g.setAttribute('aria-expanded', willOpen);
      willOpen ? openGroups.add(label) : openGroups.delete(label);
      return;
    }
    const b = e.target.closest('[data-shell]');
    if (!b) return;
    const k = b.dataset.shell;
    const pops = { org: 'pop-org', bell: 'pop-bell', me: 'pop-me' };
    if (pops[k]) { const p = document.getElementById(pops[k]); closePops(p); p.classList.toggle('open'); e.stopPropagation(); return; }
    if (k === 'menu') { root.classList.toggle('nav-open'); return; }
    if (k === 'close') { closePops(); return; }
    if (k === 'readall') { store.update((s) => s.notifications.forEach((n) => { n.unread = false; })); renderShell(); return; }
    if (k === 'reset') {
      closePops();
      confirm('Reset demo?', 'All changes you made in this session will be cleared and the original demo scenario restored.', 'Reset Demo').then((ok) => {
        if (!ok) return;
        store.reset(); renderShell(); toast('Demo data reset', 'The original scenario has been restored.');
      });
    }
  });
  // Close mobile nav after following a link
  root.querySelector('.sidebar').addEventListener('click', (e) => { if (e.target.closest('a')) root.classList.remove('nav-open'); });
  root.addEventListener('click', (e) => { if (root.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) root.classList.remove('nav-open'); });

  const q = document.getElementById('global-q');
  const pop = document.getElementById('pop-search');
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    if (!v) { pop.classList.remove('open'); return; }
    const s = store.s;
    const leads = s.leads.filter((l) => l.name.toLowerCase().includes(v) || (l.company || '').toLowerCase().includes(v) || l.email.includes(v)).slice(0, 6);
    const camps = s.campaigns.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 3);
    const lists = s.lists.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 2);
    const rows = [
      ...leads.map((l) => `<a class="menu-item" href="#/demo/leads/${l.id}">${avatar(l.initials, 'sm')}<span><b>${esc(l.name)}</b> <span class="muted small">${esc(l.company || 'Company unknown')}</span></span></a>`),
      ...camps.map((c) => `<a class="menu-item" href="#/demo/campaigns/${c.id}">${icon('send', 16)}<span>${esc(c.name)} <span class="muted small">Campaign</span></span></a>`),
      ...lists.map((c) => `<a class="menu-item" href="#/demo/prospecting/lists/${c.id}">${icon('users', 16)}<span>${esc(c.name)} <span class="muted small">Prospect list</span></span></a>`),
    ];
    pop.innerHTML = rows.length ? rows.join('') : '<div class="muted small" style="padding:10px">No matches in demo data</div>';
    pop.classList.add('open');
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Escape') { q.value = ''; pop.classList.remove('open'); } if (e.key === 'Enter') { const a = pop.querySelector('a'); if (a) { location.hash = a.getAttribute('href'); q.value = ''; pop.classList.remove('open'); } } });
  pop.addEventListener('click', () => { q.value = ''; pop.classList.remove('open'); });
}

document.addEventListener('click', (e) => { if (!e.target.closest('.popover') && !e.target.closest('[data-shell]') && !e.target.closest('.global-search')) closePops(); });

function renderShell() {
  const { path } = parseHash();
  app.innerHTML = shell(path);
  wireShell();
  if (current && !current.route.bare) mountPage();
}

function mountPage() {
  const el = document.getElementById(current.route.bare ? 'bare' : 'page');
  const ctx = { params: current.params, query: current.query, store, navigate, rerender: () => mountPage() };
  const scrollY = window.scrollY;
  el.innerHTML = current.mod.render(ctx);
  // Re-renders keep the scroll position; fresh navigations start at the top.
  if (current.fresh) { window.scrollTo(0, 0); current.fresh = false; } else window.scrollTo(0, scrollY);
  // Replace the node to drop old delegated listeners before mounting again.
  let root = el;
  if (current.mod.mount) {
    root = el.cloneNode(true);
    el.replaceWith(root);
    current.mod.mount(root, ctx);
  }
  enhanceTables(root);
}

async function route() {
  const { path, query } = parseHash();
  if (path === '' ) { navigate('/'); return; }
  if (path === '/demo') { navigate('/demo/dashboard'); return; }
  const moved = MOVED.find(([from]) => path === from || path.startsWith(`${from}/`));
  if (moved) { location.replace(`#${moved[1]}${path.slice(moved[0].length)}${location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?')) : ''}`); return; }
  const r = ROUTES.find((x) => x.re.test(path));
  if (!r) { navigate('/demo/dashboard'); return; }
  const m = path.match(r.re);
  const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
  let mod;
  try { mod = (await import(`./pages/${r.page}.js`)).default; }
  catch (err) { console.error(err); mod = { title: 'Coming soon', render: () => `<div class="card card-pad">${icon('info')} This screen is not available yet.</div>` }; }
  const sameShell = current && !current.route.bare && !r.bare && document.getElementById('shell');
  current = { route: r, params, query, mod, fresh: true };
  document.title = `${mod.title || 'Demo'} · Leadviron`;
  if (r.bare) { app.innerHTML = '<div id="bare"></div>'; mountPage(); return; }
  if (!sameShell) renderShell();
  else {
    // Update the sidebar active state without rebuilding the shell
    document.querySelector('.sidebar .nav').innerHTML = navHtml(path);
    mountPage();
  }
  document.getElementById('page')?.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);
route();
