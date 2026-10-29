// 34 · Workspace Setup — optional 5-step wizard (bare page, no sidebar). Does not gate the demo.
import { icon, esc, select, on, toast } from '../ui.js';
import { store } from '../store.js';

const STEPS = ['Organization', 'Team', 'Lead source', 'Channel', 'Review'];
const SOURCES = [['web', 'Web Forms', 'file', 'Built-in forms and CSV import'], ['meta', 'Meta Lead Ads', 'meta', 'Facebook & Instagram lead forms'], ['google', 'Google Lead Forms', 'google', 'Webhook from Google Ads'], ['csv', 'CSV import', 'upload', 'Upload an existing list']];
const CHANNELS = [['email', 'Email', 'mail', 'SMTP sending + inbound replies'], ['whatsapp', 'WhatsApp Cloud API', 'whatsapp', 'Approved templates and replies'], ['linkedin', 'LinkedIn tasks', 'linkedin', 'Assisted tasks only']];

const ui = { step: 0, d: null };

const fresh = () => ({
  name: store.s.org.name, timezone: store.s.org.timezone, language: store.s.org.language,
  invites: [{ email: 'maya.hassan@example.com', role: 'Sales Manager' }, { email: '', role: 'Sales Representative' }],
  sources: { web: true, meta: true, google: false, csv: false },
  channels: { email: true, whatsapp: true, linkedin: false },
});

function choice(group, [k, label, ic, hint], on_) {
  return `<label class="card row ws-choice ${on_ ? 'selected' : ''}" style="padding:12px 14px;cursor:pointer;box-shadow:none">
    <input type="checkbox" class="check" data-change="pick" data-group="${group}" data-k="${k}" ${on_ ? 'checked' : ''}>
    <span class="ico-circle sm">${icon(ic, 17)}</span><span class="grow"><span class="strong" style="display:block;font-weight:500">${label}</span><span class="muted small">${hint}</span></span></label>`;
}

function stepBody(d) {
  switch (ui.step) {
    case 0: return `<h2 class="mb16">Workspace details</h2>
      <div class="stack">
        <div class="field"><label>Organization name</label><input class="input" style="height:44px" data-input="name" value="${esc(d.name)}"></div>
        <div class="field"><label>Time zone</label>${select(['Asia/Riyadh (UTC+03:00)', 'Asia/Dubai (UTC+04:00)', 'Africa/Cairo (UTC+02:00)'], d.timezone, 'data-change="f" data-k="timezone" style="height:44px"')}</div>
        <div class="field"><label>Language</label>${select(['English', 'Arabic'], d.language, 'data-change="f" data-k="language" style="height:44px"')}</div>
        <p class="muted small">You can change these details later.</p></div>`;
    case 1: return `<h2>Invite your team</h2><p class="muted mb16">Add teammates now or later from Team & Permissions.</p>
      <div class="stack sm">${d.invites.map((x, i) => `<div class="row"><input class="input grow" placeholder="name@example.com" data-input="inv" data-i="${i}" value="${esc(x.email)}">
        ${select(['Admin', 'Sales Manager', 'Sales Representative'], x.role, `data-change="inv-role" data-i="${i}" style="width:190px"`)}
        <button class="icon-btn" data-action="inv-del" data-i="${i}" aria-label="Remove">${icon('x', 16)}</button></div>`).join('')}
        <div><button class="btn soft sm" data-action="inv-add">${icon('plus', 15)} Add another</button></div></div>`;
    case 2: return `<h2>Choose lead sources</h2><p class="muted mb16">Where new leads come from. Connections are configured later in Settings → Integrations.</p>
      <div class="stack sm">${SOURCES.map((s) => choice('sources', s, d.sources[s[0]])).join('')}</div>`;
    case 3: return `<h2>Choose outreach channels</h2><p class="muted mb16">Channel eligibility and consent rules still apply to every lead.</p>
      <div class="stack sm">${CHANNELS.map((c) => choice('channels', c, d.channels[c[0]])).join('')}</div>`;
    default: {
      const inv = d.invites.filter((x) => x.email.trim());
      const pick = (list, sel) => list.filter(([k]) => sel[k]).map(([, l]) => l).join(', ') || 'None selected';
      return `<h2 class="mb16">Review</h2>
      <div class="kv" style="grid-template-columns:130px 1fr">
        <span class="k">Organization</span><span class="v">${esc(d.name)}</span>
        <span class="k">Time zone</span><span class="v">${esc(d.timezone)}</span>
        <span class="k">Language</span><span class="v">${esc(d.language)}</span>
        <span class="k">Team invites</span><span class="v">${inv.length ? inv.map((x) => `${esc(x.email)} <span class="muted small">(${esc(x.role)})</span>`).join('<br>') : 'None'}</span>
        <span class="k">Lead sources</span><span class="v">${pick(SOURCES, d.sources)}</span>
        <span class="k">Channels</span><span class="v">${pick(CHANNELS, d.channels)}</span>
      </div>
      <div class="callout mt16">${icon('info', 18)}<span>Demo preview: finishing does not create a workspace, send invites or connect any account.</span></div>`;
    }
  }
}

export default {
  title: 'Workspace Setup',
  render() {
    const d = ui.d || (ui.d = fresh());
    const last = ui.step === STEPS.length - 1;
    return `
    <div class="auth-page ws-page" style="place-items:start center">
      <div class="ws-deco" style="right:-120px;top:60px"></div><div class="ws-deco" style="left:-140px;bottom:-40px"></div>
      <div class="ws-top"><a href="#/demo/dashboard" aria-label="Leadviron"><img src="assets/logo.png" alt="Leadviron" style="height:30px;mix-blend-mode:multiply"></a>
        <a class="btn ghost" href="#/demo/settings/general">${icon('arrowLeft', 16)} Back to Settings</a></div>
      <div style="position:relative;width:min(840px,100%);padding-top:56px">
        <p class="muted" style="text-align:center">Step ${ui.step + 1} of ${STEPS.length} · Optional</p>
        <h1 style="text-align:center;font-size:36px;margin-top:6px">Set up your workspace</h1>
        <ol class="ws-steps">${STEPS.map((s, i) => `<li class="${i === ui.step ? 'active' : i < ui.step ? 'done' : ''}"><button data-action="go" data-i="${i}"><span class="n">${i < ui.step ? icon('check', 16) : i + 1}</span><span class="t">${s}</span></button></li>`).join('')}</ol>
        <div class="card" style="width:min(610px,100%);margin:0 auto;padding:28px 40px;box-shadow:var(--shadow)">
          ${stepBody(d)}
          <div class="row mt20" style="justify-content:space-between">
            ${ui.step > 0 ? `<button class="btn" data-action="back">${icon('arrowLeft', 16)} Back</button>` : '<a class="btn ghost" href="#/demo/dashboard">Skip for now</a>'}
            <button class="btn primary lg" data-action="${last ? 'finish' : 'next'}">${last ? 'Finish setup' : 'Continue'}</button>
          </div>
        </div>
        <p class="muted small" style="text-align:center;margin-top:18px">The ready-made demo is always available without this setup.</p>
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const d = () => ui.d;
    on(root, {
      click: {
        go: (el) => { ui.step = +el.dataset.i; ctx.rerender(); },
        next: () => {
          if (ui.step === 0 && !d().name.trim()) { toast('Organization name is required', ''); return; }
          ui.step++; ctx.rerender();
        },
        back: () => { ui.step--; ctx.rerender(); },
        'inv-add': () => { d().invites.push({ email: '', role: 'Sales Representative' }); ctx.rerender(); },
        'inv-del': (el) => { d().invites.splice(+el.dataset.i, 1); ctx.rerender(); },
        finish: () => {
          const name = d().name.trim();
          ui.step = 0; ui.d = null;
          toast(`Workspace “${name}” setup simulated`, 'No workspace was created, no invites were sent.');
          ctx.navigate('/demo/settings/general');
        },
      },
      change: {
        f: (el) => { d()[el.dataset.k] = el.value; },
        'inv-role': (el) => { d().invites[+el.dataset.i].role = el.value; },
        pick: (el) => { d()[el.dataset.group][el.dataset.k] = el.checked; ctx.rerender(); },
      },
      input: {
        name: (el) => { d().name = el.value; },
        inv: (el) => { d().invites[+el.dataset.i].email = el.value; },
      },
    });
  },
};
