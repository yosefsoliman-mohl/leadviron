// 11 · Enrichment Operations — what each enrichment run added, from which provider, with confidence and cost.
import { icon, esc, avatar, dots, bar, pageHead, tabs, select, searchInput, pager, statusBadge, on, toast, modal, keepFocus } from '../ui.js';
import { store, leadById, fieldValue, ENRICH_FIELDS, FIELD_LABELS, cohortCounts } from '../store.js';

const ui = { tab: 'completed', q: '', sel: 'LD-1048', page: 1, per: 6, _tabQ: null };
let timer = null;
// One example of each outcome first: complete, partial and no external match.
const FEATURED = ['LD-0731', 'LD-0842', 'LD-0915', 'LD-1048', 'LD-1052', 'LD-0912'];

const provider = (l, i) => (['LD-0915', 'LD-1052'].includes(l.id) || (i % 3 === 2 && !l.id.startsWith('LD-0') && !l.id.startsWith('LD-10')) ? 'Demo Provider B' : 'Demo Provider A');
const resultLabel = (l) => (l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No external match');
const confidence = (l) => (l.enrich === 'complete' ? 97 : l.enrich === 'partial' ? 94 : null);

// Partial matches with a lower provider confidence, held for a human check.
function attention() {
  const done = store.s.enrichReviewed || [];
  return store.s.leads.filter((l) => l.enrich === 'partial').slice(0, 8).filter((l) => !done.includes(l.id)).map((l, i) => ({ l, conf: 68 + ((i * 5) % 14), issue: i % 2 ? 'Company name differs from email domain' : 'Low-confidence job title match' }));
}

function detail(l) {
  if (!l) return '';
  const pc = Math.round((l.found / 6) * 100);
  return `<div class="card card-pad">
    <div class="row between"><h2 style="font-size:22px"><a href="#/demo/leads/${l.id}" style="color:inherit">${esc(l.name)}</a></h2><button class="icon-btn" data-action="close" aria-label="Close details">${icon('x', 18)}</button></div>
    <div class="muted">${pc}% coverage · ${l.found}/6 fields</div>
    <div class="stack sm mt12">${ENRICH_FIELDS.map((f) => { const v = fieldValue(l, f); return `<div class="row" style="gap:10px"><span style="width:110px" class="small">${FIELD_LABELS[f]}</span><span class="grow small ${v ? 'strong' : 'muted'}" style="font-weight:500">${v ? esc(f === 'linkedin' ? 'Profile found' : v) : 'Not found'}</span>${v ? `<span class="blue">${icon('checkCircle', 18)}</span> <span class="badge gray" style="width:76px">Found</span>` : `<span class="muted">${icon('minusCircle', 18)}</span> <span class="badge gray" style="width:76px">Not found</span>`}</div>`; }).join('')}</div>
    <div class="divider"></div>
    <div class="kv small"><span class="k">Source</span><span class="v">${provider(l, store.s.leads.indexOf(l))}</span><span class="k">Provider match confidence</span><span class="v">${confidence(l) ? `${confidence(l)}%` : '—'}</span><span class="k">Example cost</span><span class="v">1 demo credit ${icon('info', 14, 'muted')}</span></div>
    <div class="row mt16">${l.found < 6 ? `<a class="btn primary grow" href="#/demo/leads/${l.id}">Review missing fields</a>` : `<a class="btn primary grow" href="#/demo/leads/${l.id}">Open lead</a>`}<button class="btn outline grow" data-action="retry">${icon('refresh', 16)} Retry enrichment</button></div>
    <p class="muted small mt12">Original email and phone retained.</p></div>`;
}

export default {
  title: 'Enrichment Operations',
  render(ctx) {
    if (ctx.query.tab && ctx.query.tab !== ui._tabQ) { ui._tabQ = ctx.query.tab; ui.tab = ctx.query.tab; }
    const s = store.s;
    const c = cohortCounts();
    const job = s.enrichmentJobs.find((j) => j.status === 'Completed');
    const running = s.enrichmentJobs.filter((j) => j.status === 'Running');
    const att = attention();
    const q = ui.q.toLowerCase();
    const rank = (l) => { const i = FEATURED.indexOf(l.id); return i < 0 ? 99 : i; };
    const rows = s.leads.filter((l) => !q || [l.name, l.company, l.email].join(' ').toLowerCase().includes(q)).sort((a, b) => rank(a) - rank(b));
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    if (ui.page > pages) ui.page = pages;
    const view = rows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
    const sel = ui.sel ? leadById(ui.sel) : null;
    const sumCard = (ic, t, n, meta, found, badge = '') => `<div class="card stat" style="padding:14px 18px"><div class="ico">${icon(ic, 22)}</div><div class="grow"><div class="label">${t}</div><div class="row"><span class="value num" style="font-size:24px">${n}</span><span class="muted">${meta}</span></div></div><div>${badge}${dots(found, 6, 'lg')}</div></div>`;

    let body = '';
    if (ui.tab === 'running') {
      body = running.length ? running.map((j) => `<div class="card card-pad mb12"><div class="row wrap"><span class="ico-circle">${icon('refresh', 20)}</span><div class="grow"><div class="strong">${j.id} · ${esc(j.list)} · Running</div><div class="muted small">Started ${esc(j.started)} · ${esc(j.provider)}</div></div><div style="width:280px"><div class="row between small"><span>${j.processed} / ${j.total} processed</span><span>${Math.round((j.processed / j.total) * 100)}%</span></div><div class="mt8">${bar((j.processed / j.total) * 100, 'lg')}</div></div><button class="btn sm" data-action="cancel" data-id="${j.id}">Cancel</button></div></div>`).join('')
        : `<div class="card"><div class="empty">${icon('database', 32)}<div>No enrichment running right now.</div><button class="btn primary sm mt12" data-action="start">${icon('play', 14)} Start enrichment</button></div></div>`;
    } else if (ui.tab === 'attention') {
      body = `<div class="callout mb12">${icon('info', 18)}<span>${att.length} records need review. These partial matches came back with lower provider confidence. Accept to keep the values, or reject to keep only the original contact details.</span></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Lead</th><th>Issue</th><th>Confidence</th><th>Fields found</th><th class="r">Actions</th></tr></thead><tbody>
        ${att.map(({ l, conf, issue }) => `<tr><td><a class="cell-person" href="#/demo/leads/${l.id}" style="text-decoration:none">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></a></td><td>${issue}</td><td><span class="badge gray">${conf}%</span></td><td>${l.found} / 6</td>
          <td class="r nowrap"><button class="btn sm" data-action="reject" data-id="${l.id}">Reject values</button> <button class="btn sm primary" data-action="accept" data-id="${l.id}">Accept</button></td></tr>`).join('') || `<tr><td colspan="5"><div class="empty">${icon('checkCircle', 30)}<div>All flagged records reviewed.</div></div></td></tr>`}
        </tbody></table></div>`;
    } else {
      body = `
      <div class="card row wrap" style="padding:16px 20px;gap:16px"><span class="ico-circle lg">${icon('file', 24)}</span><div class="grow"><div class="strong" style="font-size:16px">${job.id} · ${esc(job.list)} · Completed</div><div class="muted">Started ${esc(job.started)} · Completed ${esc(job.completed)}</div></div>
        <div style="width:300px"><div class="row between"><span>${job.processed} / ${job.total} processed</span><span class="muted">100%</span></div><div class="mt8">${bar(100, 'lg')}</div></div></div>
      <div class="grid g3 mt16">
        ${sumCard('users', 'Complete', c.complete, '100% · 6/6 fields', 6)}
        ${sumCard('halfCircle', 'Partial', c.partial, '50% · 3/6 fields', 3)}
        ${sumCard('dashedCircle', 'No external match', c.nomatch, '0% · 0/6 fields', 0)}
      </div>
      <div class="split mt16" style="${sel ? '' : 'grid-template-columns:1fr'}">
        <div>
          ${searchInput('Search by name, company or email...', ui.q, 'data-input="q" id="enr-q"')}
          <div class="table-wrap mt12"><table class="tbl nowrap-cells"><thead><tr><th class="w-check"></th><th>Lead</th><th>Provider</th><th>Fields found</th><th>Processing</th><th>Result</th><th class="c">Demo credits</th></tr></thead><tbody>
            ${view.map((l) => `<tr class="clickable ${l.id === ui.sel ? 'selected' : ''}" data-action="sel" data-id="${l.id}"><td><input type="checkbox" class="check" ${l.id === ui.sel ? 'checked' : ''} aria-label="Select ${esc(l.name)}"></td>
              <td><div class="cell-person">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td>
              <td>${provider(l, s.leads.indexOf(l))}</td><td class="num">${l.found} / 6</td><td>${statusBadge('Completed')}</td><td>${statusBadge(resultLabel(l), { tone: l.enrich === 'nomatch' ? 'gray' : '' })}</td><td class="c">1</td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">No leads match.</div></td></tr>'}
          </tbody></table></div>
          <div class="table-foot"><span class="muted">Showing ${rows.length ? (ui.page - 1) * ui.per + 1 : 0}–${Math.min(ui.page * ui.per, rows.length)} of ${rows.length}</span><span style="margin-left:auto"></span>${select([[6, '6 per page'], [12, '12 per page'], [25, '25 per page']], ui.per, 'data-change="per" aria-label="Rows per page"', 'sm')}${pager(ui.page, pages)}</div>
        </div>
        ${sel ? `<div>${detail(sel)}</div>` : ''}
      </div>`;
    }
    return `
    ${pageHead({ title: 'Enrichment Operations', sub: 'KSA Business Prospects · 120 people', actions: `<button class="btn primary" data-action="start">${icon('play', 17)} Start enrichment</button>` })}
    ${tabs([['running', 'Running', running.length || null], ['completed', 'Completed'], ['attention', 'Needs attention', att.length || null]], ui.tab)}
    ${body}`;
  },
  mount(root, ctx) {
    clearInterval(timer);
    // Advance any running demo job; stops once the page is gone or the job finishes.
    if (store.s.enrichmentJobs.some((j) => j.status === 'Running')) {
      timer = setInterval(() => {
        if (!document.body.contains(document.getElementById('page')) || !location.hash.includes('/intelligence/enrichment')) { clearInterval(timer); return; }
        let finished = null;
        store.update((s) => s.enrichmentJobs.forEach((j) => {
          if (j.status !== 'Running') return;
          j.processed = Math.min(j.total, j.processed + Math.ceil(j.total / 8));
          if (j.processed >= j.total) { j.status = 'Done'; finished = j; }
        }));
        if (finished) { clearInterval(timer); toast(`${finished.id} finished`, 'Demo results — no paid lookups were made.'); }
        if (ui.tab === 'running') ctx.rerender();
      }, 900);
    }
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        sel: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        close: () => { ui.sel = null; ctx.rerender(); },
        retry: () => toast(`Retry simulated for ${leadById(ui.sel).name}`, 'No paid lookup was made. Demo results unchanged.'),
        cancel: (el) => { store.update((s) => { const j = s.enrichmentJobs.find((x) => x.id === el.dataset.id); j.status = 'Cancelled'; }); toast(`${el.dataset.id} cancelled`, 'Processed records keep their results.'); ctx.rerender(); },
        accept: (el) => { store.update((s) => { s.enrichReviewed = [...(s.enrichReviewed || []), el.dataset.id]; }); toast('Enrichment values accepted', 'Saved in this demo session.'); ctx.rerender(); },
        reject: (el) => { store.update((s) => { s.enrichReviewed = [...(s.enrichReviewed || []), el.dataset.id]; }); toast('Values rejected', 'Original contact details kept. Demo session only.'); ctx.rerender(); },
        start: () => modal({
          title: 'Start enrichment',
          body: `<div class="stack"><div class="field"><label>Audience</label>${select(store.s.lists.map((l) => [l.id, `${l.name} (${l.people})`]), 'lst-partial', 'name="list"')}</div>
            <div class="form-grid"><div class="field"><label>Primary provider</label>${select(['Demo Enrichment A', 'Demo Enrichment B'], 'Demo Enrichment A', 'name="prov"')}</div><div class="field"><label>Fallback provider</label>${select(['Demo Enrichment B', 'None'], 'Demo Enrichment B', 'name="fb"')}</div></div>
            <label class="row"><input type="checkbox" class="check" name="empty" checked> Fill empty fields only</label>
            <label class="row"><input type="checkbox" class="check" name="keep" checked disabled> Preserve submitted contact details</label>
            <div class="callout">${icon('info', 18)}<span>Demo run: results come from sample data, no external provider is called and no credits are spent. Completeness is never guaranteed.</span></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Start enrichment', cls: 'primary', value: 1 }],
        }).then(({ value, form }) => {
          if (!value) return;
          const list = store.s.lists.find((l) => l.id === form.list);
          store.update((s) => s.enrichmentJobs.push({ id: `ENR-${1024 + s.enrichmentJobs.length}`, list: list.name, status: 'Running', started: 'Oct 29, 2026, Now', provider: form.prov, processed: 0, total: list.people }));
          ui.tab = 'running'; toast(`Enrichment started for ${list.name}`, 'Simulated run with demo data.'); ctx.rerender();
        }),
      },
      change: { per: (el) => { ui.per = +el.value; ui.page = 1; ctx.rerender(); } },
      input: { q: (el) => { ui.q = el.value; ui.page = 1; keepFocus('#enr-q', ctx.rerender); } },
    });
  },
};
