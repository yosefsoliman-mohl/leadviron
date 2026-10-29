// 25 · Funnel & Acquisition — funnel, metric definitions and source economics.
import { icon, esc, avatar, stat, select, on, toast, modal, funnel, sourceIcon, statusBadge, fmt } from '../ui.js';
import { store } from '../store.js';

const ui = { period: 'Oct 1 – 29, 2026', source: '', campaign: '' };

// Workspace-wide sample totals by acquisition source (SAR spend).
const ROWS = [
  { src: 'Meta Ads', leads: 520, qual: 312, contacted: 234, conv: 44, spend: 26000 },
  { src: 'Google Ads', leads: 360, qual: 234, contacted: 176, conv: 38, spend: 36000 },
  { src: 'LinkedIn', leads: 240, qual: 150, contacted: 112, conv: 26, spend: 24000 },
  { src: 'Web Forms', leads: 120, qual: 48, contacted: 36, conv: 4, spend: null },
];

const METRICS = [
  { key: 'new', icon: 'users', name: 'New leads', def: 'Unique acquired leads.', pick: () => true },
  { key: 'qual', icon: 'target', name: 'Qualified', def: 'Passed qualification rules.', pick: (l) => l.qual === 'Qualified' },
  { key: 'contact', icon: 'mail', name: 'Successful contact', def: 'Confirmed two-way contact.', pick: (l) => store.s.conversations.some((c) => c.leadId === l.id && c.messages.some((m) => m.from === 'lead')) },
  { key: 'conv', icon: 'bars', name: 'Converted', def: 'Recorded customer conversion.', pick: (l) => l.stage === 'Converted' },
];

const money = (n, d = 2) => (n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));

function totals(rows) {
  return rows.reduce((a, r) => ({ leads: a.leads + r.leads, qual: a.qual + r.qual, contacted: a.contacted + r.contacted, conv: a.conv + r.conv, spend: a.spend + (r.spend || 0) }), { leads: 0, qual: 0, contacted: 0, conv: 0, spend: 0 });
}

function metricModal(ctx, m) {
  const leads = store.s.leads.filter((l) => (!ui.source || l.source === ui.source) && m.pick(l)).slice(0, 8);
  modal({
    title: `${m.name} · example records`,
    wide: true,
    body: `<p class="muted mb12">${esc(m.def)} Sample records from the ${esc(store.s.leads[0].cohort)} demo cohort${ui.source ? ` (source: ${esc(ui.source)})` : ''}.</p>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Lead</th><th>Source</th><th>Qualification</th><th>Stage</th><th></th></tr></thead><tbody>
      ${leads.length ? leads.map((l) => `<tr><td><div class="cell-person">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td><td>${esc(l.source)}</td><td>${statusBadge(l.qual)}</td><td>${statusBadge(l.stage)}</td><td class="r"><a href="#/demo/leads/${l.id}" data-close>Open</a></td></tr>`).join('') : '<tr><td colspan="5"><div class="empty">No sample records for this filter.</div></td></tr>'}
      </tbody></table></div>`,
    buttons: [{ label: 'Close', value: null }, { label: 'View all leads', cls: 'primary', value: 1 }],
  }).then(({ value }) => value && ctx.navigate('/demo/leads'));
}

export default {
  title: 'Funnel & Acquisition',
  render() {
    const rows = ui.source ? ROWS.filter((r) => r.src === ui.source) : ROWS;
    const t = totals(rows);
    const rate = (a, b, d = 0) => (b ? ((a / b) * 100).toFixed(d) : '0');
    return `
    <div class="page-head"><div class="titles"><h1>Funnel & Acquisition</h1><div class="sub">${ui.source ? `${esc(ui.source)} leads` : 'All workspace leads'}</div></div>
      <div class="actions">
        ${select(['Oct 1 – 29, 2026', 'Oct 24 – 29, 2026', 'Sep 1 – 30, 2026'], ui.period, 'data-change="period" aria-label="Period"')}
        ${select([['', 'All sources'], ...ROWS.map((r) => r.src)], ui.source, 'data-change="source" aria-label="Source"')}
        ${select([['', 'All campaigns'], ...store.s.campaigns.map((c) => [c.id, c.name])], ui.campaign, 'data-change="campaign" aria-label="Campaign"')}
      </div></div>
    <div class="grid g4">
      ${stat({ icon: 'users', label: 'New leads', value: fmt(t.leads), meta: 'This period' })}
      ${stat({ icon: 'target', label: 'Qualified', value: fmt(t.qual), meta: `${rate(t.qual, t.leads)}% qualification rate` })}
      ${stat({ icon: 'mail', label: 'Successful contact', value: fmt(t.contacted), meta: `${rate(t.contacted, t.qual)}% contact rate` })}
      ${stat({ icon: 'bars', label: 'Converted', value: fmt(t.conv), meta: `${rate(t.conv, t.leads, 1)}% conversion rate` })}
    </div>
    <div class="split wide-side mt16">
      <div class="card"><div class="card-head"><h2>Lead conversion funnel</h2><span class="muted">Overall conversion</span> <span class="strong" style="font-size:18px;color:var(--blue-600)">${rate(t.conv, t.leads, 1)}%</span></div>
        <div class="card-body">${funnel([{ label: 'New leads', value: t.leads }, { label: 'Qualified', value: t.qual }, { label: 'Contacted', value: t.contacted }, { label: 'Converted', value: t.conv }])}</div></div>
      <div class="card"><div class="card-head"><h2>Metric definitions</h2><a href="#/demo/leads" class="small">View records</a></div>
        <div class="card-body" style="padding-top:0">${METRICS.map((m) => `<button class="metric-row" data-action="metric" data-key="${m.key}"><span class="ico-circle">${icon(m.icon, 19)}</span><span class="grow"><span class="strong" style="font-weight:500;display:block">${m.name}</span><span class="muted small">${m.def}</span></span>${icon('chevRight', 18, 'blue')}</button>`).join('')}</div></div>
    </div>
    <div class="card mt16"><div class="card-head"><h2>Leads by acquisition source</h2></div>
      <div class="card-body"><div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>Source</th><th class="c">New leads</th><th class="c">Qualified</th><th class="c">Contacted</th><th class="c">Converted</th><th class="c">Spend (SAR)</th><th class="c">Cost per qualified (SAR)</th><th class="c">Cost per converted (SAR)</th></tr></thead>
        <tbody>${rows.map((r) => `<tr class="clickable" data-action="row" data-src="${r.src}"><td><span class="owner">${sourceIcon(r.src, 20)} ${r.src}</span></td><td class="c num">${r.leads}</td><td class="c num">${r.qual}</td><td class="c num">${r.contacted}</td><td class="c num">${r.conv}</td><td class="c num">${money(r.spend, 0)}</td><td class="c num">${r.spend ? money(r.spend / r.qual) : '—'}</td><td class="c num">${r.spend ? money(r.spend / r.conv) : '—'}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="small mt12">Recorded paid media spend: SAR ${fmt(t.spend)}</div><div class="muted tiny">Demo costs. Web Forms spend unavailable.</div></div></div>`;
  },
  mount(root, ctx) {
    on(root, {
      click: {
        metric: (el) => metricModal(ctx, METRICS.find((m) => m.key === el.dataset.key)),
        row: (el) => ctx.navigate(`/demo/leads?source=${encodeURIComponent(el.dataset.src)}`),
      },
      change: {
        period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo totals are fixed sample values for every period.'); },
        source: (el) => { ui.source = el.value; ctx.rerender(); },
        campaign: (el) => { ui.campaign = el.value; toast(el.value ? `Filtered to ${el.selectedOptions[0].text}` : 'All campaigns', 'Demo totals are sample values; campaign attribution is illustrative.'); },
      },
    });
  },
};
