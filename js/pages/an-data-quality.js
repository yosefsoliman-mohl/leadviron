// 28 · Data Quality & Intelligence — field completeness vs qualification vs readiness, computed from the demo cohort.
import { icon, esc, avatar, stat, select, bar, on, toast, modal, statusBadge } from '../ui.js';
import { store, cohortCounts, fieldValue, ENRICH_FIELDS, FIELD_LABELS, SOURCES, COHORT } from '../store.js';

const ui = { period: 'Oct 1 – 29, 2026' };

const PROVIDERS = [['Demo A', 90, 120], ['Demo B', 54, 80]];
const ATTENTION = [
  { leadId: 'LD-1048', issue: 'Company size, Industry, LinkedIn URL missing', status: 'Partial 50%', action: 'View enrichment', href: '#/demo/intelligence/enrichment' },
  { leadId: 'LD-1063', issue: 'Qualification information missing', status: 'Needs information', action: 'Open lead', href: '#/demo/leads/LD-1063' },
  { leadId: 'LD-0912', issue: 'No external data found', status: 'Research task created', action: 'View task', href: '#/demo/sales/tasks?task=TSK-305', gray: true },
];

function missingModal(ctx, f) {
  const leads = store.s.leads.filter((l) => !fieldValue(l, f));
  modal({
    title: `${FIELD_LABELS[f]} · ${leads.length} leads missing`, wide: true,
    body: `<p class="muted mb12">Missing optional fields do not block lead creation or qualification. Original contact details are retained.</p>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Lead</th><th>Enrichment</th><th>Source</th><th></th></tr></thead><tbody>
      ${leads.slice(0, 8).map((l) => `<tr><td><div class="cell-person">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td><td>${statusBadge(l.enrich === 'partial' ? 'Partial' : 'No match')}</td><td>${esc(l.source)}</td><td class="r"><a href="#/demo/leads/${l.id}" data-close>Open</a></td></tr>`).join('')}
      </tbody></table></div>${leads.length > 8 ? `<p class="muted small mt8">Showing 8 of ${leads.length}.</p>` : ''}`,
    buttons: [{ label: 'Close', value: null }, { label: 'Open Enrichment Operations', cls: 'primary', value: 1 }],
  }).then(({ value }) => value && ctx.navigate('/demo/intelligence/enrichment'));
}

export default {
  title: 'Data Quality & Intelligence',
  render() {
    const s = store.s;
    const c = cohortCounts();
    const fields = ENRICH_FIELDS.map((f) => [f, s.leads.filter((l) => fieldValue(l, f)).length]);
    const found = fields.reduce((a, [, n]) => a + n, 0);
    const slots = c.total * 6;
    const assessed = s.leads.filter((l) => l.score != null).length;
    const bySource = SOURCES.map((src) => {
      const ls = s.leads.filter((l) => l.source === src);
      return [src, ls.length, ls.filter((l) => l.enrich === 'complete').length, ls.filter((l) => l.enrich === 'partial').length, ls.filter((l) => l.enrich === 'nomatch').length];
    });
    const dupOpen = s.duplicates.filter((d) => d.status === 'Open').length;
    return `
    <div class="page-head"><div class="titles"><h1>Data Quality & Intelligence</h1><div class="sub">${icon('sparkle', 15)} ${COHORT} · ${c.total} leads</div></div>
      <div class="actions">${select(['Oct 1 – 29, 2026', 'Oct 24 – 29, 2026'], ui.period, 'data-change="period" aria-label="Period"')}</div></div>
    <div class="grid g4">
      ${stat({ icon: 'database', label: 'Target field completeness', value: `${Math.round((found / slots) * 100)}%`, meta: `${found} of ${slots} field values` })}
      ${stat({ icon: 'users', label: 'Fully enriched', value: c.complete, meta: '6/6 fields', action: 'leads' })}
      ${stat({ icon: 'target', label: 'Partially enriched', value: c.partial, meta: '3/6 fields', action: 'leads' })}
      ${stat({ icon: 'bars', label: 'No external match', value: c.nomatch, meta: `${Math.round((c.nomatch / c.total) * 100)}% of leads`, action: 'leads' })}
    </div>
    <div class="an-cols c mt16">
      <div class="card"><div class="card-head"><h2>Field completeness</h2></div><div class="card-body" style="padding-top:0">
        ${fields.map(([f, n]) => `<button class="fc-row" data-action="field" data-f="${f}" aria-label="${FIELD_LABELS[f]} ${n} of ${c.total}"><span>${FIELD_LABELS[f]}</span>${bar((n / c.total) * 100, 'lg')}<span class="muted num" style="text-align:right">${n} / ${c.total}</span><span class="strong num" style="text-align:right">${Math.round((n / c.total) * 100)}%</span></button>`).join('')}
      </div></div>
      <div class="card"><div class="card-head"><h2>Qualification and readiness</h2></div><div class="card-body" style="padding-top:0">
        ${[['users', 'Qualified', c.qualified], ['file', 'Needs information', c.needsInfo], ['minusCircle', 'Disqualified', c.disqualified], ['send', 'Contact eligible', c.eligible]].map(([ic, l, n]) => `<div class="qr-row"><span class="ico-circle sm">${icon(ic, 16)}</span><span>${l}</span><span class="v num">${n}</span></div>`).join('')}
        <div class="muted small mt8" style="padding-left:44px">Score assessed <b class="num" style="color:var(--ink-900)">${assessed}</b> · Not assessed <b class="num" style="color:var(--ink-900)">${c.total - assessed}</b></div>
        <div class="muted small mt8">${icon('info', 14)} Original contact details are retained. <a href="#/demo/intelligence/qualification">Qualification rules</a></div>
      </div></div>
    </div>
    <div class="an-cols c mt16">
      <div class="card"><div class="card-head"><h2>Source quality</h2></div><div class="card-body"><div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>Source</th><th class="c">Leads</th><th class="c">Complete</th><th class="c">Partial</th><th class="c">No match</th></tr></thead>
        <tbody>${bySource.map(([src, n, a, b, d]) => `<tr class="clickable" data-action="source" data-src="${src}"><td>${src}</td><td class="c num">${n}</td><td class="c num">${a}</td><td class="c num">${b}</td><td class="c num">${d}</td></tr>`).join('')}</tbody></table></div></div></div>
      <div class="card"><div class="card-head"><h2>Provider match coverage</h2></div><div class="card-body"><div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>Provider</th><th>Leads matched</th><th>Coverage</th><th style="width:40%"></th></tr></thead>
        <tbody>${PROVIDERS.map(([p, m, t], i) => `<tr class="clickable" data-action="provider" data-i="${i}"><td>${p}</td><td class="num">${m} / ${t}</td><td class="num">${((m / t) * 100).toFixed(1)}%</td><td>${bar((m / t) * 100, 'lg')}</td></tr>`).join('')}</tbody></table></div>
        <div class="row between mt12 small"><span class="muted">Lookups may overlap.</span><a href="#/demo/leads/duplicates">Potential duplicates · ${dupOpen ? 'Review required' : 'All reviewed'} →</a></div></div></div>
    </div>
    <div class="card mt16"><div class="card-head"><h2>Needs attention</h2></div><div class="card-body"><div class="table-wrap flat"><table class="tbl">
      <thead><tr><th>Name</th><th>Issue</th><th>Current status</th><th>Action</th></tr></thead>
      <tbody>${ATTENTION.map((a) => { const l = s.leads.find((x) => x.id === a.leadId); return `<tr><td>${esc(l.name)}</td><td>${esc(a.issue)}</td><td>${statusBadge(a.status, { tone: a.gray ? 'gray' : '' })}</td><td><a href="${a.href}">${a.action} →</a></td></tr>`; }).join('')}</tbody></table></div></div></div>`;
  },
  mount(root, ctx) {
    on(root, {
      click: {
        field: (el) => missingModal(ctx, el.dataset.f),
        leads: () => ctx.navigate('/demo/leads'),
        source: (el) => ctx.navigate(`/demo/leads?source=${encodeURIComponent(el.dataset.src)}`),
        provider: (el) => ctx.navigate(`/demo/settings/integrations/${el.dataset.i === '0' ? 'demo-enrichment-a' : 'demo-enrichment-b'}`),
      },
      change: { period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Cohort figures come from the demo data set.'); } },
    });
  },
};
