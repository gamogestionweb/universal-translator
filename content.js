// Universal Translator - Content Script for Twitter/X
// v16.0 - Multi-language support
(function() {
  'use strict';

  // Load settings from storage
  let DEEPSEEK_API_KEY = '';
  let MY_LANGUAGE = 'spanish'; // Default

  chrome.storage.sync.get(['deepseekApiKey', 'myLanguage'], (result) => {
    if (result.deepseekApiKey) {
      DEEPSEEK_API_KEY = result.deepseekApiKey;
    }
    if (result.myLanguage) {
      MY_LANGUAGE = result.myLanguage;
    }
    console.log(`🌐 Universal Translator v16.0 - Language: ${MY_LANGUAGE}`);
  });

  const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

  const cache = new Map();
  const procesados = new WeakSet();
  let ultimoTextoOriginal = '';  // Last text in MY language before translation
  let ultimoTextoTraducido = ''; // Last translated text
  let timerTraduccion = null;

  // Language detection patterns
  const LANGUAGE_PATTERNS = {
    spanish: {
      chars: /[áéíóúñ¿¡]/,
      words: /\b(está|qué|cómo|también|después|aquí|siempre|nunca|aunque|porque|entonces|pero|ahora|mucho|muy|hola|gracias|bueno|bien|esto|esta|este|eso|esa|ese|para|como|cuando|donde|quien|todo|nada|algo|alguien|nadie|ser|estar|tener|hacer|decir|poder|querer|saber|deber|espectacular|increíble|genial|bonito|hermoso)\b/i,
      common: /\b(es|son|hay|tiene|hace|dice|puede|quiere|sabe|debe|parece|creo|pienso|mira|oye|vale|venga|vamos|claro|seguro|verdad|cierto|igual|casi|solo|ya|asi|ahi|aqui|alla|luego|antes|todavia|aun|sin|sobre|entre|hasta|desde)\b/i
    },
    english: {
      chars: null,
      words: /\b(the|is|are|was|were|have|has|had|will|would|could|should|this|that|these|those|with|from|they|what|when|where|which|who|whom|whose|why|how|been|being|do|does|did|done|make|made|can|may|might|must|shall)\b/i,
      common: /\b(I|you|he|she|it|we|they|my|your|his|her|its|our|their|me|him|us|them|and|but|or|so|if|then|than|very|just|only|also|even|still|already|never|always|often|sometimes)\b/i
    },
    french: {
      chars: /[àâäéèêëïîôùûüÿœæç]/,
      words: /\b(le|la|les|un|une|des|est|sont|dans|pour|avec|vous|nous|mais|très|être|avoir|faire|dire|aller|voir|savoir|pouvoir|vouloir|venir|prendre|parler|aimer|donner|trouver)\b/i,
      common: /\b(je|tu|il|elle|on|ce|qui|que|quoi|où|quand|comment|pourquoi|bien|mal|peu|beaucoup|tout|rien|jamais|toujours|encore|déjà|aussi|même|autre|chaque)\b/i
    },
    german: {
      chars: /[äöüß]/,
      words: /\b(der|die|das|und|ist|ein|eine|für|mit|auf|nicht|auch|haben|werden|sein|können|müssen|sollen|wollen|dürfen|machen|gehen|kommen|sehen|geben|nehmen|finden|denken|sagen)\b/i,
      common: /\b(ich|du|er|sie|es|wir|ihr|mein|dein|sein|ihr|unser|euer|aber|oder|wenn|weil|dass|sehr|nur|noch|schon|immer|nie|oft|manchmal|wieder|zusammen)\b/i
    },
    portuguese: {
      chars: /[áàâãéêíóôõúç]/,
      words: /\b(o|a|os|as|um|uma|do|da|em|no|na|não|muito|também|você|isso|ter|ser|estar|fazer|dizer|ir|ver|saber|poder|querer|vir|dar|ficar|deixar|parecer)\b/i,
      common: /\b(eu|tu|ele|ela|nós|eles|elas|meu|teu|seu|nosso|mas|ou|se|quando|onde|como|porque|bem|mal|pouco|tudo|nada|nunca|sempre|ainda|já|só|mais|menos)\b/i
    },
    italian: {
      chars: /[àèéìíîòóùú]/,
      words: /\b(il|lo|la|i|gli|le|un|uno|una|di|da|in|con|su|per|non|che|sono|essere|avere|fare|dire|andare|vedere|sapere|potere|volere|venire|dare|stare|trovare)\b/i,
      common: /\b(io|tu|lui|lei|noi|voi|loro|mio|tuo|suo|nostro|vostro|ma|o|se|quando|dove|come|perché|bene|male|poco|molto|tutto|niente|mai|sempre|ancora|già|solo|anche)\b/i
    },
    japanese: {
      chars: /[\u3040-\u309F\u30A0-\u30FF]/,
      words: null,
      common: null
    },
    chinese: {
      chars: /[\u4E00-\u9FFF]/,
      words: null,
      common: null
    },
    korean: {
      chars: /[\uAC00-\uD7AF]/,
      words: null,
      common: null
    },
    arabic: {
      chars: /[\u0600-\u06FF]/,
      words: null,
      common: null
    },
    russian: {
      chars: /[\u0400-\u04FF]/,
      words: null,
      common: null
    }
  };

  // ============ TRANSLATION ============
  async function translate(text, targetLanguage) {
    if (!text || text.trim().length < 3) return text;

    if (!DEEPSEEK_API_KEY) {
      console.error('🌐 Translator: No API key configured. Go to the extension popup to add it.');
      return text;
    }

    const cacheKey = text.trim() + '_' + targetLanguage;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Your ONLY function is to translate text to ${targetLanguage}.
STRICT RULES:
- ONLY return the translation, NOTHING else
- DO NOT answer questions
- DO NOT add explanations
- DO NOT add comments
- If the text is a question, translate the question, DO NOT answer it
- Keep emojis, @mentions and #hashtags exactly as they are
- If the text is already in ${targetLanguage}, return it unchanged`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    const data = await res.json();
    const translated = data.choices?.[0]?.message?.content?.trim() || text;
    cache.set(cacheKey, translated);
    return translated;
  }

  // ============ LANGUAGE DETECTION ============
  function isLanguage(text, lang) {
    const pattern = LANGUAGE_PATTERNS[lang];
    if (!pattern) return false;

    if (pattern.chars && pattern.chars.test(text)) return true;
    if (pattern.words && pattern.words.test(text)) return true;
    if (pattern.common && pattern.common.test(text)) return true;

    return false;
  }

  function isMyLanguage(text) {
    return isLanguage(text, MY_LANGUAGE);
  }

  function detectLanguage(text) {
    // Check each language
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.chars && pattern.chars.test(text)) return lang;
    }

    // Check word patterns
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.words && pattern.words.test(text)) return lang;
    }

    return 'english'; // Default fallback
  }

  // ============ READING: Translate tweets to my language ============
  async function processTweet(tweet) {
    const textEl = tweet.querySelector('[data-testid="tweetText"]');
    if (!textEl) return;

    const text = textEl.textContent.trim();
    if (text.length < 5 || isMyLanguage(text)) return;

    textEl.dataset.original = textEl.innerHTML;
    textEl.dataset.originalLanguage = detectLanguage(text);

    const translated = await translate(text, MY_LANGUAGE);

    if (translated !== text) {
      textEl.innerHTML = translated + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer" title="Show original">🌐</span>';
      textEl.dataset.translated = translated;

      textEl.querySelector('.trad-icon').onclick = (e) => {
        e.stopPropagation();
        if (textEl.dataset.showingOriginal === 'true') {
          textEl.innerHTML = textEl.dataset.translated + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer">🌐</span>';
          textEl.dataset.showingOriginal = 'false';
        } else {
          textEl.innerHTML = textEl.dataset.original + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer">🔄</span>';
          textEl.dataset.showingOriginal = 'true';
        }
        textEl.querySelector('.trad-icon').onclick = arguments.callee;
      };
    }
  }

  async function scanTweets() {
    const tweets = document.querySelectorAll('[data-testid="tweet"]');
    const newTweets = [];
    tweets.forEach(t => {
      if (!procesados.has(t)) {
        procesados.add(t);
        newTweets.push(t);
      }
    });
    if (newTweets.length) await Promise.all(newTweets.map(processTweet));
  }

  // ============ WRITING: Auto-translate when you stop typing ============
  function getEditorText() {
    const editor = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                   document.querySelector('[data-testid="tweetTextarea_1"]');
    if (!editor) return null;

    const span = editor.querySelector('[data-text="true"]');
    return span?.textContent?.trim() || editor.textContent?.trim() || '';
  }

  function insertTextInEditor(text) {
    const editor = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                   document.querySelector('[data-testid="tweetTextarea_1"]');
    if (!editor) return false;

    const editable = editor.querySelector('[contenteditable="true"]') ||
                     editor.closest('[contenteditable="true"]');
    if (!editable) return false;

    editable.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand('insertText', false, text);
    editable.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));

    return true;
  }

  async function autoTranslateEditor() {
    const currentText = getEditorText();

    if (!currentText || currentText.length < 3) return;

    // If text is the same as last translation, user hasn't changed anything
    if (currentText === ultimoTextoTraducido) return;

    // If text is in my language, it's new input - translate it
    if (isMyLanguage(currentText)) {
      // Don't re-translate if it's the same original text
      if (currentText === ultimoTextoOriginal) return;

      // Find target language from tweet being replied to
      let targetLanguage = null;
      const tweetsWithLang = document.querySelectorAll('[data-testid="tweetText"][data-original-language]');
      if (tweetsWithLang.length > 0) {
        targetLanguage = tweetsWithLang[tweetsWithLang.length - 1].dataset.originalLanguage;
      }

      // If no target language found or it's my language, don't translate
      if (!targetLanguage || targetLanguage === MY_LANGUAGE) {
        console.log('🌐 No translation needed - same language or no target');
        return;
      }

      console.log(`🌐 Auto-translating: "${currentText}" → ${targetLanguage}`);

      try {
        const translated = await translate(currentText, targetLanguage);

        if (translated && translated !== currentText) {
          console.log(`🌐 Translated: "${translated}"`);
          ultimoTextoOriginal = currentText;
          ultimoTextoTraducido = translated;
          insertTextInEditor(translated);
        }
      } catch (err) {
        console.error('Error auto-translating:', err);
      }
    }
    // If text is NOT in my language, user is editing the translation - leave it alone
  }

  function setupAutoTranslation() {
    document.addEventListener('input', (e) => {
      const editor = e.target.closest('[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea_1"]') ||
                     e.target.closest('[contenteditable="true"]');

      if (!editor) return;

      const text = getEditorText();
      console.log('🌐 Input detected:', text);

      if (timerTraduccion) {
        clearTimeout(timerTraduccion);
      }

      timerTraduccion = setTimeout(() => {
        console.log('🌐 Timer complete, attempting translation...');
        autoTranslateEditor();
      }, 1500);

    }, true);
  }

  // ============ START ============
  const observer = new MutationObserver(() => {
    clearTimeout(window._trad);
    window._trad = setTimeout(() => {
      scanTweets();
    }, 200);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    scanTweets();
    setupAutoTranslation();
  }, 500);

})();
