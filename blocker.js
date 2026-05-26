const BLOCK_OVERLAY_ID = 'focusshield-block-overlay';
const FOCUS_KEY = 'focusShieldFocusEnabled';
const BLOCKLIST_KEY = 'focusShieldBlocklist';
const DEFAULT_BLOCKED_SITES = [
  'youtube.com',
  'facebook.com',
  'reddit.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'netflix.com'
];

function createOverlay() {
  if (document.getElementById(BLOCK_OVERLAY_ID)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = BLOCK_OVERLAY_ID;
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '2147483647';
  overlay.style.background = 'rgba(15, 23, 42, 0.96)';
  overlay.style.color = '#f8fafc';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '24px';
  overlay.style.textAlign = 'center';

  const message = document.createElement('div');
  message.innerHTML = `
    <div style="max-width: 560px;">
      <h1 style="margin:0 0 16px; font-size:2rem;">FocusShield AI</h1>
      <p style="margin:0 0 24px; line-height:1.6; font-size:1rem; color:#cbd5e1;">
        Focus mode is active. This site is temporarily blocked to keep you on task.
      </p>
      <p style="margin:0 0 24px; color:#94a3b8;">Return to your work and re-enable or disable focus mode in the extension popup.</p>
    </div>
  `;

  overlay.appendChild(message);
  document.documentElement.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';
}

function removeOverlay() {
  const existing = document.getElementById(BLOCK_OVERLAY_ID);
  if (existing) {
    existing.remove();
    document.documentElement.style.overflow = '';
  }
}

function shouldBlock(hostname, customSites) {
  const allSites = [...DEFAULT_BLOCKED_SITES, ...(customSites || [])];
  return allSites.some((site) => hostname === site || hostname.endsWith(`.${site}`));
}

function updateBlocking(enabled, customSites = []) {
  if (enabled && shouldBlock(location.hostname.toLowerCase(), customSites)) {
    createOverlay();
  } else {
    removeOverlay();
  }
}

chrome.storage.sync.get([FOCUS_KEY, BLOCKLIST_KEY], ({ [FOCUS_KEY]: enabled = false, [BLOCKLIST_KEY]: customSites = [] }) => {
  updateBlocking(enabled, customSites);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes[FOCUS_KEY] || changes[BLOCKLIST_KEY]) {
    chrome.storage.sync.get([FOCUS_KEY, BLOCKLIST_KEY], ({ [FOCUS_KEY]: enabled = false, [BLOCKLIST_KEY]: customSites = [] }) => {
      updateBlocking(enabled, customSites);
    });
  }
});
