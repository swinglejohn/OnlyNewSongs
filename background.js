let isEnabled = false;
let knownSongs = new Set();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: false, knownSongs: [] });
  console.log("Extension installed, initial state set");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'TOGGLE') {
    isEnabled = message.value;
    chrome.storage.local.set({ isEnabled });
    console.log("Extension toggled:", isEnabled);
  } else if (message.type === 'CHECK_SONG') {
    console.log("Checking song:", message.songId, "Known songs:", knownSongs.size);
    if (!isEnabled && !knownSongs.has(message.songId)) {
      knownSongs.add(message.songId);
      chrome.storage.local.set({ knownSongs: Array.from(knownSongs) });
      console.log("New song added, shouldn't skip");
      sendResponse({ shouldSkip: false });
    } else {
      console.log("Song known, should skip:", isEnabled);
      sendResponse({ shouldSkip: isEnabled });
    }
  }
  return true;
});

chrome.storage.local.get(['isEnabled', 'knownSongs'], (result) => {
  isEnabled = result.isEnabled;
  knownSongs = new Set(result.knownSongs || []);
  console.log("Initial state loaded:", { isEnabled, knownSongsCount: knownSongs.size });
});

function injectContentScript(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'cleanup' }, () => {
    if (chrome.runtime.lastError) {
      // Content script not ready, proceed with injection
      console.log('Content script not ready, injecting...');
    }
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }, () => {
      // Wait a short time to ensure content script is loaded
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'start' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error starting content script:', chrome.runtime.lastError);
          }
        });
      }, 100);
    });
  });
}

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.startsWith('https://open.spotify.com/')) {
    injectContentScript(details.tabId);
  }
});

// Also keep the existing tabs.onUpdated listener for initial page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.startsWith('https://open.spotify.com/')) {
    injectContentScript(tabId);
  }
});