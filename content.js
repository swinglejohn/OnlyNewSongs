function getCurrentSongId() {
  const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
  return nowPlayingWidget ? nowPlayingWidget.getAttribute('aria-label') : null;
}

function skipSong() {
  const nextButton = document.querySelector('[data-testid="control-button-skip-forward"]');
  if (nextButton) nextButton.click();
}

let lastCheckedSong = null;

setInterval(() => {
  const currentSongId = getCurrentSongId();
  if (currentSongId && lastCheckedSong && currentSongId !== lastCheckedSong) {
    lastCheckedSong = currentSongId;
    chrome.runtime.sendMessage({ type: 'CHECK_SONG', songId: currentSongId }, (response) => {
      if (response.shouldSkip) {
        skipSong();
      }
    });
  }
}, 1000);