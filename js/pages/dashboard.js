// 02 · Dashboard — workspace overview with links into every section.
import { icon, esc, stat, pageHead, select, on, toast, funnel, sourceIcon } from '../ui.js';
import { store } from '../store.js';
import { addLeadModal } from '../shared.js';

const ui = { period: 'Oct 1 – 29, 2026', team: 'All teams' };

const SOURCE_ROWS = [
  ['Meta Ads', 520, 312, 44], ['Google Ads', 360, 234, 38], ['LinkedIn', 240, 150, 26], ['Web Forms', 120, 48, 4],
];

export default {
  title: 'Dashboard',
  render() {
    const s = store.s;
    const today = s.tasks.filter((t) => t.due.startsWith('2026-10-29')).slice(0, 3);
    const groups = [
      { title: `Follow up with ${s.conversations.filter((c) => c.status === 'Open').length + 2} leads`, sub: 'WhatsApp • 11:00 AM', href: '#/demo/conversations', id: 'g1' },
      { title: `Review ${12} qualified leads`, sub: 'Lead review • 1:30 PM', href: '#/demo/leads?qual=Qualified', id: 'g2' },
      { title: `Complete ${s.tasks.filter((t) => t.type === 'LinkedIn' && t.status !== 'Done').length + 3} LinkedIn tasks`, sub: 'Assisted outreach • 3:00 PM', href: '#/demo/sales/tasks', id: 'g3' },
    ];
    const done = s.dashDone || {};
    const email = s.integrations.find((i) => i.id === 'email');
    return `
    ${pageHead({
      title: 'Dashboard', sub: 'Your lead-to-customer overview',
      actions: `${select(['Oct 1 – 29, 2026', 'Oct 24 – 29, 2026', 'Sep 1 – 30, 2026'], ui.period, 'data-change="period" aria-label="Period" style="min-width:190px"')}
        ${select(['All teams', 'Sales A', 'Sales B'], ui.team, 'data-change="team" aria-label="Team" style="min-width:150px"')}
        <button class="btn primary" data-action="add">${icon('plus', 18)} Add lead</button>`,
    })}
    <div class="grid g4">
      ${stat({ icon: 'users', label: 'New leads', value: '1,240', meta: 'This period', action: 'go-leads' })}
      ${stat({ icon: 'target', label: 'Qualified leads', value: '744', meta: '60% qualification rate', action: 'go-qual' })}
      ${stat({ icon: 'mail', label: 'Contacted', value: '558', meta: 'Successful contact', action: 'go-outreach' })}
      ${stat({ icon: 'bars', label: 'Conversions', value: '112', meta: '9.0% of new leads', action: 'go-funnel' })}
    </div>
    <div class="split wide-side mt16">
      <div class="card">
        <div class="card-head"><h2>Lead conversion funnel</h2><span class="muted">Overall conversion</span> <span class="blue strong" style="font-size:18px;color:var(--blue-600)">9.0%</span></div>
        <div class="card-body">${funnel([{ label: 'New leads', value: 1240, href: '#/demo/analytics/acquisition' }, { label: 'Qualified', value: 744, href: '#/demo/analytics/acquisition' }, { label: 'Contacted', value: 558, href: '#/demo/analytics/acquisition' }, { label: 'Converted', value: 112, href: '#/demo/analytics/acquisition' }])}</div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Today’s tasks</h2><a href="#/demo/sales/tasks" class="small">View all</a></div>
        <div class="card-body" style="padding-top:0">
          ${groups.map((g) => `<div class="list-item">
            <input type="checkbox" class="check" style="width:22px;height:22px" data-change="done" data-id="${g.id}" ${done[g.id] ? 'checked' : ''} aria-label="Mark ${esc(g.title)} done">
            <a class="grow" href="${g.href}" style="color:inherit;text-decoration:none"><div class="strong" style="${done[g.id] ? 'text-decoration:line-through;color:var(--ink-400)' : ''}">${esc(g.title)}</div><div class="muted small">${esc(g.sub)}</div></a>
            <span class="badge gray">${done[g.id] ? 'Done' : 'Due today'}</span></div>`).join('')}
          ${today.length ? `<div class="muted small mt8">${today.length} individual tasks due today · <a href="#/demo/sales/tasks">open Tasks & Calendar</a></div>` : ''}
        </div>
      </div>
    </div>
    <div class="split wide-side mt16">
      <div class="card">
        <div class="card-head"><h2>Lead sources</h2><a href="#/demo/analytics/acquisition" class="small">View report</a></div>
        <div class="card-body"><div class="table-wrap flat"><table class="tbl">
          <thead><tr><th>Source</th><th class="c">New leads</th><th class="c">Qualified</th><th class="c">Conversions</th></tr></thead>
          <tbody>${SOURCE_ROWS.map(([n, a, b, c]) => `<tr class="clickable" data-action="source" data-src="${n}"><td><span class="owner">${sourceIcon(n, 20)} ${n}</span></td><td class="c num">${a}</td><td class="c num">${b}</td><td class="c num">${c}</td></tr>`).join('')}</tbody>
        </table></div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Operational alerts</h2></div>
        <div class="card-body stack sm">
          ${email.status !== 'Connected' ? `<div class="callout" style="align-items:center">${icon('mail', 26)}<div class="grow"><div class="strong">Email connection needs attention</div><div class="muted small">Reconnect your sending account.</div></div><a href="#/demo/settings/integrations/email" class="strong small">Reconnect</a></div>` : ''}
          <div class="callout" style="align-items:center">${icon('database', 26)}<div class="grow"><div class="strong">Enrichment review required</div><div class="muted small">8 records need review.</div></div><a href="#/demo/intelligence/enrichment?tab=attention" class="strong small">Review</a></div>
          <div class="callout" style="align-items:center">${icon('flow', 26)}<div class="grow"><div class="strong">1 workflow run needs attention</div><div class="muted small">RUN-1050 · Email connector error</div></div><a href="#/demo/workflows/runs/RUN-1050" class="strong small">Open</a></div>
        </div>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    on(root, {
      click: {
        add: () => addLeadModal().then((id) => id && ctx.navigate(`/demo/leads/${id}`)),
        'go-leads': () => ctx.navigate('/demo/leads'),
        'go-qual': () => ctx.navigate('/demo/intelligence/qualification'),
        'go-outreach': () => ctx.navigate('/demo/analytics/outreach'),
        'go-funnel': () => ctx.navigate('/demo/analytics/acquisition'),
        source: (el) => ctx.navigate(`/demo/leads?source=${encodeURIComponent(el.dataset.src)}`),
      },
      change: {
        period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo totals are fixed sample values for every period.'); },
        team: (el) => { ui.team = el.value; toast(`Filtered to ${el.value}`, 'Demo totals are fixed sample values.'); },
        done: (el) => { store.update((s) => { s.dashDone = { ...(s.dashDone || {}), [el.dataset.id]: el.checked }; }); ctx.rerender(); },
      },
    });
  },
};
