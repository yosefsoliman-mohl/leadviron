// 27 · Sales & Team Performance — follow-up speed, reach, conversions and overdue work per member or team.
import { icon, esc, avatar, stat, select, bar, on, toast, modal, statusBadge } from '../ui.js';
import { store, DEMO_TODAY } from '../store.js';

const ui = { period: 'Oct 24 – 29, 2026', team: '', owner: '', by: 'member' };

// Sample results for the KSA Logistics Outreach assignment (64 contacts).
const MEMBERS = [
  { name: 'Sara Ahmed', team: 'Sales A', assigned: 24, reached: 20, median: 18, replies: 8, conv: 3 },
  { name: 'Khalid Ali', team: 'Sales A', assigned: 22, reached: 16, median: 26, replies: 6, conv: 2 },
  { name: 'Maya Hassan', team: 'Sales B', assigned: 18, reached: 12, median: 34, replies: 4, conv: 1 },
];

const FOLLOW = [
  { leadId: 'LD-0842', reason: 'Overdue follow-up call · Oct 28', action: 'Open task', href: '#/demo/sales/tasks?task=TSK-301' },
  { leadId: 'LD-1048', reason: 'Demo requested · Oct 30, 2:00 PM Riyadh', action: 'Schedule demo', href: '#/demo/sales/tasks?task=TSK-308' },
  { leadId: 'LD-0731', reason: 'Waiting for reply', action: 'Open lead', href: '#/demo/leads/LD-0731' },
];

const overdueFor = (name) => store.s.tasks.filter((t) => t.status !== 'Done' && t.due.slice(0, 10) < DEMO_TODAY && (!name || t.owner === name)).length;

function rowsFor() {
  const ms = MEMBERS.filter((m) => (!ui.team || m.team === ui.team) && (!ui.owner || m.name === ui.owner)).map((m) => ({ ...m, overdue: overdueFor(m.name) }));
  if (ui.by === 'member') return ms;
  const teams = {};
  ms.forEach((m) => {
    const t = teams[m.team] || (teams[m.team] = { name: m.team, team: m.team, assigned: 0, reached: 0, replies: 0, conv: 0, overdue: 0, w: 0 });
    t.assigned += m.assigned; t.reached += m.reached; t.replies += m.replies; t.conv += m.conv; t.overdue += m.overdue; t.w += m.median * m.reached;
  });
  return Object.values(teams).map((t) => ({ ...t, median: Math.round(t.w / t.reached) }));
}

function memberLeads(ctx, name) {
  const leads = store.s.leads.filter((l) => l.owner === name && l.eligibility === 'Eligible').slice(0, 8);
  modal({
    title: `${name} · assigned contacts`, wide: true,
    body: `<p class="muted mb12">Sample of eligible contacts assigned to ${esc(name)} in this demo.</p><div class="table-wrap"><table class="tbl"><thead><tr><th>Lead</th><th>Stage</th><th>Last activity</th><th></th></tr></thead><tbody>
      ${leads.map((l) => `<tr><td><div class="cell-person">${avatar(l.initials, 'sm')}<div><div class="nm">${esc(l.name)}</div><div class="co">${esc(l.company || 'Not found')}</div></div></div></td><td>${statusBadge(l.stage)}</td><td class="muted">${esc(l.activity)}</td><td class="r"><a href="#/demo/leads/${l.id}" data-close>Open</a></td></tr>`).join('')}</tbody></table></div>`,
    buttons: [{ label: 'Close', value: null }, { label: 'Open tasks', cls: 'primary', value: 1 }],
  }).then(({ value }) => value && ctx.navigate('/demo/sales/tasks'));
}

export default {
  title: 'Sales & Team Performance',
  render() {
    const rows = rowsFor();
    const t = rows.reduce((a, r) => ({ assigned: a.assigned + r.assigned, reached: a.reached + r.reached, replies: a.replies + r.replies, conv: a.conv + r.conv, overdue: a.overdue + r.overdue }), { assigned: 0, reached: 0, replies: 0, conv: 0, overdue: 0 });
    const follow = FOLLOW.map((f) => ({ ...f, lead: store.s.leads.find((l) => l.id === f.leadId) })).filter((f) => (!ui.owner || f.lead.owner === ui.owner) && (!ui.team || MEMBERS.find((m) => m.name === f.lead.owner)?.team === ui.team));
    const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    return `
    <div class="page-head"><div class="titles"><h1>Sales & Team Performance</h1><div class="sub">KSA Logistics Outreach · ${t.assigned} assigned contacts</div></div>
      <div class="actions" style="flex-direction:column;align-items:flex-end">
        <div class="row wrap">
          ${select(['Oct 24 – 29, 2026', 'Oct 1 – 29, 2026'], ui.period, 'data-change="period" aria-label="Period"')}
          ${select([['', 'All teams'], 'Sales A', 'Sales B'], ui.team, 'data-change="team" aria-label="Team"')}
          ${select([['', 'All owners'], ...MEMBERS.map((m) => m.name)], ui.owner, 'data-change="owner" aria-label="Owner"')}
        </div>
        <div class="seg blue" role="group" aria-label="Group by"><button class="${ui.by === 'member' ? 'active' : ''}" data-action="by" data-k="member">By member</button><button class="${ui.by === 'team' ? 'active' : ''}" data-action="by" data-k="team">By team</button></div>
      </div></div>
    <div class="grid g4">
      ${stat({ icon: 'users', label: 'Assigned contacts', value: t.assigned })}
      ${stat({ icon: 'mail', label: 'Reached', value: t.reached, meta: `${pctOf(t.reached, t.assigned)}% of assigned` })}
      ${stat({ icon: 'bars', label: 'Conversions', value: t.conv })}
      ${stat({ icon: 'file', label: 'Overdue tasks', value: t.overdue, action: 'overdue' })}
    </div>
    <div class="card mt16"><div class="card-head"><h2>Team performance by ${ui.by}</h2></div><div class="card-body">
      <div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>${ui.by === 'member' ? 'Member' : 'Team'}</th>${ui.by === 'member' ? '<th>Team</th>' : ''}<th class="c">Assigned</th><th>Reached</th><th class="c">Median first contact</th><th class="c">Replies</th><th class="c">Conversions</th><th class="c">Overdue</th></tr></thead>
        <tbody>${rows.map((r) => `<tr class="${ui.by === 'member' ? 'clickable' : ''}" ${ui.by === 'member' ? `data-action="member" data-name="${esc(r.name)}"` : ''}>
          <td><span class="owner"><span class="ico-circle sm">${icon(ui.by === 'member' ? 'user' : 'users', 15)}</span>${esc(r.name)}</span></td>${ui.by === 'member' ? `<td>${esc(r.team)}</td>` : ''}
          <td class="c num">${r.assigned}</td>
          <td><div class="row" style="min-width:220px"><span class="num" style="width:24px">${r.reached}</span><div class="grow" style="max-width:130px">${bar(pctOf(r.reached, r.assigned))}</div><span class="muted small">${pctOf(r.reached, r.assigned)}%</span></div></td>
          <td class="c">${r.median} min</td><td class="c num">${r.replies}</td><td class="c num">${r.conv}</td><td class="c num">${r.overdue}</td></tr>`).join('') || '<tr><td colspan="8"><div class="empty">No members match these filters.</div></td></tr>'}</tbody>
        ${rows.length ? `<tfoot><tr><td>Total</td>${ui.by === 'member' ? '<td></td>' : ''}<td class="c">${t.assigned}</td><td>${t.reached}</td><td class="c">—</td><td class="c">${t.replies}</td><td class="c">${t.conv}</td><td class="c">${t.overdue}</td></tr></tfoot>` : ''}
      </table></div>
      <p class="muted small mt8">First contact time: assignment to first successful contact.${ui.by === 'member' ? ' Select a member to see their contacts.' : ''}</p></div></div>
    <div class="card mt16"><div class="card-head"><h2>Needs follow-up</h2></div><div class="card-body">
      <div class="table-wrap flat"><table class="tbl"><thead><tr><th>Name</th><th>Company</th><th>Owner</th><th>Reason</th><th>Action</th></tr></thead>
        <tbody>${follow.map((f) => `<tr><td>${esc(f.lead.name)}</td><td>${esc(f.lead.company || 'Not found')}</td><td><span class="owner"><span class="ico-circle sm">${icon('user', 15)}</span>${esc(f.lead.owner)}</span></td><td>${esc(f.reason)}</td><td><a class="btn soft sm" href="${f.href}" style="min-width:120px">${f.action}</a></td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">Nothing needs follow-up for this filter.</div></td></tr>'}</tbody></table></div>
      <p class="muted small mt8">${t.assigned - t.reached} assigned contacts have not been reached.</p></div></div>`;
  },
  mount(root, ctx) {
    on(root, {
      click: {
        by: (el) => { ui.by = el.dataset.k; ctx.rerender(); },
        member: (el) => memberLeads(ctx, el.dataset.name),
        overdue: () => ctx.navigate('/demo/sales/tasks'),
      },
      change: {
        period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo results are fixed sample values.'); },
        team: (el) => { ui.team = el.value; ctx.rerender(); },
        owner: (el) => { ui.owner = el.value; ctx.rerender(); },
      },
    });
  },
};
