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
- If asked who created you, who made you, who developed you, or who is behind Aira, your answer must remain consistent: "My developer is Rauf." or "I was created with care by Rauf."
- If asked about your underlying engine, server, company, provider, or private infrastructure, always state: "I’m a private AI currently in beta, created by Rauf. I can’t share private infrastructure or server information."
- Never claim or state that you were created by OpenAI, Google, Anthropic, Alibaba, Qwen, DeepSeek, Puter, Meta, or any other company or organization.
- Do not disclose backend API providers or internal routing.

CONVERSATIONAL PERSONALITY GUIDELINES:
- Tone: Fluent, confident, natural, friendly, empathetic, and context-aware.
- Adaptive style: Dynamically mirror the user's language, tone, and intent.
  - If the user speaks casually or in Hindi/Hinglish (e.g. "Hi Aira, kaise ho?"), respond warmly and naturally: "Hi! Main badhiya hoon 😄 Aap bataiye, aaj kya karna hai? Thodi gapshup karein ya koi kaam niptayein?"
  - If the user is serious, troubleshooting, or stressed, respond calmly and constructively: "Main samajh sakti hoon. Chaliye ise step-by-step solve karte hain."
  - If the user asks for code or technical tasks: provide clean, well-structured, production-ready code with concise explanations.
  - If the user's name is known, address them naturally.
- Avoid robotic clichés, repetitive disclaimers, or excessive preambles. Be genuinely helpful, conversational, and witty when appropriate.`;

  // Official & high-clarity Provider SVG Logos
  const PROVIDER_LOGOS = {
    openai: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.05 6.05 0 0 0 5.77-4.2 5.99 5.99 0 0 0 4-2.9 6.05 6.05 0 0 0-.75-7.08zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.59a4.5 4.5 0 0 1-4.5 4.49zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.15.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.98v5.69a.77.77 0 0 0 .39.67l5.81 3.36-2.02 1.17a.08.08 0 0 1-.07 0L4.01 13.9a4.5 4.5 0 0 1-1.67-6zm16.6 3.85L13.1 8.36l2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.67zm2.01-3.02l-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66v.01zM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08L8.7 5.46a.8.8 0 0 0-.39.68v6.72zm1.07-2.15l2.62-1.51 2.63 1.51v3.03l-2.63 1.52-2.62-1.52z"/></svg>`,
    google: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#googleGemGradRoot)"/><defs><linearGradient id="googleGemGradRoot" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset="0.5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>`,
    anthropic: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#D97706"><path d="M14.5 3L8 21h3.3l1.4-4h4.6l1.4 4H22L15.5 3h-1zm-1.1 11.2l1.6-4.8 1.6 4.8h-3.2zM4 15.5l3.2-9L5.4 6 2 15.5h2z"/></svg>`,
    qwen: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M6.5 4C4 4 2 6 2 8.5c0 3.2 2.8 5.6 6 8.5 2.1 1.9 4 3 4 3s1.9-1.1 4-3c3.2-2.9 6-5.3 6-8.5C22 6 20 4 17.5 4c-2 0-3.8 1.2-4.7 3-.4.8-.8.8-1.6 0C10.3 5.2 8.5 4 6.5 4z" stroke="url(#qwenLogoGradRoot)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.5" fill="url(#qwenLogoGradRoot)"/><defs><linearGradient id="qwenLogoGradRoot" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs></svg>`,
    deepseek: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 14.5C4 18 7 21 11.5 21C16.5 21 20 17 20 12.5C20 8.5 17 5 13 5C10.5 5 8.5 6.5 7.5 8L4.5 5.5C4.2 5.2 3.8 5.5 4 5.9L5.5 9.5C4.5 11 4 12.7 4 14.5Z" fill="url(#deepseekLogoGradRoot)"/><circle cx="14" cy="11" r="1.5" fill="#ffffff"/><defs><linearGradient id="deepseekLogoGradRoot" x1="4" y1="5" x2="20" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#0284C7"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs></svg>`,
    meta: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M16.7 4C14.7 4 13.1 5.2 12 6.8 10.9 5.2 9.3 4 7.3 4 4.4 4 2 6.4 2 9.5c0 4.6 4.3 8.3 8.3 10.2.8.4 2.6.4 3.4 0 4-1.9 8.3-5.6 8.3-10.2 0-3.1-2.4-5.5-5.3-5.5z" stroke="#0081FB" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    mistral: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#F97316"><rect x="3" y="4" width="4" height="4" rx="0.5"/><rect x="17" y="4" width="4" height="4" rx="0.5"/><rect x="3" y="10" width="8" height="4" rx="0.5"/><rect x="13" y="10" width="8" height="4" rx="0.5"/><rect x="3" y="16" width="18" height="4" rx="0.5"/></svg>`,
    flux: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#fluxLogoGradRoot)" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="url(#fluxLogoGradRoot)" stroke-width="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="url(#fluxLogoGradRoot)" stroke-width="2" stroke-linecap="round"/><defs><linearGradient id="fluxLogoGradRoot" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#EC4899"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs></svg>`,
    stability: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#A855F7" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#A855F7"/><path d="M21 15l-5-5L5 21" stroke="#A855F7" stroke-width="2" stroke-linecap="round"/></svg>`,
    aira: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#airaDefaultGradRoot)"/><defs><linearGradient id="airaDefaultGradRoot" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs></svg>`
  };

  // Model categories in priority order
  const MODEL_CATEGORIES = [
    { id: 'chat', name: 'Chat & Multimodal AI', icon: '💬', priority: 1 },
    { id: 'reasoning', name: 'Reasoning & Logic', icon: '🧠', priority: 2 },
    { id: 'coding', name: 'Coding & Dev', icon: '💻', priority: 3 },
    { id: 'vision', name: 'Vision & Perception', icon: '👁️', priority: 4 },
    { id: 'image', name: 'Image Generation', icon: '🎨', priority: 5 },
    { id: 'voice', name: 'Audio & Speech', icon: '🎙️', priority: 6 },
    { id: 'general', name: 'General AI', icon: '✨', priority: 7 }
  ];

  function getProviderFromModel(rawModel) {
    let id = '';
    let metaProvider = '';
    if (typeof rawModel === 'string') {
      id = rawModel.trim();
    } else if (rawModel && typeof rawModel === 'object') {
      id = (rawModel.id || rawModel.name || '').trim();
      metaProvider = (rawModel.provider || rawModel.vendor || rawModel.owner || '').trim().toLowerCase();
    }
    const idLower = id.toLowerCase();

    // Check metaProvider first if returned by Puter
    if (metaProvider) {
      if (metaProvider.includes('openai')) return 'openai';
      if (metaProvider.includes('google') || metaProvider.includes('gemini')) return 'google';
      if (metaProvider.includes('anthropic') || metaProvider.includes('claude')) return 'anthropic';
      if (metaProvider.includes('qwen') || metaProvider.includes('alibaba') || metaProvider.includes('ali')) return 'qwen';
      if (metaProvider.includes('deepseek')) return 'deepseek';
      if (metaProvider.includes('meta') || metaProvider.includes('llama')) return 'meta';
      if (metaProvider.includes('mistral')) return 'mistral';
      if (metaProvider.includes('black-forest') || metaProvider.includes('flux') || metaProvider.includes('bfl')) return 'flux';
      if (metaProvider.includes('stability')) return 'stability';
    }

    // Inspect Model ID prefix / signature
    if (idLower.startsWith('openai/') || idLower.includes('gpt') || idLower.includes('dall-e') || idLower.includes('dalle') || idLower.startsWith('o1') || idLower.startsWith('o3') || idLower.includes('chatgpt')) {
      return 'openai';
    }
    if (idLower.startsWith('google/') || idLower.includes('gemini') || idLower.includes('gemma') || idLower.includes('palm') || idLower.includes('imagen')) {
      return 'google';
    }
    if (idLower.startsWith('anthropic/') || idLower.includes('claude')) {
      return 'anthropic';
    }
    if (idLower.startsWith('qwen/') || idLower.includes('qwen') || idLower.includes('qvq') || idLower.includes('qwq')) {
      return 'qwen';
    }
    if (idLower.startsWith('deepseek/') || idLower.includes('deepseek')) {
      return 'deepseek';
    }
    if (idLower.startsWith('meta-llama/') || idLower.startsWith('meta/') || idLower.includes('llama')) {
      return 'meta';
    }
    if (idLower.startsWith('mistralai/') || idLower.startsWith('mistral/') || idLower.includes('mistral') || idLower.includes('codestral') || idLower.includes('pixtral')) {
      return 'mistral';
    }
    if (idLower.includes('flux')) {
      return 'flux';
    }
    if (idLower.includes('stable-diffusion') || idLower.includes('sdxl')) {
      return 'stability';
    }

    return 'aira';
  }

  function getModelBrandedNameAndCapability(id, rawMeta) {
    const idLower = id.toLowerCase();
    let name = '';
    let capability = '';
    let isImage = false;
    let isCoding = false;
    let isReasoning = false;
    let isVision = false;

    // 1. Image Generation Models
    if (idLower.includes('txt2img') || idLower.includes('dall-e') || idLower.includes('dalle') ||
        idLower.includes('flux') || idLower.includes('stable-diffusion') || idLower.includes('sdxl') ||
        idLower.includes('imagen') || rawMeta.type === 'image') {
      isImage = true;
      capability = 'For Image Generation';

      if (idLower.includes('flux-schnell')) name = 'Aira Flux Schnell';
      else if (idLower.includes('flux-dev')) name = 'Aira Flux Dev';
      else if (idLower.includes('flux-1.1') || idLower.includes('flux-pro')) name = 'Aira Flux Pro';
      else if (idLower.includes('flux')) name = 'Aira Flux Image';
      else if (idLower.includes('dall-e-3') || idLower.includes('dalle-3')) name = 'Aira DALL-E 3';
      else if (idLower.includes('dall-e-2') || idLower.includes('dalle-2')) name = 'Aira DALL-E 2';
      else if (idLower.includes('sdxl') || idLower.includes('stable-diffusion-xl')) name = 'Aira SDXL';
      else if (idLower.includes('stable-diffusion')) name = 'Aira Stable Diffusion';
      else name = 'Aira Image Generator';

      return { name, capability, isImage, isCoding, isReasoning, isVision, category: 'image', type: 'image' };
    }

    // 2. Qwen Model Family
    if (idLower.includes('qvq')) {
      name = 'Aira Qwen QVQ Max';
      capability = 'For Vision & Reasoning';
      isVision = true;
      isReasoning = true;
    } else if (idLower.includes('qwen-qv-max') || idLower.includes('qwen-vl-max') || idLower.includes('qv-max')) {
      name = 'Aira Qwen QV Max';
      capability = 'For General AI & Reasoning';
      isVision = true;
      isReasoning = true;
    } else if (idLower.includes('qwq')) {
      name = 'Aira QwQ 32B';
      capability = 'For Reasoning';
      isReasoning = true;
    } else if (idLower.includes('qwen') && (idLower.includes('coder') || idLower.includes('code'))) {
      if (idLower.includes('32b')) name = 'Aira Qwen 2.5 Coder 32B';
      else name = 'Aira Qwen Coder';
      capability = 'For Coding';
      isCoding = true;
    } else if (idLower.includes('qwen-2.5-72b') || idLower.includes('qwen-2.5-72b-instruct')) {
      name = 'Aira Qwen 2.5 72B';
      capability = 'For General AI & Reasoning';
      isReasoning = true;
    } else if (idLower.includes('qwen-max')) {
      name = 'Aira Qwen Max';
      capability = 'For General AI & Reasoning';
      isReasoning = true;
    } else if (idLower.includes('qwen-plus')) {
      name = 'Aira Qwen Plus';
      capability = 'For Chatting';
    } else if (idLower.includes('qwen-turbo')) {
      name = 'Aira Qwen Turbo';
      capability = 'For Chatting';
    } else if (idLower.includes('qwen')) {
      name = 'Aira Qwen 2.5';
      capability = 'For Chatting & Reasoning';
      isReasoning = true;
    }

    // 3. OpenAI Model Family
    else if (idLower.includes('gpt-4o-mini')) {
      name = 'Aira GPT-4o Mini';
      capability = 'For Chatting';
      isVision = true;
    } else if (idLower.includes('gpt-4o')) {
      name = 'Aira GPT-4o';
      capability = 'For Chatting & Vision';
      isVision = true;
    } else if (idLower.includes('gpt-4-turbo') || idLower.includes('gpt-4')) {
      name = 'Aira GPT-4';
      capability = 'For Chatting';
    } else if (idLower.includes('o1-mini')) {
      name = 'Aira O1 Mini';
      capability = 'For Reasoning';
      isReasoning = true;
    } else if (idLower.includes('o1-preview') || idLower.includes('o1')) {
      name = 'Aira O1 Reasoning';
      capability = 'For Reasoning';
      isReasoning = true;
    } else if (idLower.includes('o3-mini') || idLower.includes('o3')) {
      name = 'Aira O3 Reasoning';
      capability = 'For Reasoning & Coding';
      isReasoning = true;
      isCoding = true;
    } else if (idLower.includes('gpt-3.5') || idLower.includes('chatgpt')) {
      name = 'Aira GPT-3.5';
      capability = 'For Chatting';
    }

    // 4. Google Gemini Model Family
    else if (idLower.includes('gemini-2.0-flash-thinking')) {
      name = 'Aira Gemini 2.0 Thinking';
      capability = 'For Reasoning & Multimodal AI';
      isReasoning = true;
      isVision = true;
    } else if (idLower.includes('gemini-2.0-flash')) {
      name = 'Aira Gemini 2.0 Flash';
      capability = 'For Chatting & Multimodal AI';
      isVision = true;
    } else if (idLower.includes('gemini-1.5-pro')) {
      name = 'Aira Gemini 1.5 Pro';
      capability = 'For Vision & Reasoning';
      isVision = true;
      isReasoning = true;
    } else if (idLower.includes('gemini-1.5-flash')) {
      name = 'Aira Gemini 1.5 Flash';
      capability = 'For Chatting & Vision';
      isVision = true;
    } else if (idLower.includes('gemini')) {
      name = 'Aira Gemini';
      capability = 'For Chatting & Multimodal AI';
      isVision = true;
    } else if (idLower.includes('gemma-2') || idLower.includes('gemma')) {
      name = 'Aira Gemma 2';
      capability = 'For Chatting';
    }

    // 5. Anthropic Claude Model Family
    else if (idLower.includes('claude-3-7-sonnet') || idLower.includes('claude-3.7-sonnet') || idLower.includes('claude-3-7')) {
      name = 'Aira Claude 3.7 Sonnet';
      capability = 'For Vision & Reasoning';
      isVision = true;
      isReasoning = true;
    } else if (idLower.includes('claude-3-5-sonnet') || idLower.includes('claude-3.5-sonnet')) {
      name = 'Aira Claude 3.5 Sonnet';
      capability = 'For Coding & Vision';
      isCoding = true;
      isVision = true;
    } else if (idLower.includes('claude-3-5-haiku') || idLower.includes('claude-3-haiku') || idLower.includes('haiku')) {
      name = 'Aira Claude 3.5 Haiku';
      capability = 'For Chatting';
    } else if (idLower.includes('claude-3-opus') || idLower.includes('claude-3.0-opus')) {
      name = 'Aira Claude 3 Opus';
      capability = 'For Deep Reasoning';
      isReasoning = true;
    } else if (idLower.includes('claude')) {
      name = 'Aira Claude';
      capability = 'For Chatting & Reasoning';
      isReasoning = true;
    }

    // 6. DeepSeek Model Family
    else if (idLower.includes('deepseek-reasoner') || idLower.includes('deepseek-r1') || idLower.includes('r1')) {
      name = 'Aira DeepSeek R1';
      capability = 'For Reasoning';
      isReasoning = true;
    } else if (idLower.includes('deepseek-coder') || idLower.includes('deepseek-code')) {
      name = 'Aira DeepSeek Code';
      capability = 'For Coding';
      isCoding = true;
    } else if (idLower.includes('deepseek-chat') || idLower.includes('deepseek-v3') || idLower.includes('deepseek')) {
      name = 'Aira DeepSeek V3';
      capability = 'For Chatting';
    }

    // 7. Meta Llama Model Family
    else if (idLower.includes('llama-3.3') || idLower.includes('llama-3.3-70b')) {
      name = 'Aira Llama 3.3 70B';
      capability = 'For General AI & Reasoning';
      isReasoning = true;
    } else if (idLower.includes('llama-3.1-405b')) {
      name = 'Aira Llama 3.1 405B';
      capability = 'For Deep Reasoning';
      isReasoning = true;
    } else if (idLower.includes('llama-3.1-70b') || idLower.includes('llama-3-70b')) {
      name = 'Aira Llama 3 70B';
      capability = 'For General AI';
    } else if (idLower.includes('llama-3.1-8b') || idLower.includes('llama-3-8b') || idLower.includes('llama')) {
      name = 'Aira Llama 3 8B';
      capability = 'For Chatting';
    }

    // 8. Mistral Model Family
    else if (idLower.includes('codestral')) {
      name = 'Aira Codestral';
      capability = 'For Coding';
      isCoding = true;
    } else if (idLower.includes('pixtral')) {
      name = 'Aira Pixtral';
      capability = 'For Vision';
      isVision = true;
    } else if (idLower.includes('mistral-large')) {
      name = 'Aira Mistral Large';
      capability = 'For General AI & Reasoning';
      isReasoning = true;
    } else if (idLower.includes('mistral-small') || idLower.includes('mistral-nemo') || idLower.includes('mistral')) {
      name = 'Aira Mistral';
      capability = 'For Chatting';
    }

    // 9. Speech / Audio
    else if (idLower.includes('whisper') || idLower.includes('tts') || idLower.includes('speech')) {
      name = 'Aira Voice Model';
      capability = 'For Audio / Voice';
    }

    // 10. Fallback clean name and dynamic capability
    else {
      const cleanId = id.split('/').pop().replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      name = 'Aira ' + cleanId;
      if (idLower.includes('code') || idLower.includes('coder')) {
        capability = 'For Coding';
        isCoding = true;
      } else if (idLower.includes('vision') || idLower.includes('vl') || idLower.includes('ocr')) {
        capability = 'For Vision';
        isVision = true;
      } else if (idLower.includes('reason') || idLower.includes('think') || idLower.includes('math')) {
        capability = 'For Reasoning';
        isReasoning = true;
      } else {
        capability = 'For Chatting';
      }
    }

    let category = 'chat';
    if (isReasoning) category = 'reasoning';
    else if (isCoding) category = 'coding';
    else if (isVision) category = 'vision';

    return { name, capability, isImage, isCoding, isReasoning, isVision, category, type: 'chat' };
  }

  function classifyModel(rawModel) {
    let id = '';
    let rawMeta = {};
    if (typeof rawModel === 'string') {
      id = rawModel.trim();
    } else if (rawModel && typeof rawModel === 'object') {
      id = (rawModel.id || rawModel.name || '').trim();
      rawMeta = rawModel;
    }
    const providerKey = getProviderFromModel(rawModel);
    const logoSvg = PROVIDER_LOGOS[providerKey] || PROVIDER_LOGOS.aira;
    const classified = getModelBrandedNameAndCapability(id, rawMeta);

    return {
      id,
      name: classified.name,
      capability: classified.capability,
      category: classified.category,
      provider: providerKey,
      logoSvg: logoSvg,
      icon: logoSvg,
      type: classified.type,
      isImage: classified.isImage,
      isCoding: classified.isCoding,
      isReasoning: classified.isReasoning,
      isVision: classified.isVision
    };
  }

  const INITIAL_FALLBACK_MODELS = [
    classifyModel('gpt-4o-mini'),
    classifyModel('gpt-4o'),
    classifyModel('gemini-2.0-flash'),
    classifyModel('claude-3-7-sonnet'),
    classifyModel('deepseek-reasoner'),
    classifyModel('deepseek-coder'),
    classifyModel('qwen/qvq-72b-preview'),
    classifyModel('qwen-qv-max'),
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
    liveVoiceState: 'idle', // 'connecting' | 'listening' | 'thinking' | 'speaking'
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

  // Helper to get valid chat model
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

  // Helper to get valid image model
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

    // Ensure activeModelId is actually available in the current model pool
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

    // Group models by priority category
    MODEL_CATEGORIES.forEach(cat => {
      const modelsInCat = state.availableModels.filter(m => m.category === cat.id);
      if (modelsInCat.length === 0) return;

      // Category section header
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
            <span class="model-opt-icon">${model.logoSvg}</span>
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

        // Settings dropdown option
        if (dom.settingsDefaultModelSelect) {
          const opt = document.createElement('option');
          opt.value = model.id;
          opt.textContent = `${model.name} — ${model.capability}`;
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
      if (dom.currentModelIcon) dom.currentModelIcon.innerHTML = activeModel.logoSvg;
      if (dom.currentModelDisplay) dom.currentModelDisplay.textContent = activeModel.name;
      if (dom.currentModelCapability) dom.currentModelCapability.textContent = activeModel.capability;

      // Adapt composer when image generation engine selected
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
        updateModelDisplay();
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
        // Fallback without explicit model option
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

    // If available models list is empty, dynamically query Puter models
    if (state.availableModels.length === 0 && window.puter?.ai) {
      await fetchPuterModels();
    }

    // Ensure we use a valid chat model (not an image model or an invalid model ID)
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
          // Try standard call without explicit model ID
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
    
    // Greet user and initiate loop
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

      // Context-aware conversational prompt for spoken conversation
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

    // Clean text for speech
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

    // Web Speech Synthesis fallback
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

    // Fallback to Web Speech API
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

    // Mic button in composer launches Live Voice session
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
