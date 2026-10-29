// Demo data and session state.
// Everything here is fictional sample data. Changes live in sessionStorage only and Reset Demo restores the seed.

const KEY = 'leadviron-demo-v2';

export const ENRICH_FIELDS = ['company', 'title', 'city', 'size', 'industry', 'linkedin'];
export const FIELD_LABELS = { company: 'Company', title: 'Job title', city: 'City', size: 'Company size', industry: 'Industry', linkedin: 'LinkedIn URL' };
export const OWNERS = ['Sara Ahmed', 'Khalid Ali', 'Maya Hassan'];
export const STAGES = ['New', 'Contacting', 'Engaged', 'Follow-up', 'Converted', 'Closed'];
export const SOURCES = ['Meta Ads', 'Google Ads', 'LinkedIn', 'Web Forms'];
export const COHORT = 'KSA Business Prospects';
export const WORKSPACE_TOTAL = 1240;

// ---------- Leads ----------
// Named leads appear in the reference screens; the rest of the 120-lead cohort is generated deterministically.
const NAMED = [
  { id: 'LD-0731', name: 'Noura Saleh', company: 'Madar Retail', title: 'Procurement Director', city: 'Riyadh', size: '201 – 500', industry: 'Retail', source: 'Google Ads', enrich: 'complete', qual: 'Qualified', score: 92, stage: 'Contacting', owner: 'Khalid Ali', activity: 'Email • 25m' },
  { id: 'LD-0842', name: 'Lina Mansour', company: 'Northstar Tech', title: 'IT Director', city: 'Jeddah', size: '51 – 200', industry: 'Technology', source: 'Web Forms', enrich: 'complete', qual: 'Qualified', score: 90, stage: 'Follow-up', owner: 'Maya Hassan', activity: 'Call • 1h', phoneTail: '9021' },
  { id: 'LD-0915', name: 'Maha Faris', company: 'Fleetway Logistics', title: 'Logistics Manager', city: 'Dammam', size: '51 – 200', industry: 'Logistics', source: 'LinkedIn', enrich: 'complete', qual: 'Qualified', score: 88, stage: 'Contacting', owner: 'Sara Ahmed', activity: 'Email • 2h' },
  { id: 'LD-0927', name: 'Yousef Karim', company: 'Crescent Trading', title: 'General Manager', city: 'Riyadh', size: '51 – 200', industry: 'Trading', source: 'LinkedIn', enrich: 'complete', qual: 'Qualified', score: 81, stage: 'Contacting', owner: 'Khalid Ali', activity: 'Updated • Today' },
  { id: 'LD-0954', name: 'Tariq Adel', company: 'Summit Transport', title: 'Operations Manager', city: 'Jeddah', size: '201 – 500', industry: 'Transport', source: 'Meta Ads', enrich: 'complete', qual: 'Qualified', score: 78, stage: 'Engaged', owner: 'Sara Ahmed', activity: 'Reply • 3h' },
  { id: 'LD-0763', name: 'Hana Farouk', company: 'Oasis Packaging', title: 'Finance Manager', city: 'Riyadh', size: '51 – 200', industry: 'Manufacturing', source: 'Web Forms', enrich: 'complete', qual: 'Disqualified', score: 39, stage: 'Closed', owner: 'Khalid Ali', activity: 'Call • 5h', qualReason: 'Role outside selected ICP' },
  { id: 'LD-1048', name: 'Omar Ali', company: 'Horizon Logistics', title: 'Operations Director', city: 'Riyadh', size: null, industry: null, source: 'Meta Ads', enrich: 'partial', qual: 'Qualified', score: 86, stage: 'Engaged', owner: 'Sara Ahmed', activity: 'Reply • 10m', phoneTail: '2417', whatsappOptIn: true },
  { id: 'LD-1052', name: 'Faisal Hamdan', company: 'Axis Industries', title: 'Procurement Manager', city: 'Dammam', size: null, industry: null, source: 'Meta Ads', enrich: 'partial', qual: 'Needs information', score: 68, stage: 'New', owner: 'Sara Ahmed', activity: 'Email • 42m' },
  { id: 'LD-1063', name: 'Reem Nabil', company: 'Beacon Services', title: 'HR Manager', city: 'Jeddah', size: null, industry: null, source: 'Google Ads', enrich: 'partial', qual: 'Needs information', score: 63, stage: 'New', owner: 'Maya Hassan', activity: 'Call • 2h' },
  { id: 'LD-0912', name: 'Salma Hassan', company: null, title: null, city: null, size: null, industry: null, source: 'Web Forms', enrich: 'nomatch', qual: 'Needs information', score: null, stage: 'New', owner: 'Maya Hassan', activity: 'No match • Now', qualReason: 'Company and role unknown' },
  { id: 'LD-0688', name: 'Adel Sami', company: 'Nexa Supply', title: 'Supply Chain Director', city: 'Riyadh', size: '201 – 500', industry: 'Logistics', source: 'LinkedIn', enrich: 'complete', qual: 'Qualified', score: 94, stage: 'Converted', owner: 'Sara Ahmed', activity: 'Conversion • 2d' },
  { id: 'LD-0701', name: 'Mariam Fawzi', company: 'Delta Systems', title: 'Operations Lead', city: 'Khobar', size: null, industry: null, source: 'Google Ads', enrich: 'partial', qual: 'Qualified', score: 89, stage: 'Converted', owner: 'Maya Hassan', activity: 'Conversion • 3d' },
];

const FIRST = ['Abdullah', 'Fahad', 'Saad', 'Nasser', 'Majed', 'Turki', 'Bandar', 'Hamad', 'Khaled', 'Waleed', 'Ziad', 'Rakan', 'Mishal', 'Sultan', 'Badr', 'Hussam', 'Anas', 'Yazeed', 'Rayan', 'Talal', 'Nourah', 'Sara', 'Dana', 'Lama', 'Reema', 'Haya', 'Joud', 'Shahad', 'Ghada', 'Asma', 'Lulwa', 'Razan', 'Bayan', 'Deema', 'Hessa', 'Amal'];
const LAST = ['Al-Harbi', 'Al-Otaibi', 'Al-Qahtani', 'Al-Ghamdi', 'Al-Zahrani', 'Al-Shehri', 'Al-Dosari', 'Al-Mutairi', 'Al-Anazi', 'Al-Shammari', 'Al-Subaie', 'Al-Malki', 'Al-Juhani', 'Al-Rashid', 'Al-Faisal', 'Al-Saud', 'Al-Amri', 'Al-Yami'];
const COMPANIES = ['Rawabi Freight', 'Najd Distribution', 'Sahara Cargo', 'Jazeera Foods', 'Tamkeen Builders', 'Masar Mobility', 'Wadi Trading', 'Raya Retail', 'Bayan Systems', 'Qimma Logistics', 'Afaq Industries', 'Salam Packaging', 'Nukhba Health', 'Dar Supply', 'Manara Tech', 'Sadeem Energy', 'Thuraya Media', 'Ruwad Services', 'Arkan Steel', 'Ithmar Trading', 'Mada Telecom', 'Nama Agro', 'Sawa Travel', 'Hulool Software', 'Taqa Equipment', 'Nakheel Foods', 'Majd Contracting', 'Ufuq Shipping'];
const TITLES = ['Operations Manager', 'Procurement Manager', 'Head of Sales', 'Logistics Director', 'General Manager', 'IT Manager', 'Supply Chain Manager', 'Finance Director', 'Business Development Lead', 'Fleet Manager', 'Purchasing Lead', 'COO'];
const CITIES = ['Riyadh', 'Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Riyadh', 'Jeddah', 'Medina', 'Mecca'];
const SIZES = ['11 – 50', '51 – 200', '51 – 200', '201 – 500', '501+'];
const INDUSTRIES = ['Logistics', 'Retail', 'Technology', 'Manufacturing', 'Trading', 'Transport', 'Construction', 'Food & Beverage', 'Healthcare'];
const ACTIVITY = ['Email • 1h', 'Call • 3h', 'Reply • 1d', 'Email • 2d', 'Updated • Today', 'Task • Yesterday', 'Email • 4h', 'Call • 1d'];

function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

function buildLeads() {
  const r = rng(42);
  const pick = (a) => a[Math.floor(r() * a.length)];
  // Source × enrichment cohort mix (Data Quality screen).
  const mix = { 'Meta Ads': { complete: 28, partial: 16, nomatch: 6 }, 'Google Ads': { complete: 20, partial: 8, nomatch: 2 }, LinkedIn: { complete: 18, partial: 6, nomatch: 0 }, 'Web Forms': { complete: 6, partial: 6, nomatch: 4 } };
  // Qualification/stage combos per enrichment group, matching the cohort totals used across screens.
  const combos = {
    complete: [...Array(12).fill(['Disqualified', 'Closed']), ...Array(2).fill(['Needs information', 'New']), ...Array(4).fill(['Qualified', 'Converted']), ...Array(10).fill(['Qualified', 'Follow-up']), ...Array(18).fill(['Qualified', 'Engaged']), ...Array(26).fill(['Qualified', 'Contacting'])],
    partial: [...Array(16).fill(['Needs information', 'New']), ...Array(2).fill(['Qualified', 'Converted']), ...Array(4).fill(['Qualified', 'Follow-up']), ...Array(8).fill(['Qualified', 'Engaged']), ...Array(6).fill(['Qualified', 'Contacting'])],
    nomatch: Array(12).fill(['Needs information', 'New']),
  };
  const take = (group, q, st) => { const i = combos[group].findIndex(([a, b]) => a === q && b === st); if (i >= 0) combos[group].splice(i, 1); };
  NAMED.forEach((l) => { mix[l.source][l.enrich]--; take(l.enrich, l.qual, l.stage); });

  const leads = NAMED.map((l) => ({ ...l }));
  let n = 1100, ownerIx = 0;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  Object.keys(combos).forEach((g) => shuffle(combos[g]));
  for (const src of SOURCES) {
    for (const g of ['complete', 'partial', 'nomatch']) {
      for (let k = 0; k < mix[src][g]; k++) {
        const [qual, stage] = combos[g].pop();
        const name = `${pick(FIRST)} ${pick(LAST)}`;
        const base = { id: `LD-${n++}`, name, source: src, enrich: g, qual, stage, owner: OWNERS[ownerIx++ % 3], activity: pick(ACTIVITY) };
        if (g === 'nomatch') Object.assign(base, { company: null, title: null, city: null, size: null, industry: null, score: null });
        else {
          Object.assign(base, { company: pick(COMPANIES), title: pick(TITLES), city: pick(CITIES) });
          if (g === 'complete') Object.assign(base, { size: pick(SIZES), industry: pick(INDUSTRIES) });
          else Object.assign(base, { size: null, industry: null });
          base.score = qual === 'Qualified' ? 70 + Math.floor(r() * 26) : qual === 'Disqualified' ? 25 + Math.floor(r() * 24) : 52 + Math.floor(r() * 18);
        }
        leads.push(base);
      }
    }
  }
  leads.forEach((l, i) => {
    const first = l.name.split(' ')[0].toLowerCase();
    const last = l.name.split(' ').slice(1).join('').toLowerCase().replace(/[^a-z]/g, '');
    l.email = l.email || `${first}.${last}@example.com`;
    l.phone = `+966 5••• ${l.phoneTail || String(1000 + ((i * 7919) % 9000)).slice(0, 4)}`;
    l.linkedin = l.enrich === 'complete';
    l.found = l.enrich === 'complete' ? 6 : l.enrich === 'partial' ? 3 : 0;
    l.initials = l.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    l.cohort = COHORT;
    l.eligibility = l.qual === 'Qualified' && l.enrich === 'partial' ? 'Eligible' : 'Not eligible';
  });
  // Contact eligibility: all 20 partial-qualified plus 44 complete-qualified (named ones first) are eligible;
  // the other 14 qualified leads are blocked — 8 missing permission, 6 suppressed.
  const compQ = leads.filter((l) => l.enrich === 'complete' && l.qual === 'Qualified');
  compQ.forEach((l, i) => { l.eligibility = i < 44 ? 'Eligible' : i < 52 ? 'Missing permission' : 'Suppressed'; });
  leads.forEach((l) => {
    l.consent = { email: l.eligibility === 'Eligible' ? 'Eligible' : l.eligibility === 'Suppressed' ? 'Suppressed' : 'No permission', whatsapp: l.whatsappOptIn ? 'Opt-in recorded' : 'No opt-in', linkedin: l.linkedin ? 'Assisted tasks' : 'Profile missing' };
    l.inCampaign = l.eligibility === 'Eligible' ? 'cmp-ksa' : null;
  });
  return leads;
}

// ---------- Seed ----------
function seed() {
  const leads = buildLeads();
  return {
    version: 2,
    org: { name: 'Upshifters', slug: 'upshifters', industry: 'Marketing & advertising', currency: 'SAR', timezone: 'Asia/Riyadh (UTC+03:00)', language: 'English', dateFormat: 'DD MMM YYYY', weekStart: 'Sunday', landing: 'Dashboard', leadView: 'All leads', notifications: true },
    me: { name: 'Yosef Soliman', initials: 'YS', role: 'Admin' },
    leads,
    savedViews: [],

    tasks: [
      { id: 'TSK-301', title: 'Follow-up call', leadId: 'LD-0842', owner: 'Maya Hassan', due: '2026-10-28T16:00', type: 'Call', priority: 'High', status: 'To do', notes: 'Discuss rollout timeline with IT.' },
      { id: 'TSK-302', title: 'Review missing fields', leadId: 'LD-1052', owner: 'Sara Ahmed', due: '2026-10-29T11:00', type: 'Review', priority: 'Medium', status: 'To do', notes: 'Company size, industry and LinkedIn URL not found.' },
      { id: 'TSK-303', title: 'LinkedIn introduction', leadId: 'LD-0731', owner: 'Khalid Ali', due: '2026-10-29T13:00', type: 'LinkedIn', priority: 'Medium', status: 'To do', notes: 'Assisted task — send connection note manually.' },
      { id: 'TSK-304', title: 'Request missing details', leadId: 'LD-1063', owner: 'Maya Hassan', due: '2026-10-29T14:00', type: 'Email', priority: 'Low', status: 'To do', notes: 'Ask for company size and role scope.' },
      { id: 'TSK-305', title: 'Research external data', leadId: 'LD-0912', owner: 'Maya Hassan', due: '2026-10-29T15:00', type: 'Research', priority: 'Low', status: 'To do', notes: 'No external match. Original form data kept.' },
      { id: 'TSK-306', title: 'Review missing fields', leadId: 'LD-1048', owner: 'Sara Ahmed', due: '2026-10-30T10:00', type: 'Review', priority: 'Medium', status: 'To do', notes: 'Company size, industry and LinkedIn URL missing.' },
      { id: 'TSK-307', title: 'LinkedIn follow-up', leadId: 'LD-0915', owner: 'Sara Ahmed', due: '2026-10-30T11:00', type: 'LinkedIn', priority: 'Medium', status: 'To do', notes: 'Assisted follow-up after email.' },
      { id: 'TSK-308', title: 'Schedule product demo', leadId: 'LD-1048', owner: 'Sara Ahmed', due: '2026-10-30T14:00', type: 'Meeting', priority: 'High', status: 'To do', meeting: 'Requested', notes: 'Customer requested a product demo for tomorrow at 2:00 PM in Riyadh. Not yet booked.' },
    ],

    conversations: [
      { id: 'cv-noura', leadId: 'LD-0731', channel: 'Email', time: '9:32 AM', status: 'Open', unread: true, assignee: 'Khalid Ali', messages: [
        { from: 'agent', who: 'Khalid Ali', time: 'Yesterday 4:10 PM', text: 'Hi Noura, following up on your interest in Leadviron for Madar Retail. Happy to share more.' },
        { from: 'lead', who: 'Noura Saleh', time: '9:32 AM', text: 'Thanks for the information. Could you share pricing details?' }] },
      { id: 'cv-lina', leadId: 'LD-0842', channel: 'Email', time: 'Yesterday', status: 'Open', assignee: 'Maya Hassan', messages: [
        { from: 'lead', who: 'Lina Mansour', time: 'Yesterday 11:20 AM', text: "I'm interested in learning more about your platform." }] },
      { id: 'cv-maha', leadId: 'LD-0915', channel: 'WhatsApp', time: 'Oct 27', status: 'Open', assignee: 'Sara Ahmed', messages: [
        { from: 'agent', who: 'Sara Ahmed', time: 'Oct 27 10:02 AM', text: 'Hi Maha, thanks for connecting. Would a quick call help?' },
        { from: 'lead', who: 'Maha Faris', time: 'Oct 27 10:40 AM', text: 'Can we schedule a call this week?' }] },
      { id: 'cv-omar', leadId: 'LD-1048', channel: 'WhatsApp', time: '10:48 AM', status: 'Open', assignee: 'Sara Ahmed', automationPaused: true, messages: [
        { from: 'agent', who: 'Sara Ahmed', time: '10:42 AM', text: 'Hi Omar, thanks for requesting details about Leadviron. Would you like a short demo for your team?' },
        { from: 'lead', who: 'Omar Ali', time: '10:45 AM', text: 'Yes, please. We want to improve lead follow-up.' },
        { from: 'agent', who: 'Sara Ahmed', time: '10:46 AM', text: 'Happy to help. What time suits you?' },
        { from: 'lead', who: 'Omar Ali', time: '10:48 AM', text: 'Tomorrow at 2:00 PM Riyadh time works for me.' }] },
      { id: 'cv-faisal', leadId: 'LD-1052', channel: 'WhatsApp', time: 'Oct 27', status: 'Pending', assignee: 'Sara Ahmed', messages: [
        { from: 'lead', who: 'Faisal Hamdan', time: 'Oct 27 2:15 PM', text: 'Could you send me more details about your solution?' }] },
      { id: 'cv-salma', leadId: 'LD-0912', channel: 'Email', time: 'Oct 26', status: 'Open', assignee: 'Maya Hassan', messages: [
        { from: 'lead', who: 'Salma Hassan', time: 'Oct 26 9:05 AM', text: 'Do you have a case study for the real estate sector?' }] },
      { id: 'cv-tariq', leadId: 'LD-0954', channel: 'Email', time: 'Oct 25', status: 'Resolved', assignee: 'Sara Ahmed', messages: [
        { from: 'lead', who: 'Tariq Adel', time: 'Oct 25 1:00 PM', text: 'Thanks, we will review internally.' }] },
    ],

    campaigns: [
      { id: 'cmp-ksa', name: 'KSA Logistics Outreach', goal: 'Generate qualified conversations', dates: 'Oct 24 – Nov 7, 2026', channels: ['Email', 'WhatsApp', 'LinkedIn tasks'], audience: 64, status: 'Running', reached: 48, replies: 18, conversions: 6, owner: 'Sara Ahmed', list: 'lst-ksa', linkedinTasks: 12,
        channelStats: [{ ch: 'Email', sent: 34, delivered: 32, read: null, reached: 32, replies: 10, conv: 3, cost: null }, { ch: 'WhatsApp', sent: 18, delivered: 16, read: 12, reached: 16, replies: 8, conv: 3, cost: 64 }] },
      { id: 'cmp-retail', name: 'Retail Decision Makers', goal: 'Book discovery calls', dates: 'Starts Oct 30, 2026', channels: ['Email', 'LinkedIn tasks'], audience: 40, status: 'Scheduled', reached: 0, replies: 0, conversions: 0, owner: 'Khalid Ali', list: 'lst-priority' },
      { id: 'cmp-tech', name: 'Tech Demo Follow-up', goal: 'Convert demo requests', dates: 'Started Oct 20, 2026', channels: ['Email', 'WhatsApp'], audience: 32, status: 'Paused', reached: 20, replies: 7, conversions: 2, owner: 'Maya Hassan', list: 'lst-complete' },
      { id: 'cmp-recovery', name: 'Data Recovery Sequence', goal: 'Collect missing details', dates: 'Not scheduled', channels: ['Email'], audience: 48, status: 'Draft', reached: 0, replies: 0, conversions: 0, owner: 'Maya Hassan', list: 'lst-partial' },
      { id: 'cmp-nurture', name: 'Post-Demo Nurture', goal: 'Nurture after demo', dates: 'Oct 10 – 24, 2026', channels: ['Email'], audience: 24, status: 'Completed', reached: 24, replies: 12, conversions: 5, owner: 'Sara Ahmed', list: 'lst-priority' },
    ],

    templates: [
      { id: 'tpl-b2b', name: 'B2B Introduction', channel: 'Email', language: 'English', purpose: 'Introduction', status: 'Ready', subject: 'Better lead follow-up for {{company}}', body: "Hi {{first_name}},\n\nI'd like to show how Leadviron helps {{company}} organize leads and follow-ups.\n\nWould a short demo be useful?\n\nSara", fallback: 'your team' },
      { id: 'tpl-demo', name: 'Demo Follow-up', channel: 'Email', language: 'English', purpose: 'Follow-up', status: 'Ready', subject: 'Following up on your demo, {{first_name}}', body: 'Hi {{first_name}},\n\nThanks for your time today. Here is a short summary of what we covered for {{company}}.\n\nSara', fallback: 'your team' },
      { id: 'tpl-wa', name: 'WhatsApp Demo Invite', channel: 'WhatsApp', language: 'English', purpose: 'Demo invite', status: 'Approved', subject: '', body: 'Hi {{first_name}}, would you like a short Leadviron demo for {{company}}? Reply with a time that suits you.', fallback: 'your team' },
      { id: 'tpl-li', name: 'LinkedIn Connection Note', channel: 'LinkedIn', language: 'English', purpose: 'Introduction', status: 'Assisted', subject: '', body: 'Hi {{first_name}}, I work with logistics teams in KSA on lead follow-up. Happy to connect.', fallback: 'your team' },
      { id: 'tpl-details', name: 'Details Request', channel: 'Email', language: 'English', purpose: 'Data request', status: 'Draft', subject: 'Quick question about {{company}}', body: 'Hi {{first_name}},\n\nCould you share your company size and industry so we can tailor our follow-up?\n\nMaya', fallback: 'your company' },
    ],

    lists: [
      { id: 'lst-ksa', name: 'KSA Business Prospects', sub: 'KSA Business Prospects', owner: 'Sara Ahmed', source: 'Mixed sources', type: 'Static', people: 120, ready: 64, campaign: 'cmp-ksa', updated: 'Today', filter: null },
      { id: 'lst-complete', name: 'Complete enrichment', sub: '100% • 6/6 fields', owner: 'Sara Ahmed', source: 'Saved segment', type: 'Dynamic', people: 72, ready: 44, campaign: 'cmp-ksa', updated: 'Today', filter: 'complete' },
      { id: 'lst-partial', name: 'Partial enrichment', sub: '50% • 3/6 fields', owner: 'Sara Ahmed', source: 'Saved segment', type: 'Dynamic', people: 36, ready: 20, campaign: 'cmp-ksa', updated: 'Today', filter: 'partial' },
      { id: 'lst-nomatch', name: 'No external match', sub: '0% • 0/6 fields', owner: 'Maya Hassan', source: 'Saved segment', type: 'Dynamic', people: 12, ready: 0, campaign: null, updated: 'Today', filter: 'nomatch' },
      { id: 'lst-priority', name: 'Priority leads', sub: '', owner: 'Khalid Ali', source: 'Saved segment', type: 'Static', people: 42, ready: 32, campaign: 'cmp-priority', campaignName: 'Priority outreach', updated: 'Yesterday', filter: null },
    ],

    enrichmentJobs: [
      { id: 'ENR-1024', list: 'KSA Business Prospects', status: 'Completed', started: 'Oct 29, 2026, 10:14 AM', completed: 'Oct 29, 2026, 10:42 AM', processed: 120, total: 120 },
    ],

    qualification: {
      sets: [
        { id: 'qs-b2b', name: 'B2B qualification', desc: 'Identify and qualify target prospects', status: 'Draft',
          conditions: [{ field: 'Company', op: 'is identified' }, { field: 'Decision-making role', op: 'is confirmed' }, { field: 'Relevant business need', op: 'is confirmed' }],
          missing: 'Needs Information', mismatch: 'Disqualified', version: 'Draft v2.1' },
        { id: 'qs-inbound', name: 'Inbound lead check', desc: 'Quick qualification for inbound leads', status: 'Active', conditions: [{ field: 'Valid email', op: 'is present' }, { field: 'Relevant business need', op: 'is confirmed' }], missing: 'Needs Information', mismatch: 'Disqualified', version: 'v1.4' },
        { id: 'qs-ent', name: 'Enterprise fit', desc: 'Additional criteria for enterprise accounts', status: 'Draft', conditions: [{ field: 'Company size', op: 'is at least 201' }, { field: 'Decision-making role', op: 'is confirmed' }], missing: 'Needs Information', mismatch: 'Disqualified', version: 'Draft v0.3' },
      ],
    },

    scoring: {
      version: 'Draft v1.3',
      factors: [
        { key: 'company', name: 'Company fit', icon: 'building', max: 40, rule: 'Known company and business-fit signals' },
        { key: 'role', name: 'Role fit', icon: 'user', max: 30, rule: 'Decision-making responsibility' },
        { key: 'engagement', name: 'Engagement', icon: 'send', max: 20, rule: 'Replies and stated interest' },
        { key: 'recency', name: 'Recency', icon: 'clock', max: 10, rule: 'Recent activity' },
      ],
      bands: { high: 80, medium: 50 },
      unknown: 'Not assessed',
    },

    workflows: [
      { id: 'wf-enrich', name: 'Enrichment-based outreach', desc: 'Enrich leads and start outreach automatically.', trigger: 'Enrichment completed', status: 'Active', published: 'v1.2', draft: 'v1.3', runs: 120, last: 'Today 10:42 AM', icon: 'database', owner: 'Sara Ahmed' },
      { id: 'wf-qualified', name: 'Qualified Lead Follow-up', desc: 'Follow up as soon as a lead qualifies.', trigger: 'Lead qualified', status: 'Active', published: 'v2.1', draft: null, runs: 64, last: 'Today 10:48 AM', icon: 'users', owner: 'Khalid Ali' },
      { id: 'wf-reminder', name: 'Task Reminder', desc: 'Remind owners about due tasks.', trigger: 'Task due', status: 'Active', published: 'v1.0', draft: null, runs: 38, last: 'Today 9:00 AM', icon: 'file', owner: 'Maya Hassan' },
      { id: 'wf-nurture', name: 'Post-Demo Nurture', desc: 'Nurture sequence after a demo.', trigger: 'Demo completed', status: 'Paused', published: 'v1.4', draft: null, runs: 24, last: 'Yesterday', icon: 'send', owner: 'Sara Ahmed' },
      { id: 'wf-welcome', name: 'New Lead Welcome', desc: 'Welcome new inbound leads.', trigger: 'Lead created', status: 'Draft', published: null, draft: 'v0.1', runs: 0, last: 'Yesterday', icon: 'users', owner: 'Maya Hassan' },
    ],

    runs: [
      { id: 'RUN-1052', leadId: 'LD-0731', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Waiting', step: 'Wait for reply', started: 'Oct 29, 2026 10:50 AM', next: 'Oct 31, 2026 10:50 AM' },
      { id: 'RUN-1051', leadId: 'LD-0915', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Waiting', step: 'Wait for reply', started: 'Oct 29, 2026 10:49 AM', next: 'Oct 31, 2026 10:49 AM' },
      { id: 'RUN-1050', leadId: 'LD-0842', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Needs attention', step: 'Email connector error', started: 'Oct 29, 2026 10:46 AM', next: 'Review' },
      { id: 'RUN-1049', leadId: 'LD-1052', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Completed', step: 'Review task created', started: 'Oct 29, 2026 10:44 AM', next: 'View task', taskId: 'TSK-302' },
      { id: 'RUN-1048', leadId: 'LD-1048', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Completed', step: 'Review task created', started: 'Oct 29, 2026 10:42 AM', next: 'View task', taskId: 'TSK-306' },
      { id: 'RUN-1047', leadId: 'LD-0912', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Completed', step: 'Research task created', started: 'Oct 29, 2026 10:40 AM', next: 'View task', taskId: 'TSK-305' },
      { id: 'RUN-1046', leadId: 'LD-1063', workflow: 'wf-enrich', version: 'Published v1.2', state: 'Completed', step: 'Review task created', started: 'Oct 29, 2026 10:38 AM', next: 'View task', taskId: 'TSK-304' },
    ],

    forms: [
      { id: 'frm-demo', name: 'Product Demo Request', status: 'Published', owner: 'Sara Ahmed', source: 'Web Forms', submissions: 56, updated: 'Oct 29, 2026', slug: 'product-demo', draft: 'v1.1', published: 'v1.0',
        title: 'Request a product demo', successMessage: 'Thanks — our team will contact you shortly.',
        fields: [
          { id: 'f1', type: 'text', label: 'Full name', required: true, mapping: 'Full name' },
          { id: 'f2', type: 'email', label: 'Work email', required: true, mapping: 'Email' },
          { id: 'f3', type: 'phone', label: 'Phone number', required: false, requiredWhen: 'WhatsApp opt-in = Yes', country: 'Saudi Arabia (+966)', validation: 'International phone number', mapping: 'Phone' },
          { id: 'f4', type: 'text', label: 'Company (optional)', required: false, mapping: 'Company' },
          { id: 'f5', type: 'consent', label: 'I agree to receive WhatsApp messages about my inquiry.', required: false, mapping: 'WhatsApp opt-in' },
        ] },
      { id: 'frm-sales', name: 'Contact Sales', status: 'Published', owner: 'Khalid Ali', source: 'Web Forms', submissions: 38, updated: 'Oct 28, 2026', slug: 'contact-sales', draft: null, published: 'v2.0', title: 'Contact our sales team', successMessage: 'Thanks — we will be in touch.', fields: [{ id: 'f1', type: 'text', label: 'Full name', required: true, mapping: 'Full name' }, { id: 'f2', type: 'email', label: 'Work email', required: true, mapping: 'Email' }, { id: 'f3', type: 'text', label: 'Message', required: false, mapping: 'Notes' }] },
      { id: 'frm-partner', name: 'Partner Inquiry', status: 'Published', owner: 'Maya Hassan', source: 'Web Forms', submissions: 22, updated: 'Oct 27, 2026', slug: 'partners', draft: null, published: 'v1.0', title: 'Become a partner', successMessage: 'Thanks for your interest.', fields: [{ id: 'f1', type: 'text', label: 'Full name', required: true, mapping: 'Full name' }, { id: 'f2', type: 'email', label: 'Work email', required: true, mapping: 'Email' }, { id: 'f3', type: 'text', label: 'Company', required: true, mapping: 'Company' }] },
      { id: 'frm-guide', name: 'Download Guide', status: 'Published', owner: 'Maya Hassan', source: 'Web Forms', submissions: 12, updated: 'Oct 25, 2026', slug: 'guide', draft: null, published: 'v1.0', title: 'Get the lead follow-up guide', successMessage: 'Your guide is on its way.', fields: [{ id: 'f1', type: 'email', label: 'Work email', required: true, mapping: 'Email' }] },
      { id: 'frm-event', name: 'Event Follow-up', status: 'Paused', owner: 'Sara Ahmed', source: 'Web Forms', submissions: 8, updated: 'Oct 24, 2026', slug: 'event', draft: null, published: 'v1.0', title: 'Thanks for visiting our booth', successMessage: 'Thanks — talk soon.', fields: [{ id: 'f1', type: 'text', label: 'Full name', required: true, mapping: 'Full name' }, { id: 'f2', type: 'phone', label: 'Phone', required: false, mapping: 'Phone' }] },
    ],

    ingestion: {
      stats: { incoming: 126, processed: 120, review: 4, failed: 2 },
      events: [
        { id: 'EVT-1206', source: 'Meta Lead Ads', time: '10:55 AM', status: 'Processed', result: 'Tariq Adel · Updated.', leadId: 'LD-0954' },
        { id: 'EVT-1205', source: 'Web Forms', time: '10:54 AM', status: 'Processed', result: 'Lina Mansour · Updated.', leadId: 'LD-0842' },
        { id: 'EVT-1204', source: 'CSV import', time: '10:53 AM', status: 'Failed', result: 'No lead created.', file: 'ksa-prospects-oct29.csv', row: 87, issue: 'Invalid email format', submittedName: 'Rami Nasser', submittedEmail: 'contact@' },
        { id: 'EVT-1203', source: 'CSV import', time: '10:52 AM', status: 'Needs review', result: 'Possible duplicate · Omar Ali.', leadId: 'LD-1048', file: 'ksa-prospects-oct29.csv', row: 86, issue: 'Possible duplicate of LD-1048' },
        { id: 'EVT-1202', source: 'Meta Lead Ads', time: '10:51 AM', status: 'Processed', result: 'Faisal Hamdan · Updated.', leadId: 'LD-1052' },
        { id: 'EVT-1201', source: 'Web Forms', time: '10:50 AM', status: 'Processed', result: 'Salma Hassan · Updated.', leadId: 'LD-0912' },
        { id: 'EVT-1200', source: 'Google Lead Forms', time: '10:44 AM', status: 'Needs review', result: 'Missing consent value.', issue: 'Consent field empty' },
        { id: 'EVT-1199', source: 'CSV import', time: '10:41 AM', status: 'Failed', result: 'No lead created.', file: 'ksa-prospects-oct29.csv', row: 52, issue: 'Phone number too short', submittedName: 'Huda Kamal', submittedEmail: 'huda.kamal@example.com' },
      ],
      imports: [
        { id: 'IMP-31', file: 'ksa-prospects-oct29.csv', rows: 92, created: 84, updated: 4, review: 2, failed: 2, by: 'Maya Hassan', at: 'Oct 29, 2026 10:40 AM' },
        { id: 'IMP-30', file: 'q4-prospects.csv', rows: 40, created: 38, updated: 2, review: 0, failed: 0, by: 'Maya Hassan', at: 'Oct 27, 2026 3:15 PM' },
      ],
    },

    duplicates: [
      { id: 'dup-1', a: { id: 'LD-1048', name: 'Omar Ali', company: 'Horizon Logistics', title: 'Operations Director', city: 'Riyadh', email: 'omar.ali@example.com', phone: '+966 5••• 2417', source: 'Meta Ads' }, b: { id: 'LD-2187', name: 'Omar A.', company: 'Horizon Logistics LLC', title: 'Operations Director', city: 'Riyadh', email: 'omar.ali@example.com', phone: '+966 5••• 2417', source: 'Web Forms' }, reason: 'Same email and phone', found: 3, status: 'Open' },
      { id: 'dup-2', a: { id: 'LD-0915', name: 'Maha Faris', company: 'Fleetway Logistics', title: 'Logistics Manager', city: 'Dammam', email: 'maha.faris@example.com', phone: '+966 5••• 3310', source: 'LinkedIn' }, b: { id: 'LD-2190', name: 'Maha F.', company: 'Fleetway', title: 'Logistics Manager', city: 'Dammam', email: 'm.faris@example.com', phone: '+966 5••• 3310', source: 'Meta Ads' }, reason: 'Same phone', found: 6, status: 'Open' },
      { id: 'dup-3', a: { id: 'LD-0954', name: 'Tariq Adel', company: 'Summit Transport', title: 'Operations Manager', city: 'Jeddah', email: 'tariq.adel@example.com', phone: '+966 5••• 4410', source: 'Meta Ads' }, b: { id: 'LD-2194', name: 'T. Adel', company: 'Summit Transport', title: 'Ops Manager', city: 'Jeddah', email: 'tariq.adel@example.com', phone: '+966 5••• 7781', source: 'CSV import' }, reason: 'Same email', found: 6, status: 'Open' },
      { id: 'dup-4', a: { id: 'LD-0842', name: 'Lina Mansour', company: 'Northstar Tech', title: 'IT Director', city: 'Jeddah', email: 'lina.mansour@example.com', phone: '+966 5••• 9021', source: 'Web Forms' }, b: { id: 'LD-2199', name: 'Lina M.', company: 'Northstar Technologies', title: 'Director of IT', city: 'Jeddah', email: 'lina@northstar.example', phone: '+966 5••• 1288', source: 'Google Ads' }, reason: 'Similar name and company', found: 6, status: 'Open' },
    ],
    mergeHistory: [
      { id: 'MRG-12', kept: 'Yousef Karim (LD-0927)', merged: 'Yousef K. (LD-2101)', by: 'Maya Hassan', at: 'Oct 27, 2026 4:12 PM', action: 'Merged' },
      { id: 'MRG-11', kept: 'Reem Nabil (LD-1063)', merged: 'Reem N. (LD-2093)', by: 'Sara Ahmed', at: 'Oct 25, 2026 11:03 AM', action: 'Kept separate' },
    ],

    team: [
      { id: 'u-ys', name: 'Yosef Soliman', email: 'yosef.soliman@upshifters.me', role: 'Admin', team: 'Operations', status: 'Active', access: 'All records' },
      { id: 'u-mh', name: 'Maya Hassan', email: 'maya.hassan@example.com', role: 'Sales Manager', team: 'Sales B', status: 'Active', access: 'Team records' },
      { id: 'u-sa', name: 'Sara Ahmed', email: 'sara.ahmed@example.com', role: 'Sales Representative', team: 'Sales A', status: 'Active', access: 'Assigned records' },
      { id: 'u-ka', name: 'Khalid Ali', email: 'khalid.ali@example.com', role: 'Sales Representative', team: 'Sales A', status: 'Active', access: 'Assigned records' },
    ],
    roles: [
      { id: 'Admin', icon: 'settings', scope: 'All records', perms: { view: true, edit: true, contact: true, export: true, manage: true } },
      { id: 'Sales Manager', icon: 'users', scope: 'Team records', perms: { view: true, edit: true, contact: true, export: true, manage: false } },
      { id: 'Sales Representative', icon: 'user', scope: 'Assigned records', perms: { view: true, edit: true, contact: true, export: false, manage: false } },
    ],

    fields: [
      { id: 'full_name', label: 'Full name', type: 'Text', required: true, enrichment: 'Original data', show: true },
      { id: 'email', label: 'Email', type: 'Email', required: false, enrichment: 'Original data', show: true },
      { id: 'phone', label: 'Phone', type: 'Phone', required: false, enrichment: 'Original data', show: true },
      { id: 'company', label: 'Company', type: 'Text', required: false, enrichment: 'Target field', show: true },
      { id: 'title', label: 'Job title', type: 'Text', required: false, enrichment: 'Target field', show: true },
      { id: 'city', label: 'City', type: 'Text', required: false, enrichment: 'Target field', show: true },
      { id: 'size', label: 'Company size', type: 'Single select', required: false, enrichment: 'Target field', show: true, allowUnknown: true, options: ['1 – 10', '11 – 50', '51 – 200', '201 – 500', '501+'] },
      { id: 'industry', label: 'Industry', type: 'Single select', required: false, enrichment: 'Target field', show: true, allowUnknown: true, options: ['Logistics', 'Retail', 'Technology', 'Manufacturing', 'Trading', 'Transport'] },
      { id: 'linkedin', label: 'LinkedIn URL', type: 'URL', required: false, enrichment: 'Target field', show: false },
    ],
    lifecycle: ['Lead', 'Qualified lead', 'Sales opportunity', 'Customer', 'Disqualified'],
    salesStages: STAGES.slice(),

    policies: {
      purpose: 'Sales outreach',
      requireQualified: true, missingPermission: 'Block channel', suppressed: 'Block channel',
      channels: [
        { ch: 'Email', sub: 'For campaign messages', conds: ['Valid email', 'Outreach permission', 'Not suppressed'], result: 'Email eligible' },
        { ch: 'WhatsApp', sub: 'For campaign messages', conds: ['Valid phone', 'Recorded WhatsApp opt-in', 'Not suppressed'], result: 'WhatsApp eligible' },
        { ch: 'LinkedIn', sub: 'For assisted tasks', conds: ['Available profile', 'Manual task allowed', 'Not suppressed'], result: 'Assisted task only' },
      ],
      quietHours: { enabled: true, start: '21:00', end: '08:00', days: 'Friday', timezone: 'Lead local time' },
      suppression: [
        { value: 'contact@competitor.example', type: 'Email', reason: 'Requested no contact', added: 'Oct 12, 2026' },
        { value: '+966 5••• 0099', type: 'Phone', reason: 'Opted out on WhatsApp', added: 'Oct 20, 2026' },
        { value: 'blocked-domain.example', type: 'Domain', reason: 'Company policy', added: 'Sep 30, 2026' },
      ],
      retention: { leads: '24 months', conversations: '12 months', exports: '30 days' },
      requests: [{ id: 'DSR-07', type: 'Data access', subject: 'Huda Kamal', status: 'In review', received: 'Oct 28, 2026' }, { id: 'DSR-06', type: 'Deletion', subject: 'Former contact', status: 'Completed', received: 'Oct 14, 2026' }],
    },

    audit: [
      { id: 'AUD-0928', time: '09:40 AM', actor: 'Yosef Soliman', actorRole: 'Admin', action: 'Field display updated', item: 'Company size', result: 'Success', setting: 'Show in lead tables', before: 'Off', after: 'On', link: '#/demo/settings/fields-stages' },
      { id: 'AUD-0927', time: '09:32 AM', actor: 'Maya Hassan', actorRole: 'Sales Manager', action: 'Lead owner changed', item: 'Reem Nabil', result: 'Success', setting: 'Owner', before: 'Sara Ahmed', after: 'Maya Hassan', link: '#/demo/leads/LD-1063' },
      { id: 'AUD-0926', time: '09:18 AM', actor: 'Yosef Soliman', actorRole: 'Admin', action: 'Member role changed', item: 'Maya Hassan', result: 'Success', setting: 'Role', before: 'Sales Representative', after: 'Sales Manager', link: '#/demo/settings/team' },
      { id: 'AUD-0925', time: '09:06 AM', actor: 'Yosef Soliman', actorRole: 'Admin', action: 'Suppression list updated', item: 'Contact policies', result: 'Success', setting: 'Suppression entries', before: '2', after: '3', link: '#/demo/settings/contact-policies' },
      { id: 'AUD-0924', time: '08:55 AM', actor: 'Maya Hassan', actorRole: 'Sales Manager', action: 'Import mapping updated', item: 'Q4 prospects.csv', result: 'Success', setting: 'Column "Mobile"', before: 'Not mapped', after: 'Phone', link: '#/demo/settings/ingestion' },
      { id: 'AUD-0923', time: '08:40 AM', actor: 'Sara Ahmed', actorRole: 'Sales Representative', action: 'Export requested', item: 'Lead list', result: 'Blocked', setting: 'Export data', before: '—', after: 'Not permitted for role', link: '#/demo/settings/team' },
    ],

    integrations: [
      { id: 'meta-lead-ads', name: 'Meta Lead Ads', account: 'Upshifters KSA', cat: 'Lead sources & ads', icon: 'meta', status: 'Connected', sync: 'Oct 29, 2026, 10:55 AM', purpose: 'Receive Facebook and Instagram lead form submissions.', setup: 'Page, forms, permissions and leadgen webhook, then lead retrieval and field mapping.', caps: [['Receive lead form submissions', true], ['Retrieve lead details', true], ['Map form fields', true], ['Send messages', false]] },
      { id: 'google-lead-forms', name: 'Google Ads', account: 'Upshifters Ads', cat: 'Lead sources & ads', icon: 'google', status: 'Connected', sync: 'Oct 29, 2026, 10:52 AM', purpose: 'Receive Google lead form submissions via webhook.', setup: 'Webhook URL, google_key, field mapping; deduplicate events with lead_id.', caps: [['Receive lead form webhooks', true], ['Deduplicate by lead_id', true], ['Import ad costs', true], ['Send messages', false]] },
      { id: 'web-forms', name: 'Web Forms', account: 'Leadviron forms', cat: 'Lead sources & ads', icon: 'file', status: 'Active', sync: 'Oct 29, 2026, 10:54 AM', purpose: 'Internal forms and CSV imports, managed in Leads.', setup: 'Built-in. Field setup, validation, duplicates and ingestion log.', caps: [['Collect form submissions', true], ['CSV import', true], ['Duplicate checks', true], ['Send messages', false]] },
      { id: 'demo-enrichment-a', name: 'Demo Enrichment A', account: 'Demo account A', cat: 'Data providers', icon: 'database', status: 'Connected', sync: 'Oct 29, 2026, 10:42 AM', primary: true, purpose: 'Enrich existing leads and show value source, confidence and no-match outcomes.', setup: 'Hidden API key, supported fields and usage limit. Completeness is not guaranteed.', caps: [['Match existing lead by email or phone', true], ['Enrich existing lead', true], ['Return source and confidence', true], ['Discover new prospects', false], ['Send messages', false]], usage: { manual: true, auto: true, fillEmpty: true, preserve: true, unmatched: 'Keep original record', cost: '1 demo credit', limit: '1,000 demo credits' } },
      { id: 'demo-enrichment-b', name: 'Demo Enrichment B', account: 'Demo account B', cat: 'Data providers', icon: 'database', status: 'Connected', sync: 'Oct 29, 2026, 10:40 AM', purpose: 'Fallback enrichment provider.', setup: 'Hidden API key, supported fields and usage limit.', caps: [['Match existing lead by email or phone', true], ['Enrich existing lead', true], ['Return source and confidence', true], ['Discover new prospects', false], ['Send messages', false]], usage: { manual: true, auto: false, fillEmpty: true, preserve: true, unmatched: 'Keep original record', cost: '1 demo credit', limit: '500 demo credits' } },
      { id: 'custom-provider', name: 'Custom data provider', account: 'No account connected', cat: 'Data providers', icon: 'database', status: 'Not connected', sync: '—', purpose: 'Add another data provider when approved.', setup: 'Authentication, events, retries and logs.', caps: [['Enrich existing lead', null], ['Return source and confidence', null]] },
      { id: 'email', name: 'Email', account: 'Upshifters outreach', cat: 'Communication', icon: 'mail', status: 'Needs authorization', sync: 'Oct 29, 2026, 10:47 AM', syncLabel: 'Last attempt', purpose: 'Send email, then receive replies and link them to the lead and campaign.', setup: 'Host, port, TLS, credentials, From and Reply-To. SMTP for sending; IMAP or provider API for inbound.', caps: [['Send email (SMTP)', true], ['Receive replies (IMAP)', true], ['Track delivery', true]] },
      { id: 'whatsapp', name: 'WhatsApp', account: 'Upshifters messaging', cat: 'Communication', icon: 'whatsapp', status: 'Connected', sync: 'Oct 29, 2026, 10:48 AM', purpose: 'Send messages, receive replies and message status in Conversations.', setup: 'Business account, number, token, webhook, approved templates and contact eligibility. Free-form messages depend on the customer service window.', caps: [['Send approved templates', true], ['Receive replies', true], ['Message status', true], ['Free-form outside service window', false]] },
      { id: 'linkedin', name: 'LinkedIn tasks', account: 'Sales workspace', cat: 'Communication', icon: 'linkedin', status: 'Enabled', sync: 'Oct 29, 2026, 10:50 AM', assisted: true, purpose: 'Manage assisted follow-up tasks.', setup: 'OAuth and available permissions. Automated messaging is not assumed; many access programs require approval.', caps: [['Create assisted tasks', true], ['Profile links', true], ['Automated messages', false]] },
      { id: 'custom-api', name: 'Custom API & Webhooks', account: 'Not configured', cat: 'Communication', icon: 'code', status: 'Not connected', sync: '—', purpose: 'Exchange events or connect a CRM and extra sources when approved.', setup: 'Authentication, events, retries and logs.', caps: [['Outbound webhooks', null], ['Inbound events', null]] },
    ],

    notifications: [
      { id: 'n1', text: 'Email connection needs attention', sub: 'Reconnect your sending account.', href: '#/demo/settings/integrations/email', unread: true },
      { id: 'n2', text: 'Omar Ali replied on WhatsApp', sub: 'Demo requested for tomorrow 2:00 PM', href: '#/demo/conversations?c=cv-omar', unread: true },
      { id: 'n3', text: 'RUN-1050 needs attention', sub: 'Email connector error', href: '#/demo/workflows/runs/RUN-1050', unread: true },
      { id: 'n4', text: 'Enrichment ENR-1024 completed', sub: '72 complete · 36 partial · 12 no match', href: '#/demo/intelligence/enrichment', unread: false },
    ],
  };
}

// ---------- Store ----------
let state;
const listeners = new Set();

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.version === 2) return s; }
  } catch (_) { /* storage unavailable */ }
  return seed();
}
function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* ignore */ } }

state = load();

export const store = {
  get s() { return state; },
  update(fn) { fn(state); save(); listeners.forEach((l) => l()); },
  reset() { state = seed(); save(); listeners.forEach((l) => l()); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

// ---------- Selectors ----------
export const leadById = (id) => state.leads.find((l) => l.id === id);
export const campaignById = (id) => state.campaigns.find((c) => c.id === id);
export const enrichPct = (l) => Math.round((l.found / 6) * 100);
export const enrichLabel = (l) => (l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No match');
export const enrichText = (l) => `${enrichLabel(l)} · ${enrichPct(l)}% · ${l.found}/6`;
export const fieldValue = (l, f) => (f === 'linkedin' ? (l.linkedin ? `linkedin.com/in/${l.name.toLowerCase().replace(/\s+/g, '-')}` : null) : l[f]);
export const cohortCounts = () => {
  const c = { total: 0, complete: 0, partial: 0, nomatch: 0, qualified: 0, needsInfo: 0, disqualified: 0, eligible: 0 };
  state.leads.forEach((l) => {
    c.total++; c[l.enrich]++;
    if (l.qual === 'Qualified') c.qualified++; else if (l.qual === 'Disqualified') c.disqualified++; else c.needsInfo++;
    if (l.eligibility === 'Eligible') c.eligible++;
  });
  return c;
};
export const formatDue = (iso) => {
  const d = new Date(iso);
  const m = d.toLocaleString('en-US', { month: 'short' });
  const t = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  return { date: `${m} ${d.getDate()}, ${d.getFullYear()}`, time: t };
};
// Demo "today" is Oct 29, 2026 to match the reference scenario.
export const DEMO_TODAY = '2026-10-29';
