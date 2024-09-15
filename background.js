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

    let isNewSong = !knownSongs.has(message.songId);
    if (isNewSong) {
      console.log("New song added:", message.songId);
      knownSongs.add(message.songId);
      chrome.storage.local.set({ knownSongs: Array.from(knownSongs) });
    } 

    sendResponse({ shouldSkip: isEnabled && (!isNewSong || message.inPlaylist) });
  }
  return true;
});

chrome.storage.local.get(['isEnabled', 'knownSongs'], (result) => {
  isEnabled = result.isEnabled;
  knownSongs = new Set(result.knownSongs || []);
  console.log("Initial state loaded:", { isEnabled, knownSongsCount: knownSongs.size });
});
