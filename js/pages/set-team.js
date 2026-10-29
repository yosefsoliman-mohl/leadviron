// 30 · Team & Permissions — members, roles and the role editor.
import { icon, esc, avatar, statusBadge, pageHead, select, toggle, searchInput, on, toast, modal, confirm, keepFocus } from '../ui.js';
import { store } from '../store.js';
import { settingsTabs } from './settings-tabs.js';

const ui = { q: '', role: '', team: '', sel: new Set(), roleId: 'Sales Representative', draft: null };

const PERMS = [
  ['view', 'eye', 'View leads', ''],
  ['edit', 'edit', 'Edit leads', ''],
  ['contact', 'send', 'Contact leads', 'Channel eligibility still applies.'],
  ['export', 'download', 'Export data', ''],
  ['manage', 'settings', 'Manage workspace', ''],
];
const SCOPES = ['All records', 'Team records', 'Assigned records'];

function draftFor(id) {
  const r = store.s.roles.find((x) => x.id === id);
  return { id: r.id, title: r.title || r.id, scope: r.scope, perms: { ...r.perms } };
}

export default {
  title: 'Team & Permissions',
  render() {
    const s = store.s;
    if (!ui.draft || ui.draft.id !== ui.roleId) ui.draft = draftFor(ui.roleId);
    const d = ui.draft;
    const q = ui.q.trim().toLowerCase();
    const members = s.team.filter((m) => (!ui.role || m.role === ui.role) && (!ui.team || m.team === ui.team) && (!q || m.name.toLowerCase().includes(q) || m.email.includes(q)));
    const used = s.team.filter((m) => m.role === d.id).length;
    const active = s.team.filter((m) => m.status === 'Active').length;
    const teams = [...new Set(s.team.map((m) => m.team))];
    return `
    ${pageHead({ title: 'Settings', actions: `<button class="btn primary" data-action="invite">${icon('plus', 18)} Invite member</button>` })}
    ${settingsTabs('team')}
    <div class="split">
      <div class="stack">
        <div class="card card-pad">
          <div class="row between"><h2>Team members</h2><span class="muted small">${active} active members</span></div>
          <p class="muted mb12">Manage team members, their roles and data access.</p>
          <div class="filters">
            ${searchInput('Search members by name or email...', ui.q, 'data-input="q" id="tm-q"')}
            ${select([['', 'Role'], ...s.roles.map((r) => r.id)], ui.role, 'data-change="role" aria-label="Role"')}
            ${select([['', 'Team'], ...teams], ui.team, 'data-change="team" aria-label="Team"')}
          </div>
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th class="w-check"></th><th>Member</th><th>Role</th><th>Team</th><th>Status</th><th>Access</th><th></th></tr></thead>
            <tbody>${members.length ? members.map((m) => `<tr class="${m.role === d.id ? 'selected' : ''}">
              <td><input type="checkbox" class="check" data-change="sel" data-id="${m.id}" ${ui.sel.has(m.id) ? 'checked' : ''} aria-label="Select ${esc(m.name)}"></td>
              <td><div class="cell-person">${avatar(m.name, '', 'gray')}<div><div class="nm">${esc(m.name)}</div><div class="co">${esc(m.email)}</div></div></div></td>
              <td>${select(s.roles.map((r) => r.id), m.role, `data-change="member-role" data-id="${m.id}" aria-label="Role for ${esc(m.name)}"`, 'sm')}</td>
              <td>${esc(m.team)}</td>
              <td>${statusBadge(m.status, { tone: m.status === 'Active' ? '' : 'gray' })}</td>
              <td>${esc(m.access)}</td>
              <td class="rel"><button class="icon-btn" data-action="row-menu" data-id="${m.id}" aria-label="More for ${esc(m.name)}">${icon('more', 18)}</button></td></tr>`).join('') : `<tr><td colspan="7"><div class="empty">No members match.</div></td></tr>`}</tbody>
          </table></div>
        </div>
        <div class="card card-pad">
          <h2>Roles</h2><p class="muted mb12">Manage role definitions and permissions.</p>
          <div class="select-list" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
            ${s.roles.map((r) => `<button class="si ${r.id === ui.roleId ? 'active' : ''}" data-action="pick-role" data-id="${esc(r.id)}">${icon(r.icon, 18)}<span class="grow">${esc(r.title || r.id)}</span>${icon('chevRight', 16)}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="row between"><h2>Edit role</h2><span class="muted small">Used by ${used} member${used === 1 ? '' : 's'}</span></div>
        <p class="muted mb12">Update permissions for this role.</p>
        <div class="field"><label>Role title</label><input class="input" data-input="title" value="${esc(d.title)}"></div>
        <div class="field mt12"><label>Access scope</label>${select(SCOPES, d.scope, 'data-change="scope"')}</div>
        <h3 class="mt16 mb8">Permissions</h3>
        ${PERMS.map(([k, ic, label, hint]) => `<div class="setting-row">${icon(ic, 18)}<div class="grow"><div>${label}</div>${hint ? `<div class="muted small">${hint}</div>` : ''}</div>${toggle(d.perms[k], `data-change="perm" data-k="${k}" aria-label="${label}" ${d.id === 'Admin' ? 'disabled' : ''}`)}</div>`).join('')}
        ${d.id === 'Admin' ? '<p class="muted small mt8">Admin permissions are fixed.</p>' : ''}
        <div class="divider"></div>
        <div class="row" style="justify-content:flex-end"><button class="btn" data-action="cancel">Cancel</button><button class="btn primary" data-action="save-role">Save role</button></div>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(root, '#tm-q', ctx.rerender);
    on(root, {
      click: {
        'pick-role': (el) => { ui.roleId = el.dataset.id; ui.draft = null; re(); },
        cancel: () => { ui.draft = null; re(); },
        'save-role': () => {
          const d = ui.draft;
          store.update((s) => {
            const r = s.roles.find((x) => x.id === d.id);
            r.title = d.title; r.scope = d.scope; r.perms = { ...d.perms };
            s.team.forEach((m) => { if (m.role === d.id) m.access = d.scope; });
            s.audit.unshift({ id: `AUD-${930 + s.audit.length}`, time: 'Now', actor: s.me.name, actorRole: s.me.role, action: 'Role permissions updated', item: d.title, result: 'Success', setting: 'Permissions', before: '—', after: Object.keys(d.perms).filter((k) => d.perms[k]).join(', '), link: '#/demo/settings/team' });
          });
          toast(`Role “${d.title}” saved`, 'Demo only — no real permissions were changed.');
          ui.draft = null; re();
        },
        invite: () => modal({
          title: 'Invite member',
          body: `<div class="stack"><div class="form-grid">
            <div class="field"><label>Full name</label><input class="input" name="name" placeholder="e.g. Nora Khalid"></div>
            <div class="field"><label>Email</label><input class="input" name="email" placeholder="name@example.com"></div>
            <div class="field"><label>Role</label>${select(store.s.roles.map((r) => r.id), 'Sales Representative', 'name="role"')}</div>
            <div class="field"><label>Team</label>${select(['Sales A', 'Sales B', 'Operations'], 'Sales A', 'name="team"')}</div></div>
            <div class="callout">${icon('info', 18)}<span>The demo does not send invitations or create accounts. The member is listed as Invited for this session.</span></div></div>`,
          buttons: [{ label: 'Cancel', value: null }, { label: 'Add invite', cls: 'primary', value: 1 }],
        }).then(({ value, form }) => {
          if (!value) return;
          const name = form.name.trim() || 'New member';
          const role = store.s.roles.find((r) => r.id === form.role);
          store.update((s) => s.team.push({ id: `u-${Date.now()}`, name, email: form.email.trim() || `${name.split(' ')[0].toLowerCase()}@example.com`, role: form.role, team: form.team, status: 'Invited', access: role.scope }));
          toast(`${name} listed as Invited`, 'No invitation email was sent.'); re();
        }),
        'row-menu': (el) => {
          const m = store.s.team.find((x) => x.id === el.dataset.id);
          const isMe = m.name === store.s.me.name;
          modal({ title: m.name, body: `<div class="kv"><span class="k">Email</span><span class="v">${esc(m.email)}</span><span class="k">Role</span><span class="v">${esc(m.role)}</span><span class="k">Team</span><span class="v">${esc(m.team)}</span><span class="k">Access</span><span class="v">${esc(m.access)}</span><span class="k">Status</span><span class="v">${esc(m.status)}</span></div>`,
            buttons: [{ label: 'Close', value: null }, ...(isMe ? [] : [{ label: m.status === 'Active' ? 'Deactivate' : m.status === 'Invited' ? 'Revoke invite' : 'Reactivate', cls: 'danger', value: 'toggle' }])] })
            .then(({ value }) => {
              if (value !== 'toggle') return;
              if (m.status === 'Invited') { store.update((s) => { s.team = s.team.filter((x) => x.id !== m.id); }); toast('Invite revoked'); }
              else { store.update((s) => { const x = s.team.find((y) => y.id === m.id); x.status = x.status === 'Active' ? 'Inactive' : 'Active'; }); toast(`${m.name} ${m.status === 'Active' ? 'deactivated' : 'reactivated'}`); }
              re();
            });
        },
      },
      change: {
        role: (el) => { ui.role = el.value; re(); },
        team: (el) => { ui.team = el.value; re(); },
        sel: (el) => { el.checked ? ui.sel.add(el.dataset.id) : ui.sel.delete(el.dataset.id); },
        scope: (el) => { ui.draft.scope = el.value; },
        perm: (el) => { ui.draft.perms[el.dataset.k] = el.checked; },
        'member-role': (el) => {
          const m = store.s.team.find((x) => x.id === el.dataset.id);
          if (m.name === store.s.me.name && el.value !== 'Admin') { toast('You cannot remove your own Admin role', 'Ask another admin to change it.'); re(); return; }
          confirm('Change role?', `Change ${esc(m.name)} from ${esc(m.role)} to ${esc(el.value)}?`, 'Change role').then((ok) => {
            if (ok) {
              const role = store.s.roles.find((r) => r.id === el.value);
              store.update((s) => { const x = s.team.find((y) => y.id === m.id); x.role = el.value; x.access = role.scope; });
              toast(`${m.name} is now ${el.value}`, 'Saved in this demo session.');
            }
            re();
          });
        },
      },
      input: {
        q: (el) => { ui.q = el.value; re(); },
        title: (el) => { ui.draft.title = el.value; },
      },
    });
  },
};
