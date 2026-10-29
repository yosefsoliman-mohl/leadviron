// 20 · Workflow Builder — visual steps and branches. Test and Publish are simulations on demo data.
import { icon, esc, select, on, toast, modal, confirm } from '../ui.js';
import { store, cohortCounts } from '../store.js';

const ui = { wf: null, sel: null, tested: false, q: '' };
const BLOCKS = [
  ['trigger', 'Trigger', 'bolt'], ['condition', 'Condition', 'flow'], ['delay', 'Delay', 'clock'], ['action', 'Action', 'mail'],
];
let seq = 100;
const node = (kind, title, desc, ic, children = []) => ({ id: `n${Date.now().toString(36)}${seq++}`, kind, title, desc, icon: ic, children, cfg: {} });
const edge = (n, label = null) => ({ label, node: n });

function seedGraph(w) {
  if (w.id === 'wf-enrich') {
    const cond = node('condition', 'Enrichment coverage', 'Condition', 'diamond', [
      edge(node('action', 'Start eligible outreach', 'Qualification + consent checks', 'mail', [
        edge(node('delay', 'Wait for reply', 'Up to 2 days', 'clock', [
          edge(node('action', 'Hand off to sales', 'End automated follow-ups', 'user'), 'Reply'),
          edge(node('action', 'Create follow-up task', 'End sequence', 'list'), 'No reply'),
        ])),
      ]), 'Complete · 6/6'),
      edge(node('action', 'Review missing fields', 'Create review task', 'list'), 'Partial · 1–5/6'),
      edge(node('action', 'Create research task', 'Keep original form data', 'file'), 'No match · 0/6'),
    ]);
    cond.cfg = { target: '6', complete: '6 of 6', partial: '1 to 5 of 6', nomatch: '0 of 6' };
    cond.seg = true;
    return node('trigger', 'Enrichment completed', 'Test cohort: 120 leads', 'bolt', [edge(cond)]);
  }
  const t = node('trigger', w.trigger, 'Trigger', 'bolt');
  if (w.status !== 'Draft') {
    t.children = [edge(node('action', w.trigger === 'Task due' ? 'Notify task owner' : 'Send follow-up email', 'Template · Demo Follow-up', 'mail', [
      edge(node('delay', 'Wait', '1 day', 'clock', [edge(node('action', 'Create follow-up task', 'Assign to lead owner', 'list'))])),
    ]))];
  }
  return t;
}

function graph(w) {
  const s = store.s;
  if (!s.wfGraphs) store.update((st) => { st.wfGraphs = {}; });
  if (!s.wfGraphs[w.id]) store.update((st) => { st.wfGraphs[w.id] = seedGraph(w); });
  return store.s.wfGraphs[w.id];
}

function walk(n, fn, parent = null) { fn(n, parent); n.children.forEach((e) => walk(e.node, fn, n)); }
function find(root, id) { let hit = null; walk(root, (n, p) => { if (n.id === id) hit = { n, p }; }); return hit; }
function nextVersion(v) { const [maj, min] = String(v || 'v0.0').replace('v', '').split('.').map(Number); return `v${maj}.${(min || 0) + 1}`; }

function branchCount(label) {
  const c = cohortCounts();
  if (/^Complete/.test(label)) return c.complete;
  if (/^Partial/.test(label)) return c.partial;
  if (/^No match/.test(label)) return c.nomatch;
  if (label === 'Reply') return 18;
  if (label === 'No reply') return 30;
  return null;
}

function renderNode(n) {
  const kids = n.children;
  let out = `<button class="wf-node ${ui.sel === n.id ? 'active' : ''}" data-action="step" data-id="${n.id}" data-drop="${n.id}">
    <span class="ico-circle" style="${n.kind === 'condition' ? 'background:#fff' : ''}">${icon(n.icon, 20)}</span><span><span class="t" style="display:block">${esc(n.title)}</span>${n.desc && n.kind !== 'condition' ? `<span class="d">${esc(n.desc)}</span>` : ''}</span></button>`;
  if (kids.length === 1 && !kids[0].label) out += `<div class="wf-arrow"></div>${renderNode(kids[0].node)}`;
  else if (kids.length) {
    out += `<div class="wf-arrow stem" style="height:14px"></div><div class="wf-branches">${kids.map((e) => {
      const n2 = ui.tested ? branchCount(e.label) : null;
      return `<div class="wf-branch"><span class="wf-label ${ui.tested ? 'hit' : ''}" style="position:relative;z-index:1">${esc(e.label || 'Next')}${n2 != null ? ` · ${n2} leads` : ''}</span><div class="wf-arrow" style="height:18px"></div>${renderNode(e.node)}</div>`;
    }).join('')}</div>`;
  }
  return `<div class="wf-col">${out}</div>`;
}

function settings(w, n) {
  if (!n) return '<p class="muted mt12">Select a step on the canvas to edit it.</p>';
  const field = (label, html) => `<div class="row between" style="padding:6px 0"><span class="small" style="color:var(--ink-700)">${label}</span><div style="width:140px">${html}</div></div>`;
  const cfg = n.cfg || {};
  let body = '';
  if (n.kind === 'condition' && n.seg) {
    body = field('Target fields', select(['6', '5', '4'], cfg.target, 'data-change="cfg" data-k="target"', 'sm'))
      + field('Complete', select(['6 of 6', '5 of 6'], cfg.complete, 'data-change="cfg" data-k="complete"', 'sm'))
      + field('Partial', select(['1 to 5 of 6', '1 to 4 of 6'], cfg.partial, 'data-change="cfg" data-k="partial"', 'sm'))
      + field('No match', select(['0 of 6'], cfg.nomatch, 'data-change="cfg" data-k="nomatch"', 'sm'));
  } else if (n.kind === 'condition') {
    body = field('Check', select(['Lead is qualified', 'Lead replied', 'Channel eligible'], cfg.check || 'Lead is qualified', 'data-change="cfg" data-k="check"', 'sm'));
  } else if (n.kind === 'delay') {
    body = field('Wait up to', select(['1 day', '2 days', '3 days', '1 week'], cfg.wait || '2 days', 'data-change="cfg" data-k="wait"', 'sm'))
      + field('Starts', select(['After successful send', 'Immediately'], cfg.starts || 'After successful send', 'data-change="cfg" data-k="starts"', 'sm'));
  } else if (n.kind === 'action') {
    body = field('Action', select(['Send email', 'Send WhatsApp', 'Create task', 'Assign owner', 'Hand off to sales'], cfg.type || (/task/i.test(n.title) ? 'Create task' : /hand off/i.test(n.title) ? 'Hand off to sales' : 'Send email'), 'data-change="cfg" data-k="type"', 'sm'))
      + field('Owner', select(['Lead owner', 'Sara Ahmed', 'Khalid Ali', 'Maya Hassan'], cfg.owner || 'Lead owner', 'data-change="cfg" data-k="owner"', 'sm'));
  } else {
    body = field('Event', select(['Enrichment completed', 'Lead created', 'Lead qualified', 'Task due', 'Demo completed'], cfg.event || n.title, 'data-change="cfg" data-k="event"', 'sm'));
  }
  return `<div class="callout mt12" style="align-items:center;padding:14px">${icon(n.icon, 22)}<div class="grow"><input class="input sm" value="${esc(n.title)}" data-change="title" aria-label="Step name" style="font-weight:600"><div class="muted small mt8">${n.kind[0].toUpperCase() + n.kind.slice(1)}</div></div></div>
    <div class="mt8">${body}</div>
    ${n.kind !== 'trigger' ? `<button class="btn sm danger mt8" data-action="delete">${icon('trash', 15)} Remove step</button>` : ''}`;
}

export default {
  title: 'Workflow Builder',
  render(ctx) {
    const s = store.s;
    const w = s.workflows.find((x) => x.id === ctx.params.workflowId);
    if (!w) return `<div class="card card-pad">Workflow not found. <a href="#/demo/workflows">Back to Workflows</a></div>`;
    if (ui.wf !== w.id) Object.assign(ui, { wf: w.id, sel: null, tested: false });
    const g = graph(w);
    if (!ui.sel) { let first = null; walk(g, (n) => { if (!first && n.kind === 'condition') first = n.id; }); ui.sel = first || g.id; }
    const hit = find(g, ui.sel);
    const c = cohortCounts();
    const q = ui.q.toLowerCase();
    return `
    <div class="page-head"><div class="titles"><h1>Workflow Builder</h1>
      <div class="row wrap mt8"><span class="sub" style="margin:0">${esc(w.name)}</span><span class="chip gray" style="padding:2px 10px">${w.draft ? `Draft · ${w.draft}` : `Published · ${w.published}`}</span><span class="muted small">Owner: ${esc(w.owner)}</span>${ui.tested ? '<span class="badge">Test preview</span>' : ''}</div></div>
      <div class="actions"><button class="btn" data-action="save">Save draft</button><button class="btn" data-action="test">${icon('play', 15)} Test</button><button class="btn primary" data-action="publish">${icon('play', 15)} Publish</button></div></div>
    <div class="split3" style="--cols:200px minmax(0,1fr) 300px">
      <div class="card card-pad stack sm">
        <h2>Blocks</h2>
        <div class="search-input">${icon('search', 15)}<input class="input sm" placeholder="Search blocks" value="${esc(ui.q)}" data-change="bq"></div>
        ${BLOCKS.filter(([, l]) => !q || l.toLowerCase().includes(q)).map(([k, l, ic]) => `<button class="wf-block" draggable="true" data-action="add" data-kind="${k}" data-drag="${k}">${icon(ic, 20)} ${l}</button>`).join('')}
        <p class="muted small">Click to add after the selected step, or drag a block onto a step.</p>
      </div>
      <div class="card wf-canvas canvas-dots"><div class="wf-inner">${renderNode(g)}</div></div>
      <div class="stack" style="gap:12px">
        <div class="card card-pad"><h2>Step settings</h2>${settings(w, hit && hit.n)}</div>
        ${w.id === 'wf-enrich' ? `<div class="card card-pad"><h3>Test preview · ${c.total} leads</h3>
          <table class="tbl mt8" style="font-size:13px;border:1px solid var(--border);border-radius:8px"><thead><tr><th>Segment</th><th>People</th><th>Coverage</th></tr></thead><tbody>
          <tr><td>Complete</td><td>${c.complete}</td><td>100%</td></tr><tr><td>Partial</td><td>${c.partial}</td><td>50%</td></tr><tr><td>No match</td><td>${c.nomatch}</td><td>0%</td></tr></tbody></table>
          <p class="muted small mt8">${icon('info', 13)} ${c.nomatch} no-match leads = ${Math.round((c.nomatch / c.total) * 100)}% of cohort.</p>
          <h3 class="mt16">Behavior notes</h3>
          <p class="small mt8 row" style="align-items:flex-start">${icon('info', 15)} Outreach requires qualification and channel eligibility.</p>
          <p class="small mt8 row" style="align-items:flex-start">${icon('info', 15)} Wait starts after successful sending.</p></div>` : `<div class="card card-pad"><h3>Behavior notes</h3><p class="small mt8">Only the published version runs. Draft changes take effect after Publish.</p></div>`}
        <a class="btn" href="#/demo/workflows/history?wf=${w.id}">${icon('history', 16)} View executions</a>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const w = store.s.workflows.find((x) => x.id === ctx.params.workflowId);
    if (!w) return;
    const cv = root.querySelector('.wf-canvas');
    if (cv) cv.scrollLeft = (cv.scrollWidth - cv.clientWidth) / 2;
    // Every edit happens in the draft; create one when only a published version exists.
    const edit = (fn) => {
      store.update((s) => {
        fn(s.wfGraphs[w.id]);
        const wf = s.workflows.find((x) => x.id === w.id);
        if (!wf.draft) wf.draft = nextVersion(wf.published);
        wf.last = 'Just now';
      });
      ui.tested = false;
      ctx.rerender();
    };
    const insert = (kind, afterId) => {
      const [, label, ic] = BLOCKS.find((b) => b[0] === kind);
      edit((g) => {
        const h = find(g, afterId);
        const t = kind === 'trigger' ? node('condition', 'Additional trigger filter', 'Condition', 'flow') : node(kind, kind === 'delay' ? 'Wait' : kind === 'condition' ? 'New condition' : 'Send follow-up email', kind === 'delay' ? '1 day' : label, kind === 'condition' ? 'flow' : ic);
        if (kind === 'condition') t.children = [edge(h.n.children.length === 1 ? h.n.children[0].node : node('action', 'End', 'Sequence ends', 'check'), 'Yes'), edge(node('action', 'End', 'Sequence ends', 'check'), 'No')];
        else t.children = h.n.children;
        h.n.children = [edge(t)];
        ui.sel = t.id;
      });
      toast(kind === 'trigger' ? 'A workflow has one trigger — added a trigger filter instead' : `${label} added`, 'Draft updated in this demo session.');
    };
    on(root, {
      click: {
        step: (el) => { ui.sel = el.dataset.id; ctx.rerender(); },
        add: (el) => insert(el.dataset.kind, ui.sel),
        delete: () => confirm('Remove step?', 'Steps after it move up to take its place.', 'Remove').then((ok) => ok && edit((g) => {
          const h = find(g, ui.sel);
          if (!h || !h.p) return;
          const e = h.p.children.find((x) => x.node.id === h.n.id);
          const next = h.n.children[0];
          if (next) { e.node = next.node; } else h.p.children = h.p.children.filter((x) => x !== e);
          ui.sel = h.p.id;
        })),
        save: () => { store.update((s) => { const wf = s.workflows.find((x) => x.id === w.id); if (!wf.draft) wf.draft = nextVersion(wf.published); }); toast(`Draft ${store.s.workflows.find((x) => x.id === w.id).draft} saved`, 'The published version keeps running unchanged.'); ctx.rerender(); },
        test: () => {
          ui.tested = true; ctx.rerender();
          const c = cohortCounts();
          modal({ title: 'Test run · simulated', body: w.id === 'wf-enrich' ? `<div class="stack sm"><p class="muted">Ran the draft against the ${c.total}-lead demo cohort. Nothing was sent.</p>
            <table class="tbl"><thead><tr><th>Branch</th><th class="r">Leads</th><th>Result</th></tr></thead><tbody>
            <tr><td>Complete · 6/6</td><td class="r">${c.complete}</td><td>${c.eligible - 20} start outreach · ${c.complete - (c.eligible - 20)} blocked by eligibility</td></tr>
            <tr><td>Partial · 1–5/6</td><td class="r">${c.partial}</td><td>${c.partial} review tasks</td></tr>
            <tr><td>No match · 0/6</td><td class="r">${c.nomatch}</td><td>${c.nomatch} research tasks</td></tr></tbody></table></div>`
            : `<p class="muted">Simulated with 10 sample leads. All steps resolved without errors. Nothing was sent.</p>`, buttons: [{ label: 'Close', cls: 'primary', value: 1 }] });
        },
        publish: () => {
          const wf = store.s.workflows.find((x) => x.id === w.id);
          const v = wf.draft || nextVersion(wf.published);
          confirm(`Publish ${v}?`, `New runs will use ${v}. Runs already in progress finish on ${wf.published || 'their current version'}.`, 'Publish').then((ok) => {
            if (!ok) return;
            store.update((s) => { const x = s.workflows.find((y) => y.id === w.id); x.published = v; x.draft = null; if (x.status === 'Draft') x.status = 'Active'; x.last = 'Just now'; });
            toast(`Published ${v}`, 'Demo simulation — no live automation was changed.');
            ctx.rerender();
          });
        },
      },
      change: {
        bq: (el) => { ui.q = el.value; ctx.rerender(); },
        title: (el) => edit((g) => { find(g, ui.sel).n.title = el.value || 'Untitled step'; }),
        cfg: (el) => edit((g) => { const n = find(g, ui.sel).n; n.cfg = { ...n.cfg, [el.dataset.k]: el.value }; if (el.dataset.k === 'wait') n.desc = `Up to ${el.value}`; }),
      },
    });
    // Drag a block onto a step to insert after it.
    root.addEventListener('dragstart', (e) => { const b = e.target.closest('[data-drag]'); if (b) e.dataTransfer.setData('text/plain', b.dataset.drag); });
    root.addEventListener('dragover', (e) => { if (e.target.closest('[data-drop]')) e.preventDefault(); });
    root.addEventListener('drop', (e) => { const t = e.target.closest('[data-drop]'); const k = e.dataTransfer.getData('text/plain'); if (t && k) { e.preventDefault(); insert(k, t.dataset.drop); } });
  },
};
