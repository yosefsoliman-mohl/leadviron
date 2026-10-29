// 35 · Integrations (Settings → Integrations) — lead sources, data providers and channels.
import { icon, esc, statusBadge, pageHead, select, searchInput, on, toast, modal, keepFocus } from '../ui.js';
import { store } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

const ui = { q: '', cat: '', status: '' };
const CATS = ['Lead sources & ads', 'Data providers', 'Communication'];
const LOGO_COLOR = { meta: '#0866ff', google: '#1a73e8', linkedin: '#0a66c2' };
const NOW = 'Oct 29, 2026, 11:02 AM';

// Integration requirements from the project brief (Settings → Integrations section).
const REQUIREMENTS = [
  ['Data brokers and enrichment', 'Enrich an existing lead and show value source, confidence and no-match outcomes.', 'Examples to evaluate: People Data Labs or Apollo. Hidden key, supported fields and usage limit; completeness is not guaranteed.'],
  ['LinkedIn', 'Manage assisted follow-up tasks and link approved app capabilities.', 'OAuth and available permissions. Automated messaging is not assumed; many access programs require approval.'],
  ['WhatsApp Cloud API', 'Sending, replies and message status inside Unified Inbox.', 'Business account, number, token, webhook, approved templates and contact eligibility. Free-form messages depend on the customer service window.'],
  ['Email SMTP and inbound', 'Send email, then receive replies and link them to the lead and campaign.', 'Host, port, TLS, credentials, From and Reply-To. SMTP for sending; add inbound via IMAP or provider API.'],
  ['Meta Lead Ads', 'Receive Facebook and Instagram form submissions.', 'Page, forms, permissions and leadgen webhook, then lead retrieval and field mapping.'],
  ['Google Lead Forms', 'Receive Google form submissions via webhook.', 'Webhook URL, google_key and field mapping; deduplicate events using lead_id.'],
  ['Web Forms and CSV', 'Form and file intake with review of failed rows.', 'Internal features in Leads; no data broker needed. Field setup, validation, duplicates and ingestion log.'],
  ['Custom API and Webhooks', 'Exchange events or connect a CRM and extra sources when approved.', 'Extended as needed: authentication, events, retries and logs. Calendar sync and ad costs follow the approved scope.'],
];

const needsAttention = (i) => i.status === 'Needs authorization';
const isOff = (i) => i.status === 'Not connected' || i.status === 'Disabled';

function card(i) {
  const action = isOff(i)
    ? `<button class="btn" data-action="connect" data-id="${i.id}">Connect</button>`
    : needsAttention(i) ? `<button class="btn" data-action="reconnect" data-id="${i.id}">Reconnect</button>`
      : `<a class="btn" href="#/demo/settings/integrations/${i.id}">Manage</a>`;
  return `<div class="card int-card ${needsAttention(i) ? 'attention' : ''}">
    <div class="head">
      <a class="logo" href="#/demo/settings/integrations/${i.id}" style="${LOGO_COLOR[i.icon] ? `color:${LOGO_COLOR[i.icon]}` : ''}" aria-label="${esc(i.name)} details">${icon(i.icon, 30)}</a>
      <div class="grow"><a href="#/demo/settings/integrations/${i.id}" class="strong" style="font-size:16px;color:var(--ink-900)">${esc(i.name)}</a>
        <div class="muted">${esc(i.account)}</div>
        <div class="mt8">${statusBadge(i.status, { tone: isOff(i) || needsAttention(i) ? 'gray' : '' })}</div></div>
      ${i.assisted ? '<span class="badge gray">Assisted tasks only</span>' : i.primary ? '<span class="badge">Primary</span>' : ''}
    </div>
    <div class="foot"><span class="muted small row" style="gap:6px">${icon('clock', 15)} ${esc(i.syncLabel || 'Last sync')} ${esc(i.sync)}</span><span class="grow"></span>${action}</div>
  </div>`;
}

export default {
  title: 'Integrations',
  render() {
    const all = store.s.integrations;
    const q = ui.q.trim().toLowerCase();
    const list = all.filter((i) => (!ui.cat || i.cat === ui.cat) && (!ui.status || (ui.status === 'Attention' ? needsAttention(i) : ui.status === 'Not connected' ? isOff(i) : !isOff(i) && !needsAttention(i))) &&
      (!q || `${i.name} ${i.account}`.toLowerCase().includes(q)));
    const attention = all.filter(needsAttention);
    return `
    ${pageHead({
      crumbs: [['Settings', '#/demo/settings/general'], ['Integrations']],
      title: 'Integrations', sub: 'Manage lead sources, data providers and communication channels.',
      actions: `${attention.length ? `<button class="callout" data-action="attention" style="border:0;cursor:pointer;align-items:center">${icon('info', 18)}<span class="blue" style="color:var(--blue-700)">${attention.length} connection${attention.length > 1 ? 's' : ''} need${attention.length > 1 ? '' : 's'} your attention.</span></button>` : ''}
        <button class="btn" data-action="reqs">${icon('file', 16)} Integration requirements</button>`,
    })}
    ${settingsTabs('integrations')}
    <div class="filters">
      ${searchInput('Search connections...', ui.q, 'data-input="q" id="int-q"')}
      ${select([['', 'All categories'], ...CATS], ui.cat, 'data-change="cat" aria-label="Category"')}
      ${select([['', 'All statuses'], ['Connected', 'Connected / active'], ['Attention', 'Needs attention'], ['Not connected', 'Not connected']], ui.status, 'data-change="status" aria-label="Status"')}
    </div>
    ${CATS.map((c) => { const items = list.filter((i) => i.cat === c); return items.length ? `<h2 class="section-title">${c}</h2><div class="grid g3">${items.map(card).join('')}</div>` : ''; }).join('') || '<div class="card empty">No connections match.</div>'}
    <div class="callout mt20">${icon('shield', 18)}<span>Demo connections only — no real keys and no external requests. In the operational release, credentials are stored server-side and access follows each provider's approved permissions. Enrichment starts with one primary provider; a fallback provider can be added.</span></div>`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#int-q', ctx.rerender);
    const byId = (id) => store.s.integrations.find((i) => i.id === id);
    on(root, {
      click: {
        attention: () => { ui.status = 'Attention'; re(); },
        reqs: () => modal({
          title: 'Integration requirements', wide: true,
          body: `<p class="muted mb12">Approved location: Settings → Integrations. Each connection shows Account & Capabilities, Field Mapping and Sync & Events, with Connect, Manage, Test Connection, Reauthorize and Disable.</p>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Integration</th><th>Purpose</th><th>Setup requirements & limits</th></tr></thead><tbody>
            ${REQUIREMENTS.map(([a, b, c]) => `<tr><td class="strong" style="font-weight:600;vertical-align:top">${a}</td><td style="vertical-align:top">${b}</td><td class="muted" style="vertical-align:top">${c}</td></tr>`).join('')}</tbody></table></div>`,
          buttons: [{ label: 'Close', cls: 'primary', value: null }],
        }),
        connect: (el) => {
          const i = byId(el.dataset.id);
          modal({
            title: `Connect ${i.name}`,
            body: `<div class="stack"><p class="muted">${esc(i.purpose)}</p>
              <div class="field"><label>Account name</label><input class="input" name="account" value="Upshifters ${esc(i.name.split(' ')[0])}"></div>
              <div class="field"><label>API key</label><input class="input" value="demo-key-••••••••••••" readonly><span class="muted small">Demo placeholder. Real credentials are never entered here.</span></div>
              <div class="callout">${icon('lock', 18)}<span><b>Setup in production:</b> ${esc(i.setup)} Credentials are stored on the server.</span></div></div>`,
            buttons: [{ label: 'Cancel', value: null }, { label: 'Simulate connect', cls: 'primary', value: 1 }],
          }).then(({ value, form }) => {
            if (!value) return;
            store.update((s) => { const x = s.integrations.find((y) => y.id === i.id); x.status = 'Connected'; x.account = form.account || x.account; x.sync = NOW; x.syncLabel = null; });
            toast(`${i.name} connected`, 'Simulated — no keys were stored and no provider was contacted.'); re();
          });
        },
        reconnect: (el) => {
          const i = byId(el.dataset.id);
          modal({
            title: `Reconnect ${i.name}`,
            body: `<div class="stack"><div class="callout warn">${icon('alert', 18)}<span>The sending account authorization expired. Last attempt ${esc(i.sync)}. RUN-1050 is paused until this is fixed.</span></div><p class="muted">Reauthorizing in the demo marks the connection as Connected. No provider is contacted.</p></div>`,
            buttons: [{ label: 'View details', value: 'details' }, { label: 'Reauthorize', cls: 'primary', value: 'ok' }],
          }).then(({ value }) => {
            if (value === 'details') ctx.navigate(`/demo/settings/integrations/${i.id}`);
            if (value !== 'ok') return;
            store.update((s) => { const x = s.integrations.find((y) => y.id === i.id); x.status = 'Connected'; x.sync = NOW; x.syncLabel = null; s.notifications.forEach((n) => { if (n.href.includes(i.id)) n.unread = false; }); });
            toast(`${i.name} reauthorized`, 'Simulated reauthorization — no credentials were sent.'); re();
          });
        },
      },
      change: { cat: (el) => { ui.cat = el.value; re(); }, status: (el) => { ui.status = el.value; re(); } },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
