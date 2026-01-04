// Popup Script para Traductor Universal v12.0

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');

  // Cargar API key guardada
  chrome.storage.sync.get(['deepseekApiKey'], (result) => {
    if (result.deepseekApiKey) {
      // Mostrar solo los ultimos 8 caracteres
      const key = result.deepseekApiKey;
      apiKeyInput.value = key;
      apiKeyInput.type = 'password';
    }
  });

  // Guardar API key
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      saveBtn.textContent = 'Introduce una API key';
      saveBtn.style.background = '#e74c3c';
      setTimeout(() => {
        saveBtn.textContent = 'Guardar API Key';
        saveBtn.style.background = '';
      }, 2000);
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      saveBtn.textContent = 'La key debe empezar con sk-';
      saveBtn.style.background = '#e74c3c';
      setTimeout(() => {
        saveBtn.textContent = 'Guardar API Key';
        saveBtn.style.background = '';
      }, 2000);
      return;
    }

    chrome.storage.sync.set({ deepseekApiKey: apiKey }, () => {
      saveBtn.textContent = 'Guardado!';
      saveBtn.classList.add('saved');

      setTimeout(() => {
        saveBtn.textContent = 'Guardar API Key';
        saveBtn.classList.remove('saved');
      }, 2000);
    });
  });

  // Mostrar/ocultar API key al hacer clic
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
