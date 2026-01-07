# Universal Translator - Browser Extension for Twitter/X

A browser extension that automatically translates all Twitter/X content to your language and lets you reply in the original tweet's language.

## Features

### READING (automatic)
- All tweets are automatically translated to your chosen language
- Detects the original language of each tweet
- Click the 🌐 icon to see the original text

### WRITING (your replies)
1. Write your reply in your language
2. Stop typing for 1.5 seconds
3. Your text is automatically translated to the tweet's language
4. Review the translation and click "Reply" to send

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

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Edge / Chrome)

1. Download or clone this repository
2. Go to `edge://extensions/` or `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked"
5. Select the extension folder

### Configure API Key

1. Get a free API key at [platform.deepseek.com](https://platform.deepseek.com/)
2. Click on the extension icon in your browser
3. Select your language
4. Enter your API key and click "Save Settings"

## How It Works

1. **Language Detection**: Analyzes text to detect language using character patterns and common words
2. **AI Translation**: Uses DeepSeek API (deepseek-chat model) for high-quality translations
3. **Smart Cache**: Stores translations to avoid repeated API calls
4. **DOM Observer**: Automatically detects new tweets when scrolling
5. **Auto-translate**: When you stop typing for 1.5 seconds, your reply is translated

## Project Structure

```
universal-translator/
├── manifest.json      # Extension configuration
├── content.js         # Main script (translation logic)
├── popup.html         # Popup interface
├── popup.js           # Popup logic
├── background.js      # Service worker
├── styles.css         # Additional styles
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technologies

- Vanilla JavaScript
- Chrome Extensions Manifest V3
- DeepSeek API
- MutationObserver for DOM changes

## Privacy

- Your API key is stored locally in your browser
- No data is sent to any server except DeepSeek for translation
- No analytics or tracking

## Notes

- The extension only works on twitter.com and x.com
- You need a DeepSeek API key (has a free tier)
- Translations are cached locally to save API calls

## License

MIT
