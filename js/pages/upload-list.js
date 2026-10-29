// Lead Generation · Upload List — bring an existing lead list in from CSV, map columns, review and import.
// A real file is read in the browser only to count rows and detect columns; nothing is uploaded anywhere.
import { icon, esc, owner, pageHead, select, toggle, on, toast, modal } from '../ui.js';
import { store, OWNERS } from '../store.js';
import { listLeads } from './prospect-lists.js';
import { genCrumbs } from './gen-nav.js';

const TARGETS = ['Full name', 'Email', 'Phone', 'Company', 'Job title', 'City', 'LinkedIn URL', 'Ignore'];
const GUESS = { name: 'Full name', 'full name': 'Full name', email: 'Email', 'e-mail': 'Email', phone: 'Phone', mobile: 'Phone', company: 'Company', organization: 'Company', title: 'Job title', 'job title': 'Job title', position: 'Job title', city: 'City', linkedin: 'LinkedIn URL' };
const SAMPLE = {
  file: 'ksa-prospects-nov.csv', rows: 92,
  columns: ['Name', 'Email', 'Mobile', 'Company', 'Position', 'City', 'Notes'],
  preview: [['Rami Nasser', 'contact@', '+966 5•• 4410', 'Rawabi Freight', 'Ops Manager', 'Riyadh', 'Met at expo'], ['Huda Kamal', 'huda.kamal@example.com', '+966 5•• 18', 'Najd Distribution', 'Procurement Lead', 'Jeddah', ''], ['Fahad Al-Harbi', 'fahad.alharbi@example.com', '+966 5•• 7781', 'Sahara Cargo', 'General Manager', 'Dammam', 'Warm intro']],
};

const fresh = () => ({ step: 1, file: null, rows: 0, columns: [], preview: [], map: {}, name: '', owner: 'Sara Ahmed', enrich: true, dedupe: true });
let ui = fresh();

const guess = (c) => GUESS[c.trim().toLowerCase()] || 'Ignore';

function loadSample() {
  Object.assign(ui, { file: SAMPLE.file, rows: SAMPLE.rows, columns: SAMPLE.columns, preview: SAMPLE.preview, step: 2, name: 'KSA prospects — November' });
  ui.map = Object.fromEntries(ui.columns.map((c) => [c, guess(c)]));
}

// Naive CSV split is enough for a header + row count preview.
function readFile(file, done) {
  const r = new FileReader();
  r.onload = () => {
    const lines = String(r.result).split(/\r?\n/).filter((l) => l.trim());
    const split = (l) => l.split(',').map((x) => x.replace(/^"|"$/g, '').trim());
    const columns = split(lines[0] || '').filter(Boolean);
    Object.assign(ui, { file: file.name, rows: Math.max(0, lines.length - 1), columns, preview: lines.slice(1, 4).map(split), step: 2, name: file.name.replace(/\.[^.]+$/, '') });
    ui.map = Object.fromEntries(columns.map((c) => [c, guess(c)]));
    done();
  };
  r.readAsText(file);
}

function review() {
  const mapped = Object.values(ui.map);
  const hasName = mapped.includes('Full name');
  const hasContact = mapped.includes('Email') || mapped.includes('Phone');
  const invalid = ui.file === SAMPLE.file ? 2 : Math.round(ui.rows * 0.02);
  const dupes = ui.dedupe ? (ui.file === SAMPLE.file ? 4 : Math.round(ui.rows * 0.04)) : 0;
  return { hasName, hasContact, ok: hasName && hasContact, invalid, dupes, created: Math.max(0, ui.rows - invalid - dupes) };
}

function stepper() {
  const steps = ['Upload file', 'Map columns', 'Review & import'];
  return `<div class="row wrap" style="gap:8px">${steps.map((t, i) => {
    const n = i + 1; const on_ = ui.step === n; const done = ui.step > n;
    return `<button class="chip ${on_ ? '' : 'gray'}" data-action="go" data-step="${n}" ${n > 1 && !ui.file ? 'disabled' : ''} style="${on_ ? 'border-color:var(--blue-500);color:var(--blue-700)' : ''}">${done ? icon('check', 14) : `<b>${n}</b>`} ${t}</button>${i < 2 ? `<span class="muted">${icon('chevRight', 14)}</span>` : ''}`;
  }).join('')}</div>`;
}

function stepBody() {
  if (ui.step === 1 || !ui.file) {
    return `<label class="dropzone" data-drop>
      <input type="file" accept=".csv,text/csv" data-change="file" class="sr-only">
      ${icon('fileUp', 34)}
      <div class="strong mt8" style="font-size:16px">Drop a CSV file here or click to choose</div>
      <div class="muted small mt8">Name plus email or phone is enough. Company, job title and city are optional — enrichment can fill them later.</div>
    </label>
    <div class="row wrap mt12"><button class="btn" data-action="sample">${icon('file', 16)} Use sample file</button><button class="btn ghost" data-action="template">${icon('download', 16)} Download CSV template</button></div>
    <p class="muted small mt12">Your file stays in this browser tab. The demo only reads the header and counts rows.</p>`;
  }
  if (ui.step === 2) {
    const r = review();
    return `<div class="row between wrap mb12"><div><div class="strong">${esc(ui.file)}</div><div class="muted small">${ui.rows} rows · ${ui.columns.length} columns detected</div></div><button class="btn sm" data-action="restart">${icon('refresh', 14)} Choose another file</button></div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Column in file</th><th>Sample value</th><th>Leadviron field</th></tr></thead><tbody>
      ${ui.columns.map((c, i) => `<tr><td class="strong" style="font-weight:500">${esc(c)}</td><td class="muted">${esc(ui.preview[0]?.[i] || '—')}</td><td style="min-width:180px">${select(TARGETS, ui.map[c], `data-change="map" data-col="${esc(c)}" aria-label="Map ${esc(c)}"`, 'sm')}</td></tr>`).join('')}
    </tbody></table></div>
    ${r.ok ? '' : `<div class="callout warn mt12">${icon('alert', 18)}<span>Map a <b>Full name</b> column and at least one of <b>Email</b> or <b>Phone</b> to continue.</span></div>`}
    <div class="row mt16" style="justify-content:flex-end"><button class="btn primary" data-action="go" data-step="3" ${r.ok ? '' : 'disabled'}>Continue ${icon('arrowRight', 16)}</button></div>`;
  }
  const r = review();
  return `<div class="grid g3">
      <div class="card card-pad"><div class="muted small">Rows in file</div><div class="strong" style="font-size:24px">${ui.rows}</div></div>
      <div class="card card-pad"><div class="muted small">New leads to create</div><div class="strong" style="font-size:24px;color:var(--blue-600)">${r.created}</div></div>
      <div class="card card-pad"><div class="muted small">Need review</div><div class="strong" style="font-size:24px">${r.invalid + r.dupes}</div><div class="muted tiny">${r.dupes} possible duplicates · ${r.invalid} invalid</div></div>
    </div>
    <div class="form-grid mt16">
      <div class="field"><label>List name</label><input class="input" data-input="name" value="${esc(ui.name)}"></div>
      <div class="field"><label>Owner</label>${select(OWNERS, ui.owner, 'data-change="owner"')}</div>
    </div>
    <div class="mt12">
      <div class="setting-row"><div class="grow"><div>Check for duplicates</div><div class="muted small">Matches go to Duplicate Review instead of creating a second record.</div></div>${toggle(ui.dedupe, 'data-change="dedupe"')}</div>
      <div class="setting-row"><div class="grow"><div>Enrich after import</div><div class="muted small">Looks up company, job title, city, size, industry and LinkedIn URL. Uses demo credits only.</div></div>${toggle(ui.enrich, 'data-change="enrich"')}</div>
    </div>
    <div class="callout mt12">${icon('shield', 18)}<span>Imported leads are not contact-eligible until qualification and channel permission rules pass.</span></div>
    <div class="row mt16" style="justify-content:space-between"><button class="btn" data-action="go" data-step="2">${icon('arrowLeft', 16)} Back</button><button class="btn primary" data-action="import">${icon('upload', 16)} Import ${r.created} leads</button></div>`;
}

export default {
  title: 'Upload List',
  render() {
    const s = store.s;
    const lists = s.lists;
    const uploads = s.ingestion.imports;
    return `
    ${pageHead({ crumbs: genCrumbs('Upload List'), title: 'Upload List', sub: 'Bring in lead lists you already have — CSV from events, partners or your CRM.',
      actions: `<a class="btn" href="#/demo/prospecting/lists">${icon('users', 16)} All prospect lists</a>` })}
    <div class="split">
      <div class="card card-pad"><div class="row between wrap mb16"><h2>New upload</h2>${stepper()}</div>${stepBody()}</div>
      <div class="stack">
        <div class="card card-pad"><h3 class="mb8">How uploads work</h3>
          ${[['fileUp', 'Upload', 'CSV with a header row. Up to 5,000 rows per file in production.'], ['sliders', 'Map', 'Match your columns to Leadviron fields. Original values are kept.'], ['database', 'Enrich & qualify', 'Optional enrichment, then qualification and scoring rules apply.']].map(([ic, t, d]) => `<div class="list-item" style="align-items:flex-start"><span class="ico-circle sm">${icon(ic, 16)}</span><div><div class="strong" style="font-weight:600">${t}</div><div class="muted small">${d}</div></div></div>`).join('')}
        </div>
        <div class="card card-pad"><div class="row between mb8"><h3>Recent uploads</h3><a class="small" href="#/demo/settings/ingestion">Ingestion log</a></div>
          ${uploads.map((u) => `<div class="list-item"><span class="ico-circle sm">${icon('file', 16)}</span><div class="grow"><div class="strong" style="font-weight:500">${esc(u.file)}</div><div class="muted small">${u.rows} rows · ${u.created} created · ${u.review + u.failed} to review</div></div><span class="muted tiny nowrap">${esc(u.at.split(' ').slice(0, 2).join(' '))}</span></div>`).join('')}
        </div>
      </div>
    </div>
    <h2 class="section-title">Lists</h2>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>List</th><th>Owner</th><th>Source</th><th class="r">People</th><th class="r">Outreach-ready</th><th>Updated</th><th></th></tr></thead><tbody>
      ${lists.map((l) => `<tr class="clickable" data-action="open" data-id="${l.id}"><td><div class="strong" style="font-weight:500">${esc(l.name)}</div><div class="muted small">${esc(l.type || 'Static')}</div></td><td>${owner(l.owner)}</td><td>${esc(l.source)}</td><td class="r num">${listLeads(l).length}</td><td class="r num">${l.ready}</td><td class="muted">${esc(l.updated)}</td><td class="r">${icon('chevRight', 16)}</td></tr>`).join('')}
    </tbody></table></div>`;
  },
  mount(root, ctx) {
    const re = () => ctx.rerender();
    // Drag and drop onto the drop zone
    const dz = root.querySelector('[data-drop]');
    if (dz) {
      ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
      dz.addEventListener('dragleave', () => dz.classList.remove('over'));
      dz.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f, re); });
    }
    on(root, {
      click: {
        sample: () => { loadSample(); re(); },
        template: () => toast('CSV template', 'Columns: Full name, Email, Phone, Company, Job title, City. Download is simulated in the demo.'),
        restart: () => { ui = fresh(); re(); },
        go: (el) => { if (ui.file) { ui.step = +el.dataset.step; re(); } },
        open: (el) => ctx.navigate(`/demo/prospecting/lists/${el.dataset.id}`),
        import: () => {
          const r = review();
          const name = ui.name.trim() || ui.file;
          const id = `lst-${Date.now().toString(36)}`;
          // Rows are matched to demo records so the new list has real members to open.
          const ids = store.s.leads.slice(0, Math.min(r.created, store.s.leads.length)).map((l) => l.id);
          store.update((s) => {
            s.lists.unshift({ id, name, sub: ui.file, owner: ui.owner, source: 'CSV upload', type: 'Uploaded', people: ids.length, ready: 0, campaign: null, updated: 'Now', filter: null, ids });
            s.ingestion.imports.unshift({ id: `IMP-${32 + s.ingestion.imports.length}`, file: ui.file, rows: ui.rows, created: r.created, updated: 0, review: r.dupes, failed: r.invalid, by: 'Ahmed Ashour', at: 'Oct 29, 2026 11:05 AM' });
          });
          toast(`“${name}” imported · ${r.created} leads`, `${r.dupes + r.invalid} rows sent to review.${ui.enrich ? ' Enrichment simulated with demo credits.' : ''}`);
          ui = fresh();
          ctx.navigate(`/demo/prospecting/lists/${id}`);
        },
      },
      change: {
        file: (el) => { const f = el.files[0]; if (f) readFile(f, re); },
        map: (el) => { ui.map[el.dataset.col] = el.value; re(); },
        owner: (el) => { ui.owner = el.value; },
        dedupe: (el) => { ui.dedupe = el.checked; re(); },
        enrich: (el) => { ui.enrich = el.checked; },
      },
      input: { name: (el) => { ui.name = el.value; } },
    });
  },
};
