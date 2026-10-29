// Breadcrumbs and sub-tabs shared by the Lead Generation pages (Outreach, Upload List, From Social Media).

export const genCrumbs = (section, href, name) => [['Lead Generation', '#/demo/campaigns'], [section, name ? href : null], ...(name ? [[name]] : [])];

const OUTREACH = [['campaigns', 'Campaigns', '#/demo/campaigns'], ['templates', 'Template Library', '#/demo/campaigns/templates']];

export const outreachTabs = (active) => `<div class="seg mb16" role="tablist">${OUTREACH.map(([k, l, h]) => `<a class="${k === active ? 'active' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
