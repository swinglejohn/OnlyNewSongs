(function() {
  let lastCheckedSong = null;
  let intervalId;
  let isMonitoring = false;

  function getCurrentSongId() {
    const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
    return nowPlayingWidget ? nowPlayingWidget.getAttribute('aria-label') : null;
  }

  function isInPlaylist() {
    const addButton = document.querySelector('[data-testid="add-button"]');
    return addButton ? addButton.getAttribute('aria-label').includes('Remove from') : false;
  }

  function skipSong() {
    const nextButton = document.querySelector('[data-testid="control-button-skip-forward"]');
    if (nextButton) nextButton.click();
  }

  function startMonitoring() {
    if (isMonitoring) return;
    
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    isMonitoring = true;
    intervalId = setInterval(() => {
      const inPlaylist = isInPlaylist();
      if (inPlaylist) {
        skipSong();
        return;
      }
      
      const currentSongId = getCurrentSongId();
      if (currentSongId && lastCheckedSong && currentSongId !== lastCheckedSong) {
        lastCheckedSong = currentSongId;
        chrome.runtime.sendMessage({
          type: 'CHECK_SONG',
          songId: currentSongId,
          inPlaylist: inPlaylist
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error checking song:', chrome.runtime.lastError);
            return;
          }
          if (response && response.shouldSkip) {
            skipSong();
          }
        });
      }
    }, 1000);
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    isMonitoring = false;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cleanup') {
      cleanup();
      sendResponse({status: 'cleaned up'});
    } else if (message.action === 'start') {
      startMonitoring();
      sendResponse({status: 'started'});
    }
    return true; // Indicates we will send a response asynchronously
  });

  // Initial start
  startMonitoring();
})();