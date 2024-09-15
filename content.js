(function () {
  console.log('Content script injected');

  let lastCheckedSong = null;
  let intervalId;
  let lastUrl = location.href;

  function getCurrentSongId() {
    const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
    return nowPlayingWidget ? nowPlayingWidget.getAttribute('aria-label') : null;
  }

  function isInPlaylist() {
    const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
    if (!nowPlayingWidget) {
      console.error('Could not find nowPlayingWidget:', nowPlayingWidget);
      return false;
    }

    // get the button inside the nowPlayingWidget that has an aria-checked attribute
    const addButton = nowPlayingWidget.querySelector('[aria-checked]');
    if (!addButton) {
      console.error('Could not find addButton:', addButton);
      return false;
    }

    isChecked = addButton.getAttribute('aria-checked') === 'true'; // it's a string, sadly
    return isChecked;
  }

  function skipSong() {
    const nextButton = document.querySelector('[data-testid="control-button-skip-forward"]');
    if (nextButton) nextButton.click();
  }

  function startMonitoring() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    console.log('Monitoring started');
    intervalId = setInterval(() => {
      const inPlaylist = isInPlaylist();
      const currentSongId = getCurrentSongId();

      console.log('In content interval with song: ' + currentSongId + ' in playlist: ' + inPlaylist, "lastCheckedSong:", lastCheckedSong);
      // check lastCheckedSong isn't null because we don't want to always skip the first song
      if (currentSongId && lastCheckedSong && currentSongId !== lastCheckedSong) {
        lastCheckedSong = currentSongId;
        chrome.runtime.sendMessage({
          type: 'CHECK_SONG',
          songId: currentSongId,
          inPlaylist: inPlaylist,
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error checking song:', chrome.runtime.lastError);
          } else if (response && response.shouldSkip) {
            skipSong();
          }
        });
      }
      lastCheckedSong = currentSongId;
    }, 1000);
  }

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('URL changed to', lastUrl);
      startMonitoring();
    }
  }

  // Check for URL changes every second
  setInterval(checkUrlChange, 1000);

  // Initial start
  startMonitoring();
})();