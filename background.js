// Background Service Worker para Traductor Universal

// Inicializar estadísticas si no existen
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['translatorConfig', 'translatorStats'], (result) => {
    if (!result.translatorConfig) {
      chrome.storage.sync.set({
        translatorConfig: {
          enabled: true,
          translateOutgoing: true,
          targetLang: 'es'
        }
      });
    }

    if (!result.translatorStats) {
      chrome.storage.sync.set({
        translatorStats: {
          translated: 0,
          savedSeconds: 0,
          lastReset: new Date().toDateString()
        }
      });
    }
  });

  console.log('🌐 Traductor Universal instalado');
});

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'incrementStats') {
    chrome.storage.sync.get(['translatorStats'], (result) => {
      const stats = result.translatorStats || { translated: 0, savedSeconds: 0, lastReset: new Date().toDateString() };

      // Resetear stats si es un nuevo día
      const today = new Date().toDateString();
      if (stats.lastReset !== today) {
        stats.translated = 0;
        stats.savedSeconds = 0;
        stats.lastReset = today;
      }

      stats.translated += message.count || 1;
      stats.savedSeconds += message.seconds || 3; // Asumimos 3 segundos ahorrados por traducción

      chrome.storage.sync.set({ translatorStats: stats });
    });
  }

  return true;
});
