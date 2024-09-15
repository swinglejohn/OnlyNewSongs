document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('johnsToggleButton');
  console.log('popup.js DOMContentLoaded listener triggered');
  
  chrome.storage.local.get('isEnabled', (data) => {
    toggleButton.textContent = data.isEnabled ? 'Disable Discovery Mode' : 'Enable Discovery Mode';
  });

  toggleButton.addEventListener('click', () => {
    console.log('Clicked toggle button');
    chrome.storage.local.get('isEnabled', (data) => {

      currentTextState = toggleButton.textContent;
      console.log('Current text state:', currentTextState);
      console.log('Current isEnabled state:', data.isEnabled);

      const newState = !data.isEnabled;
      chrome.storage.local.set({ isEnabled: newState });
      chrome.runtime.sendMessage({ type: 'TOGGLE', value: newState });
      toggleButton.textContent = newState ? 'Disable Discovery Mode' : 'Enable Discovery Mode';
    });
  });
});
