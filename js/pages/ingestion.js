// 08 · Ingestion Monitor — incoming records, imports, and failed/review rows with correction.
import { icon, esc, stat, pageHead, tabs, select, searchInput, statusBadge, sourceIcon, pager, on, toast, modal, keepFocus } from '../ui.js';
import { store } from '../store.js';
import { leadSettingsTabs, leadSettingsCrumbs } from './settings-tabs.js';

const ui = { tab: 'events', q: '', source: '', status: '', period: 'Oct 29, 2026', sel: 'EVT-1204', page: 1, per: 6, fix: {} };

// Two more review items so "Failed & Review" matches the 4 + 2 shown in the summary.
const EXTRA = [
  { id: 'EVT-1198', source: 'Meta Lead Ads', time: '10:38 AM', status: 'Needs review', result: 'Phone format unclear.', issue: 'Phone number has 13 digits' },
  { id: 'EVT-1197', source: 'Web Forms', time: '10:35 AM', status: 'Needs review', result: 'Possible duplicate · Lina Mansour.', leadId: 'LD-0842', issue: 'Possible duplicate of LD-0842' },
];

function events() {
  const ing = store.s.ingestion;
  if (!ing.events.some((e) => e.id === 'EVT-1198')) ing.events.push(...EXTRA.map((e) => ({ ...e })));
  return ing.events;
}
const STATUS_TONE = { Processed: '', Failed: 'gray', 'Needs review': 'gray', Skipped: 'gray', Corrected: '' };
const dotBadge = (st) => statusBadge(st, { tone: STATUS_TONE[st] ?? '', dot: true, pill: true });
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function detail(e) {
  if (!e) return `<div class="card card-pad"><p class="muted">Select an event to see its details.</p></div>`;
  const lead = e.leadId ? store.s.leads.find((l) => l.id === e.leadId) : null;
  if (e.status === 'Failed') {
    const v = ui.fix[e.id] ?? e.submittedEmail ?? '';
    const isEmail = /email/i.test(e.issue);
    return `<div class="card card-pad">
      <h2>Import row needs correction</h2>
      <div class="row mt8"><span class="strong" style="font-size:17px">${e.id}</span>${dotBadge('Failed')}</div>
      <div class="kv mt12">
        <span class="k">File</span><span class="v">${esc(e.file)}</span><span class="k">Row</span><span class="v">${e.row}</span>
        <span class="k">Issue</span><span class="v">${esc(e.issue)}</span><span class="k">Submitted name</span><span class="v">${esc(e.submittedName)}</span>
        <span class="k">Submitted email</span><span class="v">${esc(e.submittedEmail)}</span><span class="k">Outcome</span><span class="v">No lead created.</span>
      </div>
      <div class="callout mt16">${icon('info', 18)}<span>Original row preserved. Correct the ${isEmail ? 'email' : 'value'} before retrying.</span></div>
      <div class="field mt12"><label>${isEmail ? 'Corrected email' : 'Corrected phone'}</label><input class="input ${v && isEmail && !validEmail(v) ? 'error' : ''}" id="fix-input" data-input="fix" value="${esc(v)}" ${isEmail ? '' : 'placeholder="+966 5X XXX XXXX"'}></div>
      <div class="row wrap mt12">
        <button class="btn primary" data-action="retry" ${(isEmail ? validEmail(v) : v.replace(/\D/g, '').length >= 9) ? '' : 'disabled'}>Correct &amp; retry</button>
        <button class="btn" data-action="download">${icon('download', 16)} Download row</button>
        <button class="btn" data-action="skip">${icon('skip', 16)} Skip row</button>
      </div></div>`;
  }
  if (e.status === 'Needs review') {
    return `<div class="card card-pad"><h2>Record needs review</h2><div class="row mt8"><span class="strong" style="font-size:17px">${e.id}</span>${dotBadge('Needs review')}</div>
      <div class="kv mt12"><span class="k">Source</span><span class="v">${esc(e.source)}</span><span class="k">Received</span><span class="v">${esc(e.time)} (Riyadh)</span><span class="k">Issue</span><span class="v">${esc(e.issue)}</span>${lead ? `<span class="k">Matching lead</span><span class="v"><a href="#/demo/leads/${lead.id}">${esc(lead.name)} · ${lead.id}</a></span>` : ''}</div>
      <div class="callout mt16">${icon('info', 18)}<span>The incoming record is held until someone decides. Nothing is overwritten automatically.</span></div>
      <div class="row wrap mt12">${lead ? '<a class="btn primary" href="#/demo/settings/duplicates">Open Duplicate Review</a>' : ''}<button class="btn ${lead ? '' : 'primary'}" data-action="approve">${icon('check', 16)} Accept record</button><button class="btn" data-action="skip">${icon('skip', 16)} Skip</button></div></div>`;
  }
  return `<div class="card card-pad"><h2>Event details</h2><div class="row mt8"><span class="strong" style="font-size:17px">${e.id}</span>${dotBadge(e.status)}</div>
    <div class="kv mt12"><span class="k">Source</span><span class="v">${esc(e.source)}</span><span class="k">Received</span><span class="v">${esc(e.time)} (Riyadh)</span><span class="k">Result</span><span class="v">${esc(e.result)}</span></div>
    ${lead ? `<a class="btn mt16" href="#/demo/leads/${lead.id}">${icon('external', 16)} Open ${esc(lead.name)}</a>` : ''}</div>`;
}

export default {
  title: 'Ingestion Monitor',
  render() {
    const ing = store.s.ingestion;
    const all = events();
    const q = ui.q.toLowerCase();
    let rows = all.filter((e) => (!q || [e.id, e.source, e.result, e.submittedName].join(' ').toLowerCase().includes(q)) && (!ui.source || e.source === ui.source) && (!ui.status || e.status === ui.status));
    if (ui.tab === 'review') rows = rows.filter((e) => e.status === 'Failed' || e.status === 'Needs review');
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    if (ui.page > pages) ui.page = pages;
    const view = rows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
    const open = all.filter((e) => e.status === 'Failed' || e.status === 'Needs review').length;
    const sel = all.find((e) => e.id === ui.sel);
    const sources = [...new Set(all.map((e) => e.source))];
    const table = ui.tab === 'imports'
      ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Import</th><th>File</th><th class="c">Rows</th><th class="c">Created</th><th class="c">Updated</th><th class="c">Review</th><th class="c">Failed</th><th>By</th><th>When</th></tr></thead><tbody>
          ${ing.imports.map((m) => `<tr><td class="muted">${m.id}</td><td class="strong" style="font-weight:500">${icon('file', 15)} ${esc(m.file)}</td><td class="c">${m.rows}</td><td class="c">${m.created}</td><td class="c">${m.updated}</td><td class="c">${m.review}</td><td class="c">${m.failed}</td><td>${esc(m.by)}</td><td class="muted">${esc(m.at)}</td></tr>`).join('')}
        </tbody></table></div><button class="btn mt12" data-action="import">${icon('upload', 16)} Import CSV</button>`
      : `<div class="split" style="--cols:minmax(0,1fr) 420px">
        <div><div class="table-wrap"><table class="tbl"><thead><tr><th class="w-check"></th><th>Event</th><th>Source</th><th>Time (Riyadh)</th><th>Status</th><th>Result</th></tr></thead><tbody>
          ${view.map((e) => `<tr class="clickable ${e.id === ui.sel ? 'selected' : ''}" data-action="sel" data-id="${e.id}"><td><input type="checkbox" class="check" ${e.id === ui.sel ? 'checked' : ''} aria-label="Select ${e.id}"></td>
            <td class="strong" style="font-weight:500">${e.id}</td><td><span class="owner">${sourceIcon(e.source, 18)} ${esc(e.source)}</span></td><td>${esc(e.time)}</td><td>${dotBadge(e.status)}</td><td class="muted">${esc(e.result)}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No events match.</div></td></tr>'}
        </tbody></table></div>
        <div class="table-foot"><span class="muted">Showing ${view.length} of ${ui.tab === 'review' ? rows.length : ing.stats.incoming} incoming records</span>${pager(ui.page, pages)}</div></div>
        <div>${detail(sel)}</div></div>`;
    return `
    ${leadSettingsTabs('ingestion')}
    ${pageHead({ crumbs: leadSettingsCrumbs('Ingestion Monitor'), title: 'Ingestion Monitor', sub: `All sources · ${ui.period}`, actions: `<a class="btn" href="#/demo/settings/integrations">${icon('layers', 16)} Source connections</a>` })}
    <div class="grid g4">
      ${stat({ icon: 'file', label: 'Incoming records', value: ing.stats.incoming })}
      ${stat({ icon: 'settings', label: 'Processed', value: ing.stats.processed })}
      ${stat({ icon: 'clock', label: 'Needs review', value: ing.stats.review, action: 'go-review' })}
      ${stat({ icon: 'alert', label: 'Failed', value: ing.stats.failed, action: 'go-review' })}
    </div>
    <p class="muted small mt8">Processed records include new leads and updates.</p>
    <div class="mt12">${tabs([['events', 'Events'], ['imports', 'Imports'], ['review', `Failed & Review (${open})`]], ui.tab)}</div>
    ${ui.tab !== 'imports' ? `<div class="filters">
      ${searchInput('Search by event ID, name or source...', ui.q, 'data-input="q" id="ing-q"')}
      ${select([['', 'Source'], ...sources], ui.source, 'data-change="source" aria-label="Source"')}
      ${select([['', 'Status'], 'Processed', 'Needs review', 'Failed', 'Skipped'], ui.status, 'data-change="status" aria-label="Status"')}
      ${select(['Oct 29, 2026', 'Oct 28, 2026', 'Last 7 days'], ui.period, 'data-change="period" aria-label="Period"')}
    </div>` : ''}
    ${table}`;
  },
  mount(root, ctx) {
    const setEv = (fn) => store.update((s) => fn(s.ingestion.events.find((x) => x.id === ui.sel), s.ingestion.stats));
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ui.page = 1; ctx.rerender(); },
        'go-review': () => { ui.tab = 'review'; ui.page = 1; ctx.rerender(); },
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        sel: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        retry: () => {
          const v = ui.fix[ui.sel];
          setEv((e, st) => { e.status = 'Processed'; e.result = `${e.submittedName} · Corrected and retried.`; if (/email/i.test(e.issue)) e.submittedEmail = v; st.failed = Math.max(0, st.failed - 1); st.processed += 1; });
          toast('Row corrected and retried', 'Simulated — the demo does not create a real lead.'); ctx.rerender();
        },
        download: () => { const e = store.s.ingestion.events.find((x) => x.id === ui.sel); toast(`Row ${e.row} prepared for download`, 'Demo simulation — no file was saved.'); },
        skip: () => { setEv((e, st) => { if (e.status === 'Failed') st.failed = Math.max(0, st.failed - 1); else st.review = Math.max(0, st.review - 1); e.status = 'Skipped'; e.result = 'Skipped by reviewer.'; }); toast(`${ui.sel} skipped`, 'Original row kept in the import log.'); ctx.rerender(); },
        approve: () => { setEv((e, st) => { e.status = 'Processed'; e.result = 'Accepted by reviewer.'; st.review = Math.max(0, st.review - 1); st.processed += 1; }); toast(`${ui.sel} accepted`, 'Saved in this demo session.'); ctx.rerender(); },
        import: () => modal({ title: 'Import CSV', body: `<div class="card card-pad" style="border-style:dashed;text-align:center">${icon('fileUp', 30)}<div class="strong mt8">Drop a CSV file here</div><div class="muted small">Rows are validated, deduplicated and logged here.</div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Simulate import', cls: 'primary', value: 1 }] })
          .then(({ value }) => { if (!value) return; store.update((s) => s.ingestion.imports.unshift({ id: `IMP-${32 + s.ingestion.imports.length}`, file: 'demo-upload.csv', rows: 20, created: 18, updated: 2, review: 0, failed: 0, by: s.me.name, at: 'Oct 29, 2026 · Now' })); toast('Import simulated · 20 rows', 'No real leads were created.'); ctx.rerender(); }),
      },
      change: {
        source: (el) => { ui.source = el.value; ui.page = 1; ctx.rerender(); },
        status: (el) => { ui.status = el.value; ui.page = 1; ctx.rerender(); },
        period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo events are fixed sample values.'); ctx.rerender(); },
      },
      input: {
        q: (el) => { ui.q = el.value; ui.page = 1; keepFocus('#ing-q', ctx.rerender); },
        fix: (el) => { ui.fix[ui.sel] = el.value; keepFocus('#fix-input', ctx.rerender); },
      },
    });
  },
};
