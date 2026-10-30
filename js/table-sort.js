// Click-to-sort for every `table.tbl` on a page. Clicking a header sorts ascending, again descending, a third
// time restores the original order. The choice is remembered per page and table, so it survives re-renders.
// Tables whose page sorts its own (paginated) data mark headers with data-action="sort" and are left alone.
import { icon } from './ui.js';

const saved = new Map(); // `${path}|${tableIndex}` -> { col, dir }

const pathKey = () => location.hash.split('?')[0];

// Numbers (including %, SAR, "3 / 6", "1,240"), dates and text, with empty values ("—") always last.
function sortValue(cell) {
  // Skip avatar initials ("SA\nSara Ahmed") so people sort by name.
  const t = (cell?.innerText || '').replace(/^[A-Z]{2,3}\n(?=\S)/, '').replace(/\s+/g, ' ').trim();
  if (!t || t === '—' || /^not (found|assessed)/i.test(t)) return { empty: true };
  const num = t.replace(/^SAR\s*/i, '').match(/^[-+]?\d[\d,]*(\.\d+)?/);
  if (num) return { n: parseFloat(num[0].replace(/,/g, '')) };
  if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}/.test(t)) { const d = Date.parse(t.replace(' · ', ' ')); if (!Number.isNaN(d)) return { n: d }; }
  return { s: t.toLowerCase() };
}

function compare(a, b) {
  if (a.empty || b.empty) return a.empty && b.empty ? 0 : a.empty ? 1 : -1;
  if (a.n != null && b.n != null) return a.n - b.n;
  return String(a.s ?? a.n).localeCompare(String(b.s ?? b.n), 'en', { numeric: true });
}

function apply(table, col, dir) {
  const body = table.tBodies[0];
  if (!body) return;
  const rows = [...body.rows];
  rows.forEach((r, i) => { if (r.dataset.order == null) r.dataset.order = i; });
  // Group rows (e.g. "Today (4)") split the table into sections that are sorted separately.
  const sections = [];
  let cur = [];
  rows.forEach((r) => {
    if (r.classList.contains('group') || r.querySelector('td[colspan]')) { sections.push(cur, [r]); cur = []; } else cur.push(r);
  });
  sections.push(cur);
  const frag = document.createDocumentFragment();
  sections.forEach((sec) => {
    if (sec.length === 1 && (sec[0].classList.contains('group') || sec[0].querySelector('td[colspan]'))) { frag.appendChild(sec[0]); return; }
    const sorted = dir ? [...sec].sort((a, b) => dir * compare(sortValue(a.cells[col]), sortValue(b.cells[col])) || a.dataset.order - b.dataset.order)
      : [...sec].sort((a, b) => a.dataset.order - b.dataset.order);
    sorted.forEach((r) => frag.appendChild(r));
  });
  body.appendChild(frag);
  [...table.tHead.rows[0].cells].forEach((th, i) => {
    if (!th.classList.contains('sortable')) return;
    const d = i === col ? dir : 0;
    th.setAttribute('aria-sort', d > 0 ? 'ascending' : d < 0 ? 'descending' : 'none');
    th.querySelector('.sort-ind').innerHTML = icon(d > 0 ? 'chevUp' : d < 0 ? 'chevDown' : 'sort', 13);
  });
}

export function enhanceTables(root) {
  root.querySelectorAll('table.tbl').forEach((table, ti) => {
    const head = table.tHead?.rows[0];
    // Fully page-sorted tables (sortTh headers) are skipped; headers with their own button keep it.
    if (!head || table.dataset.nosort != null || head.querySelector('th.sortable[data-action]')) return;
    if ((table.tBodies[0]?.rows.length || 0) < 2) return;
    table.dataset.sortId = ti;
    [...head.cells].forEach((th, i) => {
      if (!th.textContent.trim() || th.classList.contains('w-check') || th.colSpan > 1 || th.querySelector('[data-action], input')) return;
      th.classList.add('sortable');
      th.tabIndex = 0;
      th.dataset.col = i;
      th.setAttribute('aria-sort', 'none');
      th.insertAdjacentHTML('beforeend', `<span class="sort-ind" aria-hidden="true">${icon('sort', 13)}</span>`);
    });
    const s = saved.get(`${pathKey()}|${ti}`);
    if (s) apply(table, s.col, s.dir);
  });
}

// A page's own sort button takes over from the header sort on that table.
document.addEventListener('click', (e) => {
  const own = e.target.closest('th [data-action]');
  const table = own?.closest('table[data-sort-id]');
  if (table) saved.delete(`${pathKey()}|${table.dataset.sortId}`);
}, true);

function onActivate(e) {
  const th = e.target.closest('th.sortable');
  if (!th || e.target.closest('input, button, a, select')) return;
  if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  const table = th.closest('table');
  const key = `${pathKey()}|${table.dataset.sortId}`;
  const col = +th.dataset.col;
  const prev = saved.get(key);
  // asc → desc → original order
  const dir = !prev || prev.col !== col ? 1 : prev.dir === 1 ? -1 : 0;
  if (dir) saved.set(key, { col, dir }); else saved.delete(key);
  apply(table, col, dir);
}
document.addEventListener('click', onActivate);

// For paginated tables the page sorts its full data set. `state` is { key, dir } kept in the page's ui object.
export function sortTh(label, key, state, cls = '') {
  const d = state.key === key ? state.dir : 0;
  return `<th class="sortable ${cls}" data-action="sort" data-key="${key}" tabindex="0" role="button" aria-sort="${d > 0 ? 'ascending' : d < 0 ? 'descending' : 'none'}">${label}<span class="sort-ind" aria-hidden="true">${icon(d > 0 ? 'chevUp' : d < 0 ? 'chevDown' : 'sort', 13)}</span></th>`;
}

// Cycles asc → desc → off for the clicked key.
export function nextSort(state, key) {
  if (state.key !== key) return { key, dir: 1 };
  return state.dir === 1 ? { key, dir: -1 } : { key: null, dir: 0 };
}

export function sortBy(rows, state, getters) {
  if (!state.key || !getters[state.key]) return rows;
  const get = getters[state.key];
  return rows.map((r, i) => [r, i]).sort(([a, ia], [b, ib]) => {
    const va = get(a), vb = get(b);
    const ea = va == null || va === '', eb = vb == null || vb === '';
    if (ea || eb) return ea && eb ? ia - ib : ea ? 1 : -1;
    const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'en', { numeric: true });
    return state.dir * c || ia - ib;
  }).map(([r]) => r);
}
document.addEventListener('keydown', onActivate);
