// 09 · Prospect Lists — saved audiences with size, readiness and linked campaigns.
import { icon, esc, avatar, owner, pageHead, select, searchInput, pager, on, toast, modal, keepFocus } from '../ui.js';
import { store, OWNERS } from '../store.js';

const ui = { q: '', owner: '', source: '', type: '', ready: '', sel: 'lst-ksa', page: 1, per: 10 };

// Members of a list, used for its enrichment breakdown.
export function listLeads(list) {
  const leads = store.s.leads;
  if (list.ids) return leads.filter((l) => list.ids.includes(l.id));
  if (list.filter) return leads.filter((l) => l.enrich === list.filter);
  if (list.id === 'lst-priority') return leads.filter((l) => l.qual === 'Qualified').sort((a, b) => b.score - a.score).slice(0, 42);
  return leads;
}

function campaignLink(l) {
  const c = store.s.campaigns.find((x) => x.id === l.campaign);
  if (c) return `<a href="#/demo/campaigns/${c.id}">${esc(c.name)}</a>`;
  if (l.campaignName) return `<a href="#/demo/campaigns">${esc(l.campaignName)}</a>`;
  return '<span class="muted">—</span>';
}

function breakdown(list) {
  const m = listLeads(list);
  const n = (k) => m.filter((l) => l.enrich === k).length;
  return { complete: n('complete'), partial: n('partial'), nomatch: n('nomatch') };
}

export default {
  title: 'Prospect Lists',
  render() {
    const s = store.s;
    const q = ui.q.toLowerCase();
    const rows = s.lists.filter((l) => (!q || l.name.toLowerCase().includes(q)) && (!ui.owner || l.owner === ui.owner) && (!ui.source || l.source === ui.source) && (!ui.type || l.type === ui.type)
      && (!ui.ready || (ui.ready === 'ready' ? l.ready > 0 : l.ready === 0)));
    const pages = Math.max(1, Math.ceil(rows.length / ui.per));
    const view = rows.slice((ui.page - 1) * ui.per, ui.page * ui.per);
    const sel = s.lists.find((l) => l.id === ui.sel);
    const b = sel ? breakdown(sel) : null;
    const box = (ic, n, label, sub) => `<div class="card row" style="padding:14px 16px;gap:14px"><span class="ico-circle lg">${icon(ic, 24)}</span><div><span class="strong" style="font-size:22px">${n}</span> <span class="small">${label}</span>${sub ? `<div class="muted small">${sub}</div>` : ''}</div></div>`;
    return `
    ${pageHead({ title: 'Prospect Lists', sub: 'Saved audiences and prospecting segments', actions: `<button class="btn primary" data-action="create">${icon('plus', 18)} Create Prospect List</button>` })}
    <div class="filters">
      ${searchInput('Search lists by name...', ui.q, 'data-input="q" id="pl-q"')}
      ${select([['', 'Owner'], ...OWNERS], ui.owner, 'data-change="f" data-k="owner" aria-label="Owner"')}
      ${select([['', 'Source'], 'Mixed sources', 'Saved segment'], ui.source, 'data-change="f" data-k="source" aria-label="Source"')}
      ${select([['', 'List type'], 'Static', 'Dynamic'], ui.type, 'data-change="f" data-k="type" aria-label="List type"')}
      ${select([['', 'Outreach readiness'], ['ready', 'Has outreach-ready'], ['none', 'None ready']], ui.ready, 'data-change="f" data-k="ready" aria-label="Outreach readiness"')}
    </div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th class="w-check"></th><th>List</th><th>Owner</th><th>Source</th><th class="c">People</th><th class="c">Outreach-ready</th><th>Linked campaign</th><th>Updated</th></tr></thead>
      <tbody>${view.map((l) => `<tr class="clickable ${l.id === ui.sel ? 'selected' : ''}" data-action="sel" data-id="${l.id}">
        <td><input type="checkbox" class="check" ${l.id === ui.sel ? 'checked' : ''} aria-label="Select ${esc(l.name)}"></td>
        <td><div class="row"><span class="ico-circle sm">${icon('users', 16)}</span><div><div class="row" style="gap:8px"><a class="strong" href="#/demo/prospecting/lists/${l.id}" data-action="open" data-id="${l.id}" style="color:var(--ink-900)">${esc(l.name)}</a>${l.type === 'Dynamic' ? '<span class="badge">Dynamic</span>' : ''}</div>${l.sub ? `<div class="muted small">${esc(l.sub)}</div>` : ''}</div></div></td>
        <td>${owner(l.owner)}</td><td>${esc(l.source)}</td><td class="c num">${l.people}</td><td class="c num">${l.ready}</td>
        <td data-stop>${campaignLink(l)}</td><td class="muted">${esc(l.updated)}</td></tr>`).join('') || '<tr><td colspan="8"><div class="empty">No lists match these filters.</div></td></tr>'}</tbody>
    </table></div>
    <div class="table-foot"><span class="muted">Showing ${view.length ? (ui.page - 1) * ui.per + 1 : 0}–${(ui.page - 1) * ui.per + view.length} of ${rows.length} lists</span><span style="margin-left:auto"></span>${pager(ui.page, pages)}</div>
    ${sel ? `<div class="card card-pad mt8">
      <div class="row wrap" style="gap:16px"><span class="ico-circle lg">${icon('users', 24)}</span><div class="grow"><h2 style="font-size:20px">${esc(sel.name)}</h2><div class="muted">${esc(sel.sub || sel.type + ' list')}</div></div>
        <div><div class="muted small">Owner</div>${owner(sel.owner)}</div><a class="btn primary" href="#/demo/prospecting/lists/${sel.id}">Open list ${icon('external', 16)}</a></div>
      <div class="grid g5 mt16">
        ${box('users', sel.people, 'People')}
        ${box('file', b.complete, 'Complete', '100% • 6/6 fields')}
        ${box('halfCircle', b.partial, 'Partial', '50% • 3/6 fields')}
        ${box('dashedCircle', b.nomatch, 'No match', '0% • 0/6 fields')}
        ${box('users', sel.ready, 'Outreach-ready')}
      </div>
      <div class="row between mt12 muted small"><span>Outreach-ready = Qualified + channel-eligible</span><span>Lists may overlap</span></div>
    </div>` : ''}`;
  },
  mount(root, ctx) {
    on(root, {
      click: {
        sel: (el, e) => { if (e.target.closest('[data-stop] a')) { ctx.navigate(e.target.closest('a').getAttribute('href').slice(1)); return; } ui.sel = el.dataset.id; ctx.rerender(); },
        open: (el) => ctx.navigate(`/demo/prospecting/lists/${el.dataset.id}`),
        page: (el) => { ui.page = +el.dataset.page; ctx.rerender(); },
        create: () => modal({
          title: 'Create prospect list',
          body: `<div class="stack"><div class="field"><label>List name</label><input class="input" name="name" placeholder="e.g. Riyadh logistics leaders"></div>
            <div class="form-grid"><div class="field"><label>Enrichment</label>${select([['', 'Any'], ['complete', 'Complete'], ['partial', 'Partial'], ['nomatch', 'No match']], '', 'name="enrich"')}</div>
            <div class="field"><label>Qualification</label>${select([['', 'Any'], 'Qualified', 'Needs information', 'Disqualified'], '', 'name="qual"')}</div>
            <div class="field"><label>City</label>${select([['', 'Any'], 'Riyadh', 'Jeddah', 'Dammam', 'Khobar'], '', 'name="city"')}</div>
            <div class="field"><label>Owner</label>${select(OWNERS, 'Sara Ahmed', 'name="owner"')}</div></div>
            <p class="muted small">Builds a static list from the demo cohort. No external prospect search is run.</p></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Create list', cls: 'primary', value: 1 }],
        }).then(({ value, form }) => {
          if (!value) return;
          const members = store.s.leads.filter((l) => (!form.enrich || l.enrich === form.enrich) && (!form.qual || l.qual === form.qual) && (!form.city || l.city === form.city));
          const id = `lst-${Date.now().toString(36)}`;
          const name = form.name.trim() || 'New prospect list';
          store.update((s) => s.lists.push({ id, name, sub: `${members.length} people · created in demo`, owner: form.owner, source: 'Saved segment', type: 'Static', people: members.length, ready: members.filter((l) => l.eligibility === 'Eligible').length, campaign: null, updated: 'Now', ids: members.map((l) => l.id) }));
          ui.sel = id; toast(`List “${name}” created`, `${members.length} prospects · saved in this demo session.`); ctx.rerender();
        }),
      },
      change: { f: (el) => { ui[el.dataset.k] = el.value; ui.page = 1; ctx.rerender(); } },
      input: { q: (el) => { ui.q = el.value; ui.page = 1; keepFocus('#pl-q', ctx.rerender); } },
    });
  },
};
