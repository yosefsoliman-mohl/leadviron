// 11 · Enrichment Operations — what each enrichment run added, from which provider, with confidence and cost.
import { icon, esc, avatar, dots, bar, pageHead, tabs, select, searchInput, pager, statusBadge, toggle, on, toast, modal, confirm, keepFocus } from '../ui.js';
import { store, leadById, fieldValue, ENRICH_FIELDS, FIELD_LABELS, cohortCounts } from '../store.js';
import { sortTh, nextSort, sortBy } from '../table-sort.js';
import { allFields, enabledFields, costPerLead, fieldState, GROUPS, FIELD_TYPES, FIELD_SOURCES } from '../enrich-fields.js';

const ui = { tab: 'completed', q: '', sel: 'LD-1048', page: 1, per: 6, _tabQ: null, fq: '', fgroup: '', sort: { key: null, dir: 0 } };
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

// Fields tab: six core fields that drive coverage, plus additional and custom fields that can be switched on/off.
function fieldsTab() {
  const q = ui.fq.trim().toLowerCase();
  const fields = allFields().filter((f) => (!ui.fgroup || f.group === ui.fgroup) && (!q || `${f.label} ${f.desc || ''}`.toLowerCase().includes(q)));
  const on = enabledFields();
  const groups = GROUPS.filter((g) => fields.some((f) => f.group === g) || (g === 'Custom fields' && (!ui.fgroup || ui.fgroup === g) && !q));
  const row = (f) => `<div class="ef-row ${f.enabled ? 'on' : ''}">
      <div class="grow" style="min-width:0"><div class="row" style="gap:8px;flex-wrap:wrap"><span class="strong" style="font-weight:600">${esc(f.label)}</span><span class="badge gray">${esc(f.type)}</span>${f.custom ? '<span class="badge outline">Custom</span>' : ''}</div>
        <div class="muted small mt4">${esc(f.desc || f.instructions || '')}</div>
        <div class="tiny muted mt4">${icon('database', 12)} ${esc(f.source)} · ${f.credits ? `+${f.credits} credit${f.credits === 1 ? '' : 's'}` : 'Free'}</div></div>
      ${f.custom ? `<button class="icon-btn" data-action="edit-field" data-key="${f.key}" aria-label="Edit ${esc(f.label)}">${icon('edit', 16)}</button><button class="icon-btn" data-action="del-field" data-key="${f.key}" aria-label="Delete ${esc(f.label)}">${icon('trash', 16)}</button>` : ''}
      ${toggle(f.enabled, `data-change="field-on" data-key="${f.key}" data-custom="${f.custom ? 1 : ''}" aria-label="Enrich ${esc(f.label)}"`)}
    </div>`;
  return `
    <div class="grid g3">
      <div class="card card-pad"><div class="muted small">Core target fields</div><div class="strong" style="font-size:24px">6 <span class="muted" style="font-size:14px;font-weight:500">always on</span></div><div class="tiny muted mt4">Used for coverage: Complete / Partial / No match</div></div>
      <div class="card card-pad"><div class="muted small">Additional fields on</div><div class="strong" style="font-size:24px;color:var(--blue-600)">${on.length}</div><div class="tiny muted mt4">${allFields().length} available · ${fieldState().custom.length} custom</div></div>
      <div class="card card-pad"><div class="muted small">Estimated cost per lead</div><div class="strong" style="font-size:24px">${costPerLead().toFixed(1)} <span class="muted" style="font-size:14px;font-weight:500">demo credits</span></div><div class="tiny muted mt4">1 credit core lookup + additional fields</div></div>
    </div>
    <div class="card card-pad mt16"><div class="row wrap" style="gap:8px"><span class="strong">Core fields</span><span class="muted small">— always enriched</span></div>
      <div class="row wrap mt8" style="gap:8px">${ENRICH_FIELDS.map((k) => `<span class="chip">${icon('lock', 13)} ${FIELD_LABELS[k]}</span>`).join('')}</div></div>
    <div class="filters mt16">
      ${searchInput('Search fields…', ui.fq, 'data-input="fq" id="ef-q"')}
      ${select([['', 'All groups'], ...GROUPS], ui.fgroup, 'data-change="fgroup" aria-label="Group"')}
      <button class="btn primary" data-action="add-field">${icon('plus', 17)} Add custom field</button>
    </div>
    <div class="ef-grid">
      ${groups.map((g) => {
        const list = fields.filter((f) => f.group === g);
        const allOn = list.length && list.every((f) => f.enabled);
        return `<div class="card"><div class="card-head"><h3>${g}</h3>${list.length ? `<button class="link-btn small" data-action="group-all" data-group="${g}" data-on="${allOn ? '' : 1}">${allOn ? 'Turn all off' : 'Turn all on'}</button>` : ''}</div>
          <div class="card-body" style="padding-top:0">${list.map(row).join('') || `<div class="empty" style="padding:20px">${icon('plus', 24)}<div>No custom fields yet.</div><button class="btn sm mt8" data-action="add-field">Add custom field</button></div>`}</div></div>`;
      }).join('') || `<div class="card"><div class="empty">No fields match “${esc(ui.fq)}”.</div></div>`}
    </div>
    <div class="callout mt16">${icon('info', 18)}<span>Additional fields are looked up on the next enrichment run and shown on each lead’s Enrichment tab. They don’t change coverage, qualification or contact permission. Average salary is a market benchmark for the role, not the person’s pay.</span></div>`;
}

function fieldModal(f = {}) {
  return modal({
    title: f.key ? `Edit ${f.label}` : 'Add custom field',
    body: `<div class="stack">
      <div class="field"><label>Field name *</label><input class="input" name="label" value="${esc(f.label || '')}" placeholder="e.g. Instagram followers, Fleet size, Branch count"></div>
      <div class="form-grid">
        <div class="field"><label>Type</label>${select(FIELD_TYPES, f.type || 'Text', 'name="type"')}</div>
        <div class="field"><label>Source</label>${select(FIELD_SOURCES, f.source || 'AI web research', 'name="source"')}</div>
      </div>
      <div class="field"><label>What to look for</label><textarea class="textarea" name="instructions" style="min-height:80px" placeholder="e.g. Number of vehicles the company operates in KSA">${esc(f.instructions || '')}</textarea></div>
      <label class="row"><input type="checkbox" class="check" name="enabled" ${f.enabled === false ? '' : 'checked'}> Enrich this field on the next run</label>
      <p class="muted small">Custom fields are added to every lead’s Enrichment tab. Manual entry fields are filled by your team.</p></div>`,
    buttons: [{ label: 'Cancel', value: null }, { label: f.key ? 'Save field' : 'Add field', cls: 'primary', value: 1 }],
  });
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

function setEnabled(keys, value, custom) {
  store.update((s) => {
    if (custom) s.enrichCustom.forEach((c) => { if (keys.includes(c.key)) c.enabled = value; });
    else { s.enrichFieldsOn = { ...fieldState().on }; keys.forEach((k) => { s.enrichFieldsOn[k] = value; }); }
  });
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
    const sortedRows = sortBy(rows, ui.sort, { name: (l) => l.name, provider: (l) => provider(l, s.leads.indexOf(l)), found: (l) => l.found, result: (l) => resultLabel(l) });
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    if (ui.page > pages) ui.page = pages;
    const view = sortedRows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
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
    } else if (ui.tab === 'fields') {
      body = fieldsTab();
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
          <div class="table-wrap mt12"><table class="tbl nowrap-cells"><thead><tr><th class="w-check"></th>${sortTh('Lead', 'name', ui.sort)}${sortTh('Provider', 'provider', ui.sort)}${sortTh('Fields found', 'found', ui.sort)}<th>Processing</th>${sortTh('Result', 'result', ui.sort)}<th class="c">Demo credits</th></tr></thead><tbody>
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
    ${tabs([['running', 'Running', running.length || null], ['completed', 'Completed'], ['attention', 'Needs attention', att.length || null], ['fields', 'Enrichment fields', 6 + enabledFields().length]], ui.tab)}
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
        sort: (el) => { ui.sort = nextSort(ui.sort, el.dataset.key); ui.page = 1; ctx.rerender(); },
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        sel: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        close: () => { ui.sel = null; ctx.rerender(); },
        retry: () => toast(`Retry simulated for ${leadById(ui.sel).name}`, 'No paid lookup was made. Demo results unchanged.'),
        cancel: (el) => { store.update((s) => { const j = s.enrichmentJobs.find((x) => x.id === el.dataset.id); j.status = 'Cancelled'; }); toast(`${el.dataset.id} cancelled`, 'Processed records keep their results.'); ctx.rerender(); },
        accept: (el) => { store.update((s) => { s.enrichReviewed = [...(s.enrichReviewed || []), el.dataset.id]; }); toast('Enrichment values accepted', 'Saved in this demo session.'); ctx.rerender(); },
        reject: (el) => { store.update((s) => { s.enrichReviewed = [...(s.enrichReviewed || []), el.dataset.id]; }); toast('Values rejected', 'Original contact details kept. Demo session only.'); ctx.rerender(); },
        'group-all': (el) => {
          const list = allFields().filter((f) => f.group === el.dataset.group);
          setEnabled(list.filter((f) => !f.custom).map((f) => f.key), !!el.dataset.on, false);
          setEnabled(list.filter((f) => f.custom).map((f) => f.key), !!el.dataset.on, true);
          ctx.rerender();
        },
        'add-field': () => fieldModal().then(({ value, form }) => {
          if (!value) return;
          if (!form.label.trim()) { toast('Field not added', 'A field name is required.'); return; }
          const key = `c_${Date.now().toString(36)}`;
          store.update((s) => { s.enrichCustom = [...(s.enrichCustom || []), { key, label: form.label.trim(), type: form.type, source: form.source, instructions: form.instructions.trim(), credits: form.source === 'Manual entry' ? 0 : 1, enabled: form.enabled }]; });
          ui.fgroup = ''; ui.fq = '';
          toast(`Custom field “${form.label.trim()}” added`, 'Shown on every lead’s Enrichment tab. Demo session only.');
          ctx.rerender();
        }),
        'edit-field': (el) => {
          const f = fieldState().custom.find((x) => x.key === el.dataset.key);
          fieldModal(f).then(({ value, form }) => {
            if (!value) return;
            store.update((s) => { const x = s.enrichCustom.find((c) => c.key === f.key); Object.assign(x, { label: form.label.trim() || x.label, type: form.type, source: form.source, instructions: form.instructions.trim(), credits: form.source === 'Manual entry' ? 0 : 1, enabled: form.enabled }); });
            toast('Field updated', 'Saved in this demo session.'); ctx.rerender();
          });
        },
        'del-field': (el) => {
          const f = fieldState().custom.find((x) => x.key === el.dataset.key);
          confirm('Delete custom field?', `“${esc(f.label)}” and its demo values will be removed from all leads.`, 'Delete field').then((ok) => {
            if (!ok) return;
            store.update((s) => { s.enrichCustom = s.enrichCustom.filter((c) => c.key !== f.key); });
            toast('Custom field deleted', 'Demo session only.'); ctx.rerender();
          });
        },
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
      change: {
        per: (el) => { ui.per = +el.value; ui.page = 1; ctx.rerender(); },
        fgroup: (el) => { ui.fgroup = el.value; ctx.rerender(); },
        'field-on': (el) => {
          const { key } = el.dataset;
          setEnabled([key], el.checked, !!el.dataset.custom);
          const f = allFields().find((x) => x.key === key);
          toast(`${f.label} ${el.checked ? 'on' : 'off'}`, `Applies to the next enrichment run. Est. ${costPerLead().toFixed(1)} credits per lead.`);
          ctx.rerender();
        },
      },
      input: {
        q: (el) => { ui.q = el.value; ui.page = 1; keepFocus('#enr-q', ctx.rerender); },
        fq: (el) => { ui.fq = el.value; keepFocus('#ef-q', ctx.rerender); },
      },
    });
  },
};
