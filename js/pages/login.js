// 01 · Login — Username / Password / Sign In plus Open Demo (no credentials, no account).
import { icon, on, modal } from '../ui.js';

export default {
  title: 'Sign in',
  render: () => `
  <div class="auth-page">
    <div class="blob" style="width:520px;height:520px;left:-260px;top:-300px"></div>
    <div class="blob" style="width:420px;height:420px;right:-160px;bottom:-220px"></div>
    <div class="auth-card">
      <div class="auth-logo"><img src="assets/logo.png" alt="Leadviron"></div>
      <div class="card" style="padding:32px;box-shadow:var(--shadow)">
        <div style="text-align:center;margin-bottom:22px">
          <h1 style="font-size:28px">Welcome back</h1>
          <p class="muted mt8" style="font-size:15px">Sign in to Leadviron</p>
        </div>
        <form class="stack" data-submit="signin" novalidate>
          <div class="field"><label for="u">Username</label><input class="input lg" id="u" name="username" autocomplete="off" placeholder="Your username" style="height:46px"></div>
          <div class="field"><label for="p">Password</label>
            <div class="rel"><input class="input" id="p" name="password" type="password" autocomplete="off" placeholder="••••••••" style="height:46px;padding-right:44px">
              <button type="button" class="icon-btn" data-action="peek" aria-label="Show password" style="position:absolute;right:5px;top:5px">${icon('eye', 18)}</button></div>
          </div>
          <div id="signin-msg" class="callout hidden">${icon('info', 18)}<span>Account sign-in will be available in the operational release. Use <b>Open Demo</b> to explore the platform now.</span></div>
          <button class="btn primary lg block" type="submit">Sign In</button>
          <div class="row" style="gap:12px;color:var(--ink-400)"><div class="grow divider" style="margin:0"></div><span class="small">or</span><div class="grow divider" style="margin:0"></div></div>
          <a class="btn outline lg block" href="#/demo/dashboard" style="text-decoration:none">${icon('play', 16)} Open Demo</a>
          <p class="muted small" style="text-align:center">No sign-in needed. The demo uses sample data and does not create an account.</p>
        </form>
        <div style="text-align:center;margin-top:16px"><button class="link-btn" data-action="forgot">Forgot your password?</button></div>
      </div>
      <p class="muted small" style="text-align:center;margin-top:18px">Powered by <b style="color:var(--ink-600)">Upshifters</b></p>
    </div>
  </div>`,
  mount(root) {
    on(root, {
      click: {
        peek: (b) => { const p = root.querySelector('#p'); const show = p.type === 'password'; p.type = show ? 'text' : 'password'; b.innerHTML = icon(show ? 'eyeOff' : 'eye', 18); },
        forgot: () => modal({ title: 'Recover access', body: '<p class="muted">Password recovery will be available once accounts are enabled in the operational release. In the meantime, open the demo from the sign-in page.</p>', buttons: [{ label: 'Got it', cls: 'primary', value: true }] }),
      },
      submit: { signin: () => root.querySelector('#signin-msg').classList.remove('hidden') },
    });
  },
};
