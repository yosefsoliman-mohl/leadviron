// 19 · All Workflows — automations with triggers, status, published vs draft versions and runs.
import { icon, esc, pageHead, select, searchInput, pager, statusBadge, on, toast, modal, confirm, keepFocus } from '../ui.js';
import { store, cohortCounts, OWNERS } from '../store.js';

const ui = { q: '', status: '', trigger: '', owner: '', sel: 'wf-enrich' };

function filtered() {
  const q = ui.q.toLowerCase();
  return store.s.workflows.filter((w) => (!ui.status || w.status === ui.status) && (!ui.trigger || w.trigger === ui.trigger) && (!ui.owner || w.owner === ui.owner) &&
    (!q || w.name.toLowerCase().includes(q) || w.trigger.toLowerCase().includes(q)));
}

export default {
  title: 'Workflows',
  render() {
    const s = store.s;
    const rows = filtered();
    const w = s.workflows.find((x) => x.id === ui.sel);
    const c = cohortCounts();
    const email = s.integrations.find((i) => i.id === 'email');
    return `
    ${pageHead({ title: 'Workflows', sub: 'Automate lead processing and follow-up', actions: `<button class="btn primary" data-action="create">${icon('plus', 18)} Create workflow</button>` })}
    ${email.status !== 'Connected' ? `<div class="callout mb16" style="align-items:center;padding:14px 18px"><span class="ico-circle" style="background:var(--blue-600);color:#fff">${icon('info', 20)}</span><div class="grow"><div class="strong" style="color:var(--blue-700)">1 workflow needs attention</div><div class="small">Email sending connector requires review.</div></div><a class="strong" href="#/demo/workflows/runs/RUN-1050">Review ${icon('arrowRight', 15)}</a></div>` : ''}
    <div class="filters">
      ${searchInput('Search workflows by name or trigger...', ui.q, 'data-input="q" id="wf-q"')}
      ${select([['', 'All statuses'], 'Active', 'Paused', 'Draft'], ui.status, 'data-change="status" aria-label="Status"')}
      ${select([['', 'Trigger'], ...new Set(s.workflows.map((x) => x.trigger))], ui.trigger, 'data-change="trigger" aria-label="Trigger"')}
      ${select([['', 'Owner'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
    </div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th class="w-check"></th><th>Workflow</th><th>Trigger</th><th>Status</th><th>Published version</th><th>Runs</th><th>Last activity</th><th>Actions</th></tr></thead>
      <tbody>${rows.map((x) => `<tr class="clickable ${x.id === ui.sel ? 'selected' : ''}" data-action="select" data-id="${x.id}">
        <td><input type="checkbox" class="check" data-change="pick" data-id="${x.id}" ${x.id === ui.sel ? 'checked' : ''} aria-label="Select ${esc(x.name)}"></td>
        <td><div class="row"><span class="ico-circle sm">${icon(x.icon, 16)}</span><span class="strong" style="font-weight:500">${esc(x.name)}</span></div></td>
        <td class="muted">${esc(x.trigger)}</td>
        <td>${statusBadge(x.status, { dot: true, pill: true })}</td>
        <td>${x.published ? (x.draft ? `<span class="badge">${x.published}</span> <span class="badge">Draft ${x.draft}</span>` : x.published) : '<span class="muted">Not published</span>'}</td>
        <td class="num">${x.runs || '—'}</td>
        <td class="muted">${esc(x.last)}</td>
        <td><div class="row" style="gap:6px"><a class="btn sm" href="#/demo/workflows/${x.id}/builder" style="min-width:72px">${x.status === 'Draft' ? 'Edit' : 'Open'}</a><button class="btn sm" data-action="menu" data-id="${x.id}" aria-label="More actions">${icon('more', 16)}</button></div></td></tr>`).join('') || `<tr><td colspan="8"><div class="empty">No workflows match.</div></td></tr>`}</tbody>
    </table></div>
    <div class="table-foot"><span class="muted">Showing 1–${rows.length} of ${s.workflows.length} workflows</span>${select([[10, '10 per page']], 10, 'aria-label="Rows per page"', 'sm')}${pager(1, 1)}</div>
    ${w ? `<div class="card card-pad mt8"><div class="row wrap" style="gap:24px;align-items:stretch">
      <div class="row" style="align-items:flex-start;min-width:280px"><span class="ico-circle lg">${icon(w.icon, 26)}</span><div><h2>${esc(w.name)}</h2><div class="muted small">${esc(w.desc)}</div>
        <div class="row wrap mt12" style="gap:6px">${statusBadge(w.status, { dot: true, pill: true })}${w.published ? `<span class="chip gray">Published <b style="color:var(--blue-600)">${w.published}</b></span>` : ''}${w.draft ? `<span class="chip gray">Draft ${w.draft} available</span>` : ''}</div></div></div>
      <div class="vdivider"></div>
      <div class="row" style="align-items:flex-start">${icon('users', 24, 'blue')}<div><div class="small">Cohort</div><div class="value num" style="font-size:26px;font-weight:700">${w.id === 'wf-enrich' ? c.total : w.runs}</div><div class="small">people</div><div class="muted tiny mt8">${w.id === 'wf-enrich' ? 'KSA Business Prospects' : 'Workflow runs'}</div></div></div>
      <div class="vdivider"></div>
      ${w.id === 'wf-enrich' ? `<div class="row grow" style="align-items:flex-start">${icon('halfCircle', 24, 'blue')}<div class="grow"><div class="small">Enrichment coverage</div><div class="row mt8" style="gap:26px;align-items:flex-start">
        <div><b style="font-size:22px">${c.complete}</b><div class="small">Complete</div><div class="muted tiny">100% (6/6 fields)</div></div><div><b style="font-size:22px">${c.partial}</b><div class="small">Partial</div><div class="muted tiny">50% (3/6 fields)</div></div><div><b style="font-size:22px">${c.nomatch}</b><div class="small">No external match</div><div class="muted tiny">0% (0/6 fields)</div></div></div></div></div>` : `<div class="grow small"><div class="muted">Trigger</div><div class="strong">${esc(w.trigger)}</div><div class="muted mt8">Owner</div><div>${esc(w.owner)}</div></div>`}
      <div class="stack sm" style="justify-content:center;min-width:170px"><a class="btn primary" href="#/demo/workflows/${w.id}/builder">Open builder</a><a class="btn" href="#/demo/workflows/history?wf=${w.id}">View executions</a></div>
    </div></div>` : ''}`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(document, '#wf-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; re(); };
    const act = {
      duplicate: (w) => { const id = `wf-${Date.now().toString(36)}`; store.update((s) => s.workflows.push({ ...w, id, name: `${w.name} (copy)`, status: 'Draft', published: null, draft: 'v0.1', runs: 0, last: 'Just now' })); ui.sel = id; toast('Workflow duplicated', 'Saved as a draft. The published version is unchanged.'); re(); },
      pause: (w) => confirm('Pause workflow?', 'New runs stop starting. Runs already waiting keep their state until you resume.', 'Pause workflow').then((ok) => { if (!ok) return; store.update((s) => { s.workflows.find((x) => x.id === w.id).status = 'Paused'; }); toast(`${w.name} paused`, 'Demo simulation — no live automation was changed.'); re(); }),
      activate: (w) => { if (!w.published) { toast('Publish the workflow first', 'Drafts cannot run until a version is published.'); return; } store.update((s) => { s.workflows.find((x) => x.id === w.id).status = 'Active'; }); toast(`${w.name} activated`, 'Runs the published version only.'); re(); },
    };
    on(root, {
      click: {
        select: (el, e) => { if (e.target.closest('a, button, input')) return; ui.sel = el.dataset.id; re(); },
        menu: (el) => {
          const w = store.s.workflows.find((x) => x.id === el.dataset.id);
          const btns = [{ label: 'Duplicate', value: 'duplicate' }, w.status === 'Active' ? { label: 'Pause', value: 'pause' } : { label: 'Activate', value: 'activate' }, { label: 'View executions', cls: 'primary', value: 'history' }];
          modal({ title: w.name, body: `<div class="kv"><span class="k">Trigger</span><span class="v">${esc(w.trigger)}</span><span class="k">Status</span><span class="v">${w.status}</span><span class="k">Published</span><span class="v">${w.published || 'Not published'}</span><span class="k">Draft</span><span class="v">${w.draft || '—'}</span></div>`, buttons: btns })
            .then(({ value }) => { if (value === 'history') ctx.navigate(`/demo/workflows/history?wf=${w.id}`); else if (value) act[value](w); });
        },
        create: () => modal({ title: 'Create workflow', body: `<div class="stack"><div class="field"><label>Name</label><input class="input" name="name" placeholder="e.g. Reactivate cold leads"></div><div class="field"><label>Trigger</label>${select(['Lead created', 'Lead qualified', 'Enrichment completed', 'Task due', 'Reply received'], 'Lead created', 'name="trigger"')}</div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Create & open builder', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => {
            if (!value) return;
            const id = `wf-${Date.now().toString(36)}`;
            store.update((s) => s.workflows.push({ id, name: form.name.trim() || 'Untitled workflow', desc: `Starts when: ${form.trigger}.`, trigger: form.trigger, status: 'Draft', published: null, draft: 'v0.1', runs: 0, last: 'Just now', icon: 'flow', owner: 'Sara Ahmed' }));
            toast('Workflow created', 'Draft saved in this demo session.');
            ctx.navigate(`/demo/workflows/${id}/builder`);
          }),
      },
      change: { status: set('status'), trigger: set('trigger'), owner: set('owner'), pick: (el) => { ui.sel = el.checked ? el.dataset.id : null; re(); } },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
