// 10 · Prospect List Details — people in a list, their data coverage and actions that fit their data.
import { icon, esc, avatar, ring, tabs, select, searchInput, pager, statusBadge, on, toast, modal, bar, keepFocus } from '../ui.js';
import { store, enrichPct, OWNERS } from '../store.js';
import { listLeads } from './prospect-lists.js';

const ui = { listId: null, tab: 'prospects', industry: '', role: '', city: '', enrich: '', q: '', page: 1, per: 10, sel: new Set(['LD-0731', 'LD-0915']) };
const ICP = { industries: ['Logistics', 'Transport', 'Retail', 'Trading'], roles: ['Director', 'Manager', 'Head'], cities: ['Riyadh', 'Jeddah', 'Dammam'], sizes: ['51 – 200', '201 – 500', '501+'] };

const dash = '<span class="muted">—</span>';
const roleOf = (t) => (!t ? '' : /director|coo|head/i.test(t) ? 'Director' : /manager|lead/i.test(t) ? 'Manager' : 'Other');

function filtered(members) {
  const q = ui.q.toLowerCase();
  return members.filter((l) => (!ui.industry || l.industry === ui.industry) && (!ui.role || roleOf(l.title) === ui.role) && (!ui.city || l.city === ui.city) && (!ui.enrich || l.enrich === ui.enrich)
    && (!q || [l.name, l.company, l.title].join(' ').toLowerCase().includes(q)));
}

function summaryCard(n, pc, label, sub, extra = '') {
  return `<div class="card row" style="padding:14px 18px;gap:14px;min-width:180px"><span>${ring(pc, 40)}</span><div><div class="small">${label}</div><div><span class="strong" style="font-size:22px">${n}</span> <span class="blue strong">· ${pc}%</span></div><div class="muted small">${sub}</div>${extra}</div></div>`;
}

function readiness(members) {
  const q = members.filter((l) => l.qual === 'Qualified');
  const el = members.filter((l) => l.eligibility === 'Eligible');
  const rows = [['Outreach-ready (qualified + channel-eligible)', el.length], ['Qualification pending or failed', members.length - q.length], ['Missing channel permission', q.filter((l) => l.eligibility === 'Missing permission').length], ['Suppressed contacts', q.filter((l) => l.eligibility === 'Suppressed').length]];
  return `<div class="grid g2"><div class="card card-pad"><h3 class="mb12">Outreach readiness · ${members.length} prospects</h3>
    ${rows.map(([t, n], i) => `<div class="row list-item"><span class="grow">${t}</span><span class="strong num" style="width:40px;text-align:right">${n}</span><div style="width:140px">${bar((n / members.length) * 100, i ? 'light' : '')}</div></div>`).join('')}
    <a class="btn primary mt16" href="#/demo/campaigns/new">${icon('send', 16)} Use in a campaign</a></div>
    <div class="card card-pad"><h3 class="mb12">Eligible by enrichment</h3>
    <div class="row" style="gap:28px"><div><div class="strong" style="font-size:26px">${el.filter((l) => l.enrich === 'complete').length}</div><div class="muted">Complete (100%)</div></div><div><div class="strong" style="font-size:26px">${el.filter((l) => l.enrich === 'partial').length}</div><div class="muted">Partial (50%)</div></div><div><div class="strong" style="font-size:26px">${el.filter((l) => l.enrich === 'nomatch').length}</div><div class="muted">No match (0%)</div></div></div>
    <div class="callout mt16">${icon('info', 18)}<span>Enrichment coverage does not grant contact permission. Partial records can still be contacted when qualified and channel-eligible.</span></div></div></div>`;
}

function icpTab(members) {
  const fit = members.filter((l) => ICP.industries.includes(l.industry) && ICP.cities.includes(l.city));
  const chips = (k, all) => all.map((v) => `<button class="chip ${ICP[k].includes(v) ? '' : 'gray'}" data-action="icp" data-k="${k}" data-v="${esc(v)}">${ICP[k].includes(v) ? icon('check', 13) : ''} ${esc(v)}</button>`).join(' ');
  return `<div class="split"><div class="card card-pad stack">
    <h3>Ideal customer profile</h3>
    <div><div class="label mb8">Industries</div>${chips('industries', ['Logistics', 'Transport', 'Retail', 'Trading', 'Technology', 'Manufacturing'])}</div>
    <div><div class="label mb8">Roles</div>${chips('roles', ['Director', 'Manager', 'Head', 'Other'])}</div>
    <div><div class="label mb8">Locations</div>${chips('cities', ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Medina'])}</div>
    <div><div class="label mb8">Company size</div>${chips('sizes', ['11 – 50', '51 – 200', '201 – 500', '501+'])}</div>
    <p class="muted small">Prospects with missing fields are not excluded by ICP filters — they stay in the list as “unknown”.</p></div>
    <div class="card card-pad"><h3>ICP match</h3><div class="strong mt12" style="font-size:32px">${fit.length}</div><div class="muted">of ${members.length} prospects match on known industry and location</div>
    <div class="mt12">${bar((fit.length / members.length) * 100, 'lg')}</div><div class="muted small mt12">${members.filter((l) => !l.industry).length} prospects have an unknown industry.</div>
    <button class="btn mt16" data-action="apply-icp">${icon('filter', 16)} Apply as filters</button></div></div>`;
}

export default {
  title: 'Prospect List',
  render(ctx) {
    const s = store.s;
    const list = s.lists.find((l) => l.id === ctx.params.listId);
    if (!list) return `<div class="card card-pad">List not found. <a href="#/demo/prospecting/lists">Back to Prospect Lists</a></div>`;
    if (ui.listId !== list.id) { ui.listId = list.id; ui.page = 1; }
    const members = listLeads(list);
    const n = (k) => members.filter((l) => l.enrich === k).length;
    const pc = (k) => (members.length ? Math.round((n(k) / members.length) * 100) : 0);
    const rows = filtered(members);
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    if (ui.page > pages) ui.page = pages;
    const view = rows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
    const sel = [...ui.sel].filter((id) => members.some((l) => l.id === id));
    const opt = (k) => [...new Set(members.map((l) => l[k]).filter(Boolean))].sort();
    let body;
    if (ui.tab === 'icp') body = icpTab(members);
    else if (ui.tab === 'ready') body = readiness(members);
    else body = `
      <div class="filters">
        ${select([['', 'Industry: Any'], ...opt('industry')], ui.industry, 'data-change="f" data-k="industry" aria-label="Industry"')}
        ${select([['', 'Role: Any'], 'Director', 'Manager', 'Other'], ui.role, 'data-change="f" data-k="role" aria-label="Role"')}
        ${select([['', 'Location: Any'], ...opt('city')], ui.city, 'data-change="f" data-k="city" aria-label="Location"')}
        ${select([['', 'Enrichment: All'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], ui.enrich, 'data-change="f" data-k="enrich" aria-label="Enrichment"')}
        <div style="flex:1"></div>
        <div style="width:260px">${searchInput('Search prospects...', ui.q, 'data-input="q" id="pd-q"')}</div>
      </div>
      <div class="card row wrap" style="padding:10px 16px;background:var(--blue-50);border-color:var(--blue-100);margin-bottom:12px">
        <span class="strong" style="width:100px">${sel.length} selected</span>
        <button class="btn primary" data-action="campaign" ${sel.length ? '' : 'disabled'}>${icon('plus', 17)} Add to campaign</button>
        <button class="btn outline" data-action="enrich" ${sel.length ? '' : 'disabled'}>${icon('database', 17)} Enrich data</button>
        <button class="btn outline" data-action="linkedin" ${sel.length ? '' : 'disabled'}>${icon('linkedin', 17)} Create LinkedIn tasks</button>
        ${sel.length ? '<button class="link-btn small" data-action="clear" style="margin-left:auto">Clear</button>' : ''}
      </div>
      <div class="table-wrap"><table class="tbl nowrap-cells">
        <thead><tr><th class="w-check"><input type="checkbox" class="check" data-change="all" ${view.length && view.every((l) => ui.sel.has(l.id)) ? 'checked' : ''} aria-label="Select page"></th><th>Prospect</th><th>Company</th><th>Job title</th><th>City</th><th>Company size</th><th>Industry</th><th>LinkedIn</th><th>Enrichment</th><th></th></tr></thead>
        <tbody>${view.map((l) => `<tr class="${ui.sel.has(l.id) ? 'selected' : ''}">
          <td><input type="checkbox" class="check" data-change="sel" data-id="${l.id}" ${ui.sel.has(l.id) ? 'checked' : ''} aria-label="Select ${esc(l.name)}"></td>
          <td><a class="cell-person" href="#/demo/leads/${l.id}" style="text-decoration:none">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div>${l.enrich === 'nomatch' ? '<div class="co">Contact data retained</div>' : ''}</div></a></td>
          <td>${l.company ? esc(l.company) : dash}</td><td>${l.title ? esc(l.title) : dash}</td><td>${l.city ? esc(l.city) : dash}</td><td class="nowrap">${l.size ? esc(l.size) : dash}</td><td>${l.industry ? esc(l.industry) : dash}</td>
          <td>${l.linkedin ? `<button class="link-btn owner" data-action="profile" data-id="${l.id}"><span style="color:#0a66c2">${icon('linkedin', 18)}</span> View profile</button>` : dash}</td>
          <td><div class="row nowrap">${ring(enrichPct(l), 20)}<span class="num">${enrichPct(l)}%</span><span class="muted small">${l.found}/6</span></div></td>
          <td>${statusBadge(l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No match', { tone: l.enrich === 'complete' ? '' : 'gray', pill: true })}</td></tr>`).join('') || '<tr><td colspan="10"><div class="empty">No prospects match these filters.</div></td></tr>'}</tbody>
      </table></div>
      <div class="table-foot"><span class="muted">Showing ${rows.length ? (ui.page - 1) * ui.per + 1 : 0} – ${Math.min(ui.page * ui.per, rows.length)} of ${rows.length}</span><span class="muted small" style="margin-left:auto">— = Not found by provider</span>${pager(ui.page, pages)}</div>`;
    return `
    <div class="row wrap" style="align-items:flex-start;gap:20px;margin-bottom:18px">
      <div class="grow" style="min-width:280px">
        <nav class="breadcrumb"><a href="#/demo/prospecting/lists">Prospecting</a><span>/</span><a href="#/demo/prospecting/lists">Prospect lists</a></nav>
        <h1 style="font-size:32px">${esc(list.name)}</h1>
        <div class="muted mt8" style="font-size:16px">${members.length} prospects · Enrichment results</div>
        <div class="mt8">Owner: ${esc(list.owner)}${list.campaign ? ` · <a href="#/demo/campaigns/${list.campaign}">Linked campaign</a>` : ''}</div>
      </div>
      <div class="row wrap">
        ${summaryCard(n('complete'), n('complete') ? 100 : 0, 'Complete', '6 of 6 fields found')}
        ${summaryCard(n('partial'), n('partial') ? 50 : 0, 'Partial', '3 of 6 fields found')}
        ${summaryCard(n('nomatch'), 0, 'No match', '0 of 6 fields found', `<div class="muted small">${pc('nomatch')}% of cohort</div>`)}
      </div>
    </div>
    ${tabs([['prospects', 'Prospects'], ['icp', 'ICP & Filters'], ['ready', 'Outreach Readiness']], ui.tab)}
    ${body}`;
  },
  mount(root, ctx) {
    const list = store.s.lists.find((l) => l.id === ctx.params.listId);
    if (!list) return;
    const chosen = () => listLeads(list).filter((l) => ui.sel.has(l.id));
    on(root, {
      click: {
        tab: (el) => { ui.tab = el.dataset.key; ctx.rerender(); },
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        clear: () => { ui.sel.clear(); ctx.rerender(); },
        profile: () => toast('LinkedIn profile not opened', 'The demo does not open external profiles.'),
        icp: (el) => { const a = ICP[el.dataset.k]; const i = a.indexOf(el.dataset.v); i >= 0 ? a.splice(i, 1) : a.push(el.dataset.v); ctx.rerender(); },
        'apply-icp': () => { ui.tab = 'prospects'; ui.industry = ''; ui.city = ''; ui.page = 1; toast('ICP saved for this list', 'Demo session only.'); ctx.rerender(); },
        campaign: () => {
          const c = chosen(); const ok = c.filter((l) => l.eligibility === 'Eligible');
          modal({ title: 'Add to campaign', body: `<div class="stack"><div class="field"><label>Campaign</label>${select(store.s.campaigns.filter((x) => x.status !== 'Completed').map((x) => [x.id, x.name]), list.campaign || 'cmp-ksa', 'name="c"')}</div>
            <div class="callout">${icon('info', 18)}<span><b>${ok.length} of ${c.length}</b> selected prospects are qualified and channel-eligible. Others remain in the list but are excluded from outreach.</span></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Add eligible prospects', cls: 'primary', value: 1 }] })
            .then(({ value, form }) => { if (!value) return; store.update((s) => s.leads.forEach((l) => { if (ok.some((o) => o.id === l.id)) l.inCampaign = form.c; })); toast(`${ok.length} prospects added to ${store.s.campaigns.find((x) => x.id === form.c).name}`, `${c.length - ok.length} excluded. Nothing was sent.`); ui.sel.clear(); ctx.rerender(); });
        },
        enrich: () => {
          const c = chosen(); const need = c.filter((l) => l.found < 6);
          modal({ title: 'Enrich data', body: `<div class="kv"><span class="k">Selected</span><span class="v">${c.length} prospects</span><span class="k">Need enrichment</span><span class="v">${need.length} (missing fields)</span><span class="k">Already complete</span><span class="v">${c.length - need.length} — skipped</span><span class="k">Provider</span><span class="v">Demo Enrichment A, fallback B</span><span class="k">Estimated cost</span><span class="v">${need.length} demo credits</span></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Start enrichment', cls: 'primary', value: 1 }] })
            .then(({ value }) => { if (value) { toast(`Enrichment simulated for ${need.length} prospects`, 'No paid lookup. Track results in Enrichment Operations.'); ui.sel.clear(); ctx.rerender(); } });
        },
        linkedin: () => {
          const c = chosen(); const withProfile = c.filter((l) => l.linkedin);
          modal({ title: 'Create LinkedIn tasks', body: `<div class="stack"><div class="callout">${icon('linkedin', 18)}<span>LinkedIn outreach is assisted: tasks are created for owners to act manually. <b>${withProfile.length} of ${c.length}</b> selected prospects have a profile.</span></div><div class="field"><label>Task</label>${select(['LinkedIn introduction', 'LinkedIn follow-up', 'View profile and engage'], 'LinkedIn introduction', 'name="t"')}</div><div class="field"><label>Assign to</label>${select([['owner', 'Each lead owner'], ...OWNERS], 'owner', 'name="o"')}</div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: `Create ${withProfile.length} tasks`, cls: 'primary', value: 1 }] })
            .then(({ value, form }) => {
              if (!value || !withProfile.length) return;
              store.update((s) => withProfile.forEach((l, i) => s.tasks.push({ id: `TSK-${500 + s.tasks.length}`, title: form.t, leadId: l.id, owner: form.o === 'owner' ? l.owner : form.o, due: '2026-10-30T12:00', type: 'LinkedIn', priority: 'Medium', status: 'To do', notes: 'Assisted task created from prospect list.' })));
              toast(`${withProfile.length} LinkedIn tasks created`, `${c.length - withProfile.length} skipped without a profile. See Tasks & Calendar.`); ui.sel.clear(); ctx.rerender();
            });
        },
      },
      change: {
        f: (el) => { ui[el.dataset.k] = el.value; ui.page = 1; ctx.rerender(); },
        sel: (el) => { el.checked ? ui.sel.add(el.dataset.id) : ui.sel.delete(el.dataset.id); ctx.rerender(); },
        all: (el) => { filtered(listLeads(list)).slice((ui.page - 1) * ui.per, ui.page * ui.per).forEach((l) => (el.checked ? ui.sel.add(l.id) : ui.sel.delete(l.id))); ctx.rerender(); },
      },
      input: { q: (el) => { ui.q = el.value; ui.page = 1; keepFocus('#pd-q', ctx.rerender); } },
    });
  },
};
