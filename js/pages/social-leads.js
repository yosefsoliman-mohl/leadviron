// Lead Generation · From Social Media — leads captured by Meta, Google and LinkedIn lead forms.
import { icon, esc, avatar, owner, statusBadge, dots, pageHead, select, toggle, on, toast, confirm } from '../ui.js';
import { store, enrichLabel, enrichPct } from '../store.js';
import { genCrumbs } from './gen-nav.js';

// Platform totals match the Dashboard and Funnel & Acquisition sample figures.
const PLATFORMS = [
  { key: 'Meta Ads', name: 'Meta Lead Ads', sub: 'Facebook & Instagram lead forms', icon: 'meta', integration: 'meta-lead-ads', leads: 520, qualified: 312, conv: 44, spend: 26000,
    forms: [['KSA Logistics — Demo request', 312, 'Active'], ['Retail Ops Guide download', 148, 'Active'], ['Event follow-up (Riyadh)', 60, 'Ended']] },
  { key: 'Google Ads', name: 'Google Lead Forms', sub: 'Lead form assets on Search & YouTube', icon: 'google', integration: 'google-lead-forms', leads: 360, qualified: 234, conv: 38, spend: 36000,
    forms: [['Lead management software — KSA', 228, 'Active'], ['Demo request — YouTube', 132, 'Active']] },
  { key: 'LinkedIn', name: 'LinkedIn Lead Gen Forms', sub: 'Sponsored content lead forms', icon: 'linkedin', integration: 'linkedin', leads: 240, qualified: 150, conv: 26, spend: 24000,
    forms: [['Operations leaders — KSA', 164, 'Active'], ['Whitepaper: Lead follow-up', 76, 'Paused']] },
];
const FORM_FOR = { 'Meta Ads': 'KSA Logistics — Demo request', 'Google Ads': 'Lead management software — KSA', LinkedIn: 'Operations leaders — KSA' };
const TIMES = ['10:55 AM', '10:51 AM', '10:32 AM', '9:48 AM', '9:15 AM', 'Yesterday', 'Yesterday', 'Oct 27', 'Oct 27', 'Oct 26'];

const ui = { platform: '', page: 1 };

function settings() {
  const s = store.s;
  return s.socialSettings || { autoAssign: true, autoEnrich: true, dedupe: true };
}

export default {
  title: 'From Social Media',
  render() {
    const s = store.s;
    const cfg = settings();
    const synced = s.socialSynced || 'Oct 29, 2026, 10:55 AM';
    const rows = s.leads.filter((l) => ['Meta Ads', 'Google Ads', 'LinkedIn'].includes(l.source) && (!ui.platform || l.source === ui.platform));
    const per = 10; const pages = Math.max(1, Math.ceil(rows.length / per));
    if (ui.page > pages) ui.page = pages;
    const view = rows.slice((ui.page - 1) * per, ui.page * per);
    const total = PLATFORMS.reduce((a, p) => a + p.leads, 0);
    return `
    ${pageHead({ crumbs: genCrumbs('From Social Media'), title: 'From Social Media', sub: `Leads captured from social and ad platform lead forms · last sync ${esc(synced)}`,
      actions: `<button class="btn" data-action="sync">${icon('refresh', 16)} Sync now</button><a class="btn primary" href="#/demo/settings/integrations">${icon('plus', 18)} Connect a platform</a>` })}
    <div class="grid g3">
      ${PLATFORMS.map((p) => {
        const integ = s.integrations.find((i) => i.id === p.integration);
        const active = ui.platform === p.key;
        return `<div class="card social-card ${active ? 'selected' : ''}">
          <div class="row" style="align-items:flex-start;gap:14px">
            <span class="logo-tile">${icon(p.icon, 28)}</span>
            <div class="grow" style="min-width:0"><div class="strong" style="font-size:16px">${p.name}</div><div class="muted small">${p.sub}</div>
              <div class="mt8">${statusBadge(integ && integ.status !== 'Not connected' ? 'Connected' : 'Not connected')}</div></div>
          </div>
          <div class="grid g3 mt16" style="gap:8px">
            <div><div class="muted tiny">Leads</div><div class="strong num" style="font-size:20px">${p.leads}</div></div>
            <div><div class="muted tiny">Qualified</div><div class="strong num" style="font-size:20px">${p.qualified}</div></div>
            <div><div class="muted tiny">Converted</div><div class="strong num" style="font-size:20px">${p.conv}</div></div>
          </div>
          <div class="mt12 small muted">${Math.round((p.leads / total) * 100)}% of social leads · SAR ${(p.spend / p.qualified).toFixed(2)} per qualified lead</div>
          <div class="row wrap mt12" style="gap:8px"><button class="btn sm ${active ? 'soft' : ''}" data-action="platform" data-key="${p.key}">${active ? 'Showing leads' : 'View leads'}</button><a class="btn sm ghost" href="#/demo/settings/integrations/${p.integration}">Manage</a></div>
        </div>`;
      }).join('')}
    </div>

    <div class="split mt16">
      <div class="card">
        <div class="card-head" style="flex-wrap:wrap"><h2>Recent social leads</h2>${select([['', 'All platforms'], ...PLATFORMS.map((p) => [p.key, p.name])], ui.platform, 'data-change="platform" aria-label="Platform"', 'sm')}</div>
        <div class="table-wrap flat"><table class="tbl"><thead><tr><th>Lead</th><th>Platform · form</th><th>Captured</th><th>Enrichment</th><th>Qualification</th><th>Owner</th></tr></thead><tbody>
          ${view.map((l, i) => `<tr class="clickable" data-action="open" data-id="${l.id}">
            <td><div class="cell-person">${avatar(l.initials)}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Company unknown')}</div></div></div></td>
            <td><div class="owner">${icon(PLATFORMS.find((p) => p.key === l.source).icon, 18)}<span class="small">${esc(FORM_FOR[l.source])}</span></div></td>
            <td class="muted nowrap">${TIMES[((ui.page - 1) * per + i) % TIMES.length]}</td>
            <td><div class="row nowrap">${dots(l.found)}<span class="small muted">${enrichLabel(l)} ${enrichPct(l)}%</span></div></td>
            <td>${statusBadge(l.qual)}</td><td>${owner(l.owner)}</td></tr>`).join('')}
        </tbody></table></div>
        <div class="table-foot" style="padding:12px 16px"><span class="muted small">${rows.length} social leads in the demo cohort</span>
          <div class="pager"><button data-action="page" data-page="${ui.page - 1}" ${ui.page <= 1 ? 'disabled' : ''} aria-label="Previous">${icon('chevLeft', 16)}</button><span class="small muted" style="padding:0 8px">${ui.page} / ${pages}</span><button data-action="page" data-page="${ui.page + 1}" ${ui.page >= pages ? 'disabled' : ''} aria-label="Next">${icon('chevRight', 16)}</button></div></div>
      </div>
      <div class="stack">
        <div class="card card-pad"><h3 class="mb8">Lead forms</h3>
          ${PLATFORMS.filter((p) => !ui.platform || p.key === ui.platform).flatMap((p) => p.forms.map(([n, c, st]) => `<div class="list-item">${icon(p.icon, 20)}<div class="grow" style="min-width:0"><div class="strong" style="font-weight:500">${esc(n)}</div><div class="muted small">${c} leads</div></div>${statusBadge(st, { tone: st === 'Active' ? '' : 'gray' })}</div>`)).join('')}
        </div>
        <div class="card card-pad"><h3>Intake rules</h3><p class="muted small mt8">Applied to every new social lead before it reaches All Leads.</p>
          <div class="setting-row"><div class="grow"><div>Assign owners round-robin</div><div class="muted small">Sara Ahmed, Khalid Ali, Maya Hassan</div></div>${toggle(cfg.autoAssign, 'data-change="cfg" data-k="autoAssign"')}</div>
          <div class="setting-row"><div class="grow"><div>Enrich automatically</div><div class="muted small">Demo Enrichment A, fill empty fields only</div></div>${toggle(cfg.autoEnrich, 'data-change="cfg" data-k="autoEnrich"')}</div>
          <div class="setting-row"><div class="grow"><div>Check duplicates</div><div class="muted small">Same email or phone goes to Duplicate Review</div></div>${toggle(cfg.dedupe, 'data-change="cfg" data-k="dedupe"')}</div>
        </div>
        <div class="callout">${icon('info', 18)}<span>Form submissions keep the original name, email and phone. Lead form consent is recorded per channel; it does not by itself allow WhatsApp messages.</span></div>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const setPlatform = (k) => { ui.platform = ui.platform === k ? '' : k; ui.page = 1; ctx.rerender(); };
    on(root, {
      click: {
        platform: (el) => setPlatform(el.dataset.key),
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        open: (el) => ctx.navigate(`/demo/leads/${el.dataset.id}`),
        sync: () => { store.update((s) => { s.socialSynced = 'Oct 29, 2026, 11:06 AM'; }); toast('Sync simulated · no new leads', 'No platform was contacted. Demo data unchanged.'); ctx.rerender(); },
      },
      change: {
        platform: (el) => { ui.platform = el.value; ui.page = 1; ctx.rerender(); },
        cfg: (el) => {
          const k = el.dataset.k;
          const apply = () => { store.update((s) => { s.socialSettings = { ...settings(), [k]: el.checked }; }); toast('Intake rule updated', 'Saved in this demo session only.'); };
          if (k === 'dedupe' && !el.checked) confirm('Turn off duplicate checks?', 'Repeat submissions from the same person would create separate lead records.', 'Turn off').then((ok) => { if (ok) apply(); else el.checked = true; });
          else apply();
        },
      },
    });
  },
};
