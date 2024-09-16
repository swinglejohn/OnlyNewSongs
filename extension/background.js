let isEnabled = false;
let knownSongs = new Set();
let lastCheckedSong = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: false, knownSongs: [] });
  console.log("Extension installed, initial state set");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE') {
    isEnabled = message.value;
    chrome.storage.local.set({ isEnabled });
    console.log("Extension toggled:", isEnabled);
  } else if (message.type === 'CHECK_SONG') {
    let isNewSong = !knownSongs.has(message.songId);
    if (isNewSong) {
      console.log("New song added:", message.songId);
      knownSongs.add(message.songId);
      chrome.storage.local.set({ knownSongs: Array.from(knownSongs) });
    }

    // We want to only skip a song if the extension is enabled.
    // Since we check the song every second, we don't skip if it's the same song we just added to the list.
    // This also means if someone just liked a song (added it to a playlist), we don't skip it.
    let shouldSkip = isEnabled && message.songId !== lastCheckedSong && (message.inPlaylist || !isNewSong);
    
    if (shouldSkip) {
      console.log(
        "Skipping song:",
        message.songId,
        "\nIs new song:",
        isNewSong,
        "\nKnown songs:",
        knownSongs.size,
        "\nIs in playlist:",
        message.inPlaylist,
        "\nLast checked song:",
        lastCheckedSong,
      );
    }

    sendResponse({ shouldSkip: shouldSkip });
    lastCheckedSong = message.songId;
  }
  return true;
});

chrome.storage.local.get(['isEnabled', 'knownSongs'], (result) => {
  isEnabled = result.isEnabled;
  knownSongs = new Set(result.knownSongs || []);
  console.log("Initial state loaded:", { isEnabled, knownSongsCount: knownSongs.size });
});
