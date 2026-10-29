// Tab bars shared by the Settings pages (links, not buttons).
import { tabs } from '../ui.js';

const ITEMS = [
  ['#/demo/settings/general', 'General'],
  ['#/demo/settings/team', 'Team & Permissions'],
  ['#/demo/settings/fields-stages', 'Fields & Stages'],
  ['#/demo/settings/contact-policies', 'Contact Policies'],
  ['#/demo/settings/audit', 'Audit Log'],
  ['#/demo/settings/web-forms', 'Lead Settings'],
  ['#/demo/settings/integrations', 'Integrations'],
];

const LEAD_ITEMS = [
  ['web-forms', 'Web Forms'],
  ['duplicates', 'Duplicate Review'],
  ['ingestion', 'Ingestion Monitor'],
];

export const settingsTabs = (active) => tabs(ITEMS, `#/demo/settings/${active}`);

// Lead Settings: the Settings tab bar plus a second row for its three pages.
export const leadSettingsTabs = (active) => `${settingsTabs('web-forms')}
  <div class="seg mb16" role="tablist">${LEAD_ITEMS.map(([k, l]) => `<a class="${k === active ? 'active' : ''}" href="#/demo/settings/${k}">${l}</a>`).join('')}</div>`;

export const leadSettingsCrumbs = (name) => [['Settings', '#/demo/settings/general'], ['Lead Settings', '#/demo/settings/web-forms'], [name]];
