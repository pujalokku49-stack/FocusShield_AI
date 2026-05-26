const toggleButton = document.getElementById('toggleFocus');
const statusText = document.getElementById('statusText');
const noteInput = document.getElementById('noteInput');
const saveNoteButton = document.getElementById('saveNote');
const siteInput = document.getElementById('siteInput');
const addSiteButton = document.getElementById('addSite');
const resetBlocklistButton = document.getElementById('resetBlocklist');
const blocklistItems = document.getElementById('blocklistItems');

const STORAGE_KEYS = {
  focusEnabled: 'focusShieldFocusEnabled',
  note: 'focusShieldNote',
  blocklist: 'focusShieldBlocklist'
};

function normalizeSite(site) {
  return site
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[\/\?#]/)[0]
    .toLowerCase();
}

function renderBlocklist(sites) {
  blocklistItems.innerHTML = '';

  if (sites.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No custom sites added yet.';
    emptyItem.style.opacity = '0.75';
    emptyItem.style.justifyContent = 'center';
    blocklistItems.appendChild(emptyItem);
    return;
  }

  sites.forEach((site) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = site;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeSite(site));
    item.appendChild(label);
    item.appendChild(removeButton);
    blocklistItems.appendChild(item);
  });
}

async function loadState() {
  const result = await chrome.storage.sync.get([
    STORAGE_KEYS.focusEnabled,
    STORAGE_KEYS.note,
    STORAGE_KEYS.blocklist
  ]);

  const enabled = result[STORAGE_KEYS.focusEnabled] ?? false;
  const note = result[STORAGE_KEYS.note] ?? '';
  const blocklist = result[STORAGE_KEYS.blocklist] ?? [];

  statusText.textContent = enabled ? 'Active' : 'Inactive';
  toggleButton.textContent = enabled ? 'Disable Focus Mode' : 'Enable Focus Mode';
  noteInput.value = note;
  renderBlocklist(blocklist);
}

async function toggleFocusMode() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.focusEnabled);
  const enabled = result[STORAGE_KEYS.focusEnabled] ?? false;
  const nextState = !enabled;

  await chrome.storage.sync.set({ [STORAGE_KEYS.focusEnabled]: nextState });
  await chrome.runtime.sendMessage({ type: 'focus-mode-changed', enabled: nextState });
  loadState();
}

async function saveNote() {
  await chrome.storage.sync.set({ [STORAGE_KEYS.note]: noteInput.value });
  saveNoteButton.textContent = 'Saved!';
  setTimeout(() => {
    saveNoteButton.textContent = 'Save Note';
  }, 1200);
}

async function addSite() {
  const normalized = normalizeSite(siteInput.value);
  if (!normalized) {
    siteInput.value = '';
    return;
  }

  const result = await chrome.storage.sync.get(STORAGE_KEYS.blocklist);
  const currentList = result[STORAGE_KEYS.blocklist] ?? [];

  if (!currentList.includes(normalized)) {
    const nextList = [...currentList, normalized];
    await chrome.storage.sync.set({ [STORAGE_KEYS.blocklist]: nextList });
    renderBlocklist(nextList);
  }

  siteInput.value = '';
}

async function resetBlocklist() {
  await chrome.storage.sync.set({ [STORAGE_KEYS.blocklist]: [] });
  renderBlocklist([]);
}

async function removeSite(site) {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.blocklist);
  const currentList = result[STORAGE_KEYS.blocklist] ?? [];
  const updatedList = currentList.filter((item) => item !== site);

  await chrome.storage.sync.set({ [STORAGE_KEYS.blocklist]: updatedList });
  renderBlocklist(updatedList);
}

toggleButton.addEventListener('click', toggleFocusMode);
saveNoteButton.addEventListener('click', saveNote);
addSiteButton.addEventListener('click', addSite);
resetBlocklistButton.addEventListener('click', resetBlocklist);
siteInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSite();
  }
});

loadState();
