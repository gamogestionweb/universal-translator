# Universal Translator - Browser Extension for Twitter/X

A browser extension that automatically translates all Twitter/X content to your language and lets you reply in the original tweet's language.

## Features

### READING (automatic)
- All tweets are automatically translated to Spanish
- Detects the original language of each tweet
- Click the 🌐 icon to see the original text

### WRITING (your replies)
1. Write your reply in Spanish
2. Click the green 🌐 button next to "Post"
3. Press `Ctrl+V` to paste the translation
4. Click "Post" or "Reply" to send

Your reply is automatically translated to the original tweet's language.

## Supported Languages

- Spanish
- English
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

### Edge / Chrome

1. Download or clone this repository
2. Go to `edge://extensions/` or `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked"
5. Select the `traductor` folder

### Configure API Key

1. Get a free API key at [platform.deepseek.com](https://platform.deepseek.com/)
2. Click on the extension icon
3. Enter your API key and click "Save"

## Project Structure

```
traductor/
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

## How It Works

1. **Language Detection**: Analyzes text to detect language using common word patterns and specific characters
2. **AI Translation**: Uses DeepSeek API (deepseek-chat model) for high-quality translations
3. **Smart Cache**: Stores translations to avoid repeated API calls
4. **DOM Observer**: Automatically detects new tweets when scrolling

## Technologies

- Vanilla JavaScript
- Chrome Extensions Manifest V3
- DeepSeek API
- MutationObserver for DOM changes

## Notes

- The extension only works on twitter.com and x.com
- You need a DeepSeek API key (has a free tier)
- Translations are cached to save API calls

## License

MIT
