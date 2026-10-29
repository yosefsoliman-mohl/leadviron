// 22 · Run Details — one run's step sequence, branch reasons, failure and recovery.
import { icon, esc, statusBadge, dots, on, toast, confirm } from '../ui.js';
import { store, leadById, enrichPct, fieldValue, ENRICH_FIELDS, FIELD_LABELS } from '../store.js';

const ui = { open: true };

// Builds the timeline from the run and lead. Times are offsets from the run start.
function steps(r, l) {
  const t0 = (r.started.match(/(\d+):(\d+)/) || [0, 10, 0]).slice(1).map(Number);
  const at = (sec) => { const s = t0[0] * 3600 + t0[1] * 60 + sec; return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const out = [['done', at(0), 'Enrichment completed', `${l.found} of 6 fields found.`, 'Completed']];
  const branch = l.enrich === 'complete' ? 'Complete' : l.enrich === 'partial' ? 'Partial' : 'No match';
  out.push(['done', at(1), 'Evaluate coverage', `${branch} branch selected.`, 'Completed']);
  if (l.enrich !== 'complete') {
    out.push(['done', at(2), l.enrich === 'partial' ? 'Create review task' : 'Create research task', l.enrich === 'partial' ? 'Missing fields review assigned to owner.' : 'Original form data kept; research assigned to owner.', 'Completed', r.taskId]);
    return out;
  }
  out.push(['done', at(2), 'Qualification and email eligibility', 'Checks passed.', 'Completed']);
  if (r.state === 'Needs attention') {
    out.push(['fail', at(5), 'Send introduction email', 'Provider request rejected.', 'Failed', null, true]);
    out.push(['wait', at(65), 'Retry attempt 2', 'Provider unavailable; run paused.', 'Paused']);
  } else {
    out.push(['done', at(5), 'Send introduction email', r.retried ? 'Accepted by provider on attempt 3 (simulated).' : 'Accepted by provider.', 'Completed']);
    out.push(['wait', at(6), 'Wait for reply', `Up to 2 days · next check ${r.next}`, 'Waiting']);
  }
  return out;
}

export default {
  title: 'Run Details',
  render(ctx) {
    const s = store.s;
    const r = s.runs.find((x) => x.id === ctx.params.runId);
    if (!r) return `<div class="card card-pad">Run not found. <a href="#/demo/workflows/history">Back to Execution History</a></div>`;
    const l = leadById(r.leadId);
    const wf = s.workflows.find((w) => w.id === r.workflow);
    const failed = r.state === 'Needs attention';
    const conv = s.conversations.find((c) => c.leadId === l.id);
    const ic = { done: icon('check', 16), fail: icon('alert', 15), wait: icon('clock', 16) };
    return `
    <nav class="breadcrumb"><a href="#/demo/workflows">Workflows</a><span>/</span><a href="#/demo/workflows/history?run=${r.id}">Execution History</a><span>/</span><span>${r.id}</span></nav>
    <div class="page-head"><div class="titles"><div class="title-row"><h1>Run Details</h1>${statusBadge(r.state, { pill: true })}</div>
      <div class="row wrap mt8 small" style="color:var(--ink-600);gap:12px"><a href="#/demo/leads/${l.id}" style="color:inherit;font-size:15px">${esc(l.name)} · ${esc(l.company || 'Company unknown')}</a><span class="vdivider"></span><a href="#/demo/workflows/${wf.id}/builder" style="color:inherit">${esc(wf.name)}</a><span class="vdivider"></span>${esc(r.version)}<span class="vdivider"></span>Started ${esc(r.started)}</div></div>
      <div class="actions"><a class="btn" href="#/demo/leads/${l.id}">${icon('external', 16)} Open lead</a><a class="btn primary" href="#/demo/workflows/${wf.id}/builder">${icon('flow', 16)} View workflow</a></div></div>
    <div class="grid g2" style="align-items:start">
      <div class="card card-pad"><h2>Execution timeline</h2><p class="muted small">Steps executed for this run, in order.</p>
        <div class="mt8">${steps(r, l).map(([kind, t, title, sub, st, taskId, expandable]) => `<div class="run-step">
          <span class="ic ${kind === 'fail' ? 'fail' : kind === 'wait' ? 'wait' : ''}">${ic[kind]}</span>
          <div class="grow"><div class="row"><span class="muted small num" style="width:70px">${t}</span><span class="strong grow">${esc(title)}</span>${statusBadge(st, { tone: st === 'Paused' ? 'gray' : '' })}${expandable ? `<button class="icon-btn" data-action="toggle" aria-label="Toggle details">${icon(ui.open ? 'chevUp' : 'chevDown', 16)}</button>` : ''}</div>
            <div class="muted small" style="margin-left:70px">${esc(sub)}${taskId ? ` <a href="#/demo/sales/tasks?task=${taskId}">View task</a>` : ''}</div>
            ${expandable && ui.open ? `<div class="callout mt12" style="display:block;margin-left:0"><div class="row between"><div><div class="strong">Email connector unavailable</div><div class="muted small">No message accepted by provider.</div></div><div class="strong">${(r.attempts || 2)} attempts</div></div>
              <div class="card mt12" style="padding:10px 12px;font-size:13px">${[['Attempt 1', '10:46:05'], ['Attempt 2', '10:47:05'], ...(r.attempts > 2 ? [['Attempt 3', 'Just now']] : [])].map(([a, tm]) => `<div class="row" style="padding:3px 0"><b style="width:80px">${a}</b><span class="num" style="width:70px">${tm}</span><span class="muted">Provider unavailable (request rejected)</span></div>`).join('')}</div></div>` : ''}
          </div></div>`).join('')}</div>
      </div>
      <div class="stack">
        <div class="card card-pad"><div class="row between"><div><h2>Input snapshot</h2><p class="muted small">Lead and enrichment data used for this run.</p></div><a class="small" href="#/demo/leads/${l.id}">Open lead ${icon('external', 13)}</a></div>
          <div class="grid g2 mt12" style="gap:20px">
            <div class="kv" style="grid-template-columns:100px 1fr;font-size:13px;gap:7px"><span class="k">Name</span><span class="v">${esc(l.name)}</span>${ENRICH_FIELDS.map((f) => `<span class="k">${FIELD_LABELS[f].replace(' URL', ' profile')}</span><span class="v">${f === 'linkedin' ? (l.linkedin ? 'Available' : '<span class="muted">Not found</span>') : esc(fieldValue(l, f) || '') || '<span class="muted">Not found</span>'}</span>`).join('')}</div>
            <div class="kv" style="grid-template-columns:100px 1fr;font-size:13px;gap:7px"><span class="k">Coverage</span><span class="v">${enrichPct(l)}% · ${l.found}/6 ${dots(l.found)}</span><span class="k">Qualification</span><span class="v">${statusBadge(l.qual)}</span><span class="k">Score</span><span class="v">${l.score ?? '—'}</span>
              <span class="k" style="margin-top:8px">Original source</span><span class="v" style="margin-top:8px">${esc(l.source)}</span><span class="k">Email</span><span class="v" style="word-break:break-all">${esc(l.email)}</span><span class="k">Phone</span><span class="v">${esc(l.phone)}</span></div>
          </div>
          ${conv ? `<a class="btn sm mt12" href="#/demo/conversations?c=${conv.id}">${icon('message', 15)} Open conversation</a>` : ''}</div>
        ${failed ? `<div class="card card-pad"><h2>Failed step details</h2>
          <div class="row mt12"><span class="ico-circle lg">${icon('mail', 22)}</span><div class="grow"><div class="strong">Email connector unavailable</div><div class="muted small">No message accepted by provider.</div></div><span class="vdivider"></span><b>${r.attempts || 2} attempts</b></div>
          <div class="callout mt12" style="background:var(--ink-50);display:block">The email provider rejected the request. The connector is currently unavailable.<br>This is a known provider rejection, not a delivery timeout.</div></div>
        <div class="card card-pad"><div class="row between"><div><h2>Recovery</h2><p class="muted small">Retry the failed step or review your email connection settings.</p></div><span class="muted small row">${icon('clock', 15)} Waiting for review</span></div>
          <div class="row wrap mt12"><button class="btn primary" data-action="retry">${icon('play', 15)} Retry failed step</button><a class="btn outline" href="#/demo/settings/integrations/email">${icon('settings', 15)} Review connection</a><span class="muted tiny" style="margin-left:auto">Completed steps will not repeat.</span></div></div>`
        : `<div class="card card-pad"><h2>Outcome</h2><p class="mt8">${r.state === 'Completed' ? `Run completed at <b>${esc(r.step)}</b>.` : `Run is waiting at <b>${esc(r.step)}</b>. Next check ${esc(r.next)}.`}</p>
          ${l.enrich === 'nomatch' ? `<p class="muted small mt8">${icon('info', 13)} No external match is an enrichment outcome, not an execution error.</p>` : ''}
          ${r.retried ? `<p class="muted small mt8">Recovered after a simulated retry. No email was actually sent.</p>` : ''}</div>`}
      </div>
    </div>`;
  },
  mount(root, ctx) {
    const id = ctx.params.runId;
    on(root, {
      click: {
        toggle: () => { ui.open = !ui.open; ctx.rerender(); },
        retry: () => {
          confirm('Retry failed step?', 'Retries only “Send introduction email”. Completed steps will not repeat. In the demo, attempt 3 is simulated as accepted.', 'Retry step').then((ok) => {
            if (!ok) return;
            store.update((s) => Object.assign(s.runs.find((x) => x.id === id), { attempts: 3, state: 'Waiting', step: 'Wait for reply', next: 'Oct 31, 2026 10:46 AM', retried: true }));
            toast('Attempt 3 accepted — run resumed', 'Demo simulation — no email was actually sent.');
            ctx.rerender();
          });
        },
      },
    });
  },
};
