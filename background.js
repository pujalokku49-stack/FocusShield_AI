chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ focusShieldFocusEnabled: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'focus-mode-changed') {
    const enabled = message.enabled;
    if (enabled) {
      console.log('FocusShield AI: Focus mode enabled');
    } else {
      console.log('FocusShield AI: Focus mode disabled');
    }
  }
});
