# Aira - Modern AI Chat Web App

**Developer:** Rauf  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Puter.js SDK  
**Platform:** Web & Android  

Aira is an intelligent, responsive AI assistant inspired by Google Gemini, built directly on top of the official Puter.js SDK without any unnecessary custom backends.

---

## Key Features

### 1. Puter AI Chat & Multi-Model Engine
- **Streaming Responses**: Token-by-token live AI text generation using `puter.ai.chat()` with async generators.
- **Multi-Model Engine Selection**: Choose between high performance models using `puter.ai.listModels()` branded for Aira:
  - `Aira 3.5 Sonnet` (Claude 3.5 Sonnet)
  - `Aira GPT-4o` & `Aira GPT-4 Mini`
  - `Aira Gemini 2.0` & `Aira Gemini Flash`
  - `Aira DeepSeek`
  - `Aira Mistral Large`
- **Full Markdown & Code Formatting**: Code block syntax highlighting with language detection and one-click copy buttons.
- **Conversation Controls**: New Chat, Chat history with sidebar search/switch, Rename conversation, Delete conversation, Copy response, Regenerate response, Stop active generation.

### 2. Puter Image AI (txt2img)
- Dedicated **Image Studio** powered by `puter.ai.txt2img()`.
- Style presets (Photorealistic, Digital Art, 3D Render, Anime).
- Gallery with full-screen lightbox preview and PNG download.
- Automated storage in Puter File System (`puter.fs.write()`).

### 3. Voice Input & Output
- **Speech-to-Text**: Microphone button utilizing `puter.ai.speech2txt()` with browser Web Speech fallback.
- **Text-to-Speech**: Instant voice playback for AI responses using `puter.ai.txt2speech()`.
- **Speech Controls**: Adjustable playback speech rate (0.75x - 1.5x) and automatic voice readout toggle in Settings.

### 4. Multimodal Vision & Image Understanding
- Upload images directly to the composer.
- High-resolution thumbnails and multimodal prompt analysis with Puter AI.

### 5. Puter Cloud Storage & KV Persistence
- **Puter KV**: Key-value data persistence for chat history (`puter.kv.set()`, `puter.kv.get()`), user preferences, selected models, and theme settings.
- **Puter FS**: File system operations for media exports (`puter.fs.write()`, `puter.fs.readdir()`).
- **Data Export**: One-click JSON backup of all chat logs.

### 6. Puter Authentication
- Native Puter login/logout (`puter.auth.signIn()`, `puter.auth.signOut()`, `puter.auth.getUser()`, `puter.auth.isSignedIn()`).
- Seamless guest mode with local caching and cloud sync on sign-in.

---

## Project Structure

```
/
├── index.html       # Primary application markup and layout
├── style.css        # Modern Google Gemini dark/light styling
├── app.js           # Puter.js integration, chat streaming, voice & UI state
├── README.md        # Documentation and guide
└── app/             # Android Kotlin/Compose WebView wrapper
    └── src/main/assets/ # Embedded web assets for Android runtime
```

---

## Powered by Puter.js

- Official Puter SDK: [https://developer.puter.com](https://developer.puter.com)
- Puter Cloud: [https://puter.com](https://puter.com)
