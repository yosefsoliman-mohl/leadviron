// 26 · Outreach Performance — channel, campaign and template comparison within a clear scope.
import { icon, esc, stat, select, on, toast, channelIcon } from '../ui.js';

const ui = { period: 'Oct 24 – 29, 2026', campaign: 'cmp-ksa', channel: '' };

// Sample outreach results per campaign. First outreach per contact; "—" (null) means the metric is unavailable.
const DATA = {
  'cmp-ksa': {
    name: 'KSA Logistics Outreach', enrolled: 64, reached: 48, replies: 18, conv: 6, linkedin: 12,
    channels: [{ ch: 'Email', sent: 34, delivered: 32, read: null, replied: 10, conv: 3, cost: null }, { ch: 'WhatsApp', sent: 18, delivered: 16, read: 12, replied: 8, conv: 3, cost: 64 }],
    series: [['Oct 24 – 25', 8, 1], ['Oct 26', 12, 4], ['Oct 27', 16, 6], ['Oct 28 – 29', 12, 7]],
    templates: [{ name: 'Business introduction', ch: 'Email', delivered: 32, replies: 10 }, { name: 'Demo invitation', ch: 'WhatsApp', delivered: 16, replies: 8 }],
  },
  'cmp-tech': {
    name: 'Tech Demo Follow-up', enrolled: 32, reached: 20, replies: 7, conv: 2, linkedin: 0,
    channels: [{ ch: 'Email', sent: 14, delivered: 13, read: null, replied: 4, conv: 1, cost: null }, { ch: 'WhatsApp', sent: 8, delivered: 7, read: 6, replied: 3, conv: 1, cost: 28 }],
    series: [['Oct 20 – 21', 6, 1], ['Oct 22', 6, 2], ['Oct 23', 4, 2], ['Oct 24 – 25', 4, 2]],
    templates: [{ name: 'Demo follow-up', ch: 'Email', delivered: 13, replies: 4 }, { name: 'Demo invitation', ch: 'WhatsApp', delivered: 7, replies: 3 }],
  },
};
const COMPARE = [['KSA Logistics Outreach', 48, 18, 6, 'cmp-ksa'], ['Tech Demo Follow-up', 20, 7, 2, 'cmp-tech']];

function combined() {
  const a = DATA['cmp-ksa'], b = DATA['cmp-tech'];
  const sumCh = (i) => {
    const x = a.channels[i], y = b.channels[i];
    return { ch: x.ch, sent: x.sent + y.sent, delivered: x.delivered + y.delivered, read: x.read == null ? null : x.read + y.read, replied: x.replied + y.replied, conv: x.conv + y.conv, cost: x.cost == null ? null : x.cost + y.cost };
  };
  return {
    name: 'All campaigns', enrolled: a.enrolled + b.enrolled, reached: a.reached + b.reached, replies: a.replies + b.replies, conv: a.conv + b.conv, linkedin: a.linkedin + b.linkedin,
    channels: [sumCh(0), sumCh(1)],
    series: [['Oct 20 – 23', 16, 5], ['Oct 24 – 25', 12, 3], ['Oct 26 – 27', 28, 10], ['Oct 28 – 29', 12, 7]],
    templates: [...a.templates, ...b.templates.filter((t) => t.ch === 'Email')],
  };
}

const rateTxt = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');
const dash = (v) => (v == null ? '—' : v);

function chart(series) {
  const W = 560, H = 210, L = 34, B = 28, T = 16;
  const max = 20;
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const gw = (W - L - 10) / series.length;
  let s = '';
  [0, 5, 10, 15, 20].forEach((v) => { s += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#eef1f7"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#6b7794">${v}</text>`; });
  series.forEach(([label, r, p], i) => {
    const x0 = L + i * gw + gw / 2 - 46;
    const bar = (x, v, fill, name) => `<rect x="${x}" y="${y(v)}" width="40" height="${y(0) - y(v)}" rx="3" fill="${fill}" data-tip="${esc(label)} · ${name}: ${v}" tabindex="0" role="img" aria-label="${esc(label)} ${name} ${v}"><title>${esc(label)} · ${name}: ${v}</title></rect><text x="${x + 20}" y="${y(v) - 5}" text-anchor="middle" font-size="12.5" font-weight="600" fill="#0d1733">${v}</text>`;
    s += bar(x0, r, '#1557e8', 'Reached') + bar(x0 + 48, p, '#a9c4fa', 'Replied');
    s += `<text x="${x0 + 44}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#33405f">${esc(label)}</text>`;
  });
  return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" aria-label="Reached and replied over time">${s}</svg><div class="chart-tip hidden"></div></div>`;
}

export default {
  title: 'Outreach Performance',
  render() {
    const d = ui.campaign ? DATA[ui.campaign] : combined();
    const chs = ui.channel ? d.channels.filter((c) => c.ch === ui.channel) : d.channels;
    const tpls = ui.channel ? d.templates.filter((t) => t.ch === ui.channel) : d.templates;
    const cost = chs.reduce((a, c) => a + (c.cost || 0), 0);
    return `
    <div class="page-head"><div class="titles"><h1>Outreach Performance</h1><div class="sub">${d.enrolled} enrolled contacts · First outreach per contact</div></div>
      <div class="actions">
        ${select(['Oct 24 – 29, 2026', 'Oct 20 – 29, 2026', 'Oct 1 – 29, 2026'], ui.period, 'data-change="period" aria-label="Period"')}
        ${select([['', 'All campaigns'], ['cmp-ksa', 'KSA Logistics Outreach'], ['cmp-tech', 'Tech Demo Follow-up']], ui.campaign, 'data-change="campaign" aria-label="Campaign"')}
        ${select([['', 'All channels'], 'Email', 'WhatsApp'], ui.channel, 'data-change="channel" aria-label="Channel"')}
      </div></div>
    <div class="grid g4">
      ${stat({ icon: 'mail', label: 'Reached', value: d.reached, meta: `of ${d.enrolled} enrolled` })}
      ${stat({ icon: 'message', label: 'Replies', value: d.replies, meta: `${rateTxt(d.replies, d.reached)} of reached contacts` })}
      ${stat({ icon: 'bars', label: 'Conversions', value: d.conv })}
      ${stat({ icon: 'database', label: 'Recorded channel cost', value: `SAR ${cost}`, meta: 'WhatsApp only' })}
    </div>
    <div class="card mt16"><div class="card-head"><h2>Channel comparison</h2></div><div class="card-body">
      <div class="table-wrap flat"><table class="tbl"><thead><tr><th>Channel</th><th class="c">Sent</th><th class="c">Delivered</th><th class="c">Read</th><th class="c">Replied</th><th class="c">Converted</th><th class="c">Reply rate</th><th class="c">Recorded cost</th></tr></thead>
      <tbody>${chs.map((c) => `<tr><td><span class="owner" style="color:var(--blue-600)">${channelIcon(c.ch, 20)} <span style="color:var(--ink-800)">${c.ch}</span></span></td><td class="c num">${c.sent}</td><td class="c num">${c.delivered}</td><td class="c num">${dash(c.read)}</td><td class="c num">${c.replied}</td><td class="c num">${c.conv}</td><td class="c num">${rateTxt(c.replied, c.delivered)}</td><td class="c num">${c.cost == null ? '—' : `SAR ${c.cost}`}</td></tr>`).join('')}</tbody></table></div>
      <p class="muted small mt8">Reply rate = replied / delivered. — means unavailable.</p></div></div>
    <div class="an-cols a mt16">
      <div class="card"><div class="card-head"><h2>Reached and replied over time</h2><span class="legend"><i style="background:#1557e8"></i>Reached</span><span class="legend"><i style="background:#a9c4fa"></i>Replied</span></div>
        <div class="card-body">${chart(d.series)}</div></div>
      <div class="card"><div class="card-head"><h2>Campaign comparison</h2></div><div class="card-body"><div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>Campaign</th><th class="c">Reached</th><th class="c">Replies</th><th class="c">Converted</th></tr></thead>
        <tbody>${COMPARE.map(([n, r, p, c, id]) => `<tr class="clickable ${ui.campaign === id ? 'selected' : ''}" data-action="campaign" data-id="${id}"><td><a href="#/demo/campaigns/${id}">${n}</a></td><td class="c num">${r}</td><td class="c num">${p}</td><td class="c num">${c}</td></tr>`).join('')}</tbody></table></div>
        <p class="muted small mt8">Select a row to scope this report to one campaign.</p></div></div>
    </div>
    <div class="an-cols b mt16">
      <div class="card"><div class="card-head"><h2>Templates</h2><a class="small" href="#/demo/campaigns/templates">Template Library</a></div><div class="card-body"><div class="table-wrap flat"><table class="tbl">
        <thead><tr><th>Template</th><th>Channel</th><th class="c">Delivered</th><th class="c">Replies</th><th class="c">Reply rate</th></tr></thead>
        <tbody>${tpls.map((t) => `<tr><td>${esc(t.name)}</td><td><span class="owner" style="color:var(--blue-600)">${channelIcon(t.ch, 18)} <span style="color:var(--ink-800)">${t.ch}</span></span></td><td class="c num">${t.delivered}</td><td class="c num">${t.replies}</td><td class="c num">${rateTxt(t.replies, t.delivered)}</td></tr>`).join('')}</tbody></table></div></div></div>
      <a class="card card-pad" href="#/demo/sales/tasks" style="color:inherit;text-decoration:none"><h2>LinkedIn assisted tasks</h2>
        <div class="row mt16"><span class="ico-circle lg" style="color:#0a66c2">${icon('linkedin', 28)}</span><div><div style="font-size:30px;font-weight:700;color:var(--ink-900)">${d.linkedin}</div><div class="muted">Tracked separately from delivery.</div></div></div></a>
    </div>`;
  },
  mount(root, ctx) {
    on(root, {
      click: { campaign: (el, e) => { if (e.target.closest('a')) return; ui.campaign = ui.campaign === el.dataset.id ? '' : el.dataset.id; ctx.rerender(); } },
      change: {
        period: (el) => { ui.period = el.value; toast(`Showing ${el.value}`, 'Demo results are fixed sample values.'); },
        campaign: (el) => { ui.campaign = el.value; ctx.rerender(); },
        channel: (el) => { ui.channel = el.value; ctx.rerender(); },
      },
    });
    // Chart tooltips (mouse and keyboard focus).
    const wrap = root.querySelector('.chart-wrap');
    const tip = wrap.querySelector('.chart-tip');
    const show = (el) => {
      const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      tip.textContent = el.dataset.tip;
      tip.style.left = `${r.left - w.left + r.width / 2}px`;
      tip.style.top = `${r.top - w.top}px`;
      tip.classList.remove('hidden');
    };
    wrap.addEventListener('mouseover', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(el); });
    wrap.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tip]')) tip.classList.add('hidden'); });
    wrap.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(el); });
    wrap.addEventListener('focusout', () => tip.classList.add('hidden'));
  },
};
