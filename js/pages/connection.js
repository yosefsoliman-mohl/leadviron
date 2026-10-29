// 36 · Connection Details — account, capabilities, usage settings, field mapping, sync & events.
import { icon, esc, statusBadge, tabs, select, toggle, on, toast, modal, confirm } from '../ui.js';
import { store } from '../store.js';

const ui = { tab: 'account', id: null, draft: null, mapping: null };
const NOW = 'Oct 29, 2026, 11:02 AM';
const LEAD_FIELDS = ['Full name', 'Email', 'Phone', 'Company', 'Job title', 'City', 'Company size', 'Industry', 'LinkedIn URL', 'Notes', 'Do not map'];

// Per-category defaults for the demo (usage settings, mappings, recent events).
const USAGE = {
  'Data providers': [['manual', 'Manual enrichment'], ['auto', 'Automatic enrichment'], ['fillEmpty', 'Fill empty fields only'], ['preserve', 'Preserve submitted contact details']],
  'Lead sources & ads': [['autoCreate', 'Create leads automatically'], ['dedupe', 'Check duplicates before creating'], ['assign', 'Assign owner by round robin'], ['preserve', 'Preserve submitted contact details']],
  Communication: [['send', 'Allow sending'], ['inbound', 'Sync replies to Conversations'], ['respectPolicy', 'Enforce contact policies'], ['pauseOnReply', 'Pause automation after reply']],
};
const MAPPINGS = {
  'Data providers': [['organization.name', 'Company'], ['job_title', 'Job title'], ['location.city', 'City'], ['organization.size', 'Company size'], ['organization.industry', 'Industry'], ['linkedin_url', 'LinkedIn URL']],
  'Lead sources & ads': [['full_name', 'Full name'], ['email', 'Email'], ['phone_number', 'Phone'], ['company_name', 'Company'], ['job_title', 'Job title'], ['city', 'City']],
  Communication: [['recipient.email / wa_id', 'Email'], ['recipient.phone', 'Phone'], ['contact.name', 'Full name'], ['thread.subject', 'Notes']],
};
const EVENTS = {
  'Data providers': [['10:42 AM', 'Lookup completed', 'LD-1048 · 3 of 6 fields', 'Success'], ['10:41 AM', 'Lookup completed', 'LD-0912 · no external match', 'Success'], ['10:40 AM', 'Lookup completed', 'LD-0842 · 6 of 6 fields', 'Success'], ['10:14 AM', 'Batch started', 'ENR-1024 · 120 leads', 'Success']],
  'Lead sources & ads': [['10:55 AM', 'Lead received', 'EVT-1206 · Tariq Adel', 'Success'], ['10:51 AM', 'Lead received', 'EVT-1202 · Faisal Hamdan', 'Success'], ['10:44 AM', 'Lead received', 'EVT-1200 · missing consent value', 'Needs review'], ['09:00 AM', 'Forms synced', '3 forms', 'Success']],
  Communication: [['10:48 AM', 'Reply received', 'Omar Ali · WhatsApp', 'Success'], ['10:47 AM', 'Send attempt', 'RUN-1050 · Lina Mansour', 'Failed'], ['10:46 AM', 'Send attempt', 'RUN-1050 · Lina Mansour', 'Failed'], ['10:42 AM', 'Message sent', 'Omar Ali · WhatsApp', 'Success']],
};

const isOff = (i) => i.status === 'Not connected' || i.status === 'Disabled';

function defaults(i) {
  if (i.usage) return { ...i.usage };
  const d = { unmatched: 'Keep original record', cost: i.cat === 'Communication' ? (i.id === 'whatsapp' ? 'Per conversation (Meta pricing)' : 'No per-message cost') : 'No cost', limit: i.id === 'email' ? '500 emails / day' : i.id === 'whatsapp' ? '1,000 conversations / month' : 'Unlimited' };
  USAGE[i.cat].forEach(([k]) => { d[k] = true; });
  if (i.id === 'linkedin') d.send = false;
  return d;
}

function accountTab(i, d) {
  const caps = i.caps || [];
  return `<div class="split wide-side">
    <div class="stack">
      <div class="card card-pad"><h2 class="mb12">Account details</h2>
        <div class="kv conn-kv">
          <span class="k">Account</span><span class="v">${esc(i.account)}</span>
          <span class="k">Connection mode</span><span class="v">Demo</span>
          <span class="k">${i.cat === 'Data providers' ? 'Last successful lookup' : i.syncLabel || 'Last sync'}</span><span class="v">${esc(i.sync)}${i.sync !== '—' ? ' (Riyadh)' : ''}</span>
          <span class="k">Credential</span><span class="v">${isOff(i) ? '<span class="muted">Not configured</span>' : '••••••••••••••••'}</span>
        </div></div>
      <div class="card card-pad"><h2 class="mb12">Capabilities</h2>
        ${caps.map(([c, ok]) => `<div class="row list-item" style="padding:9px 0"><span class="grow">${esc(c)}</span><span class="row" style="width:150px;gap:8px">${ok ? `<span class="blue" style="color:var(--blue-600)">${icon('checkCircle', 20)}</span> Available` : ok === false ? `<span class="muted">${icon('minusCircle', 20)}</span> <span class="muted">Not available</span>` : `<span class="muted">${icon('circle', 20)}</span> <span class="muted">After connecting</span>`}</span></div>`).join('')}
      </div>
      <div class="card card-pad"><h2 class="mb12">${i.cat === 'Data providers' ? 'Supported fields' : 'Setup requirements'}</h2>
        ${i.cat === 'Data providers' ? `<div class="row wrap">${['Company', 'Job title', 'City', 'Company size', 'Industry', 'LinkedIn URL'].map((f) => `<span class="chip">${f}</span>`).join('')}</div>` : `<p class="muted">${esc(i.setup)}</p>`}
      </div>
    </div>
    <div class="card card-pad"><h2 class="mb12">Usage settings</h2>
      ${USAGE[i.cat].map(([k, label]) => `<div class="setting-row"><span class="grow">${label}</span>${toggle(d[k], `data-change="u" data-k="${k}" aria-label="${label}" ${isOff(i) ? 'disabled' : ''}`)}</div>`).join('')}
      <div class="kv mt16" style="grid-template-columns:140px 1fr">
        ${i.cat === 'Data providers' ? `<span class="k">Unmatched lookup</span>${select(['Keep original record', 'Create research task', 'Flag for review'], d.unmatched, 'data-change="uv" data-k="unmatched"')}` : ''}
        <span class="k">${i.cat === 'Data providers' ? 'Lookup cost' : 'Cost'}</span><input class="input" readonly value="${esc(d.cost)}">
        <span class="k">${i.cat === 'Data providers' ? 'Monthly limit' : 'Limit'}</span><input class="input" readonly value="${esc(d.limit)}">
      </div>
      <button class="btn primary block mt16" data-action="save" ${isOff(i) ? 'disabled' : ''}>Save settings</button>
      <p class="muted small mt12 row" style="align-items:flex-start">${icon('info', 15)} ${i.cat === 'Data providers' ? 'No external match is a completed lookup with no additional data.' : i.cat === 'Communication' ? 'Contact policies and channel eligibility apply to every message.' : 'Original submitted contact details are always kept.'}</p>
    </div>
  </div>`;
}

function mappingTab(i) {
  const m = ui.mapping;
  return `<div class="card card-pad" style="max-width:860px">
    <div class="row between mb12"><div><h2>Field mapping</h2><p class="muted">How ${esc(i.name)} fields map to Leadviron lead fields.</p></div><button class="btn primary" data-action="save-map" ${isOff(i) ? 'disabled' : ''}>Save mapping</button></div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>${esc(i.name)} field</th><th></th><th>Leadviron field</th><th>Rule</th></tr></thead><tbody>
      ${m.map(([ext, lf], idx) => `<tr><td><code class="small">${esc(ext)}</code></td><td>${icon('arrowRight', 16, 'muted')}</td><td style="width:240px">${select(LEAD_FIELDS, lf, `data-change="map" data-i="${idx}"`, 'sm')}</td>
        <td class="muted small">${['Email', 'Phone', 'Full name'].includes(lf) ? 'Never overwrite submitted value' : lf === 'Do not map' ? 'Ignored' : 'Fill if empty'}</td></tr>`).join('')}
    </tbody></table></div>
  </div>`;
}

function syncTab(i) {
  const ev = EVENTS[i.cat];
  return `<div class="stack">
    <div class="grid g3">
      <div class="card stat"><div class="ico">${icon('refresh', 22)}</div><div><div class="label">${esc(i.syncLabel || 'Last sync')}</div><div class="strong">${esc(i.sync)}</div></div></div>
      <div class="card stat"><div class="ico">${icon('zap', 22)}</div><div><div class="label">Events today</div><div class="value num">${isOff(i) ? 0 : i.cat === 'Data providers' ? 120 : i.cat === 'Communication' ? 52 : 126}</div></div></div>
      <div class="card stat"><div class="ico">${icon('alertCircle', 22)}</div><div><div class="label">Failed today</div><div class="value num">${i.status === 'Needs authorization' ? 2 : 0}</div></div></div>
    </div>
    <div class="card card-pad"><div class="row between mb12"><h2>Recent events</h2><button class="btn sm" data-action="sync" ${isOff(i) ? 'disabled' : ''}>${icon('refresh', 15)} Sync now</button></div>
      ${isOff(i) ? '<div class="empty">Connect this integration to see events.</div>' : `<div class="table-wrap"><table class="tbl"><thead><tr><th>Time</th><th>Event</th><th>Detail</th><th>Result</th></tr></thead><tbody>
        ${(i.id === 'email' ? ev : ev.filter((e) => e[3] !== 'Failed')).map(([t, e, d, r]) => `<tr><td class="nowrap">${t}</td><td>${e}</td><td class="muted">${esc(d)}</td><td>${statusBadge(r, { tone: r === 'Success' ? '' : 'gray' })}</td></tr>`).join('')}</tbody></table></div>`}
      <p class="muted small mt12">Retries: 2 attempts, 60 seconds apart. Webhook events are deduplicated by event ID.</p></div>
  </div>`;
}

export default {
  title: 'Connection details',
  render(ctx) {
    const i = store.s.integrations.find((x) => x.id === ctx.params.connectionId);
    if (!i) return `<div class="card card-pad">Connection not found. <a href="#/demo/settings/integrations">Back to Integrations</a></div>`;
    if (ui.id !== i.id) { ui.id = i.id; ui.draft = null; ui.mapping = null; ui.tab = 'account'; }
    if (!ui.draft) ui.draft = { ...defaults(i), ...(i.settings || {}) };
    if (!ui.mapping) ui.mapping = (i.mapping || MAPPINGS[i.cat]).map((r) => [...r]);
    const off = isOff(i);
    const live = !off && i.status !== 'Needs authorization';
    return `
    <nav class="breadcrumb"><a href="#/demo/settings/general">Settings</a><span>/</span><a href="#/demo/settings/integrations">Integrations</a><span>/</span><span>${esc(i.name)}</span></nav>
    <div class="page-head">
      <div class="titles"><div class="title-row"><h1>${esc(i.name)}</h1>${statusBadge(i.status, { dot: true, pill: true, tone: live ? '' : 'gray' })}</div><div class="sub">Connection details · ${esc(i.cat)}</div></div>
      <div class="actions">
        ${off ? `<button class="btn primary" data-action="enable">${icon('power', 16)} ${i.status === 'Disabled' ? 'Enable' : 'Connect'}</button>` : `
        <button class="btn" data-action="test">${icon('play', 16)} Test connection</button>
        <button class="btn ${i.status === 'Needs authorization' ? 'primary' : ''}" data-action="reauth">${icon('refresh', 16)} Reauthorize</button>
        <button class="btn ${i.status === 'Needs authorization' ? '' : 'primary'}" data-action="disable">${icon('power', 16)} Disable</button>`}
      </div>
    </div>
    ${i.status === 'Needs authorization' ? `<div class="callout warn mb16">${icon('alert', 18)}<span><b>Authorization expired.</b> Sending is paused and RUN-1050 is waiting for review. Reauthorize to resume.</span></div>` : ''}
    ${tabs([['account', 'Account & Capabilities'], ['mapping', 'Field Mapping'], ['sync', 'Sync & Events']], ui.tab)}
    ${ui.tab === 'account' ? accountTab(i, ui.draft) : ui.tab === 'mapping' ? mappingTab(i) : syncTab(i)}
    <p class="muted small mt16 row">${icon('shield', 15)} Demo connection — no real credentials and no external requests. Production credentials are stored server-side.</p>`;
  },
  mount(root, ctx) {
    const id = ctx.params.connectionId;
    const i = () => store.s.integrations.find((x) => x.id === id);
    if (!i()) return;
    const set = (fn) => store.update((s) => fn(s.integrations.find((x) => x.id === id)));
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        test: () => {
          const x = i();
          const ok = x.status !== 'Needs authorization';
          modal({ title: 'Test connection', body: ok
            ? `<div class="row" style="gap:12px"><span class="blue" style="color:var(--blue-600)">${icon('checkCircle', 32)}</span><div><div class="strong">Connection OK</div><div class="muted small">Simulated test · response in 240 ms · ${esc(x.account)}</div></div></div>`
            : `<div class="row" style="gap:12px"><span class="muted">${icon('alertCircle', 32)}</span><div><div class="strong">Authorization failed</div><div class="muted small">Simulated test · provider rejected the stored credential. Reauthorize to continue.</div></div></div>`,
          buttons: ok ? [{ label: 'Close', cls: 'primary', value: null }] : [{ label: 'Close', value: null }, { label: 'Reauthorize', cls: 'primary', value: 'reauth' }] })
            .then(({ value }) => { if (value === 'reauth') root.querySelector('[data-action="reauth"]')?.click(); });
        },
        reauth: () => confirm(`Reauthorize ${esc(i().name)}?`, 'In the demo this simulates the provider authorization flow. No credentials are sent.', 'Reauthorize').then((ok) => {
          if (!ok) return;
          set((x) => { x.status = x.cat === 'Lead sources & ads' && x.id === 'web-forms' ? 'Active' : 'Connected'; x.sync = NOW; x.syncLabel = null; });
          store.update((s) => s.notifications.forEach((n) => { if (n.href.includes(id)) n.unread = false; }));
          toast(`${i().name} reauthorized`, 'Simulated — status is now Connected.'); ctx.rerender();
        }),
        disable: () => confirm(`Disable ${esc(i().name)}?`, 'Syncing and sending through this connection stop until it is enabled again. Existing lead data is kept.', 'Disable').then((ok) => {
          if (!ok) return;
          set((x) => { x.prevStatus = x.status; x.status = 'Disabled'; });
          toast(`${i().name} disabled`, 'Demo only — nothing changed at the provider.'); ctx.rerender();
        }),
        enable: () => {
          const x = i();
          const doIt = () => { set((y) => { y.status = y.prevStatus && y.prevStatus !== 'Needs authorization' ? y.prevStatus : (y.id === 'linkedin' ? 'Enabled' : 'Connected'); y.sync = NOW; y.syncLabel = null; if (y.account === 'No account connected' || y.account === 'Not configured') y.account = 'Demo account'; }); toast(`${x.name} ${x.status === 'Disabled' ? 'enabled' : 'connected'}`, 'Simulated — no keys stored, no provider contacted.'); ctx.rerender(); };
          if (x.status === 'Disabled') return doIt();
          modal({ title: `Connect ${x.name}`, body: `<div class="stack"><div class="field"><label>API key</label><input class="input" value="demo-key-••••••••••••" readonly><span class="muted small">Demo placeholder — real credentials are never entered in the demo.</span></div><div class="callout">${icon('lock', 18)}<span>${esc(x.setup)}</span></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Simulate connect', cls: 'primary', value: 1 }] })
            .then(({ value }) => value && doIt());
        },
        save: () => { set((x) => { x.settings = { ...ui.draft }; if (x.usage) Object.assign(x.usage, ui.draft); }); toast('Usage settings saved', 'Saved in this demo session.'); },
        'save-map': () => { set((x) => { x.mapping = ui.mapping.map((r) => [...r]); }); toast('Field mapping saved', 'Applies to new events in this demo session.'); },
        sync: () => { set((x) => { x.sync = NOW; }); toast('Sync simulated', 'No external request was made.'); ctx.rerender(); },
      },
      change: {
        u: (el) => { ui.draft[el.dataset.k] = el.checked; },
        uv: (el) => { ui.draft[el.dataset.k] = el.value; },
        map: (el) => { ui.mapping[+el.dataset.i][1] = el.value; ctx.rerender(); },
      },
    });
  },
};
