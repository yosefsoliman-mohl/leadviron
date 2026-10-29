// 14 · Campaigns — outreach campaigns with status tabs, filters and a summary panel.
import { icon, esc, owner, pageHead, select, searchInput, pager, tabs, on, toast, confirm, modal, keepFocus, pct } from '../ui.js';
import { store, OWNERS } from '../store.js';
import { genCrumbs, outreachTabs } from './gen-nav.js';

const ui = { tab: 'All', q: '', channel: '', owner: '', status: '', sel: 'cmp-ksa', panel: true };
const STATUS_ICON = { Running: 'play', Scheduled: 'calendar', Paused: 'pause', Draft: 'file', Completed: 'check' };
const CH_SHORT = { Email: 'mail', WhatsApp: 'whatsapp', 'LinkedIn tasks': 'linkedin' };

function filtered() {
  const q = ui.q.trim().toLowerCase();
  return store.s.campaigns.filter((c) =>
    (ui.tab === 'All' || c.status === ui.tab) &&
    (!ui.status || c.status === ui.status) &&
    (!ui.owner || c.owner === ui.owner) &&
    (!ui.channel || c.channels.includes(ui.channel)) &&
    (!q || c.name.toLowerCase().includes(q)));
}

function statusPill(st) {
  return `<span class="badge ${st === 'Draft' ? 'gray' : ''}" style="height:28px;padding:0 12px">${icon(STATUS_ICON[st] || 'circle', 15)} ${esc(st)}</span>`;
}

function channelCell(c) {
  return `<div class="row" style="gap:8px;color:var(--ink-700)">${c.channels.map((ch) => (CH_SHORT[ch] === 'linkedin' ? `<span style="color:#0a66c2">${icon('linkedin', 18)}</span>` : icon(CH_SHORT[ch] || 'file', 18))).join('')}${c.channels.includes('LinkedIn tasks') ? icon('file', 18) : ''}</div>
    <div class="muted small">${c.channels.join(' · ')}</div>`;
}

export default {
  title: 'Campaigns',
  render() {
    const s = store.s;
    const all = s.campaigns;
    const count = (st) => all.filter((c) => c.status === st).length;
    const rows = filtered();
    const sel = all.find((c) => c.id === ui.sel);
    const list = sel && s.lists.find((l) => l.id === sel.list);
    return `
    ${pageHead({ crumbs: genCrumbs('Outreach'), title: 'Campaigns', sub: 'Manage your outreach campaigns', actions: `<a class="btn primary" href="#/demo/campaigns/new" style="text-decoration:none">${icon('plus', 18)} Create campaign</a>` })}
    ${outreachTabs('campaigns')}
    ${tabs([['All', 'All', all.length], ...['Running', 'Scheduled', 'Paused', 'Draft', 'Completed'].map((t) => [t, t, count(t)])], ui.tab)}
    <div class="filters">
      ${searchInput('Search by campaign name...', ui.q, 'data-input="q" id="cmp-q"')}
      ${select([['', 'Channel'], 'Email', 'WhatsApp', 'LinkedIn tasks'], ui.channel, 'data-change="channel" aria-label="Channel"')}
      ${select([['', 'Owner'], ...OWNERS], ui.owner, 'data-change="owner" aria-label="Owner"')}
      ${select([['', 'Status'], 'Running', 'Scheduled', 'Paused', 'Draft', 'Completed'], ui.status, 'data-change="status" aria-label="Status"')}
    </div>
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th class="w-check"></th><th>Campaign</th><th>Channels</th><th>Audience</th><th>Status</th><th>Reached</th><th>Replies</th><th>Conversions</th><th>Owner</th><th></th></tr></thead>
        <tbody>${rows.length ? rows.map((c) => `<tr class="clickable ${ui.sel === c.id ? 'selected' : ''}" data-action="select" data-id="${c.id}">
          <td><input type="checkbox" class="check" data-change="pick" data-id="${c.id}" ${ui.sel === c.id ? 'checked' : ''} aria-label="Select ${esc(c.name)}"></td>
          <td><a href="#/demo/campaigns/${c.id}" class="strong" style="color:var(--blue-600);font-weight:500">${esc(c.name)}</a><div class="muted small">${esc(c.dates)}</div></td>
          <td>${channelCell(c)}</td>
          <td class="num">${c.audience}</td>
          <td>${statusPill(c.status)}</td>
          <td class="num">${c.reached}</td><td class="num">${c.replies}</td><td class="num">${c.conversions}</td>
          <td>${owner(c.owner)}</td>
          <td><button class="icon-btn" data-action="menu" data-id="${c.id}" aria-label="More actions">${icon('more', 18)}</button></td></tr>`).join('') : `<tr><td colspan="10"><div class="empty">${icon('search', 30)}<div>No campaigns match these filters.</div></div></td></tr>`}</tbody>
      </table>
    </div>
    <div class="table-foot"><span class="muted">Showing 1–${rows.length} of ${rows.length} campaigns</span>${select([[10, '10 per page']], 10, 'aria-label="Rows per page"', 'sm')}${pager(1, 1)}</div>
    ${sel && ui.panel ? `<div class="card card-pad mt12">
      <div class="row wrap" style="gap:8px"><h2 style="font-size:20px">${esc(list ? list.name : sel.name)}</h2><span class="muted" style="font-size:16px">· ${list ? list.people : sel.audience} source records · ${sel.audience} eligible contacts</span><button class="icon-btn" data-action="close-panel" style="margin-left:auto" aria-label="Close">${icon('x', 18)}</button></div>
      <div class="muted small mt8">${icon('send', 13)} Main campaign: <a href="#/demo/campaigns/${sel.id}">${esc(sel.name)}</a></div>
      <div class="row wrap mt12" style="gap:16px;align-items:stretch">
        <div class="grid g3 grow">
          ${[['send', 'Reached', sel.reached, `of ${sel.audience} eligible`], ['reply', 'Replies', sel.replies, sel.reached ? `${pct(sel.replies, sel.reached, 1)}% of reached contacts` : 'No contacts reached yet'], ['users', 'Conversions', sel.conversions, `${sel.conversions} converted contacts`]].map(([ic, l, v, m]) => `<div class="card stat" style="padding:12px 16px"><div class="ico">${icon(ic, 22)}</div><div><div class="small">${l}</div><div class="value num" style="font-size:22px">${v}</div><div class="meta">${m}</div></div></div>`).join('')}
        </div>
        <div class="vdivider"></div>
        <div class="stack sm" style="min-width:280px;justify-content:center">
          ${sel.channels.includes('LinkedIn tasks') ? `<div class="small row"><span style="color:#0a66c2">${icon('linkedin', 18)}</span> LinkedIn activity is tracked as assisted tasks.</div>` : ''}
          <div class="row">
            ${sel.status === 'Running' ? `<button class="btn outline" data-action="pause" data-id="${sel.id}">${icon('pause', 16)} Pause campaign</button>` : sel.status === 'Paused' ? `<button class="btn outline" data-action="resume" data-id="${sel.id}">${icon('play', 16)} Resume campaign</button>` : ''}
            <a class="btn" href="#/demo/campaigns/${sel.id}">${icon('external', 16)} Open campaign</a>
          </div>
        </div>
      </div></div>` : ''}`;
  },
  mount(root, ctx) {
    const re = () => keepFocus(document, '#cmp-q', ctx.rerender);
    const set = (k) => (el) => { ui[k] = el.value; re(); };
    const setStatus = (id, st, msg) => { store.update((s) => { s.campaigns.find((c) => c.id === id).status = st; }); toast(msg, 'Demo simulation — no live campaign was affected.'); re(); };
    const act = {
      pause: (id) => confirm('Pause campaign?', 'Scheduled outreach stops until you resume. Replies keep arriving in Conversations.', 'Pause campaign').then((ok) => ok && setStatus(id, 'Paused', 'Campaign paused')),
      resume: (id) => setStatus(id, 'Running', 'Campaign resumed'),
      duplicate: (id) => {
        const src = store.s.campaigns.find((c) => c.id === id);
        const copy = `cmp-copy-${Date.now().toString(36)}`;
        store.update((s) => s.campaigns.push({ ...src, id: copy, name: `${src.name} (copy)`, status: 'Draft', dates: 'Not scheduled', reached: 0, replies: 0, conversions: 0, channelStats: undefined }));
        ui.sel = copy; toast(`Duplicated as “${src.name} (copy)”`, 'Saved as a draft in this demo session.'); re();
      },
    };
    on(root, {
      click: {
        select: (el, e) => { if (e.target.closest('a, input, button')) return; ui.sel = el.dataset.id; ui.panel = true; re(); },
        tab: (el) => { ui.tab = el.dataset.key; re(); },
        'close-panel': () => { ui.panel = false; re(); },
        pause: (el) => act.pause(el.dataset.id),
        resume: (el) => act.resume(el.dataset.id),
        menu: (el) => {
          const c = store.s.campaigns.find((x) => x.id === el.dataset.id);
          const opts = [{ label: 'Duplicate', value: 'duplicate' }];
          if (c.status === 'Running') opts.push({ label: 'Pause', value: 'pause' });
          if (c.status === 'Paused') opts.push({ label: 'Resume', value: 'resume' });
          opts.push({ label: c.status === 'Draft' ? 'Continue setup' : 'Open', cls: 'primary', value: 'open' });
          modal({ title: c.name, body: `<p class="muted">${esc(c.status)} · ${esc(c.dates)} · ${c.audience} contacts</p>`, buttons: opts }).then(({ value }) => {
            if (value === 'open') ctx.navigate(c.status === 'Draft' ? '/demo/campaigns/new' : `/demo/campaigns/${c.id}`);
            else if (value) act[value](c.id);
          });
        },
      },
      change: {
        channel: set('channel'), owner: set('owner'), status: set('status'),
        pick: (el) => { ui.sel = el.checked ? el.dataset.id : null; ui.panel = true; re(); },
      },
      input: { q: (el) => { ui.q = el.value; re(); } },
    });
  },
};
