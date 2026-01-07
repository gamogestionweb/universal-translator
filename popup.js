// Universal Translator - Popup Script v16.0

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const myLanguageSelect = document.getElementById('myLanguage');
  const saveBtn = document.getElementById('saveBtn');

  // Load saved settings
  chrome.storage.sync.get(['deepseekApiKey', 'myLanguage'], (result) => {
    if (result.deepseekApiKey) {
      apiKeyInput.value = result.deepseekApiKey;
      apiKeyInput.type = 'password';
    }
    if (result.myLanguage) {
      myLanguageSelect.value = result.myLanguage;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const myLanguage = myLanguageSelect.value;

    if (!apiKey) {
      saveBtn.textContent = 'Enter an API key';
      saveBtn.style.background = '#e74c3c';
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
        saveBtn.style.background = '';
      }, 2000);
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      saveBtn.textContent = 'Key must start with sk-';
      saveBtn.style.background = '#e74c3c';
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
        saveBtn.style.background = '';
      }, 2000);
      return;
    }

    chrome.storage.sync.set({
      deepseekApiKey: apiKey,
      myLanguage: myLanguage
    }, () => {
      saveBtn.textContent = 'Saved!';
      saveBtn.classList.add('saved');

      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
        saveBtn.classList.remove('saved');
      }, 2000);
    });
  });

  // Show/hide API key on click
  apiKeyInput.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
    }
  });

  apiKeyInput.addEventListener('blur', () => {
    if (apiKeyInput.value) {
      apiKeyInput.type = 'password';
    }
  });
});
