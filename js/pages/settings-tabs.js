// Tab bar shared by the Settings pages (links, not buttons).
import { tabs } from '../ui.js';

const ITEMS = [
  ['#/demo/settings/general', 'General'],
  ['#/demo/settings/team', 'Team & Permissions'],
  ['#/demo/settings/fields-stages', 'Fields & Stages'],
  ['#/demo/settings/contact-policies', 'Contact Policies'],
  ['#/demo/settings/audit', 'Audit Log'],
  ['#/demo/settings/integrations', 'Integrations'],
];

export const settingsTabs = (active) => tabs(ITEMS, `#/demo/settings/${active}`);
