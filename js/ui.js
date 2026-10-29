// Shared UI helpers. Pages build HTML strings with these and wire events with `on()`.

const P = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  userPlus: '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  bars: '<path d="M6 20v-6M12 20V10M18 20V4"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  flow: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-6 5M12 11.5l6 5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevRight: '<path d="m9 6 6 6-6 6"/>',
  chevLeft: '<path d="m15 6-6 6 6 6"/>',
  chevUp: '<path d="m18 15-6-6-6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m7.5 12.5 3 3 6-6" stroke="#fff" stroke-width="2.4"/>',
  minusCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  dashedCircle: '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
  halfCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calendarCheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  fileUp: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  play: '<path d="m6 4 14 8-14 8z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  pauseCircle: '<circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  bookmark: '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  grip: '<circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  message: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>',
  reply: '<path d="M9 17 4 12l5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  checkSquare: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 11 3 3 8-8"/>',
  dropdown: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 9h10M7 13h6M7 17h4"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  rotate: '<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  skip: '<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>',
  merge: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="12" r="3"/><path d="M6 9v6M8.5 7.5 15.5 11"/>',
  split: '<path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M12 22v-8"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
};

// Official brand marks (Simple Icons, CC0) in each brand's own colors. Used for sources, channels and integrations.
const BRAND = {
  meta: '<path fill="#0081FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/>',
  google: '<path fill="#34A853" d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998z"/>'
    + '<path fill="#4285F4" d="M23.4641 16.9287L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z"/>'
    + '<path fill="#FBBC04" d="M7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/>',
  whatsapp: '<path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
  linkedin: '<path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
};

export function icon(name, size = 18, cls = '') {
  if (BRAND[name]) return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${BRAND[name]}</svg>`;
  const body = P[name] || P.circle;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export function avatar(nameOrInitials, size = '', cls = '') {
  const t = nameOrInitials && nameOrInitials.length <= 3 && nameOrInitials === nameOrInitials.toUpperCase() ? nameOrInitials : initials(nameOrInitials);
  return `<span class="avatar ${size} ${cls}">${esc(t)}</span>`;
}

export function owner(name, size = 'sm') {
  return `<span class="owner">${avatar(name, size, 'gray')}<span>${esc(name)}</span></span>`;
}

export function badge(text, tone = '', extra = '') {
  return `<span class="badge ${tone} ${extra}">${esc(text)}</span>`;
}

// Tone for common status words, so every page colors them the same way.
const TONES = {
  qualified: '', complete: '', completed: '', published: '', active: '', connected: '', running: '', eligible: '', success: '', processed: '', ready: '', approved: '', enabled: '',
  partial: '', contacting: '', engaged: '', 'follow-up': '', new: '', converted: '', scheduled: '', 'to do': '', waiting: '', assisted: '',
  'not qualified': 'gray', disqualified: 'gray', closed: 'gray', draft: 'gray', paused: 'gray', 'no match': 'gray', 'no external match': 'gray', excluded: 'gray', failed: 'gray', blocked: 'gray', 'not connected': 'gray', inactive: 'gray', done: 'gray',
  pending: '', 'needs information': '', 'needs review': 'gray', 'needs attention': '', 'needs authorization': 'gray', overdue: '',
};
export function statusBadge(text, opts = {}) {
  const tone = opts.tone ?? TONES[String(text).toLowerCase()] ?? '';
  const dot = opts.dot ? '<span class="bdot"></span>' : '';
  return `<span class="badge ${tone} ${opts.pill ? 'pill' : ''}">${dot}${esc(text)}</span>`;
}

export function dots(found, total = 6, cls = '') {
  let s = '';
  for (let i = 0; i < total; i++) s += `<i class="${i < found ? 'on' : ''}"></i>`;
  return `<span class="dots ${cls}" aria-label="${found} of ${total} fields">${s}</span>`;
}

export function bar(pct, cls = '') {
  return `<div class="bar ${cls}"><span style="width:${Math.max(0, Math.min(100, pct))}%"></span></div>`;
}

// Small pie used for enrichment coverage (full, half, empty).
export function ring(pct, size = 22) {
  const bg = pct >= 100 ? 'var(--blue-600)' : pct <= 0 ? 'transparent' : `conic-gradient(var(--blue-600) 0 ${pct}%, transparent ${pct}% 100%)`;
  return `<span class="ring" style="width:${size}px;height:${size}px;background:${bg};box-shadow:inset 0 0 0 2px ${pct > 0 ? 'var(--blue-600)' : 'var(--ink-200)'}"></span>`;
}

export function stat({ icon: ic, label, value, meta = '', action = '', cls = '' }) {
  return `<div class="card stat ${action ? 'clickable' : ''} ${cls}" ${action ? `data-action="${action}" role="button" tabindex="0"` : ''}>
    <div class="ico">${icon(ic, 24)}</div>
    <div class="grow"><div class="label">${label}</div><div class="value num">${value}</div>${meta ? `<div class="meta">${meta}</div>` : ''}</div>
  </div>`;
}

export function pageHead({ title, sub = '', actions = '', crumbs = null, badges = '' }) {
  const bc = crumbs ? `<nav class="breadcrumb">${crumbs.map(([t, h], i) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`) + (i < crumbs.length - 1 ? '<span>/</span>' : '')).join('')}</nav>` : '';
  return `<div class="page-head"><div class="titles">${bc}<div class="title-row"><h1>${esc(title)}</h1>${badges}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
}

export function tabs(items, active, action = 'tab') {
  return `<div class="tabs" role="tablist">${items.map((it) => {
    const [key, label, count] = Array.isArray(it) ? it : [it, it];
    const href = typeof key === 'string' && key.startsWith('#') ? key : '';
    const inner = `${esc(label)}${count != null ? ` <span class="count">${count}</span>` : ''}`;
    return href
      ? `<a class="tab ${active === key ? 'active' : ''}" href="${href}">${inner}</a>`
      : `<button class="tab ${active === key ? 'active' : ''}" role="tab" data-action="${action}" data-key="${esc(key)}">${inner}</button>`;
  }).join('')}</div>`;
}

export function select(options, value, attrs = '', cls = '') {
  return `<select class="select ${cls}" ${attrs}>${options.map((o) => {
    const [v, l] = Array.isArray(o) ? o : [o, o];
    return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`;
  }).join('')}</select>`;
}

export function toggle(checked, attrs = '') {
  return `<label class="toggle"><input type="checkbox" ${checked ? 'checked' : ''} ${attrs}><span></span></label>`;
}

export function searchInput(placeholder, value = '', attrs = '') {
  return `<div class="search-input">${icon('search', 17)}<input class="input" type="search" placeholder="${esc(placeholder)}" value="${esc(value)}" ${attrs}></div>`;
}

export function pager(page, pages, action = 'page') {
  if (pages <= 1) return `<div class="pager"><button class="active">1</button></div>`;
  let b = `<button data-action="${action}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous">${icon('chevLeft', 16)}</button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i > 5 && i < pages) { if (i === 6) b += '<span class="muted">…</span>'; continue; }
    b += `<button data-action="${action}" data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`;
  }
  b += `<button data-action="${action}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next">${icon('chevRight', 16)}</button>`;
  return `<div class="pager">${b}</div>`;
}

export function sourceIcon(source, size = 18) {
  const s = String(source).toLowerCase();
  if (s.includes('meta')) return icon('meta', size);
  if (s.includes('google')) return icon('google', size);
  if (s.includes('linkedin')) return icon('linkedin', size);
  if (s.includes('whatsapp')) return icon('whatsapp', size);
  if (s.includes('email')) return `<span style="color:var(--blue-600)">${icon('mail', size)}</span>`;
  if (s.includes('csv')) return `<span style="color:var(--ink-600)">${icon('file', size)}</span>`;
  return `<span style="color:var(--ink-600)">${icon('file', size)}</span>`;
}
export function source(name) { return `<span class="owner">${sourceIcon(name)}<span>${esc(name)}</span></span>`; }

export function channelIcon(ch, size = 18) {
  const c = String(ch).toLowerCase();
  if (c.includes('whatsapp')) return icon('whatsapp', size);
  if (c.includes('linkedin')) return icon('linkedin', size);
  if (c.includes('task')) return icon('file', size);
  return icon('mail', size);
}

// ---------- Event wiring ----------
// Delegates clicks on [data-action] and change/input on [data-change]/[data-input] to handler maps.
export function on(root, { click = {}, change = {}, input = {}, submit = {} } = {}) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || !root.contains(el)) return;
    const fn = click[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Native buttons, links and fields handle their own keys.
    if (e.target.closest('button, a, input, select, textarea') !== e.target.closest('[data-action][role="button"]')) return;
    const el = e.target.closest('[data-action][role="button"]');
    if (el && click[el.dataset.action]) { e.preventDefault(); click[el.dataset.action](el, e); }
  });
  root.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && change[el.dataset.change]) change[el.dataset.change](el, e);
  });
  root.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && input[el.dataset.input]) input[el.dataset.input](el, e);
  });
  root.addEventListener('submit', (e) => {
    const el = e.target.closest('[data-submit]');
    if (el && submit[el.dataset.submit]) { e.preventDefault(); submit[el.dataset.submit](el, e); }
  });
}

// Keeps focus and caret in a search box across a re-render.
// Called as keepFocus(selector, fn) or keepFocus(root, selector, fn). The page root is replaced on
// every render, so the element is always looked up in the live document.
export function keepFocus(...args) {
  const [selector, fn] = typeof args[0] === 'string' ? args : args.slice(1);
  const el = document.querySelector(selector);
  const pos = el && document.activeElement === el ? el.selectionStart : null;
  fn();
  if (pos == null) return;
  const n = document.querySelector(selector);
  if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (_) { /* type=search */ } }
}

// ---------- Toast / modal ----------
export function toast(msg, detail = 'Demo simulation — nothing was sent or saved externally.') {
  let host = document.querySelector('.toasts');
  if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('role', 'status'); document.body.appendChild(host); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon('info', 18)}<div>${esc(msg)}${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
  host.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
}

// Opens a modal. `body` is HTML; buttons: [{label, cls, value}]. Resolves with {value, form} where form is FormData-like object.
export function modal({ title, body, buttons = [{ label: 'Close', value: null }], wide = false, onMount }) {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${icon('x', 18)}</button></div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div>
    </div>`;
    const close = (value) => {
      const form = {};
      ov.querySelectorAll('[name]').forEach((el) => { form[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
      ov.remove(); document.removeEventListener('keydown', esc_);
      resolve({ value, form });
    };
    const esc_ = (e) => { if (e.key === 'Escape') close(null); };
    ov.addEventListener('click', (e) => {
      if (e.target === ov || e.target.closest('[data-close]')) return close(null);
      const b = e.target.closest('[data-i]');
      if (b) close(buttons[+b.dataset.i].value);
    });
    document.addEventListener('keydown', esc_);
    document.body.appendChild(ov);
    if (onMount) onMount(ov);
    const first = ov.querySelector('input, select, textarea');
    (first || ov.querySelector('.modal-foot .btn:last-child'))?.focus();
  });
}

export const confirm = (title, text, okLabel = 'Confirm') =>
  modal({ title, body: `<p class="muted">${text}</p>`, buttons: [{ label: 'Cancel', value: false }, { label: okLabel, cls: 'primary', value: true }] }).then((r) => r.value === true);

export function emptyState(text, ic = 'search') {
  return `<div class="empty">${icon(ic, 32)}<div>${esc(text)}</div></div>`;
}

// Lead conversion funnel (Dashboard, Funnel & Acquisition). steps: [{label, value, href?}]
export function funnel(steps) {
  const W = 640, rowH = 54, gap = 8, top = 0;
  const fills = ['#1d5fe9', '#6f9bf5', '#a9c4fa', '#d3e1fd'];
  const textFill = ['#fff', '#0d1733', '#0d1733', '#0d1733'];
  const max = steps[0].value;
  const widths = steps.map((s, i) => 440 - i * 80);
  let svg = '';
  steps.forEach((s, i) => {
    const y = top + i * (rowH + gap);
    const w1 = widths[i], w2 = i < steps.length - 1 ? widths[i + 1] : widths[i] - 80;
    const cx = 330;
    const pts = `${cx - w1 / 2},${y} ${cx + w1 / 2},${y} ${cx + w2 / 2},${y + rowH} ${cx - w2 / 2},${y + rowH}`;
    const link = s.href ? `<a href="${s.href}" aria-label="${esc(s.label)} ${s.value}">` : '';
    svg += `${link}<g class="fn-step"><polygon points="${pts}" fill="${fills[i] || fills[3]}"/><text x="${cx}" y="${y + rowH / 2 + 6}" text-anchor="middle" font-size="17" font-weight="600" fill="${textFill[i] || '#0d1733'}">${fmt(s.value)}</text></g>${link ? '</a>' : ''}`;
    svg += `<text x="20" y="${y + rowH / 2 + 5}" font-size="13.5" fill="#33405f">${esc(s.label)}</text>`;
    if (i > 0) {
      const rate = ((s.value / steps[i - 1].value) * 100).toFixed(s.value / steps[i - 1].value < .3 ? 1 : 0);
      svg += `<path d="M ${cx + widths[i - 1] / 2 + 14} ${y - rowH / 2 + 2} q 10 ${rowH / 2} -2 ${rowH / 2 + 10}" fill="none" stroke="#8f99b2" stroke-width="1.4" marker-end="url(#fn-arrow)"/>`;
      svg += `<text x="${cx + widths[i - 1] / 2 + 34}" y="${y + 6}" font-size="14" fill="#33405f">${rate}%</text>`;
    }
  });
  const H = steps.length * (rowH + gap);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block" role="img" aria-label="Funnel ${steps.map((s) => `${s.label} ${s.value}`).join(', ')}">
    <defs><marker id="fn-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#8f99b2"/></marker></defs>${svg}</svg>`;
}

export const pct = (a, b, d = 0) => (b ? ((a / b) * 100).toFixed(d) : '0');
export const fmt = (n) => Number(n).toLocaleString('en-US');
