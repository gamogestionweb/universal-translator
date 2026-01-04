// Traductor Universal - Content Script para Twitter/X
// v13.0 - Botón bonito al lado de Postear/Responder
(function() {
  'use strict';

  // Cargar API key desde storage
  let DEEPSEEK_API_KEY = '';

  chrome.storage.sync.get(['deepseekApiKey'], (result) => {
    if (result.deepseekApiKey) {
      DEEPSEEK_API_KEY = result.deepseekApiKey;
    }
  });

  const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

  const cache = new Map();
  const procesados = new WeakSet();

  // ============ TRADUCCIÓN ============
  async function traducir(texto, idioma) {
    if (!texto || texto.trim().length < 3) return texto;

    if (!DEEPSEEK_API_KEY) {
      console.error('🌐 Traductor: No hay API key configurada. Ve al popup de la extensión para añadirla.');
      return texto;
    }

    const cacheKey = texto.trim() + '_' + idioma;
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
          { role: 'system', content: `Traduce al ${idioma}. Solo devuelve la traducción, nada más. Mantén emojis, @menciones y #hashtags sin traducir.` },
          { role: 'user', content: texto }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    const data = await res.json();
    const traducido = data.choices?.[0]?.message?.content?.trim() || texto;
    cache.set(cacheKey, traducido);
    return traducido;
  }

  // ============ DETECTAR IDIOMA ============
  function esEspanol(texto) {
    if (/[áéíóúñ¿¡]/.test(texto)) return true;
    if (/\b(está|qué|cómo|también|después|aquí|siempre|nunca|aunque|porque|entonces|pero|ahora|mucho|muy|hola|gracias|bueno|bien)\b/i.test(texto)) return true;
    return false;
  }

  function detectarIdioma(texto) {
    if (esEspanol(texto)) return 'español';
    if (/\b(the|is|are|was|have|will|this|that|with|from|they|what|when|where|would|could|should)\b/gi.test(texto)) return 'inglés';
    if (/\b(le|la|les|est|sont|dans|pour|avec|vous|nous|mais|très|être)\b/gi.test(texto)) return 'francés';
    if (/\b(der|die|das|und|ist|ein|eine|für|mit|auf|nicht|auch)\b/gi.test(texto)) return 'alemán';
    if (/\b(do|da|em|no|na|não|muito|também|você|isso)\b/gi.test(texto)) return 'portugués';
    if (/\b(il|la|che|di|non|per|sono|questo|una|con)\b/gi.test(texto)) return 'italiano';
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(texto)) return 'japonés';
    if (/[\u4E00-\u9FFF]/.test(texto)) return 'chino';
    if (/[\uAC00-\uD7AF]/.test(texto)) return 'coreano';
    if (/[\u0600-\u06FF]/.test(texto)) return 'árabe';
    if (/[\u0400-\u04FF]/.test(texto)) return 'ruso';
    return 'inglés';
  }

  // ============ LECTURA: Traducir tweets al español ============
  async function procesarTweet(tweet) {
    const textoEl = tweet.querySelector('[data-testid="tweetText"]');
    if (!textoEl) return;

    const texto = textoEl.textContent.trim();
    if (texto.length < 5 || esEspanol(texto)) return;

    textoEl.dataset.original = textoEl.innerHTML;
    textoEl.dataset.idiomaOriginal = detectarIdioma(texto);

    const traducido = await traducir(texto, 'español');

    if (traducido !== texto) {
      textoEl.innerHTML = traducido + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer" title="Ver original">🌐</span>';
      textoEl.dataset.traducido = traducido;

      textoEl.querySelector('.trad-icon').onclick = (e) => {
        e.stopPropagation();
        if (textoEl.dataset.mostrandoOriginal === 'true') {
          textoEl.innerHTML = textoEl.dataset.traducido + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer">🌐</span>';
          textoEl.dataset.mostrandoOriginal = 'false';
        } else {
          textoEl.innerHTML = textoEl.dataset.original + ' <span class="trad-icon" style="opacity:0.5;cursor:pointer">🔄</span>';
          textoEl.dataset.mostrandoOriginal = 'true';
        }
        textoEl.querySelector('.trad-icon').onclick = arguments.callee;
      };
    }
  }

  async function escanearTweets() {
    const tweets = document.querySelectorAll('[data-testid="tweet"]');
    const nuevos = [];
    tweets.forEach(t => {
      if (!procesados.has(t)) {
        procesados.add(t);
        nuevos.push(t);
      }
    });
    if (nuevos.length) await Promise.all(nuevos.map(procesarTweet));
  }

  // ============ ESCRITURA: Botón junto a Postear/Responder ============
  function insertarBotonTraducir() {
    // Buscar todos los botones de envío de Twitter
    const botonesTwitter = document.querySelectorAll('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');

    botonesTwitter.forEach(botonTwitter => {
      // Verificar si ya tiene nuestro botón
      const contenedor = botonTwitter.closest('div');
      if (!contenedor) return;
      if (contenedor.querySelector('.btn-traducir-universal')) return;

      // Crear nuestro botón con el mismo estilo que el de Twitter
      const miBoton = document.createElement('div');
      miBoton.className = 'btn-traducir-universal';
      miBoton.innerHTML = '🌐';
      miBoton.title = 'Traducir y copiar (luego Ctrl+V)';
      miBoton.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        min-height: 36px;
        padding: 0 16px;
        margin-right: 12px;
        background: #00b894;
        color: white;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 700;
        transition: all 0.2s ease;
        user-select: none;
        vertical-align: middle;
      `;

      miBoton.onmouseenter = () => {
        miBoton.style.background = '#00a085';
        miBoton.style.transform = 'scale(1.05)';
      };
      miBoton.onmouseleave = () => {
        miBoton.style.background = '#00b894';
        miBoton.style.transform = 'scale(1)';
      };

      miBoton.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Buscar el editor de texto
        const editor = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                       document.querySelector('[data-testid="tweetTextarea_1"]') ||
                       document.querySelector('[contenteditable="true"][data-testid]') ||
                       document.querySelector('.public-DraftEditor-content');

        if (!editor) {
          console.log('No encontré editor');
          return;
        }

        // Obtener el texto del editor
        const span = editor.querySelector('[data-text="true"]');
        const miTexto = span?.textContent?.trim() || editor.textContent?.trim();

        if (!miTexto || miTexto.length < 2) {
          miBoton.innerHTML = '✏️';
          miBoton.title = 'Escribe algo primero';
          setTimeout(() => {
            miBoton.innerHTML = '🌐';
            miBoton.title = 'Traducir y copiar (luego Ctrl+V)';
          }, 1500);
          return;
        }

        // Detectar idioma del tweet al que respondemos
        let idiomaDestino = 'inglés';

        // Buscar el tweet más cercano con idioma detectado
        const tweetsConIdioma = document.querySelectorAll('[data-testid="tweetText"][data-idioma-original]');
        if (tweetsConIdioma.length > 0) {
          idiomaDestino = tweetsConIdioma[tweetsConIdioma.length - 1].dataset.idiomaOriginal;
        }

        // Si ya está en español y el destino es español, avisar
        if (esEspanol(miTexto) && idiomaDestino === 'español') {
          miBoton.innerHTML = '✅';
          miBoton.title = 'Ya está en español';
          setTimeout(() => {
            miBoton.innerHTML = '🌐';
            miBoton.title = 'Traducir y copiar (luego Ctrl+V)';
          }, 1500);
          return;
        }

        // Mostrar estado de carga
        miBoton.innerHTML = '⏳';
        miBoton.style.background = '#f39c12';

        try {
          const traducido = await traducir(miTexto, idiomaDestino);
          console.log(`🌐 Traducido: "${miTexto}" → "${traducido}" (${idiomaDestino})`);

          // Copiar al portapapeles
          await navigator.clipboard.writeText(traducido);

          // Éxito
          miBoton.innerHTML = '✅';
          miBoton.style.background = '#27ae60';
          miBoton.title = '¡Copiado! Pulsa Ctrl+V';

        } catch (err) {
          console.error('Error:', err);
          miBoton.innerHTML = '❌';
          miBoton.style.background = '#e74c3c';
          miBoton.title = 'Error al traducir';
        }

        // Restaurar después de 3 segundos
        setTimeout(() => {
          miBoton.innerHTML = '🌐';
          miBoton.style.background = '#00b894';
          miBoton.title = 'Traducir y copiar (luego Ctrl+V)';
        }, 3000);
      };

      // Insertar ANTES del botón de Twitter (Postear/Responder)
      botonTwitter.parentElement.insertBefore(miBoton, botonTwitter);
    });
  }

  // ============ INICIAR ============
  const observer = new MutationObserver(() => {
    clearTimeout(window._trad);
    window._trad = setTimeout(() => {
      escanearTweets();
      insertarBotonTraducir();
    }, 200);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Ejecutar al inicio
  setTimeout(() => {
    escanearTweets();
    insertarBotonTraducir();
  }, 500);

  console.log('🌐 Traductor Universal v13.0 - Activo');

})();
