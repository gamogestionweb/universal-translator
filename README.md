# Universal Translator for Twitter/X

A free browser extension that automatically translates tweets to your language and your replies to the original tweet's language. Break language barriers on Twitter/X!

## Features

### Reading (Automatic)
- All tweets are automatically translated to your chosen language
- Smart language detection using scoring system
- Click the 🌐 icon to toggle between original and translated text
- Supports 11 languages including non-Latin scripts

### Writing (Your Replies)
1. Write your reply in your native language
2. Wait 3 seconds after you stop typing
3. Your text is automatically translated to match the tweet's language
4. Edit if needed, then click "Reply" to send

### v1.1.0 Improvements
- **Better language detection**: Uses scoring system instead of first-match (fixes Italian/English confusion)
- **More time to type**: 3 seconds delay instead of 1.5 seconds
- **No more partial translations**: Checks if you're still typing before translating
- **Smarter target detection**: Translates to the main tweet's language, not random replies
- **Editable after translation**: You can now edit the translated text without issues

## Supported Languages

- English
- Spanish
- French
- German
- Portuguese
- Italian
- Japanese
- Chinese
- Korean
- Arabic
- Russian

## Installation

### Manual Installation (Chrome / Edge / Brave)

1. Download or clone this repository
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked"
5. Select the extension folder

### Get Your Free API Key

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com/)
2. Create an API key (free tier available)
3. Click the extension icon in your browser
4. Select your language and paste your API key
5. Click "Save Settings"

## How It Works

1. **Language Detection**: Analyzes text patterns and common words with a scoring system
2. **AI Translation**: Uses DeepSeek API for high-quality, context-aware translations
3. **Smart Cache**: Stores translations locally to minimize API calls
4. **DOM Observer**: Automatically detects new tweets as you scroll
5. **Auto-translate**: Translates your replies after 3 seconds of inactivity

## Privacy

- Your API key is stored locally in your browser only
- Tweet text is sent to DeepSeek API for translation (required for the extension to work)
- No analytics, tracking, or data collection
- Open source - inspect the code yourself!

## License

MIT - Free to use, modify, and distribute.

---

Made with Claude (Anthropic) + a human from Spain
