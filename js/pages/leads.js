// 03 · All Leads — searchable, filterable cohort table with bulk actions.
import { icon, esc, avatar, owner, statusBadge, dots, pageHead, select, searchInput, pager, source, on, toast, modal, keepFocus, tabs } from '../ui.js';
import { store, enrichLabel, enrichPct, OWNERS, SOURCES, STAGES, COHORT, WORKSPACE_TOTAL, cohortCounts } from '../store.js';
import { addLeadModal } from '../shared.js';
import { sortTh, nextSort, sortBy } from '../table-sort.js';

const ui = { tab: 'all', q: '', source: '', owner: '', enrich: '', qual: '', stage: '', page: 1, per: 10, sel: new Set(), sort: { key: null, dir: 0 } };

// Minutes since the last activity, from labels like "Email • 25m", "Call • 2h", "Reply • 1d", "Updated • Today".
function ago(label) {
  const t = label.split('•').pop().trim();
  const m = t.match(/^(\d+)([mhd])$/);
  if (m) return +m[1] * { m: 1, h: 60, d: 1440 }[m[2]];
  return { Now: 0, Today: 300, Yesterday: 1440 }[t] ?? 99999;
}
const QUAL_ORDER = ['Qualified', 'Needs information', 'Disqualified'];
const SORT = {
  name: (l) => l.name, source: (l) => l.source, enrich: (l) => l.found, qual: (l) => QUAL_ORDER.indexOf(l.qual),
  score: (l) => l.score, stage: (l) => STAGES.indexOf(l.stage), owner: (l) => l.owner, activity: (l) => ago(l.activity),
};
const sorted = () => sortBy(filtered(), ui.sort, SORT);

function filtered() {
  const q = ui.q.trim().toLowerCase();
  return store.s.leads.filter((l) =>
    (ui.tab === 'all' || l.enrich === ui.tab) &&
    (!ui.source || l.source === ui.source) &&
    (!ui.owner || l.owner === ui.owner) &&
    (!ui.enrich || l.enrich === ui.enrich) &&
    (!ui.qual || l.qual === ui.qual) &&
    (!ui.stage || l.stage === ui.stage) &&
    (!q || l.name.toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q) || l.email.toLowerCase().includes(q)));
}

function summary(icn, title, n, metaTxt, found, extra = '') {
  return `<div class="card stat" style="padding:16px 20px">
    <div class="ico">${icon(icn, 24)}</div>
    <div class="grow"><div class="label">${title}</div><div class="row"><span class="value num">${n}</span><span class="muted">${metaTxt}</span></div></div>
    <div style="text-align:right">${extra}<div class="mt8">${dots(found, 6, 'lg')}</div></div></div>`;
}

export default {
  title: 'All Leads',
  render(ctx) {
    // Links from other pages can preset filters, e.g. #/demo/leads?source=Meta%20Ads or ?qual=Qualified
    const qk = JSON.stringify(ctx.query);
    if (qk !== ui._qk) { ui._qk = qk; ['source', 'owner', 'enrich', 'qual', 'stage'].forEach((k) => { if (ctx.query[k]) { ui[k] = ctx.query[k]; ui.page = 1; } }); }
    const c = cohortCounts();
    const rows = sorted();
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    if (ui.page > pages) ui.page = pages;
    const view = rows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
    const allSel = view.length && view.every((l) => ui.sel.has(l.id));
    const more = ui.qual || ui.stage;
    return `
    ${pageHead({
      title: 'All Leads', sub: `${COHORT} · ${c.total} of ${WORKSPACE_TOTAL.toLocaleString()} leads`,
      actions: `<button class="btn" data-action="save-view">${icon('bookmark', 17)} Save view</button>
        <button class="btn" data-action="import">${icon('upload', 17)} Import</button>
        <button class="btn primary" data-action="add">${icon('plus', 18)} Add lead</button>`,
    })}
    ${store.s.savedViews.length ? `<div class="row wrap mb12"><span class="muted small">Saved views:</span>${store.s.savedViews.map((v, i) => `<button class="chip" data-action="apply-view" data-i="${i}">${icon('bookmark', 14)} ${esc(v.name)}</button>`).join('')}</div>` : ''}
    <div class="grid g3">
      ${summary('users', 'Fully enriched', c.complete, '100% • 6/6 fields', 6)}
      ${summary('halfCircle', 'Partially enriched', c.partial, '50% • 3/6 fields', 3)}
      ${summary('dashedCircle', 'No external match', c.nomatch, '0% • 0/6 fields', 0, '<span class="badge">10% of cohort</span>')}
    </div>
    <div class="mt16">${tabs([['all', 'All records', c.total], ['complete', 'Complete', c.complete], ['partial', 'Partial', c.partial], ['nomatch', 'No match', c.nomatch]], ui.tab)}</div>
    <div class="filters">
      ${searchInput('Search by name, company or email...', ui.q, 'data-input="q" id="lead-q"')}
      ${select([['', 'Source'], ...SOURCES], ui.source, 'data-change="source" aria-label="Source"')}
      ${select([['', 'Owner'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
      ${select([['', 'Enrichment'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], ui.enrich, 'data-change="enrich" aria-label="Enrichment"')}
      <button class="btn ${more ? 'soft' : ''}" data-action="more">${icon('filter', 16)} More filters${more ? ' · on' : ''}</button>
    </div>
    <div class="table-wrap">
      <div class="bulkbar">
        <input type="checkbox" class="check" data-change="sel-all" ${allSel ? 'checked' : ''} aria-label="Select page">
        <span class="strong" style="font-weight:500">${ui.sel.size} selected</span>
        <span class="vdivider"></span>
        <button class="btn ghost sm" data-action="bulk-owner" ${ui.sel.size ? '' : 'disabled'}>${icon('user', 17)} Assign owner</button>
        <button class="btn ghost sm" data-action="bulk-campaign" ${ui.sel.size ? '' : 'disabled'}>${icon('send', 17)} Add to campaign</button>
        <button class="btn ghost sm" data-action="bulk-enrich" ${ui.sel.size ? '' : 'disabled'}>${icon('database', 17)} Enrich</button>
        ${ui.sel.size ? '<button class="link-btn small" data-action="clear-sel" style="margin-left:auto">Clear selection</button>' : ''}
      </div>
      <table class="tbl">
        <thead><tr><th class="w-check"></th>${[['Lead / Company', 'name'], ['Source', 'source'], ['Enrichment', 'enrich'], ['Qualification', 'qual'], ['Score', 'score'], ['Stage', 'stage'], ['Owner', 'owner'], ['Last activity', 'activity']].map(([t, k]) => sortTh(t, k, ui.sort)).join('')}</tr></thead>
        <tbody>${view.length ? view.map((l) => `<tr class="clickable ${ui.sel.has(l.id) ? 'selected' : ''}" data-action="open" data-id="${l.id}">
          <td><input type="checkbox" class="check" data-change="sel" data-id="${l.id}" ${ui.sel.has(l.id) ? 'checked' : ''} aria-label="Select ${esc(l.name)}"></td>
          <td><div class="cell-person">${avatar(l.initials, '')}<div><div class="nm">${esc(l.name)}${l.isNew ? ' <span class="badge">New</span>' : ''}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td>
          <td>${source(l.source)}</td>
          <td><div class="row nowrap"><span class="num" style="width:38px">${enrichPct(l)}%</span>${dots(l.found)}<span class="${l.enrich === 'partial' ? 'badge' : 'muted'}" style="${l.enrich === 'partial' ? '' : 'margin-left:4px'}">${enrichLabel(l)}</span></div></td>
          <td>${statusBadge(l.qual === 'Disqualified' ? 'Not qualified' : l.qual === 'Needs information' ? 'Pending' : l.qual)}</td>
          <td class="num strong" style="font-weight:500">${l.score ?? '—'}</td>
          <td>${statusBadge(l.stage, { tone: l.stage === 'Closed' ? 'gray' : '' })}</td>
          <td>${owner(l.owner)}</td>
          <td class="muted nowrap">${esc(l.activity)}</td></tr>`).join('') : `<tr><td colspan="9"><div class="empty">${icon('search', 30)}<div>No leads match these filters.</div><button class="btn sm mt12" data-action="reset-filters">Clear filters</button></div></td></tr>`}</tbody>
      </table>
    </div>
    <div class="table-foot">
      <span class="muted">Showing ${rows.length ? (ui.page - 1) * ui.per + 1 : 0}–${Math.min(ui.page * ui.per, rows.length)} of ${rows.length}</span>
      <span class="muted tiny" style="margin-left:auto">Coverage of 6 enrichment fields. Original contact details retained.</span>
      ${select([[10, '10 per page'], [25, '25 per page'], [50, '50 per page']], ui.per, 'data-change="per" aria-label="Rows per page"', 'sm')}
      ${pager(ui.page, pages)}
    </div>`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#lead-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; ui.page = 1; re(); };
    const selected = () => [...ui.sel];
    on(root, {
      click: {
        open: (el, e) => { if (e.target.closest('input')) return; ctx.navigate(`/demo/leads/${el.dataset.id}`); },
        tab: (el) => { ui.tab = el.dataset.key; ui.page = 1; re(); },
        sort: (el) => { ui.sort = nextSort(ui.sort, el.dataset.key); ui.page = 1; re(); },
        page: (el) => { ui.page = +el.dataset.page; re(); },
        add: () => addLeadModal().then((id) => { if (id) { ui.page = 1; ctx.rerender(); } }),
        'clear-sel': () => { ui.sel.clear(); re(); },
        'reset-filters': () => { Object.assign(ui, { q: '', source: '', owner: '', enrich: '', qual: '', stage: '', tab: 'all', page: 1 }); re(); },
        'save-view': () => modal({ title: 'Save view', body: `<div class="field"><label>View name</label><input class="input" name="name" placeholder="e.g. My qualified leads"></div><p class="muted small mt8">Saves the current tab, search and filters for this demo session.</p>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Save view', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; const name = form.name.trim() || `View ${store.s.savedViews.length + 1}`; store.update((s) => s.savedViews.push({ name, f: { tab: ui.tab, q: ui.q, source: ui.source, owner: ui.owner, enrich: ui.enrich, qual: ui.qual, stage: ui.stage } })); toast(`View “${name}” saved`, 'Available while this demo session lasts.'); re(); }),
        'apply-view': (el) => { Object.assign(ui, store.s.savedViews[+el.dataset.i].f, { page: 1 }); re(); },
        import: () => modal({ title: 'Import leads', body: `<div class="stack"><div class="card card-pad" style="border-style:dashed;text-align:center">${icon('fileUp', 30)}<div class="strong mt8">Drop a CSV file here</div><div class="muted small">Name, email and phone columns are mapped automatically.</div></div><div class="callout">${icon('info', 18)}<span>In the demo, imports are simulated. Review processed rows and errors in the <a href="#/demo/settings/ingestion">Ingestion Monitor</a>.</span></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Simulate import', cls: 'primary', value: 1 }] })
          .then(({ value }) => value && toast('Import simulated · 92 rows', '84 created, 4 updated, 2 need review, 2 failed. See Ingestion Monitor.')),
        more: () => modal({ title: 'More filters', body: `<div class="stack"><div class="field"><label>Qualification</label>${select([['', 'Any'], 'Qualified', 'Needs information', 'Disqualified'], ui.qual, 'name="qual"')}</div><div class="field"><label>Stage</label>${select([['', 'Any'], 'New', 'Contacting', 'Engaged', 'Follow-up', 'Converted', 'Closed'], ui.stage, 'name="stage"')}</div></div>`, buttons: [{ label: 'Clear', value: 'clear' }, { label: 'Apply', cls: 'primary', value: 'apply' }] })
          .then(({ value, form }) => { if (value === 'clear') { ui.qual = ''; ui.stage = ''; } else if (value === 'apply') { ui.qual = form.qual; ui.stage = form.stage; } ui.page = 1; re(); }),
        'bulk-owner': () => modal({ title: `Assign owner · ${ui.sel.size} leads`, body: `<div class="field"><label>Owner</label>${select(OWNERS, 'Sara Ahmed', 'name="owner"')}</div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Assign', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; const ids = selected(); store.update((s) => s.leads.forEach((l) => { if (ids.includes(l.id)) l.owner = form.owner; })); toast(`${ids.length} leads assigned to ${form.owner}`, 'Saved in this demo session.'); ui.sel.clear(); re(); }),
        'bulk-campaign': () => {
          const leads = store.s.leads.filter((l) => ui.sel.has(l.id));
          const ok = leads.filter((l) => l.eligibility === 'Eligible').length;
          modal({ title: 'Add to campaign', body: `<div class="stack"><div class="field"><label>Campaign</label>${select(store.s.campaigns.filter((c) => c.status !== 'Completed').map((c) => [c.id, c.name]), 'cmp-ksa', 'name="cmp"')}</div><div class="callout">${icon('info', 18)}<span><b>${ok} of ${leads.length}</b> selected leads are eligible. Leads without qualification or channel permission stay excluded.</span></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Add eligible leads', cls: 'primary', value: 1 }] })
            .then(({ value, form }) => { if (!value) return; const c = store.s.campaigns.find((x) => x.id === form.cmp); toast(`${ok} leads added to ${c.name}`, `${leads.length - ok} excluded by contact policy. Nothing was sent.`); ui.sel.clear(); re(); });
        },
        'bulk-enrich': () => {
          const n = ui.sel.size;
          modal({ title: `Enrich ${n} leads`, body: `<div class="kv"><span class="k">Provider</span><span class="v">Demo Enrichment A</span><span class="k">Estimated cost</span><span class="v">${n} demo credits</span><span class="k">Behavior</span><span class="v">Fill empty fields only · keep original contact details</span></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Start enrichment', cls: 'primary', value: 1 }] })
            .then(({ value }) => { if (value) { toast(`Enrichment simulated for ${n} leads`, 'No paid lookup was made. Results use demo data.'); ui.sel.clear(); re(); } });
        },
      },
      change: {
        source: set('source'), owner: set('owner'), enrich: set('enrich'),
        per: (el) => { ui.per = +el.value; ui.page = 1; re(); },
        sel: (el) => { el.checked ? ui.sel.add(el.dataset.id) : ui.sel.delete(el.dataset.id); re(); },
        'sel-all': (el) => { const rows = sorted().slice((ui.page - 1) * ui.per, ui.page * ui.per); rows.forEach((l) => (el.checked ? ui.sel.add(l.id) : ui.sel.delete(l.id))); re(); },
      },
      input: { q: (el) => { ui.q = el.value; ui.page = 1; re(); } },
    });
  },
};
