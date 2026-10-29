// 13 · Scoring Rules — factor weights, priority bands and a live test lead; data completeness stays separate.
import { icon, esc, avatar, dots, bar, pageHead, select, searchInput, statusBadge, owner, on, toast, modal, confirm, keepFocus } from '../ui.js';
import { store, leadById, enrichPct } from '../store.js';

const ui = { lead: 'LD-1048', q: '' };
const DEFAULT_MAX = { company: 40, role: 30, engagement: 20, recency: 10 };
// How strongly a typical lead meets each factor (Omar Ali: 36/40, 27/30, 15/20, 8/10 = 86).
const PROFILE = { company: 0.9, role: 0.9, engagement: 0.75, recency: 0.8 };
const EXAMPLES = ['LD-0731', 'LD-0763', 'LD-1048', 'LD-0912'];

const baseW = () => Object.keys(DEFAULT_MAX).reduce((a, k) => a + DEFAULT_MAX[k] * PROFILE[k], 0);
const curW = (factors) => factors.reduce((a, f) => a + f.max * PROFILE[f.key], 0);

// Score under the current weights; equals the stored score at default weights.
function scoreOf(l, sc) {
  if (l.score == null) return sc.unknown === 'Score as zero' ? 0 : null;
  return Math.min(100, Math.round((l.score * curW(sc.factors)) / baseW()));
}
function breakdown(l, sc) {
  const total = scoreOf(l, sc);
  if (total == null) return null;
  const k = l.score / 86;
  const pts = sc.factors.map((f) => Math.min(f.max, Math.round(f.max * PROFILE[f.key] * k)));
  const diff = total - pts.reduce((a, b) => a + b, 0);
  const last = pts.length - 1;
  pts[last] = Math.max(0, Math.min(sc.factors[last].max, pts[last] + diff));
  return pts;
}
const band = (v, sc) => (v == null ? 'Not assessed' : v >= sc.bands.high ? 'High' : v >= sc.bands.medium ? 'Medium' : 'Low');

export default {
  title: 'Scoring Rules',
  render() {
    const s = store.s;
    const sc = s.scoring;
    const total = sc.factors.reduce((a, f) => a + Number(f.max), 0);
    const l = leadById(ui.lead);
    const v = scoreOf(l, sc);
    const pts = breakdown(l, sc);
    const q = ui.q.toLowerCase();
    const ex = EXAMPLES.map(leadById).filter((x) => x && (!q || [x.name, x.company, x.email].join(' ').toLowerCase().includes(q)));
    const all = s.leads.map((x) => scoreOf(x, sc));
    const dist = { High: all.filter((x) => band(x, sc) === 'High').length, Medium: all.filter((x) => band(x, sc) === 'Medium').length, Low: all.filter((x) => band(x, sc) === 'Low').length };
    return `
    ${pageHead({
      title: 'Scoring Rules', sub: `B2B priority score · ${esc(sc.version)}${sc.dirty ? ' · <span class="blue">Unsaved changes</span>' : ''}`,
      actions: `<button class="btn" data-action="versions">${icon('history', 17)} Versions</button><button class="btn" data-action="test">${icon('play', 16)} Test</button><button class="btn" data-action="save">${icon('bookmark', 17)} Save draft</button><button class="btn primary" data-action="publish" ${total === 100 ? '' : 'disabled'}>${icon('upload', 17)} Publish</button>`,
    })}
    <div class="split" style="--cols:minmax(0,1fr) 440px">
      <div class="card card-pad">
        <h2>Score factors</h2>
        <p class="muted mt8">Adjust the weight of each factor. The total maximum points is 100.</p>
        <div class="table-wrap mt12"><table class="tbl"><thead><tr><th>Factor</th><th>Maximum points</th><th>Rule</th><th class="c">Edit</th></tr></thead><tbody>
          ${sc.factors.map((f, i) => `<tr><td><span class="owner"><span class="ico-circle sm">${icon(f.icon, 16)}</span> ${esc(f.name)}</span></td>
            <td><div class="row"><input class="input sm num" type="number" min="0" max="100" value="${f.max}" data-change="max" data-i="${i}" style="width:70px" aria-label="${esc(f.name)} maximum points"><input type="range" min="0" max="60" value="${f.max}" data-change="max" data-input="slide" data-i="${i}" class="sc-range" aria-label="${esc(f.name)} weight"></div></td>
            <td class="muted small" style="max-width:200px">${esc(f.rule)}</td><td class="c"><button class="btn sm" data-action="edit" data-i="${i}">${icon('edit', 14)} Edit</button></td></tr>`).join('')}
          <tr><td class="strong">Total maximum</td><td colspan="3"><span class="strong" style="font-size:16px" id="sc-total">${total}</span> ${total === 100 ? '' : `<span class="badge amber">Must equal 100 to publish</span>`}</td></tr>
        </tbody></table></div>
        <div class="row wrap mt16" style="align-items:flex-end;gap:20px">
          <div class="grow"><div class="strong mb8">Priority score bands</div><div class="row wrap">
            <div class="sc-band"><span class="ring" style="background:var(--blue-600)"></span><div><div class="small blue" style="color:var(--blue-600)">High</div><div>${sc.bands.high} – 100</div></div></div>
            <div class="sc-band"><span class="ring" style="background:var(--blue-400)"></span><div><div class="small" style="color:var(--blue-600)">Medium</div><div>${sc.bands.medium} – ${sc.bands.high - 1}</div></div></div>
            <div class="sc-band"><span class="ring" style="background:var(--blue-200)"></span><div><div class="small" style="color:var(--blue-600)">Low</div><div>0 – ${sc.bands.medium - 1}</div></div></div>
            <button class="btn sm" data-action="bands">${icon('sliders', 14)} Edit bands</button></div></div>
          <div><div class="small mb8">Unknown required inputs ${icon('info', 13, 'muted')}</div>${select(['Not assessed', 'Score as zero'], sc.unknown, 'data-change="unknown" aria-label="Unknown required inputs"')}</div>
        </div>
        <div class="muted small mt12">Current distribution: ${dist.High} high · ${dist.Medium} medium · ${dist.Low} low · ${all.filter((x) => x == null).length} not assessed</div>
      </div>
      <div class="card card-pad">
        <div class="row between"><h2>Test lead</h2>${select(s.leads.slice(0, 12).map((x) => [x.id, x.name]), ui.lead, 'data-change="lead" aria-label="Change lead"', 'sm')}</div>
        <div class="row mt12">${avatar(l.initials, 'lg')}<div><a class="strong" style="font-size:18px;color:var(--ink-900)" href="#/demo/leads/${l.id}">${esc(l.name)}</a><div class="muted">${esc(l.company || 'Company unknown')} · ${l.id}</div></div></div>
        <div class="card row wrap mt12" style="padding:16px;background:var(--blue-50);border-color:var(--blue-100)">
          <div class="grow"><div class="small">Priority score</div><div class="nowrap"><span style="font-size:40px;font-weight:700;color:var(--ink-900)">${v ?? '—'}</span> <span class="muted" style="font-size:20px">/ 100</span></div>${v != null ? statusBadge(`${band(v, sc)} priority`) : '<span class="badge gray">Not assessed</span>'}</div>
          <div class="card row" style="padding:10px 14px">${icon('halfCircle', 22, 'blue')}<div><div class="small">Enrichment</div><div class="blue strong" style="color:var(--blue-600)">${l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No match'} ${enrichPct(l)}% · ${l.found}/6</div></div></div>
        </div>
        <div class="row between mt16"><h3>Score breakdown</h3><span class="muted small">Maximum points</span></div>
        ${pts ? sc.factors.map((f, i) => `<div class="row mt12"><span style="width:110px">${esc(f.name)}</span><div class="grow">${bar(f.max ? (pts[i] / f.max) * 100 : 0, 'lg')}</div><span class="num" style="width:60px;text-align:right"><b>${pts[i]}</b> / ${f.max}</span></div>`).join('') : '<p class="muted mt12">Required inputs are unknown, so this lead is not assessed.</p>'}
        <p class="muted small mt16">Enrichment coverage is shown separately and does not change the score by itself.</p>
      </div>
    </div>
    <div class="card mt16">
      <div class="card-head" style="flex-wrap:wrap"><h2>Example leads in this cohort</h2><div style="width:320px;max-width:100%">${searchInput('Search by name, company or email...', ui.q, 'data-input="q" id="sc-q"')}</div></div>
      <div class="table-wrap flat"><table class="tbl"><thead><tr><th class="w-check"></th><th>Name</th><th>Company</th><th>Enrichment coverage (6 fields)</th><th>Priority score (/ 100)</th><th>Qualification</th><th>Owner</th><th>Last activity</th></tr></thead><tbody>
        ${ex.map((x) => { const sv = scoreOf(x, sc); return `<tr class="clickable ${x.id === ui.lead ? 'selected' : ''}" data-action="pick" data-id="${x.id}"><td><input type="checkbox" class="check" ${x.id === ui.lead ? 'checked' : ''} aria-label="Use ${esc(x.name)} as test lead"></td>
          <td><span class="owner">${avatar(x.initials, 'sm')} <span class="strong" style="font-weight:500">${esc(x.name)}</span></span></td><td class="muted">${esc(x.company || 'Not found')}</td>
          <td><div class="row">${dots(x.found)} <span>${x.enrich === 'complete' ? 'Complete (100%)' : x.enrich === 'partial' ? 'Partial (50%)' : 'No match (0%)'}</span></div></td>
          <td class="strong" style="font-weight:500">${sv ?? 'Not assessed'}</td><td>${statusBadge(x.qual === 'Needs information' ? 'Needs Information' : x.qual, { tone: x.qual === 'Disqualified' ? 'gray' : '' })}</td><td>${owner(x.owner)}</td><td class="muted">${esc(x.activity)}</td></tr>`; }).join('') || '<tr><td colspan="8"><div class="empty">No example leads match.</div></td></tr>'}
      </tbody></table></div>
    </div>`;
  },
  mount(root, ctx) {
    const edit = (fn) => { store.update((s) => { fn(s.scoring); s.scoring.dirty = true; }); ctx.rerender(); };
    on(root, {
      click: {
        pick: (el) => { ui.lead = el.dataset.id; ctx.rerender(); },
        edit: (el) => {
          const f = store.s.scoring.factors[+el.dataset.i];
          modal({ title: `Edit ${f.name}`, body: `<div class="stack"><div class="field"><label>Rule description</label><input class="input" name="rule" value="${esc(f.rule)}"></div><div class="field"><label>Maximum points</label><input class="input" type="number" name="max" min="0" max="100" value="${f.max}"></div><p class="muted small">Signals are read from qualification answers, replies and activity dates in the demo cohort.</p></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Save factor', cls: 'primary', value: 1 }] })
            .then(({ value, form }) => value && edit((sc) => { const x = sc.factors[+el.dataset.i]; x.rule = form.rule || x.rule; x.max = Math.max(0, Math.min(100, +form.max || 0)); }));
        },
        bands: () => modal({ title: 'Priority score bands', body: `<div class="form-grid"><div class="field"><label>High from</label><input class="input" type="number" name="high" value="${store.s.scoring.bands.high}"></div><div class="field"><label>Medium from</label><input class="input" type="number" name="medium" value="${store.s.scoring.bands.medium}"></div></div>`, buttons: [{ label: 'Cancel', value: null }, { label: 'Save bands', cls: 'primary', value: 1 }] })
          .then(({ value, form }) => { if (!value) return; const h = +form.high, m = +form.medium; if (!(m > 0 && h > m && h <= 100)) { toast('Bands not saved', 'Medium must be below High, and High at most 100.'); return; } edit((sc) => { sc.bands = { high: h, medium: m }; }); }),
        test: () => {
          const sc = store.s.scoring; const all = store.s.leads.map((x) => scoreOf(x, sc));
          toast(`Scored ${all.filter((x) => x != null).length} leads · ${all.filter((x) => x == null).length} not assessed`, `${all.filter((x) => band(x, sc) === 'High').length} high, ${all.filter((x) => band(x, sc) === 'Medium').length} medium, ${all.filter((x) => band(x, sc) === 'Low').length} low. No lead was changed.`);
        },
        save: () => { store.update((s) => { s.scoring.dirty = false; }); toast(`${store.s.scoring.version} saved`, 'Saved in this demo session.'); ctx.rerender(); },
        publish: () => confirm('Publish scoring rules?', `${esc(store.s.scoring.version)} becomes the published version. In the demo no lead scores are rewritten.`, 'Publish').then((ok) => {
          if (!ok) return; store.update((s) => { s.scoring.version = 'Published v1.3'; s.scoring.dirty = false; }); toast('Scoring rules published', 'Demo simulation — no operational scores changed.'); ctx.rerender();
        }),
        versions: () => modal({ title: 'Versions', body: `<table class="tbl"><thead><tr><th>Version</th><th>Status</th><th>By</th><th>Date</th></tr></thead><tbody>
            <tr><td>${esc(store.s.scoring.version)}</td><td>${statusBadge(store.s.scoring.version.startsWith('Draft') ? 'Draft' : 'Published')}</td><td>Yosef Soliman</td><td>Oct 29, 2026</td></tr>
            <tr><td>v1.2</td><td>${statusBadge(store.s.scoring.version.startsWith('Draft') ? 'Published' : 'Archived', { tone: store.s.scoring.version.startsWith('Draft') ? '' : 'gray' })}</td><td>Yosef Soliman</td><td>Oct 14, 2026</td></tr>
            <tr><td>v1.1</td><td>${statusBadge('Archived', { tone: 'gray' })}</td><td>Maya Hassan</td><td>Sep 30, 2026</td></tr></tbody></table>
            <div class="row mt12"><button class="btn sm" data-reset>${icon('rotate', 14)} Restore default weights</button></div>`, buttons: [{ label: 'Close', value: null }],
          onMount: (ov) => ov.querySelector('[data-reset]').addEventListener('click', () => { ov.querySelector('[data-close]').click(); edit((sc) => sc.factors.forEach((f) => { f.max = DEFAULT_MAX[f.key]; })); toast('Default weights restored', 'Draft only.'); }) }),
      },
      change: {
        max: (el) => edit((sc) => { sc.factors[+el.dataset.i].max = Math.max(0, Math.min(100, Math.round(+el.value || 0))); }),
        unknown: (el) => edit((sc) => { sc.unknown = el.value; }),
        lead: (el) => { ui.lead = el.value; ctx.rerender(); },
      },
      input: {
        // While dragging, only sync the number box and total; the full re-render happens on release.
        slide: (el) => {
          const row = el.closest('tr'); row.querySelector('input[type=number]').value = el.value;
          const sum = [...root.querySelectorAll('.sc-range')].reduce((a, r) => a + +r.value, 0);
          const t = root.querySelector('#sc-total'); if (t) t.textContent = sum;
        },
        q: (el) => { ui.q = el.value; keepFocus('#sc-q', ctx.rerender); },
      },
    });
  },
};
