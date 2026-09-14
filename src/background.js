/**
 * Background Service Worker
 * Xử lý: API calls, database, AI integration, answer vault
 */

class AnswerVault {
  constructor() {
    this.dbName = 'QuizAnswerVault';
    this.storeName = 'answers';
    this.db = null;
    this.initDB();
  }

  /**
   * Khởi tạo IndexedDB
   */
  initDB() {
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = () => {
      console.error('[AnswerVault] Lỗi mở database');
    };

    request.onsuccess = (e) => {
      this.db = e.target.result;
      console.log('[AnswerVault] Database initialized');
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  }

  /**
   * Lưu đáp án vào vault
   */
  async saveAnswer(question, answer) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const data = {
        questionHash: this.hashQuestion(question.text),
        questionText: question.text,
        questionImages: question.images || [],
        correctAnswer: answer,
        timestamp: Date.now(),
        confirmed: false
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('[AnswerVault] Lưu đáp án thành công');
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Tìm đáp án trong vault
   */
  async findAnswer(question) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const questionHash = this.hashQuestion(question.text);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.filter(r => 
          r.questionHash === questionHash || 
          this.similarityScore(r.questionText, question.text) > 0.8
        );
        
        if (results.length > 0) {
          resolve(results[0]);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Hash câu hỏi để tìm kiếm nhanh
   */
  hashQuestion(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * Tính điểm similarity giữa 2 chuỗi
   */
  similarityScore(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance
   */
  levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Lấy tất cả đáp án
   */
  async getAllAnswers() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Xóa đáp án
   */
  async deleteAnswer(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * AI Integration - Ollama (Local) + OpenAI (Cloud) Support
 * Default: Ollama (free, local, private)
 * Fallback: OpenAI (when Ollama unavailable)
 */
class AIIntegration {
  constructor(config = {}) {
    this.config = config;
    this.provider = config.aiProvider || 'ollama'; // 'ollama' | 'openai'
    
    // Ollama config
    this.ollamaEndpoint = config.ollamaEndpoint || 'http://localhost:11434/api/chat';
    this.ollamaModel = config.ollamaModel || 'mistral'; // or 'llama2', 'neural-chat', etc
    
    // OpenAI config (fallback)
    this.openaiKey = config.aiApiKey;
    this.openaiModel = 'gpt-3.5-turbo';
    this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    console.log(`[AI] Initialized with provider: ${this.provider}`);
  }

  /**
   * Hỏi AI - Ollama hoặc OpenAI
   */
  async askAI(question, options) {
    try {
      const prompt = this.buildPrompt(question, options);
      
      // Thử Ollama trước (default)
      if (this.provider === 'ollama' || !this.openaiKey) {
        console.log('[AI] Trying Ollama...');
        const result = await this.askOllama(prompt, options);
        if (result) return result;
        
        // Fallback to OpenAI nếu Ollama fail
        if (this.openaiKey) {
          console.log('[AI] Ollama unavailable, falling back to OpenAI...');
          return await this.askOpenAI(prompt, options);
        }
      }
      
      // Hoặc dùng OpenAI trực tiếp nếu cấu hình
      if (this.provider === 'openai' && this.openaiKey) {
        console.log('[AI] Using OpenAI...');
        return await this.askOpenAI(prompt, options);
      }
      
      console.error('[AI] No AI provider configured');
      return null;
    } catch (error) {
      console.error('[AI] Error:', error);
      return null;
    }
  }

  /**
   * Gọi Ollama local
   */
  async askOllama(prompt, options) {
    try {
      const response = await fetch(this.ollamaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          messages: [
            {
              role: 'system',
              content: 'Bạn là một trợ lý học tập giúp giải các bài quiz. Hãy trả lời câu hỏi và đưa ra lựa chọn đúng nhất.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.message?.content;
      
      if (!answer) {
        throw new Error('No response from Ollama');
      }
      
      console.log('[AI] ✅ Ollama response received');
      return this.parseAnswer(answer, options, 'ollama');
    } catch (error) {
      console.warn('[AI] Ollama failed:', error.message);
      return null;
    }
  }

  /**
   * Gọi OpenAI API
   */
  async askOpenAI(prompt, options) {
    try {
      const response = await fetch(this.openaiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: 'Bạn là một trợ lý học tập giúp giải các bài quiz. Hãy trả lời câu hỏi và đưa ra lựa chọn đúng nhất.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      console.log('[AI] ✅ OpenAI response received');
      return this.parseAnswer(answer, options, 'openai');
    } catch (error) {
      console.error('[AI] OpenAI failed:', error.message);
      return null;
    }
  }

  /**
   * Xây dựng prompt cho AI
   */
  buildPrompt(question, options) {
    let prompt = `Câu hỏi: ${question.text}\n\n`;
    prompt += `Các lựa chọn:\n`;
    
    options.forEach((option, index) => {
      prompt += `${String.fromCharCode(65 + index)}) ${option.text}\n`;
    });
    
    prompt += `\nHãy chọn đáp án đúng và giải thích lý do. Kết thúc bằng "Đáp án: X" (X là A, B, C hoặc D)`;
    
    return prompt;
  }

  /**
   * Parse đáp án từ response
   */
  parseAnswer(response, options, source) {
    // Tìm "Đáp án: X"
    const match = response.match(/Đáp án:\s*([A-D])/i);
    if (match) {
      return {
        answer: match[1].toUpperCase(),
        explanation: response,
        confidence: 0.85,
        source: source
      };
    }

    // Fallback: tìm chữ cái A, B, C, D
    const letters = response.match(/[A-D]/);
    if (letters) {
      return {
        answer: letters[0],
        explanation: response,
        confidence: 0.6,
        source: source
      };
    }

    return null;
  }
}

/**
 * Quản lý configurations
 */
class ConfigManager {
  constructor() {
    this.defaults = {
      // AI Configuration
      aiProvider: 'ollama', // 'ollama' | 'openai'
      aiApiKey: '', // OpenAI key (optional)
      ollamaEndpoint: 'http://localhost:11434/api/chat',
      ollamaModel: 'mistral', // mistral, llama2, neural-chat, etc
      
      // Features
      useLocalVault: true,
      useAI: true,
      autoSolve: false,
      highlightCorrect: true,
      autoScore: true,
      scanImages: true,
      
      // Database
      sqlServerConnection: null
    };
    this.loadConfig();
  }

  async loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.defaults, (items) => {
        this.config = items;
        resolve(items);
      });
    });
  }

  async saveConfig(updates) {
    this.config = { ...this.config, ...updates };
    return new Promise((resolve) => {
      chrome.storage.local.set(this.config, () => {
        resolve(this.config);
      });
    });
  }

  getConfig() {
    return this.config || this.defaults;
  }
}

// Khởi tạo các module
const vault = new AnswerVault();
const config = new ConfigManager();
let ai = null;

// Đợi config load và khởi tạo AI
config.loadConfig().then(() => {
  const cfg = config.getConfig();
  
  // Khởi tạo AI với cấu hình (Ollama hoặc OpenAI)
  ai = new AIIntegration({
    aiProvider: cfg.aiProvider || 'ollama',
    aiApiKey: cfg.aiApiKey,
    ollamaEndpoint: cfg.ollamaEndpoint,
    ollamaModel: cfg.ollamaModel
  });
  
  console.log('[Background] AI initialized');
  console.log(`  Provider: ${cfg.aiProvider || 'ollama'}`);
  console.log(`  Ollama: ${cfg.ollamaEndpoint}`);
  if (cfg.aiApiKey) console.log(`  OpenAI: Configured (fallback)`);
});

/**
 * Xử lý tin nhắn từ content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'findAnswer') {
    handleFindAnswer(request.question, sendResponse);
  } else if (request.action === 'saveAnswer') {
    handleSaveAnswer(request.question, request.answer, sendResponse);
  } else if (request.action === 'getConfig') {
    sendResponse({ config: config.getConfig() });
  } else if (request.action === 'updateConfig') {
    config.saveConfig(request.config).then(() => {
      sendResponse({ success: true });
    });
  } else if (request.action === 'getAllAnswers') {
    vault.getAllAnswers().then(answers => {
      sendResponse({ answers });
    });
  } else if (request.action === 'deleteAnswer') {
    vault.deleteAnswer(request.id).then(() => {
      sendResponse({ success: true });
    });
  }
});

/**
 * Tìm đáp án (từ vault hoặc AI)
 */
async function handleFindAnswer(question, sendResponse) {
  try {
    console.log('[Background] Tìm đáp án cho:', question.text);

    // Bước 1: Tìm trong Answer Vault
    const vaultAnswer = await vault.findAnswer(question);
    
    if (vaultAnswer) {
      console.log('[Background] Tìm được đáp án trong vault');
      sendResponse({
        success: true,
        answer: vaultAnswer.correctAnswer,
        source: 'vault',
        explanation: vaultAnswer.explanation || ''
      });
      return;
    }

    // Bước 2: Không tìm được, gọi AI
    if (ai && config.getConfig().useAI) {
      console.log('[Background] Gọi AI để tìm đáp án');
      const aiResult = await ai.askAI(question, question.options);
      
      if (aiResult) {
        // Lưu đáp án vào vault để lần sau dùng lại
        await vault.saveAnswer(question, aiResult.answer);
        
        sendResponse({
          success: true,
          answer: aiResult.answer,
          source: 'ai',
          explanation: aiResult.explanation,
          confidence: aiResult.confidence
        });
        return;
      }
    }

    // Không tìm được
    sendResponse({
      success: false,
      message: 'Không tìm được đáp án'
    });
  } catch (error) {
    console.error('[Background] Lỗi tìm đáp án:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Lưu đáp án vào vault
 */
async function handleSaveAnswer(question, answer, sendResponse) {
  try {
    await vault.saveAnswer(question, answer);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Background] Lỗi lưu đáp án:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('[Background] Service worker initialized');
