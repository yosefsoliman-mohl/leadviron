// Landing page — what Leadviron does, from lead capture to automated follow-up. Home route ("#/").
import { icon, dots } from '../ui.js';

// Client brands. Mark-only logos get the brand name next to them.
const CLIENTS = [
  ['alj.png', 'Abdul Latif Jameel', false],
  ['alrajhi.svg', 'Al Rajhi Bank', false],
  ['mg.svg', 'MG Motor', true],
  ['dongfeng.svg', 'Dongfeng', false],
  ['hongqi.svg', 'Hongqi', false],
  ['mitsubishi.svg', 'Mitsubishi', true],
  ['toyota.svg', 'Toyota', true],
  ['suzuki.svg', 'Suzuki', true],
  ['budget.svg', 'Budget', false],
  ['gac.png', 'GAC', false],
];

const STEPS = [
  ['zap', 'Generate', 'Outreach campaigns, uploaded lists and social lead forms feed one pipeline.'],
  ['database', 'Enrich', 'Company, title, city, size, industry and LinkedIn — with source and confidence.'],
  ['target', 'Qualify', 'Clear rules mark each lead Qualified, Needs info or Disqualified, with the reason.'],
  ['star', 'Score', 'A weighted priority score tells your team who to call first.'],
  ['message', 'Communicate', 'WhatsApp, email and LinkedIn tasks in one Conversations inbox.'],
  ['flow', 'Automate', 'Workflows follow up on time, pause on reply and hand off to sales.'],
];

const logo = (name, size = 22) => `<span class="lp-chip-ico">${icon(name, size)}</span>`;

function heroVisual() {
  return `<div class="lp-hero-visual" aria-hidden="true">
    <div class="lp-glow"></div>
    <div class="lp-card lp-main">
      <div class="lp-row"><span class="lp-av">OA</span><div class="lp-grow"><b>Omar Ali</b><small>Ops Director · Horizon Logistics</small></div><span class="lp-pill">Qualified</span></div>
      <div class="lp-score">
        <div class="lp-ring" style="--p:86"><span>86</span></div>
        <div class="lp-grow">
          <small>Priority score</small>
          ${[['Company fit', 90], ['Role fit', 90], ['Engagement', 75], ['Recency', 80]].map(([n, v]) => `<div class="lp-bar"><span>${n}</span><i><em style="width:${v}%"></em></i></div>`).join('')}
        </div>
      </div>
      <div class="lp-row lp-enrich"><span>Enrichment</span>${dots(3)}<small>3 of 6 fields · Demo Provider A</small></div>
      <div class="lp-next">${icon('calendarCheck', 16)} Demo booked · Tomorrow 2:00 PM</div>
    </div>
    <div class="lp-float lp-f1">${logo('meta')}<div><b>+312</b><small>Meta lead forms</small></div></div>
    <div class="lp-float lp-f2">${logo('whatsapp')}<div><b>Reply received</b><small>“Tomorrow 2 PM works.”</small></div></div>
    <div class="lp-float lp-f3">${logo('google')}<div><b>+360</b><small>Google lead forms</small></div></div>
    <div class="lp-float lp-f4"><span class="lp-chip-ico lp-blue">${icon('pause', 16)}</span><div><b>Automation paused</b><small>Lead replied — handed to Sara</small></div></div>
  </div>`;
}

function genCard(ic, title, text, visual) {
  return `<article class="lp-gen reveal"><div class="lp-gen-visual">${visual}</div><div class="lp-gen-body"><span class="lp-icon">${icon(ic, 20)}</span><h3>${title}</h3><p>${text}</p></div></article>`;
}

function feature(eyebrow, title, text, bullets, visual, flip = false) {
  return `<div class="lp-feature reveal ${flip ? 'flip' : ''}">
    <div class="lp-feature-copy"><span class="lp-eyebrow">${eyebrow}</span><h2>${title}</h2><p>${text}</p>
      <ul>${bullets.map((b) => `<li>${icon('check', 16)}<span>${b}</span></li>`).join('')}</ul></div>
    <div class="lp-feature-visual">${visual}</div>
  </div>`;
}

const enrichVisual = `<div class="lp-card lp-pad">
  <div class="lp-row"><b class="lp-grow">Enrichment results</b><span class="lp-pill soft">50% · 3/6</span></div>
  <table class="lp-table">${[['Company', 'Horizon Logistics', 96], ['Job title', 'Operations Director', 93], ['City', 'Riyadh', 91], ['Company size', null], ['Industry', null], ['LinkedIn URL', null]].map(([f, v, c]) => `<tr><td>${f}</td><td>${v ? `<b>${v}</b>` : '<span class="lp-miss">Not found</span>'}</td><td>${v ? `<span class="lp-ok">${icon('checkCircle', 16)} ${c}%</span>` : '<span class="lp-dim">—</span>'}</td></tr>`).join('')}</table>
  <div class="lp-note">${icon('shield', 14)} Original email and phone always kept</div>
</div>`;

const qualifyVisual = `<div class="lp-card lp-pad">
  <div class="lp-q3">
    <div><b>78</b><span>Qualified</span><i style="--w:65%"></i></div>
    <div><b>30</b><span>Needs info</span><i style="--w:25%"></i></div>
    <div><b>12</b><span>Disqualified</span><i style="--w:10%"></i></div>
  </div>
  <div class="lp-rule">${icon('grip', 14)} <span>Company</span><em>is identified</em></div>
  <div class="lp-and">AND</div>
  <div class="lp-rule">${icon('grip', 14)} <span>Decision-making role</span><em>is confirmed</em></div>
  <div class="lp-and">AND</div>
  <div class="lp-rule">${icon('grip', 14)} <span>Business need</span><em>is confirmed</em></div>
</div>`;

const chatVisual = `<div class="lp-card lp-pad lp-chat">
  <div class="lp-row lp-chat-head"><span class="lp-av">OA</span><div class="lp-grow"><b>Omar Ali</b><small>WhatsApp · Horizon Logistics</small></div>${logo('whatsapp', 18)}</div>
  <div class="lp-msg out">Hi Omar, would you like a short demo for your team?</div>
  <div class="lp-msg in">Yes, please. We want to improve lead follow-up.</div>
  <div class="lp-msg out">Happy to help. What time suits you?</div>
  <div class="lp-msg in">Tomorrow at 2:00 PM Riyadh time works for me.</div>
  <div class="lp-typing">${icon('calendarCheck', 15)} Task created: Schedule product demo</div>
</div>`;

const flowVisual = `<div class="lp-card lp-pad lp-flow">
  <div class="lp-node">${icon('bolt', 16)} Enrichment completed</div><i class="lp-line"></i>
  <div class="lp-node lp-cond">${icon('diamond', 16)} Qualified & eligible?</div><i class="lp-line"></i>
  <div class="lp-node">${icon('whatsapp', 16)} Send WhatsApp intro</div><i class="lp-line"></i>
  <div class="lp-node">${icon('clock', 16)} Wait up to 2 days</div>
  <div class="lp-branch"><div class="lp-node lp-good">${icon('user', 16)} Replied → hand off to sales</div><div class="lp-node">${icon('mail', 16)} No reply → email follow-up</div></div>
</div>`;

export default {
  title: 'Lead Intelligence platform',
  render: () => `
  <div class="lp">
    <header class="lp-nav" id="lp-top">
      <a class="lp-brand" href="#/" aria-label="Leadviron home"><img src="assets/logo.png" alt="Leadviron"></a>
      <nav class="lp-links" aria-label="Sections">
        <button data-action="scroll" data-to="lp-how">How it works</button>
        <button data-action="scroll" data-to="lp-generate">Lead generation</button>
        <button data-action="scroll" data-to="lp-features">Platform</button>
        <button data-action="scroll" data-to="lp-clients">Customers</button>
      </nav>
      <div class="lp-nav-cta"><a class="lp-link" href="#/login">Sign in</a><a class="lp-btn primary sm" href="#/demo/dashboard">Open demo</a></div>
    </header>

    <section class="lp-hero">
      <div class="lp-hero-copy">
        <span class="lp-badge"><i></i> Lead Intelligence platform</span>
        <h1>Every lead, from every platform — <span class="lp-grad">enriched, scored and converted.</span></h1>
        <p class="lp-lead">Leadviron brings leads from ads, social media, outreach and your own lists into one workspace. It fills the gaps, tells you who is ready to buy, and keeps every conversation moving automatically.</p>
        <div class="lp-cta-row">
          <a class="lp-btn primary" href="#/demo/dashboard">Open the live demo ${icon('arrowRight', 18)}</a>
          <button class="lp-btn ghost" data-action="scroll" data-to="lp-how">See how it works</button>
        </div>
        <div class="lp-trust">${icon('shieldCheck', 16)} No sign-up needed · The demo runs on sample data</div>
      </div>
      ${heroVisual()}
    </section>

    <section class="lp-sources reveal" aria-label="Lead sources">
      <span>Capture leads wherever they start</span>
      <div class="lp-source-list">
        ${[['meta', 'Meta Lead Ads'], ['google', 'Google Ads'], ['linkedin', 'LinkedIn'], ['whatsapp', 'WhatsApp'], ['file', 'Web forms'], ['fileUp', 'CSV lists'], ['mail', 'Email']].map(([i, n]) => `<span class="lp-source">${icon(i, 20)} ${n}</span>`).join('')}
      </div>
    </section>

    <section class="lp-section" id="lp-how">
      <div class="lp-head reveal"><span class="lp-eyebrow">How it works</span><h2>One journey from first touch to closed deal</h2><p>Six steps, one workspace. Every lead knows where it came from, what we know about it, and what happens next.</p></div>
      <ol class="lp-steps">
        ${STEPS.map(([ic, t, d], i) => `<li class="lp-step reveal" style="--d:${i * 70}ms"><span class="lp-step-n">0${i + 1}</span><span class="lp-icon">${icon(ic, 22)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
      </ol>
    </section>

    <section class="lp-section lp-tint" id="lp-generate">
      <div class="lp-head reveal"><span class="lp-eyebrow">Lead generation</span><h2>Three ways to fill your pipeline</h2><p>Start from wherever your leads are today — and keep them all in the same place.</p></div>
      <div class="lp-gen-grid">
        ${genCard('send', 'Outreach', 'Build audiences, write once with personalization, and reach prospects on email, WhatsApp and LinkedIn tasks — only when they are eligible.',
          `<div class="lp-seq"><div>${icon('mail', 16)} Day 1 · Intro email</div><div>${icon('whatsapp', 16)} Day 3 · WhatsApp follow-up</div><div>${icon('linkedin', 16)} Day 5 · LinkedIn task</div><span class="lp-pill">48 reached · 18 replies</span></div>`)}
        ${genCard('fileUp', 'Upload a list', 'Drop in a CSV from an event, partner or old CRM. Map the columns, catch duplicates and bad rows, then enrich in one go.',
          `<div class="lp-csv"><div class="lp-csv-file">${icon('file', 18)} ksa-prospects.csv <small>92 rows</small></div><div class="lp-map"><span>Mobile</span>${icon('arrowRight', 14)}<b>Phone</b></div><div class="lp-map"><span>Position</span>${icon('arrowRight', 14)}<b>Job title</b></div><div class="lp-map"><span>Company</span>${icon('arrowRight', 14)}<b>Company</b></div></div>`)}
        ${genCard('megaphone', 'From social media', 'Meta, Google and LinkedIn lead forms flow in on their own, get an owner round-robin and are checked for duplicates instantly.',
          `<div class="lp-social">${[['meta', 'Meta', 520, 100], ['google', 'Google', 360, 69], ['linkedin', 'LinkedIn', 240, 46]].map(([i, n, v, w]) => `<div class="lp-soc-row">${icon(i, 18)}<span>${n}</span><i><em style="width:${w}%"></em></i><b>${v}</b></div>`).join('')}</div>`)}
      </div>
    </section>

    <section class="lp-section" id="lp-features">
      ${feature('Enrichment', 'Know exactly who you are talking to', 'Leadviron looks up the missing details for every lead and shows where each value came from — so your team trusts the data and never overwrites what the lead told you.',
        ['Six target fields: company, title, city, size, industry, LinkedIn', 'Source and confidence on every value', 'Partial and no-match results handled cleanly'], enrichVisual)}
      ${feature('Qualifying & scoring', 'Spend time on the leads that will convert', 'Simple rules decide who is qualified and explain why. A weighted priority score then ranks them, so the best leads get a call first.',
        ['Qualified, Needs info or Disqualified — with reasons', 'Adjustable weights for fit, role, engagement and recency', 'Test changes on real leads before publishing'], qualifyVisual, true)}
      ${feature('Conversations', 'Every conversation in one inbox', 'WhatsApp, email and LinkedIn activity sit next to the lead’s profile, score and next task. Reply, assign or book a meeting without switching tools.',
        ['Channel eligibility and consent checked before sending', 'Internal notes and reassignment', 'Meetings and tasks created from the chat'], chatVisual)}
      ${feature('Automation', 'Follow-up that never forgets', 'Visual workflows send the right message at the right time, wait for replies, and hand hot leads to a salesperson the moment they respond.',
        ['Triggers on enrichment, qualification or form submission', 'Pauses automatically when a lead replies', 'Run history explains every step and retry'], flowVisual, true)}
    </section>

    <section class="lp-results reveal">
      <div class="lp-results-inner">
        <div class="lp-results-copy"><span class="lp-eyebrow light">Results</span><h2>Built to lift your conversion rate</h2><p>Faster first contact, better-qualified conversations and follow-up that never slips — that is where conversion comes from.</p></div>
        <div class="lp-stats">
          <div><b>9.0%</b><span>lead-to-customer conversion</span></div>
          <div><b>37.5%</b><span>reply rate on outreach</span></div>
          <div><b>18 min</b><span>median time to first contact</span></div>
          <div><b>120</b><span>leads enriched in under 30 min</span></div>
        </div>
        <small class="lp-foot-note">Figures from the Leadviron demo scenario. Results depend on your market and data.</small>
      </div>
    </section>

    <section class="lp-cta reveal">
      <h2>See your pipeline the Leadviron way</h2>
      <p>Open the interactive demo — every screen, real workflows, sample data. No account needed.</p>
      <div class="lp-cta-row center"><a class="lp-btn primary" href="#/demo/dashboard">Open the live demo ${icon('arrowRight', 18)}</a><a class="lp-btn ghost" href="#/login">Sign in</a></div>
    </section>

    <section class="lp-clients" id="lp-clients" aria-label="Brands we work with">
      <p>Trusted by teams at leading brands</p>
      <div class="lp-marquee">
        <div class="lp-track">
          ${[0, 1].map((k) => `<div class="lp-logos" ${k ? 'aria-hidden="true"' : ''}>${CLIENTS.map(([f, n, label]) => `<span class="lp-logo"><img src="assets/clients/${f}" alt="${k ? '' : n}" loading="lazy">${label ? `<b>${n}</b>` : ''}</span>`).join('')}</div>`).join('')}
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <img src="assets/logo.png" alt="Leadviron">
      <span>Powered by <b>Upshifters</b> · © 2026</span>
      <button class="lp-link" data-action="scroll" data-to="lp-top">Back to top ${icon('chevUp', 14)}</button>
    </footer>
  </div>`,
  mount(root) {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action="scroll"]');
      if (!b) return;
      document.getElementById(b.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const items = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  },
};
