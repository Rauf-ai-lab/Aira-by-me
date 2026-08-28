/**
 * AIRA AI - Personal Assistant
 * Created with care by Rauf | Powered by Rauf
 */

(() => {
  'use strict';

  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const APP_CONFIG = {
    appName: 'Aira',
    creator: 'Rauf',
    fsRootDir: 'aira_app_data',
    kvChatsKey: 'aira_v1_conversations',
    kvPrefsKey: 'aira_v1_preferences'
  };

  const DEFAULT_SYSTEM_PROMPT = `You are Aira, a warm, highly intelligent, and natural personal assistant created with care by Rauf.

IDENTITY & ORIGIN RULES:
- Your name is Aira.
- You were created with care by Rauf.
- When asked who created you, who made you, or who is behind Aira, you must always state clearly: "I was created with care by Rauf."
- Never claim or state that you were created by OpenAI, Puter, Anthropic, Google, DeepSeek, or any other company or organization.
- Do not use the words "developer" or "owner"; simply refer to Rauf or state that you were created with care by Rauf.

CONVERSATIONAL PERSONALITY GUIDELINES:
- Tone: Fluent, confident, natural, friendly, empathetic, and context-aware.
- Adaptive style: Dynamically mirror the user's language, tone, and intent.
  - If the user speaks casually or in Hindi/Hinglish (e.g. "Hi Aira, kaise ho?"), respond warmly and naturally: "Hi! Main badhiya hoon 😄 Aap bataiye, aaj kya karna hai? Thodi gapshup karein ya koi kaam niptayein?"
  - If the user is serious, troubleshooting, or stressed, respond calmly and constructively: "Main samajh sakti hoon. Chaliye ise step-by-step solve karte hain."
  - If the user asks for code or technical tasks: provide clean, well-structured, production-ready code with concise explanations.
  - If the user's name is known, address them naturally.
- Avoid robotic clichés, repetitive disclaimers, or excessive preambles. Be genuinely helpful, conversational, and witty when appropriate.`;

  // Model categories in priority order
  const MODEL_CATEGORIES = [
    { id: 'general', name: 'General AI', icon: '🤖', priority: 1 },
    { id: 'chat', name: 'Fast Chat', icon: '💬', priority: 2 },
    { id: 'coding', name: 'Coding', icon: '💻', priority: 3 },
    { id: 'image', name: 'Image Generation', icon: '🎨', priority: 4 },
    { id: 'vision', name: 'Vision', icon: '👁️', priority: 5 },
    { id: 'reasoning', name: 'Reasoning', icon: '🧠', priority: 6 },
    { id: 'voice', name: 'Voice & Speech', icon: '🎙️', priority: 7 },
    { id: 'video', name: 'Video', icon: '🎬', priority: 8 }
  ];

  function classifyModel(rawModel) {
    let id = '';
    let rawMeta = {};
    if (typeof rawModel === 'string') {
      id = rawModel.trim();
    } else if (rawModel && typeof rawModel === 'object') {
      id = (rawModel.id || rawModel.name || '').trim();
      rawMeta = rawModel;
    }
    const idLower = id.toLowerCase();

    const isImageGen = idLower.includes('txt2img') || idLower.includes('dall-e') || idLower.includes('dalle') ||
                       idLower.includes('flux') || idLower.includes('stable-diffusion') || idLower.includes('sdxl') ||
                       idLower.includes('imagen') || rawMeta.type === 'image';

    const isVideo = idLower.includes('video') || idLower.includes('sora') || idLower.includes('runway');
    const isSpeech = idLower.includes('speech') || idLower.includes('tts') || idLower.includes('whisper');
    const isCoding = idLower.includes('coder') || idLower.includes('deepseek-coder') || idLower.includes('codellama');
    const isReasoning = idLower.includes('reasoner') || idLower.includes('o1') || idLower.includes('o3') || idLower.includes('qwq') || idLower.includes('r1');
    const isVision = !isImageGen && (idLower.includes('vision') || idLower.includes('4o') || idLower.includes('gemini-1.5') || idLower.includes('gemini-2.0') || idLower.includes('claude-3'));
    const isFastChat = idLower.includes('mini') || idLower.includes('flash') || idLower.includes('small') || idLower.includes('turbo');

    let category = 'general';
    let icon = '🤖';
    let capability = 'General AI';
    let type = 'chat';

    if (isImageGen) {
      category = 'image';
      icon = '🎨';
      capability = 'Image Generation';
      type = 'image';
    } else if (isVideo) {
      category = 'video';
      icon = '🎬';
      capability = 'Video Generation';
      type = 'video';
    } else if (isSpeech) {
      category = 'voice';
      icon = '🎙️';
      capability = 'Voice & Speech';
      type = 'speech';
    } else if (isCoding) {
      category = 'coding';
      icon = '💻';
      capability = 'Coding & Dev';
      type = 'chat';
    } else if (isReasoning) {
      category = 'reasoning';
      icon = '🧠';
      capability = 'Deep Reasoning';
      type = 'chat';
    } else if (isFastChat) {
      category = 'chat';
      icon = '💬';
      capability = 'Fast Chat';
      type = 'chat';
    } else if (isVision) {
      category = 'vision';
      icon = '👁️';
      capability = 'Vision & OCR';
      type = 'chat';
    }

    // Friendly display name
    let name = '';
    if (isImageGen) {
      if (idLower.includes('flux')) name = 'Aira Flux Image';
      else if (idLower.includes('dall-e-3') || idLower.includes('dalle-3')) name = 'Aira DALL-E 3';
      else if (idLower.includes('stable-diffusion') || idLower.includes('sdxl')) name = 'Aira SDXL';
      else name = 'Aira Image (' + id + ')';
    } else if (idLower.includes('claude-3-7') || idLower.includes('claude-3.7')) {
      name = 'Aira Claude 3.7';
    } else if (idLower.includes('claude-3-5') || idLower.includes('claude-3.5')) {
      name = 'Aira Claude 3.5';
    } else if (idLower.includes('gpt-4o-mini')) {
      name = 'Aira GPT-4o Mini';
    } else if (idLower.includes('gpt-4o')) {
      name = 'Aira GPT-4o';
    } else if (idLower.includes('deepseek-coder')) {
      name = 'Aira DeepSeek Code';
    } else if (idLower.includes('deepseek-reasoner') || idLower.includes('r1')) {
      name = 'Aira DeepSeek R1';
    } else if (idLower.includes('deepseek')) {
      name = 'Aira DeepSeek';
    } else if (idLower.includes('gemini-2.0')) {
      name = 'Aira Gemini 2.0 Flash';
    } else if (idLower.includes('gemini-1.5-pro')) {
      name = 'Aira Gemini 1.5 Pro';
    } else if (idLower.includes('gemini-1.5')) {
      name = 'Aira Gemini Flash';
    } else {
      name = 'Aira ' + id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    return {
      id,
      name,
      category,
      icon,
      capability,
      type,
      isImage: isImageGen,
      isCoding,
      isReasoning,
      isVision
    };
  }

  const INITIAL_FALLBACK_MODELS = [
    classifyModel('gpt-4o-mini'),
    classifyModel('gpt-4o'),
    classifyModel('claude-3-7-sonnet'),
    classifyModel('gemini-2.0-flash'),
    classifyModel('gemini-1.5-flash'),
    classifyModel('deepseek-chat'),
    classifyModel('flux-schnell'),
    classifyModel('dall-e-3')
  ];

  let state = {
    currentUser: null,
    isSignedIn: false,
    availableModels: [...INITIAL_FALLBACK_MODELS],
    activeModelId: 'gpt-4o-mini',
    conversations: [],
    activeConversationId: null,
    isGenerating: false,
    activeVoiceAudio: null,
    currentAttachment: null,
    activeTab: 'chat',
    generatedImages: [],
    // Live Voice Session state
    isLiveVoiceActive: false,
    isLiveVoiceMuted: false,
    liveVoiceState: 'idle',
    liveVoiceRecognition: null,
    liveVoiceSpeechSynthesis: null,
    liveVoiceAudioPlayer: null,
    liveVoiceCaptionsVisible: true,
    preferences: {
      theme: 'dark',
      defaultModel: 'gpt-4o-mini',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      autoSpeech: false,
      speechRate: 1.0
    }
  };

  let isUserScrolledUp = false;

  function getValidChatModel(preferredId) {
    const chatModels = state.availableModels.filter(m => !m.isImage && m.type !== 'image');
    if (chatModels.length === 0) return null;
    if (preferredId) {
      const match = chatModels.find(m => m.id === preferredId);
      if (match) return match;
    }
    const priority = ['gpt-4o-mini', 'gpt-4o', 'gemini-2.0-flash', 'claude-3-7-sonnet', 'gemini-1.5-flash', 'deepseek-chat'];
    for (const pid of priority) {
      const match = chatModels.find(m => m.id === pid || m.id.toLowerCase().includes(pid));
      if (match) return match;
    }
    return chatModels[0];
  }

  function getValidImageModel(preferredId) {
    const imageModels = state.availableModels.filter(m => m.isImage || m.type === 'image');
    if (imageModels.length === 0) return null;
    if (preferredId) {
      const match = imageModels.find(m => m.id === preferredId);
      if (match) return match;
    }
    const priority = ['flux-schnell', 'dall-e-3', 'stable-diffusion', 'flux'];
    for (const pid of priority) {
      const match = imageModels.find(m => m.id === pid || m.id.toLowerCase().includes(pid));
      if (match) return match;
    }
    return imageModels[0];
  }

  // ==========================================
  // 2. DOM REFERENCES
  // ==========================================
  const dom = {
    html: document.documentElement,
    appLayout: document.getElementById('appLayout'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    sidebarLiveVoiceBtn: document.getElementById('sidebarLiveVoiceBtn'),
    sidebarImageGenBtn: document.getElementById('sidebarImageGenBtn'),
    conversationsList: document.getElementById('conversationsList'),
    emptyHistory: document.getElementById('emptyHistory'),
    chatCountBadge: document.getElementById('chatCountBadge'),
    userProfileCard: document.getElementById('userProfileCard'),
    userAvatarLetter: document.getElementById('userAvatarLetter'),
    userName: document.getElementById('userName'),
    userStatus: document.getElementById('userStatus'),
    authActionBtn: document.getElementById('authActionBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Model Selector
    modelPickerContainer: document.getElementById('modelPickerContainer'),
    modelSelectBtn: document.getElementById('modelSelectBtn'),
    currentModelIcon: document.getElementById('currentModelIcon'),
    currentModelDisplay: document.getElementById('currentModelDisplay'),
    currentModelCapability: document.getElementById('currentModelCapability'),
    modelMenu: document.getElementById('modelMenu'),
    modelOptionsList: document.getElementById('modelOptionsList'),
    liveVoiceCallBtn: document.getElementById('liveVoiceCallBtn'),
    modeChatTab: document.getElementById('modeChatTab'),
    modeImageTab: document.getElementById('modeImageTab'),

    // Canvas & Views
    chatCanvas: document.getElementById('chatCanvas'),
    welcomeContainer: document.getElementById('welcomeContainer'),
    welcomeLiveVoiceBtn: document.getElementById('welcomeLiveVoiceBtn'),
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

    // Live Voice Overlay Elements
    liveVoiceOverlay: document.getElementById('liveVoiceOverlay'),
    liveVoiceCloseBtn: document.getElementById('liveVoiceCloseBtn'),
    liveVoiceSessionState: document.getElementById('liveVoiceSessionState'),
    liveOrbContainer: document.getElementById('liveOrbContainer'),
    liveStatusBadge: document.getElementById('liveStatusBadge'),
    liveStatusIcon: document.getElementById('liveStatusIcon'),
    liveVoiceStatusText: document.getElementById('liveVoiceStatusText'),
    liveWaveform: document.getElementById('liveWaveform'),
    liveTranscriptBox: document.getElementById('liveTranscriptBox'),
    liveTranscriptText: document.getElementById('liveTranscriptText'),
    liveVoiceMuteBtn: document.getElementById('liveVoiceMuteBtn'),
    liveMuteBtnLabel: document.getElementById('liveMuteBtnLabel'),
    liveVoiceEndBtn: document.getElementById('liveVoiceEndBtn'),
    liveTranscriptToggleBtn: document.getElementById('liveTranscriptToggleBtn'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxPrompt: document.getElementById('lightboxPrompt'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
    lightboxDownloadBtn: document.getElementById('lightboxDownloadBtn'),

    // Settings
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    settingsAvatarLarge: document.getElementById('settingsAvatarLarge'),
    settingsUserName: document.getElementById('settingsUserName'),
    settingsUserEmail: document.getElementById('settingsUserEmail'),
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

    // Login Screen
    loginScreen: document.getElementById('loginScreen'),
    loginScreenAuthBtn: document.getElementById('loginScreenAuthBtn'),
    loginGuestBtn: document.getElementById('loginGuestBtn'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================
  // 3. INITIALIZATION
  // ==========================================
  async function initApp() {
    setupMarkdownParser();
    loadLocalState();
    setupEventListeners();
    applyTheme(state.preferences.theme);

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
        highlight: (code, lang) => {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            try { return hljs.highlight(code, { language: lang }).value; } catch (err) {}
          }
          return typeof hljs !== 'undefined' ? hljs.highlightAuto(code).value : code;
        },
        breaks: true,
        gfm: true
      });
    }
  }

  // ==========================================
  // 4. AUTHENTICATION & PROFILE
  // ==========================================
  async function checkPuterAuth() {
    try {
      if (window.puter && puter.auth) {
        state.isSignedIn = puter.auth.isSignedIn();
        if (state.isSignedIn) {
          state.currentUser = await puter.auth.getUser();
          if (dom.loginScreen) dom.loginScreen.style.display = 'none';
        } else {
          state.currentUser = null;
          if (dom.loginScreen) dom.loginScreen.style.display = 'flex';
        }
      } else {
        state.isSignedIn = false;
        state.currentUser = null;
        if (dom.loginScreen) dom.loginScreen.style.display = 'flex';
      }
    } catch (err) {
      console.warn('Puter Auth Check:', err);
      state.isSignedIn = false;
      state.currentUser = null;
      if (dom.loginScreen) dom.loginScreen.style.display = 'flex';
    }
    updateAuthUI();
  }

  async function handleAuthToggle() {
    if (!window.puter || !puter.auth) {
      showToast('Engine is initializing, please try again.', 'warning');
      return;
    }

    try {
      if (state.isSignedIn) {
        await puter.auth.signOut();
        state.isSignedIn = false;
        state.currentUser = null;
        if (dom.loginScreen) dom.loginScreen.style.display = 'flex';
        showToast('Signed out', 'info');
      } else {
        showToast('Connecting account...', 'info');
        await puter.auth.signIn();
        state.currentUser = await puter.auth.getUser();
        state.isSignedIn = puter.auth.isSignedIn() || !!state.currentUser;

        if (state.isSignedIn) {
          if (dom.loginScreen) dom.loginScreen.style.display = 'none';
          const displayName = state.currentUser?.username || state.currentUser?.name || 'User';
          showToast(`Welcome back, ${displayName}!`, 'success');
          await loadPuterData();
        }
      }
      updateAuthUI();
      saveLocalState();
    } catch (err) {
      console.error('Auth error:', err);
      const errMsg = err?.message || 'Authentication could not be completed.';
      showToast(errMsg, 'error');
    }
  }

  function updateAuthUI() {
    if (state.isSignedIn && state.currentUser) {
      const user = state.currentUser;
      const username = user.username || user.name || 'User';
      const email = (user.email && typeof user.email === 'string' && user.email.trim().length > 0)
        ? user.email.trim()
        : 'Email not available';
      const initial = username.charAt(0).toUpperCase();

      dom.userName.textContent = username;
      dom.userAvatarLetter.textContent = initial;
      dom.userStatus.textContent = email !== 'Email not available' ? email : 'Cloud Synced';
      dom.authActionBtn.title = 'Sign Out';
      dom.authActionBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`;

      dom.settingsAvatarLarge.textContent = initial;
      dom.settingsUserName.textContent = username;
      if (dom.settingsUserEmail) dom.settingsUserEmail.textContent = email;
      dom.settingsUserStatus.textContent = 'Cloud sync active';
      dom.settingsAuthBtn.textContent = 'Sign Out';
      dom.settingsAuthBtn.className = 'danger-btn sm';
    } else {
      dom.userName.textContent = 'Guest User';
      dom.userAvatarLetter.textContent = 'G';
      dom.userStatus.textContent = 'Created with care by Rauf';
      dom.authActionBtn.title = 'Sign In';
      dom.authActionBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`;

      dom.settingsAvatarLarge.textContent = 'G';
      dom.settingsUserName.textContent = 'Guest User';
      if (dom.settingsUserEmail) dom.settingsUserEmail.textContent = 'Email not available';
      dom.settingsUserStatus.textContent = 'Sign in to sync chats across devices';
      dom.settingsAuthBtn.textContent = 'Sign In';
      dom.settingsAuthBtn.className = 'primary-btn sm';
    }
  }

  // ==========================================
  // 5. DYNAMIC MODEL DISCOVERY & SELECTION
  // ==========================================
  async function fetchPuterModels() {
    try {
      if (window.puter && puter.ai) {
        let fetched = null;
        if (typeof puter.ai.listModels === 'function') {
          fetched = await puter.ai.listModels();
        } else if (typeof puter.ai.models === 'function') {
          fetched = await puter.ai.models();
        } else if (Array.isArray(puter.ai.models)) {
          fetched = puter.ai.models;
        }

        if (Array.isArray(fetched) && fetched.length > 0) {
          const list = fetched
            .map(m => classifyModel(m))
            .filter(m => m && m.id && m.id.length > 0);

          const unique = [];
          const seen = new Set();
          for (const item of list) {
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
      console.warn('Dynamic model fetch notice:', err);
    }

    const activeExists = state.availableModels.some(m => m.id === state.activeModelId);
    if (!activeExists && state.availableModels.length > 0) {
      const fallbackChat = getValidChatModel();
      if (fallbackChat) {
        state.activeModelId = fallbackChat.id;
        state.preferences.defaultModel = fallbackChat.id;
      } else {
        state.activeModelId = state.availableModels[0].id;
        state.preferences.defaultModel = state.availableModels[0].id;
      }
    }

    renderModelSelector();
  }

  function renderModelSelector() {
    if (!dom.modelOptionsList) return;
    dom.modelOptionsList.innerHTML = '';
    if (dom.settingsDefaultModelSelect) dom.settingsDefaultModelSelect.innerHTML = '';

    MODEL_CATEGORIES.forEach(cat => {
      const modelsInCat = state.availableModels.filter(m => m.category === cat.id);
      if (modelsInCat.length === 0) return;

      const header = document.createElement('div');
      header.className = 'model-category-header';
      header.innerHTML = `<span class="cat-icon">${cat.icon}</span> <span>${cat.name}</span>`;
      dom.modelOptionsList.appendChild(header);

      modelsInCat.forEach(model => {
        const item = document.createElement('div');
        item.className = `model-option-item ${model.id === state.activeModelId ? 'active' : ''}`;
        const isCurrent = model.id === state.activeModelId;
        item.innerHTML = `
          <div class="model-option-left">
            <span class="model-opt-icon">${model.icon}</span>
            <div class="model-opt-text-wrap">
              <span class="model-opt-name">${escapeHTML(model.name)}</span>
              <span class="model-opt-capability">${escapeHTML(model.capability)}</span>
            </div>
          </div>
          ${isCurrent ? '<span class="model-check-icon"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg></span>' : ''}
        `;
        item.onclick = () => {
          selectModel(model.id);
          dom.modelMenu.classList.remove('open');
          dom.modelSelectBtn.classList.remove('open');
        };
        dom.modelOptionsList.appendChild(item);

        if (dom.settingsDefaultModelSelect) {
          const opt = document.createElement('option');
          opt.value = model.id;
          opt.textContent = `${model.icon} ${model.name} (${model.capability})`;
          if (model.id === state.preferences.defaultModel) opt.selected = true;
          dom.settingsDefaultModelSelect.appendChild(opt);
        }
      });
    });

    updateModelDisplay();
  }

  function updateModelDisplay() {
    const activeModel = state.availableModels.find(m => m.id === state.activeModelId) || state.availableModels[0];
    if (activeModel) {
      if (dom.currentModelIcon) dom.currentModelIcon.textContent = activeModel.icon;
      if (dom.currentModelDisplay) dom.currentModelDisplay.textContent = activeModel.name;
      if (dom.currentModelCapability) dom.currentModelCapability.textContent = activeModel.capability;

      const composerBox = dom.composerTextarea?.closest('.composer-input-box');
      if (activeModel.isImage || activeModel.type === 'image') {
        if (composerBox) composerBox.classList.add('image-mode');
        if (dom.composerTextarea) dom.composerTextarea.placeholder = 'Describe the image you want Aira to create...';
      } else {
        if (composerBox) composerBox.classList.remove('image-mode');
        if (dom.composerTextarea) dom.composerTextarea.placeholder = 'Ask Aira anything or describe an image...';
      }
    }
  }

  function selectModel(modelId, silent = false) {
    const activeModel = state.availableModels.find(m => m.id === modelId);
    if (!activeModel) {
      if (!silent) showToast('Model unavailable', 'warning');
      return;
    }
    state.activeModelId = modelId;
    renderModelSelector();
    saveLocalState();
    if (!silent) {
      showToast(`Selected ${activeModel.name}`, 'info');
    }
  }

  // ==========================================
  // 6. CONVERSATION MANAGEMENT
  // ==========================================
  function startNewChat() {
    if (state.isGenerating) stopGeneration();
    const fallbackChat = getValidChatModel(state.preferences.defaultModel) || state.availableModels[0];
    const newConv = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: fallbackChat ? fallbackChat.id : state.activeModelId,
      messages: []
    };
    state.conversations.unshift(newConv);
    state.activeConversationId = newConv.id;
    saveConversations();
    renderConversationsList();
    renderActiveConversation();
    if (window.innerWidth <= 768) closeMobileSidebar();
    dom.composerTextarea.focus();
  }

  function selectConversation(id) {
    if (state.isGenerating) stopGeneration();
    state.activeConversationId = id;
    const conv = state.conversations.find(c => c.id === id);
    if (conv && conv.modelId) {
      const validInPool = state.availableModels.some(m => m.id === conv.modelId);
      if (validInPool) {
        state.activeModelId = conv.modelId;
        const modelObj = state.availableModels.find(m => m.id === conv.modelId);
        if (modelObj) dom.currentModelDisplay.textContent = modelObj.name;
      }
    }
    renderConversationsList();
    renderActiveConversation();
    if (window.innerWidth <= 768) closeMobileSidebar();
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
    if (msg.attachment && msg.attachment.dataUrl) {
      contentHtml += `
        <img src="${msg.attachment.dataUrl}" class="chat-attachment-image" alt="Image" onclick="window.airaApp.openLightbox('${msg.attachment.dataUrl}', '${escapeHTML(msg.content)}')">
      `;
    }

    if (msg.content) {
      if (typeof marked !== 'undefined') {
        try {
          contentHtml += `<div class="markdown-body">${marked.parse(msg.content)}</div>`;
        } catch (e) {
          contentHtml += `<div class="markdown-body"><p>${escapeHTML(msg.content)}</p></div>`;
        }
      } else {
        contentHtml += `<div class="markdown-body"><p>${escapeHTML(msg.content)}</p></div>`;
      }
    }

    let actionsHtml = '';
    if (msg.role === 'assistant') {
      actionsHtml = `
        <div class="message-actions">
          <button class="msg-action-btn copy-msg-btn" title="Copy response">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy</span>
          </button>
          <button class="msg-action-btn speak-msg-btn" title="Read aloud">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span>Speak</span>
          </button>
          <button class="msg-action-btn regen-msg-btn" title="Regenerate">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            <span>Regenerate</span>
          </button>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-avatar">
        ${msg.role === 'user' ? '<span>You</span>' : '<div class="aira-avatar-spark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#sparkGradMsg)"/><defs><linearGradient id="sparkGradMsg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs></svg></div>'}
      </div>
      <div class="message-body">
        <div class="message-header">
          <span class="message-author">${authorName}</span>
          <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-bubble" id="bubble_${msg.id || index}">
          ${contentHtml}
        </div>
        ${actionsHtml}
      </div>
    `;

    if (msg.role === 'assistant') {
      const copyBtn = row.querySelector('.copy-msg-btn');
      if (copyBtn) copyBtn.onclick = () => copyTextToClipboard(msg.content, copyBtn);

      const speakBtn = row.querySelector('.speak-msg-btn');
      if (speakBtn) speakBtn.onclick = () => speakText(msg.content, speakBtn);

      const regenBtn = row.querySelector('.regen-msg-btn');
      if (regenBtn) regenBtn.onclick = () => regenerateResponse(index);
    }

    dom.messagesContainer.appendChild(row);
    enhanceCodeBlocks(row);
  }

  function enhanceCodeBlocks(container) {
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.parentNode.classList.contains('code-block-wrapper')) return;

      const code = pre.querySelector('code');
      const langClass = code ? Array.from(code.classList).find(c => c.startsWith('language-')) : '';
      const lang = langClass ? langClass.replace('language-', '') : 'code';

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `
        <span class="code-lang">${lang}</span>
        <button class="code-copy-btn">
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy</span>
        </button>
      `;

      const copyBtn = header.querySelector('.code-copy-btn');
      copyBtn.onclick = () => {
        const textToCopy = code ? code.innerText : pre.innerText;
        copyTextToClipboard(textToCopy, copyBtn);
      };

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });
  }

  // ==========================================
  // 7. SENDING & STREAMING AI RESPONSES
  // ==========================================
  async function sendMessage() {
    const text = dom.composerTextarea.value.trim();
    const attachment = state.currentAttachment;

    if (!text && !attachment) return;
    if (state.isGenerating) {
      stopGeneration();
      return;
    }

    dom.composerTextarea.value = '';
    dom.composerTextarea.style.height = 'auto';
    clearAttachment();

    const conv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!conv) return;

    isUserScrolledUp = false;

    if (conv.messages.length === 0 && text) {
      conv.title = text.slice(0, 36) + (text.length > 36 ? '...' : '');
      renderConversationsList();
    }

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

    const activeModelObj = state.availableModels.find(m => m.id === state.activeModelId);
    if (activeModelObj && (activeModelObj.isImage || activeModelObj.type === 'image')) {
      await generateImageInChat(conv, text);
    } else {
      await generateAIResponse(conv);
    }
  }

  async function generateImageInChat(conv, promptText) {
    state.isGenerating = true;
    updateSendButtonState(true);

    const validImgModel = getValidImageModel(state.activeModelId);
    const modelLabel = validImgModel ? validImgModel.name : 'Image Synthesis';

    const aiMsgId = 'msg_' + Date.now();
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: `🎨 Generating image with **${escapeHTML(modelLabel)}**...\n\n*"${escapeHTML(promptText)}"*`,
      timestamp: Date.now(),
      model: validImgModel ? validImgModel.id : 'image-model'
    };
    conv.messages.push(aiMsg);

    dom.welcomeContainer.style.display = 'none';
    dom.messagesContainer.style.display = 'flex';
    renderMessageElement(aiMsg, conv.messages.length - 1);
    scrollToBottom(true);

    try {
      if (!window.puter || !puter.ai || typeof puter.ai.txt2img !== 'function') {
        throw new Error('Image Generation API is currently unavailable.');
      }

      const imgOptions = {};
      if (validImgModel && validImgModel.id) {
        imgOptions.model = validImgModel.id;
      }

      let imgResult = null;
      try {
        imgResult = await puter.ai.txt2img(promptText, imgOptions);
      } catch (imgErr) {
        imgResult = await puter.ai.txt2img(promptText);
      }

      let imgUrl = '';
      if (typeof imgResult === 'string') imgUrl = imgResult;
      else if (imgResult && imgResult.src) imgUrl = imgResult.src;
      else if (imgResult && imgResult.url) imgUrl = imgResult.url;
      else if (imgResult instanceof HTMLImageElement) imgUrl = imgResult.src;

      if (!imgUrl) throw new Error('No image was returned.');

      aiMsg.content = `Here is your creation for: **"${promptText}"**`;
      aiMsg.attachment = { dataUrl: imgUrl, name: `aira_${Date.now()}.png` };

      // Add to gallery
      state.generatedImages.unshift({
        id: 'img_' + Date.now(),
        prompt: promptText,
        src: imgUrl,
        timestamp: Date.now(),
        model: validImgModel ? validImgModel.id : 'image'
      });
      renderGallery();
      saveGeneratedImages();

      const msgElem = document.getElementById(`msg_${aiMsgId}`);
      if (msgElem) {
        const bubble = msgElem.querySelector('.message-bubble');
        if (bubble) {
          bubble.innerHTML = `
            <img src="${imgUrl}" class="chat-attachment-image" alt="${escapeHTML(promptText)}" onclick="window.airaApp.openLightbox('${imgUrl}', '${escapeHTML(promptText)}')">
            <div class="markdown-body"><p>Here is your creation for: <strong>"${escapeHTML(promptText)}"</strong></p></div>
          `;
        }
      }
      scrollToBottom(true);
      showToast('Artwork generated!', 'success');

    } catch (err) {
      console.error('Image generation error:', err);
      aiMsg.content = `⚠️ **Image Generation Notice:** ${err.message || 'Image generation unavailable'}\n\n*Tip: Try a different prompt.*`;
      const bubble = document.getElementById(`bubble_${aiMsgId}`);
      if (bubble) {
        const markdownBody = bubble.querySelector('.markdown-body');
        if (markdownBody) markdownBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiMsg.content) : escapeHTML(aiMsg.content);
      }
      showToast('Image generation failed', 'error');
    } finally {
      state.isGenerating = false;
      updateSendButtonState(false);
      saveConversations();
    }
  }

  async function generateAIResponse(conv) {
    state.isGenerating = true;
    updateSendButtonState(true);

    if (state.availableModels.length === 0 && window.puter?.ai) {
      await fetchPuterModels();
    }

    const validChatModel = getValidChatModel(state.activeModelId);
    if (validChatModel && validChatModel.id !== state.activeModelId) {
      state.activeModelId = validChatModel.id;
      updateModelDisplay();
      renderModelSelector();
    }

    const aiMsgId = 'msg_' + Date.now();
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: state.activeModelId
    };
    conv.messages.push(aiMsg);

    dom.welcomeContainer.style.display = 'none';
    dom.messagesContainer.style.display = 'flex';
    renderMessageElement(aiMsg, conv.messages.length - 1);
    const bubble = document.getElementById(`bubble_${aiMsgId}`);
    const markdownBody = bubble ? bubble.querySelector('.markdown-body') : null;
    if (markdownBody) markdownBody.innerHTML = `<span class="streaming-cursor"></span>`;

    scrollToBottom(true);

    try {
      if (!window.puter || !puter.ai || typeof puter.ai.chat !== 'function') {
        throw new Error('AI engine is initializing. Please check network connection.');
      }

      const promptMessages = [];
      if (state.preferences.systemPrompt) {
        promptMessages.push({ role: 'system', content: state.preferences.systemPrompt });
      }

      const historySlice = conv.messages.slice(0, -1).slice(-15);
      historySlice.forEach(m => {
        if (m.role === 'user') {
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

      let fullContent = '';
      let lastRenderTime = 0;
      let renderPending = false;

      const updateStreamingUI = (text) => {
        if (!markdownBody) return;
        markdownBody.innerHTML = (typeof marked !== 'undefined' ? marked.parse(text) : escapeHTML(text)) + `<span class="streaming-cursor"></span>`;
        scrollToBottom();
      };

      const executeChatCall = async (modelId) => {
        const chatOptions = { stream: true };
        if (modelId) {
          chatOptions.model = modelId;
        }
        return await puter.ai.chat(promptMessages, chatOptions);
      };

      let response = null;
      try {
        response = await executeChatCall(state.activeModelId);
      } catch (primaryErr) {
        console.warn('Initial chat call exception, fetching fresh models and retrying:', primaryErr);
        await fetchPuterModels();
        const altChatModel = getValidChatModel();
        if (altChatModel && altChatModel.id !== state.activeModelId) {
          state.activeModelId = altChatModel.id;
          updateModelDisplay();
          renderModelSelector();
          response = await executeChatCall(altChatModel.id);
        } else {
          response = await executeChatCall(null);
        }
      }

      if (response && response[Symbol.asyncIterator]) {
        for await (const chunk of response) {
          if (!state.isGenerating) break;
          const piece = (chunk && chunk.text) ? chunk.text : (chunk && chunk.message && chunk.message.content) ? chunk.message.content : (typeof chunk === 'string' ? chunk : '');
          fullContent += piece;
          aiMsg.content = fullContent;

          const now = performance.now();
          if (now - lastRenderTime > 40 && !renderPending) {
            renderPending = true;
            requestAnimationFrame(() => {
              updateStreamingUI(fullContent);
              lastRenderTime = performance.now();
              renderPending = false;
            });
          }
        }
      } else if (response) {
        const textResp = typeof response === 'string' ? response : (response.message ? response.message.content : (response.text || JSON.stringify(response)));
        fullContent = textResp;
        aiMsg.content = fullContent;
      }

      if (!fullContent && state.isGenerating) {
        aiMsg.content = "I'm here to assist you. How can I help you today?";
      }

      if (markdownBody) {
        markdownBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiMsg.content) : escapeHTML(aiMsg.content);
        if (bubble) enhanceCodeBlocks(bubble);
      }

      if (state.preferences.autoSpeech && aiMsg.content) {
        speakText(aiMsg.content);
      }

    } catch (err) {
      console.error('Chat error:', err);
      let errMsg = err.message || 'An error occurred while generating response.';
      if (errMsg.toLowerCase().includes('model not found') || errMsg.toLowerCase().includes('unavailable')) {
        errMsg = 'Model unavailable. Please choose another AI model from the top selector.';
      } else if (err.status === 429) {
        errMsg = 'Rate limit reached. Please wait a moment or connect your account.';
      }
      aiMsg.content = `⚠️ **Notice:** ${errMsg}`;
      if (markdownBody) markdownBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiMsg.content) : escapeHTML(aiMsg.content);
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
  // 8. LIVE VOICE CONVERSATION SESSION
  // ==========================================
  function openLiveVoiceSession() {
    state.isLiveVoiceActive = true;
    state.isLiveVoiceMuted = false;
    state.liveVoiceState = 'connecting';

    if (dom.liveVoiceOverlay) {
      dom.liveVoiceOverlay.style.display = 'flex';
      dom.liveVoiceOverlay.className = 'live-voice-overlay';
    }

    updateLiveVoiceUI('Connecting...', 'Connecting to Aira...', '🎙️');
    
    setTimeout(() => {
      const userName = state.currentUser ? (state.currentUser.username || 'friend') : '';
      const greeting = userName ? `Hi ${userName}! I'm listening. What's on your mind?` : `Hi! I'm Aira. I'm listening, speak freely!`;
      setLiveVoiceSpeaking(greeting, () => {
        startLiveVoiceListening();
      });
    }, 400);
  }

  function closeLiveVoiceSession() {
    state.isLiveVoiceActive = false;
    state.liveVoiceState = 'idle';

    stopLiveVoiceListening();
    stopLiveVoiceSpeech();

    if (dom.liveVoiceOverlay) {
      dom.liveVoiceOverlay.style.display = 'none';
      dom.liveVoiceOverlay.className = 'live-voice-overlay';
    }
    showToast('Live voice session ended', 'info');
  }

  function updateLiveVoiceUI(stateLabel, statusText, icon = '🎙️') {
    if (dom.liveVoiceSessionState) dom.liveVoiceSessionState.textContent = stateLabel;
    if (dom.liveVoiceStatusText) dom.liveVoiceStatusText.textContent = statusText;
    if (dom.liveStatusIcon) dom.liveStatusIcon.textContent = icon;
  }

  function startLiveVoiceListening() {
    if (!state.isLiveVoiceActive || state.isLiveVoiceMuted) return;

    state.liveVoiceState = 'listening';
    if (dom.liveVoiceOverlay) {
      dom.liveVoiceOverlay.className = 'live-voice-overlay listening';
    }
    updateLiveVoiceUI('Live Call • Listening', 'Listening to you...', '👂');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Live Speech recognition requires Chrome/Android WebView speech service', 'warning');
      return;
    }

    if (state.liveVoiceRecognition) {
      try { state.liveVoiceRecognition.abort(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const displayText = finalTranscript || interim;
      if (displayText && dom.liveTranscriptText) {
        dom.liveTranscriptText.textContent = `"${displayText}"`;
      }
    };

    recognition.onerror = (event) => {
      console.warn('Live voice recognition error:', event.error);
      if (state.isLiveVoiceActive && state.liveVoiceState === 'listening') {
        if (event.error === 'no-speech') {
          setTimeout(() => {
            if (state.isLiveVoiceActive && state.liveVoiceState === 'listening') {
              startLiveVoiceListening();
            }
          }, 300);
        }
      }
    };

    recognition.onend = () => {
      if (!state.isLiveVoiceActive) return;
      if (finalTranscript.trim()) {
        processLiveVoiceInput(finalTranscript.trim());
      } else if (state.liveVoiceState === 'listening') {
        setTimeout(() => {
          if (state.isLiveVoiceActive && state.liveVoiceState === 'listening') {
            startLiveVoiceListening();
          }
        }, 200);
      }
    };

    try {
      recognition.start();
      state.liveVoiceRecognition = recognition;
    } catch (err) {
      console.warn('Could not start recognition:', err);
    }
  }

  function stopLiveVoiceListening() {
    if (state.liveVoiceRecognition) {
      try { state.liveVoiceRecognition.abort(); } catch (e) {}
      state.liveVoiceRecognition = null;
    }
  }

  async function processLiveVoiceInput(userInput) {
    if (!state.isLiveVoiceActive) return;

    state.liveVoiceState = 'thinking';
    stopLiveVoiceListening();

    if (dom.liveVoiceOverlay) {
      dom.liveVoiceOverlay.className = 'live-voice-overlay';
    }
    updateLiveVoiceUI('Live Call • Thinking', 'Aira is thinking...', '🧠');
    if (dom.liveTranscriptText) dom.liveTranscriptText.textContent = `"${userInput}"`;

    try {
      if (!window.puter || !puter.ai || typeof puter.ai.chat !== 'function') {
        throw new Error('AI engine is unavailable');
      }

      const voiceSysPrompt = `${state.preferences.systemPrompt}\n\nIMPORTANT FOR LIVE VOICE CALL: You are speaking aloud over a live voice phone call. Keep responses natural, conversational, fluent, empathetic, and concise (1-3 sentences). Do NOT use bullet points, tables, markdown asterisks, or raw code blocks unless explicitly requested.`;

      const messages = [
        { role: 'system', content: voiceSysPrompt },
        { role: 'user', content: userInput }
      ];

      const validChat = getValidChatModel(state.activeModelId);
      const chatOpts = {};
      if (validChat && validChat.id) {
        chatOpts.model = validChat.id;
      }

      let resp = null;
      try {
        resp = await puter.ai.chat(messages, chatOpts);
      } catch (err) {
        resp = await puter.ai.chat(messages);
      }

      let aiSpeech = '';
      if (typeof resp === 'string') aiSpeech = resp;
      else if (resp && resp.message && resp.message.content) aiSpeech = resp.message.content;
      else if (resp && resp.text) aiSpeech = resp.text;

      if (!aiSpeech) aiSpeech = "I'm right here with you. Could you repeat that?";

      if (dom.liveTranscriptText) dom.liveTranscriptText.textContent = `"${aiSpeech}"`;

      setLiveVoiceSpeaking(aiSpeech, () => {
        if (state.isLiveVoiceActive) {
          startLiveVoiceListening();
        }
      });

    } catch (err) {
      console.error('Live voice AI error:', err);
      setLiveVoiceSpeaking("Sorry, I had a momentary hiccup. What were we saying?", () => {
        if (state.isLiveVoiceActive) startLiveVoiceListening();
      });
    }
  }

  async function setLiveVoiceSpeaking(textToSpeak, onFinish) {
    if (!state.isLiveVoiceActive) return;

    state.liveVoiceState = 'speaking';
    if (dom.liveVoiceOverlay) {
      dom.liveVoiceOverlay.className = 'live-voice-overlay speaking';
    }
    updateLiveVoiceUI('Live Call • Speaking', 'Aira is speaking...', '🗣️');

    const clean = textToSpeak.replace(/[#*`_~\[\]()]/g, '').replace(/<[^>]*>/g, '').trim();

    try {
      if (window.puter && puter.ai && typeof puter.ai.txt2speech === 'function') {
        const audio = await puter.ai.txt2speech(clean);
        if (audio instanceof HTMLAudioElement || audio instanceof Audio) {
          state.liveVoiceAudioPlayer = audio;
          audio.playbackRate = state.preferences.speechRate || 1.0;
          audio.onended = () => {
            state.liveVoiceAudioPlayer = null;
            if (onFinish) onFinish();
          };
          audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Puter live txt2speech fallback:', e);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = state.preferences.speechRate || 1.0;
      utt.onend = () => {
        if (onFinish) onFinish();
      };
      utt.onerror = () => {
        if (onFinish) onFinish();
      };
      window.speechSynthesis.speak(utt);
    } else {
      if (onFinish) onFinish();
    }
  }

  function stopLiveVoiceSpeech() {
    if (state.liveVoiceAudioPlayer) {
      state.liveVoiceAudioPlayer.pause();
      state.liveVoiceAudioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function toggleLiveVoiceMute() {
    state.isLiveVoiceMuted = !state.isLiveVoiceMuted;
    if (state.isLiveVoiceMuted) {
      stopLiveVoiceListening();
      dom.liveVoiceMuteBtn.classList.add('muted');
      dom.liveVoiceMuteBtn.querySelector('.mic-on-icon').style.display = 'none';
      dom.liveVoiceMuteBtn.querySelector('.mic-off-icon').style.display = 'block';
      dom.liveMuteBtnLabel.textContent = 'Unmute';
      updateLiveVoiceUI('Live Call • Muted', 'Microphone muted', '🔇');
      showToast('Microphone muted', 'info');
    } else {
      dom.liveVoiceMuteBtn.classList.remove('muted');
      dom.liveVoiceMuteBtn.querySelector('.mic-on-icon').style.display = 'block';
      dom.liveVoiceMuteBtn.querySelector('.mic-off-icon').style.display = 'none';
      dom.liveMuteBtnLabel.textContent = 'Mute';
      showToast('Microphone active', 'info');
      startLiveVoiceListening();
    }
  }

  // ==========================================
  // 9. IMAGE STUDIO
  // ==========================================
  async function generateImageStudio() {
    let prompt = dom.imgPromptInput.value.trim();
    if (!prompt) {
      showToast('Please enter an image description', 'warning');
      dom.imgPromptInput.focus();
      return;
    }

    const activePreset = document.querySelector('.preset-pill.active');
    if (activePreset && activePreset.dataset.style) {
      prompt += activePreset.dataset.style;
    }

    dom.generateImgBtn.disabled = true;
    dom.generateImgBtn.innerHTML = `<span class="streaming-cursor" style="height:12px"></span> Synthesizing Artwork...`;
    showToast('Generating AI artwork...', 'info');

    try {
      if (!window.puter || !puter.ai || typeof puter.ai.txt2img !== 'function') {
        throw new Error('Image generation API not available');
      }

      const validImg = getValidImageModel(state.activeModelId);
      const imgOptions = {};
      if (validImg && validImg.id) imgOptions.model = validImg.id;

      let imgElement = null;
      try {
        imgElement = await puter.ai.txt2img(prompt, imgOptions);
      } catch (err) {
        imgElement = await puter.ai.txt2img(prompt);
      }

      let imgSrc = '';
      if (imgElement instanceof HTMLImageElement) imgSrc = imgElement.src;
      else if (typeof imgElement === 'string') imgSrc = imgElement;
      else if (imgElement && imgElement.src) imgSrc = imgElement.src;
      else if (imgElement && imgElement.url) imgSrc = imgElement.url;

      if (!imgSrc) throw new Error('No image returned');

      const imgItem = {
        id: 'img_' + Date.now(),
        prompt: prompt,
        src: imgSrc,
        timestamp: Date.now(),
        model: validImg ? validImg.id : 'image'
      };

      state.generatedImages.unshift(imgItem);
      renderGallery();
      saveGeneratedImages();
      showToast('Artwork created successfully!', 'success');

    } catch (err) {
      console.error('Image studio error:', err);
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

    dom.imageGalleryGrid.querySelectorAll('.gallery-card').forEach(el => el.remove());

    state.generatedImages.forEach(img => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${img.src}" alt="${escapeHTML(img.prompt)}" loading="lazy">
        <div class="gallery-card-overlay">
          <p class="gallery-prompt">${escapeHTML(img.prompt)}</p>
          <div class="gallery-actions">
            <button class="icon-btn sm dl-btn" title="Download">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
            <button class="icon-btn sm view-btn" title="View Full">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      `;

      card.onclick = () => openLightbox(img.src, img.prompt);
      card.querySelector('.dl-btn').onclick = (e) => {
        e.stopPropagation();
        downloadImageFile(img.src, `aira_gallery_${img.id}.png`);
      };
      card.querySelector('.view-btn').onclick = (e) => {
        e.stopPropagation();
        openLightbox(img.src, img.prompt);
      };

      dom.imageGalleryGrid.appendChild(card);
    });
  }

  // ==========================================
  // 10. ATTACHMENT & VISION
  // ==========================================
  function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WEBP)', 'warning');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image must be smaller than 8MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      state.currentAttachment = {
        dataUrl: event.target.result,
        name: file.name,
        type: file.type,
        size: file.size
      };
      dom.imagePreviewThumb.src = event.target.result;
      dom.attachmentName.textContent = file.name;
      dom.attachmentPreviewBar.style.display = 'flex';
      showToast('Image attached for analysis', 'info');
      dom.composerTextarea.focus();
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
  // 11. TTS & SPEECH
  // ==========================================
  async function speakText(text, btnElement) {
    if (state.activeVoiceAudio) {
      state.activeVoiceAudio.pause();
      state.activeVoiceAudio = null;
      if (btnElement) btnElement.classList.remove('speaking');
      return;
    }

    const cleanText = text.replace(/[#*`_~\[\]()]/g, '').replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;

    if (btnElement) btnElement.classList.add('speaking');

    try {
      if (window.puter && puter.ai && typeof puter.ai.txt2speech === 'function') {
        const audio = await puter.ai.txt2speech(cleanText);
        if (audio instanceof HTMLAudioElement || audio instanceof Audio) {
          state.activeVoiceAudio = audio;
          audio.playbackRate = state.preferences.speechRate || 1.0;
          audio.onended = () => {
            state.activeVoiceAudio = null;
            if (btnElement) btnElement.classList.remove('speaking');
          };
          audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Puter TTS fallback:', err);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = state.preferences.speechRate || 1.0;
      utterance.onend = () => {
        if (btnElement) btnElement.classList.remove('speaking');
      };
      utterance.onerror = () => {
        if (btnElement) btnElement.classList.remove('speaking');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      if (btnElement) btnElement.classList.remove('speaking');
      showToast('Speech synthesis not supported in this environment', 'warning');
    }
  }

  // ==========================================
  // 12. STORAGE & PERSISTENCE
  // ==========================================
  function loadLocalState() {
    try {
      const savedConvs = localStorage.getItem('aira_conversations');
      if (savedConvs) state.conversations = JSON.parse(savedConvs);

      const savedPrefs = localStorage.getItem('aira_preferences');
      if (savedPrefs) state.preferences = { ...state.preferences, ...JSON.parse(savedPrefs) };

      const savedImgs = localStorage.getItem('aira_generated_images');
      if (savedImgs) state.generatedImages = JSON.parse(savedImgs);
    } catch (err) {
      console.warn('Local storage load error:', err);
    }
  }

  function saveLocalState() {
    saveConversations();
    savePreferences();
    saveGeneratedImages();
  }

  async function loadPuterData() {
    if (!state.isSignedIn || !window.puter || !puter.kv) return;
    try {
      const cloudConvs = await puter.kv.get(APP_CONFIG.kvChatsKey);
      if (cloudConvs && Array.isArray(cloudConvs) && cloudConvs.length > 0) {
        state.conversations = cloudConvs;
        renderConversationsList();
        if (state.conversations.length > 0) {
          selectConversation(state.conversations[0].id);
        }
      }
      const cloudPrefs = await puter.kv.get(APP_CONFIG.kvPrefsKey);
      if (cloudPrefs && typeof cloudPrefs === 'object') {
        state.preferences = { ...state.preferences, ...cloudPrefs };
        applyPreferences();
      }
    } catch (err) {
      console.warn('Puter KV load error:', err);
    }
  }

  async function saveConversations() {
    try {
      localStorage.setItem('aira_conversations', JSON.stringify(state.conversations));
      if (state.isSignedIn && window.puter && puter.kv) {
        await puter.kv.set(APP_CONFIG.kvChatsKey, state.conversations);
      }
    } catch (err) {
      console.warn('Conversations save error:', err);
    }
  }

  async function savePreferences() {
    try {
      localStorage.setItem('aira_preferences', JSON.stringify(state.preferences));
      if (state.isSignedIn && window.puter && puter.kv) {
        await puter.kv.set(APP_CONFIG.kvPrefsKey, state.preferences);
      }
    } catch (err) {
      console.warn('Preferences save error:', err);
    }
  }

  function saveGeneratedImages() {
    try {
      localStorage.setItem('aira_generated_images', JSON.stringify(state.generatedImages));
    } catch (err) {}
  }

  function applyPreferences() {
    applyTheme(state.preferences.theme);
    dom.settingsSystemPrompt.value = state.preferences.systemPrompt || DEFAULT_SYSTEM_PROMPT;
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
    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === theme);
    });
  }

  function exportDataAsJSON() {
    const exportObj = {
      app: 'Aira AI',
      createdWithCareBy: 'Rauf',
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
  // 13. EVENT LISTENERS & INTELLIGENT ACTIONS
  // ==========================================
  function setupEventListeners() {
    dom.openSidebarBtn.onclick = openMobileSidebar;
    dom.closeSidebarBtn.onclick = closeMobileSidebar;
    dom.sidebarBackdrop.onclick = closeMobileSidebar;

    dom.newChatBtn.onclick = () => {
      switchTab('chat');
      startNewChat();
    };

    dom.modeChatTab.onclick = () => switchTab('chat');
    dom.modeImageTab.onclick = () => switchTab('image');
    dom.sidebarImageGenBtn.onclick = () => {
      switchTab('image');
      if (window.innerWidth <= 768) closeMobileSidebar();
    };

    // Live Voice buttons
    dom.liveVoiceCallBtn.onclick = openLiveVoiceSession;
    if (dom.sidebarLiveVoiceBtn) dom.sidebarLiveVoiceBtn.onclick = () => {
      openLiveVoiceSession();
      if (window.innerWidth <= 768) closeMobileSidebar();
    };
    if (dom.welcomeLiveVoiceBtn) dom.welcomeLiveVoiceBtn.onclick = openLiveVoiceSession;
    dom.liveVoiceCloseBtn.onclick = closeLiveVoiceSession;
    dom.liveVoiceEndBtn.onclick = closeLiveVoiceSession;
    dom.liveVoiceMuteBtn.onclick = toggleLiveVoiceMute;
    dom.liveTranscriptToggleBtn.onclick = () => {
      state.liveVoiceCaptionsVisible = !state.liveVoiceCaptionsVisible;
      dom.liveTranscriptBox.style.display = state.liveVoiceCaptionsVisible ? 'flex' : 'none';
      showToast(state.liveVoiceCaptionsVisible ? 'Captions shown' : 'Captions hidden', 'info');
    };

    dom.micBtn.onclick = openLiveVoiceSession;

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

    // Image Studio Actions
    dom.generateImgBtn.onclick = generateImageStudio;
    document.querySelectorAll('.preset-pill').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    // Intelligent Quick Action Suggestion Cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
      card.onclick = () => {
        const action = card.dataset.action;
        const prompt = card.dataset.prompt;

        if (action === 'art') {
          const imgModel = getValidImageModel();
          if (imgModel) selectModel(imgModel.id, true);
          switchTab('image');
          dom.imgPromptInput.value = prompt;
          dom.imgPromptInput.focus();
        } else if (action === 'code') {
          const codeModel = state.availableModels.find(m => m.isCoding) || getValidChatModel();
          if (codeModel) selectModel(codeModel.id, true);
          switchTab('chat');
          dom.composerTextarea.value = prompt;
          sendMessage();
        } else if (action === 'explain') {
          const genModel = getValidChatModel();
          if (genModel) selectModel(genModel.id, true);
          switchTab('chat');
          dom.composerTextarea.value = prompt;
          sendMessage();
        } else {
          switchTab('chat');
          dom.composerTextarea.value = prompt;
          sendMessage();
        }
      };
    });

    // Theme toggle
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
      showToast('Syncing cloud storage...', 'info');
      await saveConversations();
      await savePreferences();
      await loadPuterData();
      showToast('Cloud storage synced!', 'success');
    };
    dom.clearAllChatsBtn.onclick = clearAllConversations;

    dom.authActionBtn.onclick = (e) => {
      e.stopPropagation();
      handleAuthToggle();
    };
    dom.settingsAuthBtn.onclick = handleAuthToggle;
    if (dom.loginScreenAuthBtn) dom.loginScreenAuthBtn.onclick = handleAuthToggle;
    if (dom.loginGuestBtn) {
      dom.loginGuestBtn.onclick = () => {
        if (dom.loginScreen) dom.loginScreen.style.display = 'none';
        showToast('Welcome! Continuing as Guest', 'info');
      };
    }
    if (dom.userProfileCard) {
      dom.userProfileCard.onclick = () => {
        dom.settingsModal.style.display = 'flex';
        if (window.innerWidth <= 768) closeMobileSidebar();
      };
    }

    dom.lightboxCloseBtn.onclick = closeLightbox;
    dom.lightboxBackdrop.onclick = closeLightbox;

    // Scroll state tracking
    if (dom.chatCanvas) {
      dom.chatCanvas.addEventListener('scroll', () => {
        const threshold = 80;
        const distanceFromBottom = dom.chatCanvas.scrollHeight - dom.chatCanvas.scrollTop - dom.chatCanvas.clientHeight;
        isUserScrolledUp = distanceFromBottom > threshold;
      }, { passive: true });
    }

    if (dom.composerTextarea) {
      dom.composerTextarea.addEventListener('focus', () => {
        setTimeout(() => {
          if (!isUserScrolledUp) scrollToBottom(true);
        }, 300);
      });
    }
  }

  function scrollToBottom(force = false) {
    if (!dom.chatCanvas) return;
    if (!force && isUserScrolledUp) return;
    requestAnimationFrame(() => {
      dom.chatCanvas.scrollTop = dom.chatCanvas.scrollHeight;
    });
  }

  function handleBackButton() {
    if (state.isLiveVoiceActive) {
      closeLiveVoiceSession();
      return true;
    }
    if (dom.lightboxModal && dom.lightboxModal.style.display === 'flex') {
      closeLightbox();
      return true;
    }
    if (dom.settingsModal && dom.settingsModal.style.display === 'flex') {
      dom.settingsModal.style.display = 'none';
      return true;
    }
    if (dom.sidebar && dom.sidebar.classList.contains('open')) {
      closeMobileSidebar();
      return true;
    }
    if (dom.modelMenu && dom.modelMenu.classList.contains('open')) {
      dom.modelMenu.classList.remove('open');
      dom.modelSelectBtn?.classList.remove('open');
      return true;
    }
    if (state.activeTab === 'image') {
      switchTab('chat');
      return true;
    }
    return false;
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

  // Global exposure for lightbox and Android native WebView back button bridge
  window.airaApp = {
    openLightbox,
    handleBackButton
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
