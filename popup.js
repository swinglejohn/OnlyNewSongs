document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleButton');
  
  chrome.storage.local.get('isEnabled', (data) => {
    toggleButton.textContent = data.isEnabled ? 'Disable Discovery Mode' : 'Enable Discovery Mode';
  });

  toggleButton.addEventListener('click', () => {
    chrome.storage.local.get('isEnabled', (data) => {
      const newState = !data.isEnabled;
      chrome.storage.local.set({ isEnabled: newState });
      chrome.runtime.sendMessage({ type: 'TOGGLE', value: newState });
      toggleButton.textContent = newState ? 'Disable Discovery Mode' : 'Enable Discovery Mode';
    });
  });
});
