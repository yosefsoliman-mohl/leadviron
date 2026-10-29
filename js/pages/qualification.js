// 12 · Qualification Rules — edit conditions, decide how missing info is handled, preview outcomes on the cohort.
import { icon, esc, avatar, dots, pageHead, select, statusBadge, on, toast, modal, confirm } from '../ui.js';
import { store, leadById, enrichPct } from '../store.js';

const ui = { set: 'qs-b2b', tested: true };

// Each condition checks one signal on a lead: 'pass', 'missing' (unknown) or 'mismatch' (known and wrong).
const FIELDS = {
  'Company': { ops: ['is identified'], check: (l) => (l.company ? 'pass' : 'missing') },
  'Decision-making role': { ops: ['is confirmed'], check: (l) => (l.qual === 'Disqualified' ? 'mismatch' : l.title ? 'pass' : 'missing') },
  'Relevant business need': { ops: ['is confirmed'], check: (l) => (l.qual === 'Needs information' ? 'missing' : 'pass') },
  'Company size': { ops: ['is at least 201', 'is at least 51'], check: (l, op) => (!l.size ? 'missing' : (op === 'is at least 51' ? l.size !== '11 – 50' : ['201 – 500', '501+'].includes(l.size)) ? 'pass' : 'mismatch') },
  'Industry': { ops: ['is in target list'], check: (l) => (!l.industry ? 'missing' : ['Logistics', 'Transport', 'Retail', 'Trading', 'Technology'].includes(l.industry) ? 'pass' : 'mismatch') },
  'City': { ops: ['is in KSA'], check: (l) => (l.city ? 'pass' : 'missing') },
  'Valid email': { ops: ['is present'], check: (l) => (l.email ? 'pass' : 'missing') },
};
const REASON = { Company: 'Company', 'Decision-making role': 'role', 'Relevant business need': 'business need', 'Company size': 'company size', Industry: 'industry', City: 'city', 'Valid email': 'email' };

function evaluate(set, l) {
  const res = set.conditions.map((c) => [c, (FIELDS[c.field] || FIELDS.Company).check(l, c.op)]);
  const mis = res.filter(([, r]) => r === 'mismatch');
  const miss = res.filter(([, r]) => r === 'missing');
  const outcome = (o) => (o === 'Needs Information' ? 'Needs Information' : o);
  if (mis.length) return { result: outcome(set.mismatch), reason: mis[0][0].field === 'Decision-making role' ? 'Role outside selected ICP' : `${mis[0][0].field} outside criteria` };
  if (miss.length) return { result: outcome(set.missing), reason: `${miss.map(([c]) => REASON[c.field] || c.field).join(' and ').replace(/^./, (x) => x.toUpperCase())} unknown` };
  return { result: 'Qualified', reason: 'Required signals confirmed' };
}

export default {
  title: 'Qualification Rules',
  render() {
    const s = store.s;
    const set = s.qualification.sets.find((x) => x.id === ui.set) || s.qualification.sets[0];
    const results = s.leads.map((l) => evaluate(set, l).result);
    const n = (r) => results.filter((x) => x === r).length;
    const total = s.leads.length;
    const pc = (v) => Math.round((v / total) * 100);
    const examples = ['LD-1048', 'LD-0763', 'LD-0912'].map(leadById).filter(Boolean);
    const box = (ic, t, v, sub) => `<div class="card" style="padding:14px"><div class="row"><span class="ico-circle">${icon(ic, 20)}</span><span class="strong small">${t}</span></div><div class="row mt8"><span class="strong" style="font-size:26px">${v}</span><span class="muted">${pc(v)}%</span></div><div class="small">${sub}</div></div>`;
    return `
    ${pageHead({
      title: 'Qualification Rules', sub: `KSA Business Prospects · ${total} of 1,240 leads`,
      actions: `<button class="btn" data-action="save">${icon('bookmark', 17)} Save draft</button><button class="btn" data-action="test">${icon('play', 16)} Test</button>
        <button class="btn primary" data-action="publish">${icon('upload', 17)} Publish</button>
        ${select([['', 'Versions'], ['cur', `${set.version} (current)`], ['v2.0', 'v2.0 · Published Oct 12'], ['v1.9', 'v1.9 · Sep 28']], '', 'data-change="version" aria-label="Versions"')}`,
    })}
    <div class="split3" style="--cols:260px minmax(0,1fr) 440px">
      <div class="card" style="padding:14px">
        <div class="row between" style="padding:4px 6px 10px"><h2>Rule sets</h2><button class="btn sm" data-action="new-set" aria-label="New rule set">${icon('plus', 16)}</button></div>
        <div class="select-list">${s.qualification.sets.map((x) => `<button class="si ${x.id === set.id ? 'active' : ''}" data-action="set" data-id="${x.id}" style="align-items:flex-start;border-radius:8px"><div class="grow"><div class="strong ${x.id === set.id ? 'blue' : ''}" style="${x.id === set.id ? 'color:var(--blue-600)' : ''}">${esc(x.name)}</div><div class="muted small">${esc(x.desc)}</div></div>${statusBadge(x.status, { tone: x.status === 'Active' ? '' : 'gray' })}</button>`).join('')}</div>
      </div>
      <div class="card card-pad">
        <h2>Qualify when ALL required conditions are met</h2>
        <p class="muted mt8">A lead is <b>Qualified</b> when the following conditions are true.</p>
        <div class="stack sm mt12">${set.conditions.map((c, i) => `${i ? '<div class="qr-and"><span>AND</span></div>' : ''}
          <div class="card row qr-cond" style="padding:10px 12px"><span class="drag">${icon('grip', 16)}</span>
            ${select(Object.keys(FIELDS), c.field, `data-change="cfield" data-i="${i}" aria-label="Condition field"`)}
            ${select(FIELDS[c.field]?.ops || [c.op], c.op, `data-change="cop" data-i="${i}" aria-label="Condition operator"`)}
            <button class="icon-btn" data-action="del" data-i="${i}" aria-label="Remove condition" ${set.conditions.length < 2 ? 'disabled' : ''}>${icon('trash', 17)}</button></div>`).join('')}</div>
        <button class="btn mt12" data-action="add">${icon('plus', 16)} Add condition</button>
        <div class="divider"></div>
        <h3>Outcomes</h3>
        <div class="row mt12"><span class="grow small">Missing required information ${icon('info', 14, 'muted')}</span>${icon('arrowRight', 16, 'muted')}${select(['Needs Information', 'Disqualified'], set.missing, 'data-change="outcome" data-k="missing" style="width:200px"', 'sm')}</div>
        <div class="row mt8"><span class="grow small">Explicit mismatch with criteria ${icon('info', 14, 'muted')}</span>${icon('arrowRight', 16, 'muted')}${select(['Disqualified', 'Needs Information'], set.mismatch, 'data-change="outcome" data-k="mismatch" style="width:200px"', 'sm')}</div>
        <div class="divider"></div>
        <h3>Optional fields</h3>
        <p class="muted small mt8">Company size, industry and LinkedIn URL are optional unless used in a condition. Leads can qualify if these fields are missing, as long as all required conditions are met.</p>
      </div>
      <div class="card card-pad">
        <h2>Test preview · ${total} leads</h2>
        <p class="muted small mt8">${ui.tested ? 'Apply these rules to the current cohort to see expected results.' : '<span class="blue">Rules changed — results update live. Run Test to confirm.</span>'}</p>
        <div class="grid g3 mt12" style="gap:10px">
          ${box('user', 'Qualified', n('Qualified'), 'Meet all required conditions')}
          ${box('halfCircle', 'Needs Information', n('Needs Information'), 'Missing required information')}
          ${box('dashedCircle', 'Disqualified', n('Disqualified'), 'Explicit mismatch with criteria')}
        </div>
        <h3 class="mt16">Example results</h3>
        <p class="muted small">Sample leads from this cohort and how they would be classified.</p>
        <div class="table-wrap mt8"><table class="tbl"><thead><tr><th>Lead / Company</th><th>Coverage</th><th>Result</th><th>Reason</th></tr></thead><tbody>
          ${examples.map((l) => { const r = evaluate(set, l); return `<tr><td><a class="cell-person" href="#/demo/leads/${l.id}" style="text-decoration:none">${avatar(l.initials, '')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div><div class="co">${l.id}</div></div></a></td>
            <td><div class="small">${enrichPct(l)}%</div>${dots(l.found)}<div class="mt8"><span class="badge ${l.enrich === 'nomatch' ? 'gray' : ''}">${l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No match'}</span></div></td>
            <td>${statusBadge(r.result, { tone: r.result === 'Disqualified' ? 'gray' : '' })}</td><td class="small">${esc(r.reason)}</td></tr>`; }).join('')}
        </tbody></table></div>
        <div class="callout mt12">${icon('info', 20)}<div><div class="strong blue" style="color:var(--blue-700)">Qualification does not grant contact permission.</div><div class="small">This only determines fit based on the defined criteria. Channel permission and outreach are managed separately.</div></div></div>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const edit = (fn) => { store.update((s) => { const set = s.qualification.sets.find((x) => x.id === ui.set); fn(set); if (set.status === 'Active') { set.status = 'Draft'; set.version = `Draft ${set.version.replace('Draft ', '')}+`; } }); ui.tested = false; ctx.rerender(); };
    on(root, {
      click: {
        set: (el) => { ui.set = el.dataset.id; ui.tested = true; ctx.rerender(); },
        add: () => edit((set) => { const used = set.conditions.map((c) => c.field); const f = Object.keys(FIELDS).find((k) => !used.includes(k)) || 'City'; set.conditions.push({ field: f, op: FIELDS[f].ops[0] }); }),
        del: (el) => edit((set) => { set.conditions.splice(+el.dataset.i, 1); }),
        test: () => {
          const set = store.s.qualification.sets.find((x) => x.id === ui.set);
          const r = store.s.leads.map((l) => evaluate(set, l).result);
          ui.tested = true; ctx.rerender();
          toast(`Test run on ${r.length} leads`, `${r.filter((x) => x === 'Qualified').length} qualified · ${r.filter((x) => x === 'Needs Information').length} need information · ${r.filter((x) => x === 'Disqualified').length} disqualified. No lead was changed.`);
        },
        save: () => { toast(`${store.s.qualification.sets.find((x) => x.id === ui.set).name} draft saved`, 'Saved in this demo session.'); },
        publish: () => {
          const set = store.s.qualification.sets.find((x) => x.id === ui.set);
          confirm('Publish rule set?', `“${esc(set.name)}” becomes the active rule set. In the demo nothing is applied to operational leads.`, 'Publish').then((ok) => {
            if (!ok) return;
            store.update((s) => { const x = s.qualification.sets.find((y) => y.id === ui.set); const m = /(\d+)\.(\d+)/.exec(x.version) || [0, 1, 0]; x.version = `v${m[1]}.${+m[2] + 1}`; x.status = 'Active'; });
            ui.tested = true; toast(`${set.name} published`, 'Demo simulation — no operational rules changed.'); ctx.rerender();
          });
        },
        'new-set': () => modal({ title: 'New rule set', body: `<div class="stack"><div class="field"><label>Name</label><input class="input" name="name" placeholder="e.g. Partner fit"></div><div class="field"><label>Description</label><input class="input" name="desc" placeholder="What this rule set checks"></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Create', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => {
            if (!value) return;
            const id = `qs-${Date.now().toString(36)}`;
            store.update((s) => s.qualification.sets.push({ id, name: form.name.trim() || 'New rule set', desc: form.desc.trim() || 'Custom criteria', status: 'Draft', conditions: [{ field: 'Company', op: 'is identified' }], missing: 'Needs Information', mismatch: 'Disqualified', version: 'Draft v0.1' }));
            ui.set = id; ctx.rerender();
          }),
      },
      change: {
        cfield: (el) => edit((set) => { set.conditions[+el.dataset.i] = { field: el.value, op: FIELDS[el.value].ops[0] }; }),
        cop: (el) => edit((set) => { set.conditions[+el.dataset.i].op = el.value; }),
        outcome: (el) => edit((set) => { set[el.dataset.k] = el.value; }),
        version: (el) => { if (el.value && el.value !== 'cur') toast(`Viewing ${el.value} is read-only in the demo`, 'The draft stays open for editing.'); el.value = ''; },
      },
    });
  },
};
