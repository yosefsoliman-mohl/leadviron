// Additional enrichment fields: a catalog that can be switched on/off, plus custom fields.
// Coverage and "x of 6" stay based on the six core target fields; these are reported separately.
import { store } from './store.js';

export const FIELD_TYPES = ['Text', 'URL', 'Number', 'Currency (SAR)', 'Date', 'Single select', 'Yes / No'];
export const FIELD_SOURCES = ['Demo Enrichment A', 'Demo Enrichment B', 'AI web research', 'Manual entry'];

// [key, label, group, type, description, credits, on by default]
const RAW = [
  ['instagram', 'Instagram profile', 'Social profiles', 'URL', 'Public Instagram account for the person or business.', 0.5, true],
  ['twitter', 'X (Twitter) profile', 'Social profiles', 'URL', 'Public X account.', 0.5, false],
  ['facebook', 'Facebook page', 'Social profiles', 'URL', 'Company or professional Facebook page.', 0.5, false],
  ['tiktok', 'TikTok profile', 'Social profiles', 'URL', 'Public TikTok account, if any.', 0.5, false],
  ['workEntity', 'Work entity', 'Work & role', 'Text', 'Legal name of the employer (as registered).', 0.5, true],
  ['workLocation', 'Work location', 'Work & role', 'Text', 'Office or branch where the person works.', 0.5, true],
  ['department', 'Department', 'Work & role', 'Single select', 'Operations, Procurement, IT, Finance, Sales…', 0.5, false],
  ['seniority', 'Seniority level', 'Work & role', 'Single select', 'Entry, Manager, Director, VP, C-level.', 0.5, true],
  ['tenure', 'Years in current role', 'Work & role', 'Number', 'Time in the current position.', 0.5, false],
  ['workEmail', 'Verified work email', 'Work & role', 'Text', 'Business email with deliverability check.', 1, false],
  ['avgSalary', 'Average salary', 'Compensation', 'Currency (SAR)', 'Market benchmark for this role and city — not the person’s actual pay.', 1, false],
  ['salaryBand', 'Salary band', 'Compensation', 'Single select', 'Benchmark band for the role level.', 0.5, false],
  ['website', 'Company website', 'Company', 'URL', 'Main company domain.', 0.5, true],
  ['revenue', 'Company revenue', 'Company', 'Currency (SAR)', 'Estimated annual revenue range.', 1, false],
  ['founded', 'Founded year', 'Company', 'Number', 'Year the company was established.', 0.5, false],
  ['hq', 'Headquarters', 'Company', 'Text', 'Head office city and country.', 0.5, false],
  ['crNumber', 'Commercial registration (CR)', 'Company', 'Text', 'Saudi CR number when publicly listed.', 1, false],
  ['tech', 'Technologies used', 'Company', 'Text', 'CRM, ERP and marketing tools detected.', 1, false],
  ['region', 'Region', 'Location', 'Single select', 'Central, Western, Eastern, Northern, Southern.', 0.5, false],
  ['timezone', 'Time zone', 'Location', 'Text', 'Used for quiet hours and send times.', 0, true],
  ['languages', 'Languages', 'Other', 'Text', 'Languages the person works in.', 0.5, false],
  ['education', 'Education', 'Other', 'Text', 'Highest degree and institution.', 0.5, false],
];
export const CATALOG = RAW.map(([key, label, group, type, desc, credits, on]) => ({ key, label, group, type, desc, credits, on, source: credits >= 1 ? 'Demo Enrichment A' : 'Demo Enrichment A / B' }));
export const GROUPS = ['Social profiles', 'Work & role', 'Compensation', 'Company', 'Location', 'Other', 'Custom fields'];

export function fieldState() {
  const s = store.s;
  const on = s.enrichFieldsOn || Object.fromEntries(CATALOG.map((f) => [f.key, f.on]));
  return { on, custom: s.enrichCustom || [] };
}

export function allFields() {
  const { on, custom } = fieldState();
  return [...CATALOG.map((f) => ({ ...f, enabled: !!on[f.key] })), ...custom.map((f) => ({ ...f, group: 'Custom fields', custom: true, enabled: f.enabled !== false }))];
}

export const enabledFields = () => allFields().filter((f) => f.enabled);
export const costPerLead = () => 1 + enabledFields().reduce((a, f) => a + (f.credits || 0), 0);

// Deterministic demo values so the same lead always shows the same result.
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const SENIOR = (t = '') => (/director|head|chief|coo|ceo|vp/i.test(t) ? 'Director' : /manager|lead/i.test(t) ? 'Manager' : 'Senior specialist');
const SALARY = { Director: 'SAR 38,000 / month', Manager: 'SAR 24,000 / month', 'Senior specialist': 'SAR 16,000 / month' };
const REGION = { Riyadh: 'Central', Jeddah: 'Western', Mecca: 'Western', Medina: 'Western', Dammam: 'Eastern', Khobar: 'Eastern' };

export function sampleValue(l, f) {
  if (l.enrich === 'nomatch') return null;
  const h = hash(l.id + f.key);
  // Partial matches find roughly half of the additional fields.
  if (l.enrich === 'partial' && h % 2) return null;
  const co = l.company || 'Company';
  const first = l.name.split(' ')[0].toLowerCase();
  switch (f.key) {
    case 'instagram': return h % 3 === 0 ? null : `instagram.com/${slug(co)}`;
    case 'twitter': return h % 2 ? null : `x.com/${first}_${slug(co).slice(0, 6)}`;
    case 'facebook': return `facebook.com/${slug(co)}`;
    case 'tiktok': return h % 4 ? null : `tiktok.com/@${slug(co)}`;
    case 'workEntity': return `${co} Co. Ltd.`;
    case 'workLocation': return `${co} office · ${l.city || 'Riyadh'}`;
    case 'department': return (/procure|purchas/i.test(l.title) && 'Procurement') || (/it |tech/i.test(`${l.title} `) && 'IT') || (/finance/i.test(l.title) && 'Finance') || 'Operations';
    case 'seniority': return SENIOR(l.title);
    case 'tenure': return `${2 + (h % 7)} years`;
    case 'workEmail': return `${first}@${slug(co)}.example`;
    case 'avgSalary': return `${SALARY[SENIOR(l.title)]} (benchmark)`;
    case 'salaryBand': return SENIOR(l.title) === 'Director' ? 'Band 5' : SENIOR(l.title) === 'Manager' ? 'Band 4' : 'Band 3';
    case 'website': return `${slug(co)}.example.sa`;
    case 'revenue': return ['SAR 10–50M', 'SAR 50–200M', 'SAR 200M+'][h % 3];
    case 'founded': return String(1985 + (h % 35));
    case 'hq': return `${l.city || 'Riyadh'}, Saudi Arabia`;
    case 'crNumber': return h % 2 ? null : `10${String(h).slice(0, 8)}`;
    case 'tech': return ['Salesforce, SAP', 'HubSpot, Odoo', 'Zoho CRM, Oracle'][h % 3];
    case 'region': return REGION[l.city] || 'Central';
    case 'timezone': return 'Asia/Riyadh (UTC+3)';
    case 'languages': return 'Arabic, English';
    case 'education': return ['BSc, King Saud University', 'MBA, KFUPM', 'BSc, King Abdulaziz University'][h % 3];
    default: // custom fields
      if (f.source === 'Manual entry') return null;
      return h % 3 === 0 ? null : f.type === 'Yes / No' ? (h % 2 ? 'Yes' : 'No') : f.type === 'Number' ? String(5 + (h % 195)) : f.type === 'URL' ? `${slug(co)}.example.sa/${slug(f.label)}` : 'Demo value';
  }
}
