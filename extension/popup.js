document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('johnsToggleButton');
  const buttonText = document.getElementById('buttonText');
  console.log('popup.js DOMContentLoaded listener triggered');
  const turnOffText = 'Turn Off Discovery Mode';
  const turnOnText = 'Enable Discovery Mode';
  
  chrome.storage.local.get('isEnabled', (data) => {
    buttonText.textContent = data.isEnabled ? turnOffText : turnOnText;
  });

  toggleButton.addEventListener('click', () => {
    console.log('Clicked toggle button');
    chrome.storage.local.get('isEnabled', (data) => {
      const currentTextState = buttonText.textContent;
      console.log('Current text state:', currentTextState);
      console.log('Current isEnabled state:', data.isEnabled);

      const newState = !data.isEnabled;
      chrome.storage.local.set({ isEnabled: newState });
      chrome.runtime.sendMessage({ type: 'TOGGLE', value: newState });
      buttonText.textContent = newState ? turnOffText : turnOnText;
    });
  });
});