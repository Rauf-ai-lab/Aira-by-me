/**
 * AIRA AI - Web Application
 * Developer: Rauf
 * Powered by Puter.js SDK (https://developer.puter.com)
 */

(() => {
  'use strict';

  // ==========================================
  // 1. STATE & CONFIGURATION
  // ==========================================
  const APP_CONFIG = {
    appName: 'Aira',
    developer: 'Rauf',
    defaultModel: 'claude-3-5-sonnet',
    fsRootDir: 'aira_app_data',
    kvChatsKey: 'aira_v1_conversations',
    kvPrefsKey: 'aira_v1_preferences'
  };

  // Supported Puter models mapped to Aira Branding
  const DEFAULT_MODELS = [
    { id: 'claude-3-5-sonnet', name: 'Aira 3.5 Sonnet', badge: 'Smartest', desc: 'Superior reasoning, coding, and creative tasks' },
    { id: 'gpt-4o', name: 'Aira GPT-4o', badge: 'Multimodal', desc: 'High intelligence and fast multimodal analysis' },
    { id: 'gpt-4o-mini', name: 'Aira GPT-4 Mini', badge: 'Fast', desc: 'Speedy response time with strong general intelligence' },
    { id: 'gemini-1.5-flash', name: 'Aira Gemini Flash', badge: 'Ultra-Fast', desc: 'Low latency and high context window' },
    { id: 'gemini-2.0-flash', name: 'Aira Gemini 2.0', badge: 'Next-Gen', desc: 'Latest high performance model with deep knowledge' },
    { id: 'deepseek-chat', name: 'Aira DeepSeek', badge: 'Reasoning', desc: 'Advanced coding and mathematical problem solving' },
    { id: 'mistral-large-latest', name: 'Aira Mistral Large', badge: 'Balanced', desc: 'Strong multi-language fluency and reasoning' }
  ];

  let state = {
    currentUser: null,
    isSignedIn: false,
    availableModels: [...DEFAULT_MODELS],
    activeModelId: 'claude-3-5-sonnet',
    conversations: [],
    activeConversationId: null,
    currentStreamController: null,
    isGenerating: false,
    activeVoiceAudio: null,
    isRecordingVoice: false,
    mediaRecorder: null,
    audioChunks: [],
    currentAttachment: null, // { file, dataUrl, name, type }
    activeTab: 'chat', // 'chat' | 'image'
    generatedImages: [],
    preferences: {
      theme: 'dark',
      defaultModel: 'claude-3-5-sonnet',
      systemPrompt: 'You are Aira, an intelligent, empathetic, and sophisticated AI assistant created by Rauf and powered by Puter.js. Provide clear, well-structured, formatted responses with Markdown, code snippets, and helpful explanations.',
      autoSpeech: false,
      speechRate: 1.0
    }
  };

  // ==========================================
  // 2. DOM ELEMENT REFERENCES
  // ==========================================
  const dom = {
    html: document.documentElement,
    appLayout: document.getElementById('appLayout'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    sidebarImageGenBtn: document.getElementById('sidebarImageGenBtn'),
    conversationsList: document.getElementById('conversationsList'),
    emptyHistory: document.getElementById('emptyHistory'),
    chatCountBadge: document.getElementById('chatCountBadge'),
    userProfileCard: document.getElementById('userProfileCard'),
    userAvatar: document.getElementById('userAvatar'),
    userAvatarLetter: document.getElementById('userAvatarLetter'),
    userName: document.getElementById('userName'),
    userStatus: document.getElementById('userStatus'),
    authActionBtn: document.getElementById('authActionBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Top Bar & Model Selector
    modelSelectBtn: document.getElementById('modelSelectBtn'),
    currentModelDisplay: document.getElementById('currentModelDisplay'),
    modelMenu: document.getElementById('modelMenu'),
    modelOptionsList: document.getElementById('modelOptionsList'),
    modeChatTab: document.getElementById('modeChatTab'),
    modeImageTab: document.getElementById('modeImageTab'),

    // Main Canvas & Views
    chatCanvas: document.getElementById('chatCanvas'),
    welcomeContainer: document.getElementById('welcomeContainer'),
    messagesContainer: document.getElementById('messagesContainer'),
    imageStudioContainer: document.getElementById('imageStudioContainer'),
    imgPromptInput: document.getElementById('imgPromptInput'),
    generateImgBtn: document.getElementById('generateImgBtn'),
    imageGalleryGrid: document.getElementById('imageGalleryGrid'),
    galleryCount: document.getElementById('galleryCount'),
    emptyGallery: document.getElementById('emptyGallery'),

    // Composer
    composerTextarea: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    sendIcon: document.querySelector('.send-icon'),
    stopIcon: document.querySelector('.stop-icon'),
    micBtn: document.getElementById('micBtn'),
    attachFileBtn: document.getElementById('attachFileBtn'),
    fileUploadInput: document.getElementById('fileUploadInput'),
    attachmentPreviewBar: document.getElementById('attachmentPreviewBar'),
    imagePreviewThumb: document.getElementById('imagePreviewThumb'),
    attachmentName: document.getElementById('attachmentName'),
    removeAttachmentBtn: document.getElementById('removeAttachmentBtn'),

    // Voice Overlay
    voiceStatusBar: document.getElementById('voiceStatusBar'),
    voiceStatusText: document.getElementById('voiceStatusText'),
    cancelVoiceBtn: document.getElementById('cancelVoiceBtn'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxPrompt: document.getElementById('lightboxPrompt'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
    lightboxDownloadBtn: document.getElementById('lightboxDownloadBtn'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    settingsAvatarLarge: document.getElementById('settingsAvatarLarge'),
    settingsUserName: document.getElementById('settingsUserName'),
    settingsUserStatus: document.getElementById('settingsUserStatus'),
    settingsAuthBtn: document.getElementById('settingsAuthBtn'),
    settingsDefaultModelSelect: document.getElementById('settingsDefaultModelSelect'),
    settingsSystemPrompt: document.getElementById('settingsSystemPrompt'),
    settingsAutoSpeechToggle: document.getElementById('settingsAutoSpeechToggle'),
    settingsSpeechRate: document.getElementById('settingsSpeechRate'),
    speechRateLabel: document.getElementById('speechRateLabel'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    syncPuterKvBtn: document.getElementById('syncPuterKvBtn'),
    clearAllChatsBtn: document.getElementById('clearAllChatsBtn'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================
  // 3. INITIALIZATION & SETUP
  // ==========================================
  async function initApp() {
    setupMarkdownParser();
    loadLocalState();
    setupEventListeners();
    applyTheme(state.preferences.theme);

    // Fetch Puter Auth & Models asynchronously
    await checkPuterAuth();
    await fetchPuterModels();
    await loadPuterData();

    if (state.conversations.length === 0) {
      startNewChat();
    } else {
      renderConversationsList();
      selectConversation(state.conversations[0].id);
    }
  }

  function setupMarkdownParser() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (err) {}
          }
          return typeof hljs !== 'undefined' ? hljs.highlightAuto(code).value : code;
        },
        breaks: true,
        gfm: true
      });
    }
  }

  // ==========================================
  // 4. PUTER.JS AUTHENTICATION & SYNC
  // ==========================================
  async function checkPuterAuth() {
    try {
      if (window.puter && puter.auth) {
        state.isSignedIn = puter.auth.isSignedIn();
        if (state.isSignedIn) {
          state.currentUser = await puter.auth.getUser();
        }
      }
    } catch (err) {
      console.warn('Puter Auth Check warning:', err);
      state.isSignedIn = false;
      state.currentUser = null;
    }
    updateAuthUI();
  }

  async function handleAuthToggle() {
    if (!window.puter || !puter.auth) {
      showToast('Puter.js SDK not available', 'error');
      return;
    }

    try {
      if (state.isSignedIn) {
        await puter.auth.signOut();
        state.isSignedIn = false;
        state.currentUser = null;
        showToast('Signed out from Puter', 'info');
      } else {
        showToast('Opening Puter Sign-in...', 'info');
        state.currentUser = await puter.auth.signIn();
        state.isSignedIn = true;
        showToast(`Welcome ${state.currentUser.username || 'User'}!`, 'success');
        await loadPuterData();
      }
      updateAuthUI();
      saveLocalState();
    } catch (err) {
      console.error('Auth error:', err);
      showToast('Authentication failed or cancelled: ' + (err.message || ''), 'error');
    }
  }

  function updateAuthUI() {
    if (state.isSignedIn && state.currentUser) {
      const name = state.currentUser.username || state.currentUser.email || 'Puter User';
      const initial = name.charAt(0).toUpperCase();
      dom.userName.textContent = name;
      dom.userAvatarLetter.textContent = initial;
      dom.userStatus.textContent = 'Puter Cloud Connected';
      dom.authActionBtn.title = 'Sign Out';
      dom.authActionBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`;

      dom.settingsAvatarLarge.textContent = initial;
      dom.settingsUserName.textContent = name;
      dom.settingsUserStatus.textContent = 'Connected with Puter Cloud sync active';
      dom.settingsAuthBtn.textContent = 'Sign Out';
      dom.settingsAuthBtn.className = 'danger-btn sm';
    } else {
      dom.userName.textContent = 'Guest User';
      dom.userAvatarLetter.textContent = 'G';
      dom.userStatus.textContent = 'Local Mode (Sign in to sync)';
      dom.authActionBtn.title = 'Sign In with Puter';
      dom.authActionBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`;

      dom.settingsAvatarLarge.textContent = 'G';
      dom.settingsUserName.textContent = 'Guest User';
      dom.settingsUserStatus.textContent = 'Sign in with Puter to sync chats across devices';
      dom.settingsAuthBtn.textContent = 'Sign In with Puter';
      dom.settingsAuthBtn.className = 'primary-btn sm';
    }
  }

  // ==========================================
  // 5. PUTER AI MODELS LISTING
  // ==========================================
  async function fetchPuterModels() {
    try {
      if (window.puter && puter.ai && puter.ai.listModels) {
        const rawModels = await puter.ai.listModels();
        if (Array.isArray(rawModels) && rawModels.length > 0) {
          // Format model names with Aira branding
          const formatted = rawModels.map(m => {
            const id = typeof m === 'string' ? m : (m.id || m.name);
            let airaName = 'Aira ' + id.replace(/[-_]/g, ' ').replace(/^(gpt|claude|gemini|deepseek|mistral|llama)/i, (match) => {
              return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
            });
            // Polish common model names
            if (id.includes('claude-3-5') || id.includes('claude-3.5')) airaName = 'Aira 3.5 Claude';
            else if (id.includes('gpt-4o-mini')) airaName = 'Aira GPT-4 Mini';
            else if (id.includes('gpt-4o')) airaName = 'Aira GPT-4o';
            else if (id.includes('gemini-2.0')) airaName = 'Aira Gemini 2.0';
            else if (id.includes('gemini-1.5')) airaName = 'Aira Gemini 1.5';
            else if (id.includes('deepseek')) airaName = 'Aira DeepSeek';
            else if (id.includes('llama-3.1')) airaName = 'Aira 3.1 Pro';

            return {
              id: id,
              name: airaName,
              badge: id.includes('mini') || id.includes('flash') ? 'Fast' : (id.includes('claude') || id.includes('gpt-4') ? 'Pro' : 'AI'),
              desc: `Puter.ai engine (${id})`
            };
          });

          // Deduplicate
          const unique = [];
          const seen = new Set();
          for (const item of formatted) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          }
          if (unique.length > 0) {
            state.availableModels = unique;
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch Puter models, using curated list:', err);
    }
    renderModelSelector();
  }

  function renderModelSelector() {
    dom.modelOptionsList.innerHTML = '';
    dom.settingsDefaultModelSelect.innerHTML = '';

    state.availableModels.forEach(model => {
      // Top nav dropdown option
      const item = document.createElement('div');
      item.className = `model-option-item ${model.id === state.activeModelId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="model-option-top">
          <span class="model-opt-name">${escapeHTML(model.name)}</span>
          <span class="model-opt-badge">${escapeHTML(model.badge)}</span>
        </div>
        <div class="model-opt-desc">${escapeHTML(model.desc)}</div>
      `;
      item.onclick = () => {
        selectModel(model.id);
        dom.modelMenu.classList.remove('open');
        dom.modelSelectBtn.classList.remove('open');
      };
      dom.modelOptionsList.appendChild(item);

      // Settings dropdown option
      const opt = document.createElement('option');
      opt.value = model.id;
      opt.textContent = `${model.name} (${model.badge})`;
      if (model.id === state.preferences.defaultModel) opt.selected = true;
      dom.settingsDefaultModelSelect.appendChild(opt);
    });

    const activeModel = state.availableModels.find(m => m.id === state.activeModelId) || state.availableModels[0];
    if (activeModel) {
      dom.currentModelDisplay.textContent = activeModel.name;
    }
  }

  function selectModel(modelId) {
    state.activeModelId = modelId;
    renderModelSelector();
    saveLocalState();
    showToast(`Switched engine to ${dom.currentModelDisplay.textContent}`, 'info');
  }

  // ==========================================
  // 6. CONVERSATION MANAGEMENT
  // ==========================================
  function startNewChat() {
    if (state.isGenerating) {
      stopGeneration();
    }
    const newConv = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: state.preferences.defaultModel || state.activeModelId,
      messages: []
    };
    state.conversations.unshift(newConv);
    state.activeConversationId = newConv.id;
    saveConversations();
    renderConversationsList();
    renderActiveConversation();
    if (window.innerWidth <= 768) {
      closeMobileSidebar();
    }
    dom.composerTextarea.focus();
  }

  function selectConversation(id) {
    if (state.isGenerating) {
      stopGeneration();
    }
    state.activeConversationId = id;
    const conv = state.conversations.find(c => c.id === id);
    if (conv && conv.modelId) {
      state.activeModelId = conv.modelId;
      const modelObj = state.availableModels.find(m => m.id === conv.modelId);
      if (modelObj) dom.currentModelDisplay.textContent = modelObj.name;
    }
    renderConversationsList();
    renderActiveConversation();
    if (window.innerWidth <= 768) {
      closeMobileSidebar();
    }
  }

  function renameConversation(id, e) {
    if (e) e.stopPropagation();
    const conv = state.conversations.find(c => c.id === id);
    if (!conv) return;
    const newTitle = prompt('Enter a new title for this conversation:', conv.title);
    if (newTitle && newTitle.trim()) {
      conv.title = newTitle.trim();
      conv.updatedAt = Date.now();
      saveConversations();
      renderConversationsList();
    }
  }

  function deleteConversation(id, e) {
    if (e) e.stopPropagation();
    const conv = state.conversations.find(c => c.id === id);
    if (!conv) return;
    if (confirm(`Delete conversation "${conv.title}"?`)) {
      state.conversations = state.conversations.filter(c => c.id !== id);
      if (state.activeConversationId === id) {
        if (state.conversations.length > 0) {
          state.activeConversationId = state.conversations[0].id;
        } else {
          startNewChat();
          return;
        }
      }
      saveConversations();
      renderConversationsList();
      renderActiveConversation();
      showToast('Conversation deleted', 'info');
    }
  }

  function clearAllConversations() {
    if (confirm('Are you sure you want to delete ALL conversations? This cannot be undone.')) {
      state.conversations = [];
      saveConversations();
      startNewChat();
      showToast('All conversations cleared', 'info');
      dom.settingsModal.style.display = 'none';
    }
  }

  function renderConversationsList() {
    dom.chatCountBadge.textContent = state.conversations.length;
    if (state.conversations.length === 0) {
      dom.emptyHistory.style.display = 'flex';
      return;
    }
    dom.emptyHistory.style.display = 'none';

    // Remove old items but keep emptyHistory node
    const items = dom.conversationsList.querySelectorAll('.conversation-item');
    items.forEach(el => el.remove());

    state.conversations.forEach(conv => {
      const item = document.createElement('div');
      item.className = `conversation-item ${conv.id === state.activeConversationId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="conv-title-wrap">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="conv-title" title="${escapeHTML(conv.title)}">${escapeHTML(conv.title)}</span>
        </div>
        <div class="conv-actions">
          <button class="icon-btn sm edit-conv-btn" title="Rename">
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="icon-btn sm delete-conv-btn" title="Delete">
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      item.onclick = () => selectConversation(conv.id);
      item.querySelector('.edit-conv-btn').onclick = (e) => renameConversation(conv.id, e);
      item.querySelector('.delete-conv-btn').onclick = (e) => deleteConversation(conv.id, e);

      dom.conversationsList.appendChild(item);
    });
  }

  function renderActiveConversation() {
    const conv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!conv || conv.messages.length === 0) {
      dom.welcomeContainer.style.display = 'flex';
      dom.messagesContainer.style.display = 'none';
      dom.messagesContainer.innerHTML = '';
      return;
    }

    dom.welcomeContainer.style.display = 'none';
    dom.messagesContainer.style.display = 'flex';
    dom.messagesContainer.innerHTML = '';

    conv.messages.forEach((msg, idx) => {
      renderMessageElement(msg, idx);
    });

    scrollToBottom();
  }

  function renderMessageElement(msg, index) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`;
    row.id = `msg_${msg.id || index}`;

    const timestamp = msg.timestamp ? formatTime(msg.timestamp) : formatTime(Date.now());
    const authorName = msg.role === 'user' ? 'You' : 'Aira';

    let contentHtml = '';
    if (msg.role === 'user') {
      contentHtml = escapeHTML(msg.content).replace(/\n/g, '<br>');
    } else {
      contentHtml = typeof marked !== 'undefined' ? marked.parse(msg.content || '') : escapeHTML(msg.content);
    }

    let attachmentHtml = '';
    if (msg.attachment && msg.attachment.dataUrl) {
      attachmentHtml = `<img src="${msg.attachment.dataUrl}" class="chat-attachment-image" alt="User upload" onclick="window.airaApp.openLightbox('${msg.attachment.dataUrl}', 'Uploaded Image')">`;
    }

    if (msg.role === 'user') {
      row.innerHTML = `
        <div class="message-content-wrap">
          <div class="message-meta">
            <span class="message-time">${timestamp}</span>
            <span class="message-author">${authorName}</span>
          </div>
          <div class="message-bubble">
            ${attachmentHtml}
            <div>${contentHtml}</div>
          </div>
        </div>
        <div class="message-avatar user-avatar-tag">
          ${state.currentUser ? (state.currentUser.username || 'U').charAt(0).toUpperCase() : 'Y'}
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="message-avatar ai-avatar">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#aiAvatarGrad)"/><defs><linearGradient id="aiAvatarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs></svg>
        </div>
        <div class="message-content-wrap">
          <div class="message-meta">
            <span class="message-author">${authorName}</span>
            <span class="message-time">${timestamp}</span>
          </div>
          <div class="message-bubble" id="bubble_${msg.id || index}">
            ${attachmentHtml}
            <div class="markdown-body">${contentHtml}</div>
          </div>
          <div class="message-actions-toolbar">
            <button class="msg-action-btn copy-msg-btn" title="Copy response">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy</span>
            </button>
            <button class="msg-action-btn speak-msg-btn" title="Speak text">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <span>Listen</span>
            </button>
            <button class="msg-action-btn regen-msg-btn" title="Regenerate answer">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      `;

      // Attach button actions
      const copyBtn = row.querySelector('.copy-msg-btn');
      copyBtn.onclick = () => copyTextToClipboard(msg.content, copyBtn);

      const speakBtn = row.querySelector('.speak-msg-btn');
      speakBtn.onclick = () => toggleTextToSpeech(msg.content, speakBtn);

      const regenBtn = row.querySelector('.regen-msg-btn');
      regenBtn.onclick = () => regenerateResponse(index);
    }

    dom.messagesContainer.appendChild(row);
    enhanceCodeBlocks(row);
  }

  function enhanceCodeBlocks(container) {
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return;

      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;
      let lang = 'code';
      if (code && code.className) {
        const match = code.className.match(/language-(\w+)/);
        if (match) lang = match[1];
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `
        <span>${escapeHTML(lang)}</span>
        <button class="code-copy-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy code</span>
        </button>
      `;

      const copyBtn = header.querySelector('.code-copy-btn');
      copyBtn.onclick = () => copyTextToClipboard(text, copyBtn);

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });
  }

  // ==========================================
  // 7. SENDING MESSAGES & STREAMING CHAT
  // ==========================================
  async function sendMessage() {
    const text = dom.composerTextarea.value.trim();
    const attachment = state.currentAttachment;

    if (!text && !attachment) return;
    if (state.isGenerating) {
      stopGeneration();
      return;
    }

    // Clear input & attachment
    dom.composerTextarea.value = '';
    dom.composerTextarea.style.height = 'auto';
    clearAttachment();

    const conv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!conv) return;

    // Auto update conversation title on first message
    if (conv.messages.length === 0 && text) {
      conv.title = text.slice(0, 36) + (text.length > 36 ? '...' : '');
      renderConversationsList();
    }

    // Add user message
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachment: attachment ? { ...attachment } : null,
      timestamp: Date.now()
    };
    conv.messages.push(userMsg);
    conv.updatedAt = Date.now();

    renderActiveConversation();
    saveConversations();

    // Trigger AI Generation
    await generateAIResponse(conv);
  }

  async function generateAIResponse(conv) {
    state.isGenerating = true;
    updateSendButtonState(true);

    // Placeholder message for AI streaming
    const aiMsgId = 'msg_' + Date.now();
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: state.activeModelId
    };
    conv.messages.push(aiMsg);

    // Prepare container row
    dom.welcomeContainer.style.display = 'none';
    dom.messagesContainer.style.display = 'flex';
    renderMessageElement(aiMsg, conv.messages.length - 1);
    const bubble = document.getElementById(`bubble_${aiMsgId}`);
    const markdownBody = bubble ? bubble.querySelector('.markdown-body') : null;
    if (markdownBody) {
      markdownBody.innerHTML = `<span class="streaming-cursor"></span>`;
    }

    scrollToBottom();

    try {
      if (!window.puter || !puter.ai) {
        throw new Error('Puter.js SDK is not loaded. Please check your network connection.');
      }

      // Build conversation messages for Puter AI
      const promptMessages = [];

      // System persona instruction
      if (state.preferences.systemPrompt) {
        promptMessages.push({ role: 'system', content: state.preferences.systemPrompt });
      }

      // Past history up to last 15 messages for context
      const historySlice = conv.messages.slice(0, -1).slice(-15);
      historySlice.forEach(m => {
        if (m.role === 'user') {
          // If message contains image attachment, format for Puter multimodal
          if (m.attachment && m.attachment.dataUrl) {
            promptMessages.push({
              role: 'user',
              content: [
                { type: 'text', text: m.content || 'Analyze this image.' },
                { type: 'image_url', image_url: { url: m.attachment.dataUrl } }
              ]
            });
          } else {
            promptMessages.push({ role: 'user', content: m.content });
          }
        } else if (m.role === 'assistant') {
          promptMessages.push({ role: 'assistant', content: m.content });
        }
      });

      console.log(`Puter AI calling chat() with model ${state.activeModelId}...`);

      let fullContent = '';
      
      // Call Puter AI streaming chat
      const response = await puter.ai.chat(promptMessages, {
        model: state.activeModelId,
        stream: true
      });

      // Handle streaming async iterator or standard response
      if (response && response[Symbol.asyncIterator]) {
        for await (const chunk of response) {
          if (!state.isGenerating) break; // User stopped generation
          const piece = (chunk && chunk.text) ? chunk.text : (chunk && chunk.message && chunk.message.content) ? chunk.message.content : (typeof chunk === 'string' ? chunk : '');
          fullContent += piece;
          aiMsg.content = fullContent;
          if (markdownBody) {
            markdownBody.innerHTML = (typeof marked !== 'undefined' ? marked.parse(fullContent) : escapeHTML(fullContent)) + `<span class="streaming-cursor"></span>`;
            enhanceCodeBlocks(bubble);
          }
          scrollToBottom();
        }
      } else if (response) {
        // Fallback for non-streaming response
        const textResp = typeof response === 'string' ? response : (response.message ? response.message.content : JSON.stringify(response));
        fullContent = textResp;
        aiMsg.content = fullContent;
      }

      // Finalize message rendering
      if (markdownBody) {
        markdownBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiMsg.content) : escapeHTML(aiMsg.content);
        enhanceCodeBlocks(bubble);
      }

      // Auto-speech if enabled in preferences
      if (state.preferences.autoSpeech && aiMsg.content) {
        speakText(aiMsg.content);
      }

    } catch (err) {
      console.error('Puter.ai chat error:', err);
      let errMsg = err.message || 'An error occurred while generating AI response with Puter.js.';
      if (err.status === 429) errMsg = 'Puter AI rate limit reached. Please wait a moment or sign in to Puter for increased quotas.';
      else if (err.status === 401) errMsg = 'Authentication needed for this model. Please sign in with Puter.';

      aiMsg.content = `⚠️ **Error:** ${errMsg}\n\n*Tip: Check Puter model availability or try selecting another Aira model above.*`;
      if (markdownBody) {
        markdownBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiMsg.content) : escapeHTML(aiMsg.content);
      }
      showToast(errMsg, 'error');
    } finally {
      state.isGenerating = false;
      updateSendButtonState(false);
      saveConversations();
      scrollToBottom();
    }
  }

  function stopGeneration() {
    state.isGenerating = false;
    updateSendButtonState(false);
    showToast('Generation stopped', 'info');
  }

  function regenerateResponse(index) {
    const conv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!conv) return;
    if (index >= 0 && index < conv.messages.length) {
      // Remove this AI message and any succeeding ones
      conv.messages.splice(index);
      renderActiveConversation();
      saveConversations();
      generateAIResponse(conv);
    }
  }

  function updateSendButtonState(isGenerating) {
    if (isGenerating) {
      dom.sendBtn.classList.add('generating');
      dom.sendIcon.style.display = 'none';
      dom.stopIcon.style.display = 'block';
      dom.sendBtn.title = 'Stop generating';
    } else {
      dom.sendBtn.classList.remove('generating');
      dom.sendIcon.style.display = 'block';
      dom.stopIcon.style.display = 'none';
      dom.sendBtn.title = 'Send message';
    }
  }

  // ==========================================
  // 8. IMAGE GENERATION (Puter txt2img)
  // ==========================================
  async function generateImageStudio() {
    let prompt = dom.imgPromptInput.value.trim();
    if (!prompt) {
      showToast('Please enter an image description', 'warning');
      dom.imgPromptInput.focus();
      return;
    }

    // Append active preset
    const activePreset = document.querySelector('.preset-pill.active');
    if (activePreset && activePreset.dataset.style) {
      prompt += activePreset.dataset.style;
    }

    dom.generateImgBtn.disabled = true;
    dom.generateImgBtn.innerHTML = `<span class="streaming-cursor" style="height:12px"></span> Generating with Puter...`;
    showToast('Generating AI image with Puter.ai txt2img...', 'info');

    try {
      if (!window.puter || !puter.ai || !puter.ai.txt2img) {
        throw new Error('Puter.ai txt2img API not available');
      }

      console.log(`Generating image for prompt: "${prompt}"...`);
      const imgElement = await puter.ai.txt2img(prompt);

      let imgSrc = '';
      if (imgElement instanceof HTMLImageElement) {
        imgSrc = imgElement.src;
      } else if (typeof imgElement === 'string') {
        imgSrc = imgElement;
      } else if (imgElement && imgElement.src) {
        imgSrc = imgElement.src;
      }

      if (!imgSrc) {
        throw new Error('No image returned from Puter.ai');
      }

      const imgItem = {
        id: 'img_' + Date.now(),
        prompt: prompt,
        src: imgSrc,
        timestamp: Date.now()
      };

      state.generatedImages.unshift(imgItem);
      renderGallery();
      saveGeneratedImages();
      showToast('Image generated successfully!', 'success');

      // Attempt to save to Puter File System if signed in
      saveImageToPuterFS(imgItem);

    } catch (err) {
      console.error('Image generation error:', err);
      showToast('Image generation failed: ' + (err.message || ''), 'error');
    } finally {
      dom.generateImgBtn.disabled = false;
      dom.generateImgBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>Generate Image</span>
      `;
    }
  }

  function renderGallery() {
    dom.galleryCount.textContent = `${state.generatedImages.length} images`;
    if (state.generatedImages.length === 0) {
      dom.emptyGallery.style.display = 'flex';
      return;
    }
    dom.emptyGallery.style.display = 'none';

    // Remove old cards
    const cards = dom.imageGalleryGrid.querySelectorAll('.gallery-card');
    cards.forEach(c => c.remove());

    state.generatedImages.forEach(img => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${img.src}" alt="${escapeHTML(img.prompt)}" loading="lazy">
        <div class="gallery-overlay">
          <div class="gallery-prompt" title="${escapeHTML(img.prompt)}">${escapeHTML(img.prompt)}</div>
          <div class="gallery-actions">
            <button class="primary-btn sm view-img-btn">View</button>
            <button class="secondary-btn sm download-img-btn">Save</button>
          </div>
        </div>
      `;

      card.onclick = () => openLightbox(img.src, img.prompt);
      card.querySelector('.download-img-btn').onclick = (e) => {
        e.stopPropagation();
        downloadImageFile(img.src, `aira_art_${img.id}.png`);
      };

      dom.imageGalleryGrid.appendChild(card);
    });
  }

  async function saveImageToPuterFS(imgItem) {
    if (!window.puter || !puter.fs || !puter.auth || !puter.auth.isSignedIn()) return;
    try {
      const filename = `${APP_CONFIG.fsRootDir}/images/${imgItem.id}.txt`;
      await puter.fs.write(filename, imgItem.src, { createMissingParents: true });
      console.log(`Saved image metadata to Puter FS: ${filename}`);
    } catch (err) {
      console.warn('Puter FS write notice:', err);
    }
  }

  // ==========================================
  // 9. VOICE & SPEECH (Puter Speech APIs)
  // ==========================================
  async function toggleVoiceRecording() {
    if (state.isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  }

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.isRecordingVoice = true;
      state.audioChunks = [];
      dom.micBtn.classList.add('recording');
      dom.voiceStatusBar.style.display = 'flex';
      dom.voiceStatusText.textContent = 'Listening to your voice...';

      state.mediaRecorder = new MediaRecorder(stream);
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) state.audioChunks.push(e.data);
      };

      state.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
        await processSpeechToText(audioBlob);
      };

      state.mediaRecorder.start();

    } catch (err) {
      console.warn('Microphone access error, trying Web Speech API:', err);
      fallbackWebSpeechRecognition();
    }
  }

  function stopVoiceRecording() {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    state.isRecordingVoice = false;
    dom.micBtn.classList.remove('recording');
    dom.voiceStatusText.textContent = 'Transcribing with Puter AI...';
  }

  async function processSpeechToText(audioBlob) {
    try {
      if (window.puter && puter.ai && puter.ai.speech2txt) {
        const textResult = await puter.ai.speech2txt(audioBlob);
        if (textResult && typeof textResult === 'string') {
          dom.composerTextarea.value = (dom.composerTextarea.value ? dom.composerTextarea.value + ' ' : '') + textResult.trim();
          dom.composerTextarea.focus();
          showToast('Voice transcribed!', 'success');
        }
      } else {
        fallbackWebSpeechRecognition();
      }
    } catch (err) {
      console.warn('Puter speech2txt error:', err);
      fallbackWebSpeechRecognition();
    } finally {
      dom.voiceStatusBar.style.display = 'none';
    }
  }

  function fallbackWebSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported on this device', 'error');
      dom.voiceStatusBar.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      dom.voiceStatusBar.style.display = 'flex';
      dom.voiceStatusText.textContent = 'Listening with Browser Speech...';
      dom.micBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      dom.composerTextarea.value = (dom.composerTextarea.value ? dom.composerTextarea.value + ' ' : '') + transcript;
      dom.composerTextarea.focus();
      showToast('Transcribed: ' + transcript, 'success');
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      showToast('Speech error: ' + event.error, 'error');
    };

    recognition.onend = () => {
      dom.voiceStatusBar.style.display = 'none';
      dom.micBtn.classList.remove('recording');
      state.isRecordingVoice = false;
    };

    recognition.start();
  }

  async function toggleTextToSpeech(text, btnElement) {
    if (state.activeVoiceAudio) {
      state.activeVoiceAudio.pause();
      state.activeVoiceAudio = null;
      if (btnElement) {
        btnElement.classList.remove('active');
        btnElement.querySelector('span').textContent = 'Listen';
      }
      return;
    }

    if (btnElement) {
      btnElement.classList.add('active');
      btnElement.querySelector('span').textContent = 'Stop';
    }

    await speakText(text, () => {
      if (btnElement) {
        btnElement.classList.remove('active');
        btnElement.querySelector('span').textContent = 'Listen';
      }
    });
  }

  async function speakText(text, onEnded) {
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[#*`_~\[\]()]/g, '').replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;

    try {
      if (window.puter && puter.ai && puter.ai.txt2speech) {
        const audio = await puter.ai.txt2speech(cleanText);
        if (audio instanceof HTMLAudioElement || audio instanceof Audio) {
          state.activeVoiceAudio = audio;
          audio.playbackRate = state.preferences.speechRate || 1.0;
          audio.onended = () => {
            state.activeVoiceAudio = null;
            if (onEnded) onEnded();
          };
          audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Puter txt2speech error, falling back to Web Speech Synthesis:', err);
    }

    // Fallback: Web Speech Synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = state.preferences.speechRate || 1.0;
      utterance.onend = () => {
        state.activeVoiceAudio = null;
        if (onEnded) onEnded();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Text-to-speech is not supported on this browser', 'warning');
      if (onEnded) onEnded();
    }
  }

  // ==========================================
  // 10. MULTIMODAL ATTACHMENTS (IMAGE OCR / VISION)
  // ==========================================
  function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WEBP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      state.currentAttachment = {
        file: file,
        dataUrl: event.target.result,
        name: file.name,
        type: file.type
      };

      dom.imagePreviewThumb.src = state.currentAttachment.dataUrl;
      dom.attachmentName.textContent = file.name;
      dom.attachmentPreviewBar.style.display = 'flex';
      dom.composerTextarea.focus();
      showToast('Image attached for AI understanding', 'info');
    };
    reader.readAsDataURL(file);
  }

  function clearAttachment() {
    state.currentAttachment = null;
    dom.fileUploadInput.value = '';
    dom.attachmentPreviewBar.style.display = 'none';
    dom.imagePreviewThumb.src = '';
  }

  // ==========================================
  // 11. PUTER KV & LOCAL STORAGE PERSISTENCE
  // ==========================================
  async function loadPuterData() {
    try {
      if (window.puter && puter.kv && state.isSignedIn) {
        // Load cloud chats
        const cloudChats = await puter.kv.get(APP_CONFIG.kvChatsKey);
        if (cloudChats && Array.isArray(cloudChats) && cloudChats.length > 0) {
          state.conversations = cloudChats;
          renderConversationsList();
          if (state.conversations.length > 0) {
            selectConversation(state.conversations[0].id);
          }
        }

        // Load cloud preferences
        const cloudPrefs = await puter.kv.get(APP_CONFIG.kvPrefsKey);
        if (cloudPrefs) {
          state.preferences = { ...state.preferences, ...cloudPrefs };
          applyPreferences();
        }
      }
    } catch (err) {
      console.warn('Puter KV load notice:', err);
    }
  }

  async function saveConversations() {
    saveLocalState();
    if (window.puter && puter.kv && state.isSignedIn) {
      try {
        await puter.kv.set(APP_CONFIG.kvChatsKey, state.conversations);
      } catch (err) {
        console.warn('Puter KV chat save notice:', err);
      }
    }
  }

  async function savePreferences() {
    saveLocalState();
    if (window.puter && puter.kv && state.isSignedIn) {
      try {
        await puter.kv.set(APP_CONFIG.kvPrefsKey, state.preferences);
      } catch (err) {
        console.warn('Puter KV prefs save notice:', err);
      }
    }
  }

  function loadLocalState() {
    try {
      const localConvs = localStorage.getItem(APP_CONFIG.kvChatsKey);
      if (localConvs) state.conversations = JSON.parse(localConvs);

      const localPrefs = localStorage.getItem(APP_CONFIG.kvPrefsKey);
      if (localPrefs) state.preferences = { ...state.preferences, ...JSON.parse(localPrefs) };

      const localImgs = localStorage.getItem('aira_generated_images');
      if (localImgs) state.generatedImages = JSON.parse(localImgs);
    } catch (err) {
      console.error('Local storage load error:', err);
    }
    applyPreferences();
  }

  function saveLocalState() {
    try {
      localStorage.setItem(APP_CONFIG.kvChatsKey, JSON.stringify(state.conversations));
      localStorage.setItem(APP_CONFIG.kvPrefsKey, JSON.stringify(state.preferences));
    } catch (err) {}
  }

  function saveGeneratedImages() {
    try {
      localStorage.setItem('aira_generated_images', JSON.stringify(state.generatedImages));
    } catch (err) {}
  }

  function applyPreferences() {
    applyTheme(state.preferences.theme);
    dom.settingsSystemPrompt.value = state.preferences.systemPrompt || '';
    dom.settingsAutoSpeechToggle.checked = !!state.preferences.autoSpeech;
    dom.settingsSpeechRate.value = state.preferences.speechRate || 1.0;
    dom.speechRateLabel.textContent = `${state.preferences.speechRate || 1.0}x Speed`;
  }

  function applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dom.html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      dom.html.setAttribute('data-theme', theme);
    }
    // Update settings buttons
    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === theme);
    });
  }

  function exportDataAsJSON() {
    const exportObj = {
      app: 'Aira AI',
      developer: 'Rauf',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      conversations: state.conversations,
      preferences: state.preferences
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aira_chat_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chats exported to JSON file', 'success');
  }

  // ==========================================
  // 12. UI HELPERS & EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Mobile sidebar toggle
    dom.openSidebarBtn.onclick = openMobileSidebar;
    dom.closeSidebarBtn.onclick = closeMobileSidebar;
    dom.sidebarBackdrop.onclick = closeMobileSidebar;

    // New Chat
    dom.newChatBtn.onclick = () => {
      switchTab('chat');
      startNewChat();
    };

    // Tabs
    dom.modeChatTab.onclick = () => switchTab('chat');
    dom.modeImageTab.onclick = () => switchTab('image');
    dom.sidebarImageGenBtn.onclick = () => {
      switchTab('image');
      if (window.innerWidth <= 768) closeMobileSidebar();
    };

    // Model Selector Dropdown
    dom.modelSelectBtn.onclick = (e) => {
      e.stopPropagation();
      dom.modelMenu.classList.toggle('open');
      dom.modelSelectBtn.classList.toggle('open');
    };
    document.addEventListener('click', (e) => {
      if (!dom.modelPickerContainer?.contains(e.target)) {
        dom.modelMenu?.classList.remove('open');
        dom.modelSelectBtn?.classList.remove('open');
      }
    });

    // Composer Input & Send
    dom.sendBtn.onclick = sendMessage;
    dom.composerTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    dom.composerTextarea.addEventListener('input', () => {
      dom.composerTextarea.style.height = 'auto';
      dom.composerTextarea.style.height = Math.min(dom.composerTextarea.scrollHeight, 160) + 'px';
    });

    // Attachments
    dom.attachFileBtn.onclick = () => dom.fileUploadInput.click();
    dom.fileUploadInput.onchange = handleFileSelection;
    dom.removeAttachmentBtn.onclick = clearAttachment;

    // Voice
    dom.micBtn.onclick = toggleVoiceRecording;
    dom.cancelVoiceBtn.onclick = stopVoiceRecording;

    // Image Studio Actions
    dom.generateImgBtn.onclick = generateImageStudio;
    document.querySelectorAll('.preset-pill').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    // Suggestion Cards on Welcome Screen
    document.querySelectorAll('.suggestion-card').forEach(card => {
      card.onclick = () => {
        const prompt = card.dataset.prompt;
        const mode = card.dataset.mode;
        if (mode === 'image') {
          switchTab('image');
          dom.imgPromptInput.value = prompt;
          dom.imgPromptInput.focus();
        } else {
          switchTab('chat');
          dom.composerTextarea.value = prompt;
          sendMessage();
        }
      };
    });

    // Theme toggle in navbar
    dom.themeToggleBtn.onclick = () => {
      const current = dom.html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      state.preferences.theme = next;
      applyTheme(next);
      savePreferences();
      showToast(`Switched to ${next} theme`, 'info');
    };

    // Settings Modal
    dom.openSettingsBtn.onclick = () => {
      dom.settingsModal.style.display = 'flex';
      if (window.innerWidth <= 768) closeMobileSidebar();
    };
    dom.closeSettingsModalBtn.onclick = () => dom.settingsModal.style.display = 'none';
    dom.settingsModal.onclick = (e) => {
      if (e.target === dom.settingsModal) dom.settingsModal.style.display = 'none';
    };

    // Settings actions
    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
      btn.onclick = () => {
        const val = btn.dataset.themeVal;
        state.preferences.theme = val;
        applyTheme(val);
        savePreferences();
      };
    });

    dom.settingsDefaultModelSelect.onchange = () => {
      state.preferences.defaultModel = dom.settingsDefaultModelSelect.value;
      state.activeModelId = state.preferences.defaultModel;
      renderModelSelector();
      savePreferences();
    };

    dom.settingsSystemPrompt.onchange = () => {
      state.preferences.systemPrompt = dom.settingsSystemPrompt.value;
      savePreferences();
    };

    dom.settingsAutoSpeechToggle.onchange = () => {
      state.preferences.autoSpeech = dom.settingsAutoSpeechToggle.checked;
      savePreferences();
    };

    dom.settingsSpeechRate.oninput = () => {
      state.preferences.speechRate = parseFloat(dom.settingsSpeechRate.value);
      dom.speechRateLabel.textContent = `${state.preferences.speechRate}x Speed`;
      savePreferences();
    };

    dom.exportDataBtn.onclick = exportDataAsJSON;
    dom.syncPuterKvBtn.onclick = async () => {
      showToast('Syncing data with Puter KV...', 'info');
      await saveConversations();
      await savePreferences();
      await loadPuterData();
      showToast('Puter KV sync complete!', 'success');
    };
    dom.clearAllChatsBtn.onclick = clearAllConversations;

    dom.authActionBtn.onclick = handleAuthToggle;
    dom.settingsAuthBtn.onclick = handleAuthToggle;

    // Lightbox Modal
    dom.lightboxCloseBtn.onclick = closeLightbox;
    dom.lightboxBackdrop.onclick = closeLightbox;
  }

  function switchTab(tab) {
    state.activeTab = tab;
    if (tab === 'chat') {
      dom.modeChatTab.classList.add('active');
      dom.modeImageTab.classList.remove('active');
      dom.chatCanvas.style.display = 'flex';
      dom.imageStudioContainer.style.display = 'none';
      if (state.conversations.length > 0) {
        renderActiveConversation();
      }
    } else {
      dom.modeImageTab.classList.add('active');
      dom.modeChatTab.classList.remove('active');
      dom.welcomeContainer.style.display = 'none';
      dom.messagesContainer.style.display = 'none';
      dom.imageStudioContainer.style.display = 'flex';
      renderGallery();
    }
  }

  function openMobileSidebar() {
    dom.sidebar.classList.add('open');
    dom.sidebarBackdrop.classList.add('open');
  }

  function closeMobileSidebar() {
    dom.sidebar.classList.remove('open');
    dom.sidebarBackdrop.classList.remove('open');
  }

  function openLightbox(src, prompt) {
    dom.lightboxImg.src = src;
    dom.lightboxPrompt.textContent = prompt || 'Aira Image Preview';
    dom.lightboxDownloadBtn.onclick = () => downloadImageFile(src, `aira_img_${Date.now()}.png`);
    dom.lightboxModal.style.display = 'flex';
  }

  function closeLightbox() {
    dom.lightboxModal.style.display = 'none';
    dom.lightboxImg.src = '';
  }

  function downloadImageFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast('Download started', 'info');
  }

  function copyTextToClipboard(text, btnElement) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
        if (btnElement) {
          const originalText = btnElement.querySelector('span') ? btnElement.querySelector('span').textContent : '';
          if (btnElement.querySelector('span')) btnElement.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            if (btnElement.querySelector('span')) btnElement.querySelector('span').textContent = originalText || 'Copy';
          }, 2000);
        }
      });
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconSvg = '';
    if (type === 'success') iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>';
    else if (type === 'error') iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    else iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    toast.innerHTML = `${iconSvg} <span>${escapeHTML(message)}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function scrollToBottom() {
    dom.chatCanvas.scrollTop = dom.chatCanvas.scrollHeight;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Global exposure for lightbox onclick handlers
  window.airaApp = {
    openLightbox
  };

  // Start app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
