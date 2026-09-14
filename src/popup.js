/**
 * Popup Script - UI interaction
 */

class PopupController {
  constructor() {
    this.currentTab = 'solver';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.solvedCount = 0;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.updateStats();
  }

  /**
   * Setup sự kiện
   */
  setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Solver tab
    document.getElementById('scanBtn').addEventListener('click', () => this.scanQuestions());
    document.getElementById('solveBtn').addEventListener('click', () => this.solveAll());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());

    // Vault tab
    document.getElementById('refreshVaultBtn').addEventListener('click', () => this.refreshVault());
    document.getElementById('clearVaultBtn').addEventListener('click', () => this.clearVault());

    // Settings tab
    document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
    
    // AI Provider selector
    document.getElementById('aiProvider').addEventListener('change', (e) => this.toggleAIProvider(e.target.value));
  }

  /**
   * Chuyển tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // Cập nhật buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Cập nhật content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });

    // Load dữ liệu tab
    if (tabName === 'vault') {
      this.refreshVault();
    } else if (tabName === 'settings') {
      this.loadSettings();
    }
  }

  /**
   * Scan câu hỏi
   */
  async scanQuestions() {
    this.showStatus('🔍 Đang scan câu hỏi...', 'info');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'scanQuestions' }, (response) => {
        if (response && response.success) {
          this.questions = response.questions;
          this.currentQuestionIndex = 0;
          this.solvedCount = 0;
          
          document.getElementById('questionsCount').textContent = this.questions.length;
          document.getElementById('solvedCount').textContent = '0';
          
          this.displayQuestions();
          this.showStatus(`✅ Tìm được ${this.questions.length} câu hỏi!`, 'success');
        } else {
          this.showStatus('❌ Không tìm được câu hỏi', 'error');
        }
      });
    } catch (error) {
      this.showStatus(`❌ Lỗi: ${error.message}`, 'error');
    }
  }

  /**
   * Hiển thị danh sách câu hỏi
   */
  displayQuestions() {
    const list = document.getElementById('questionsList');
    list.innerHTML = '';

    if (this.questions.length === 0) {
      list.innerHTML = '<div class="info-text">Không có câu hỏi</div>';
      return;
    }

    this.questions.forEach((q, index) => {
      const item = document.createElement('div');
      item.className = 'answer-item';
      item.innerHTML = `
        <div class="answer-text" title="${q.text}">
          <strong>Câu ${index + 1}:</strong> ${q.text.substring(0, 50)}...
        </div>
        <div class="answer-value">${q.options.length} lựa chọn</div>
      `;
      item.addEventListener('click', () => this.focusQuestion(index));
      list.appendChild(item);
    });
  }

  /**
   * Focus vào câu hỏi
   */
  focusQuestion(index) {
    this.currentQuestionIndex = index;
    this.showStatus(`Câu ${index + 1}: "${this.questions[index].text}"`, 'info');
  }

  /**
   * Câu tiếp theo
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.focusQuestion(this.currentQuestionIndex);
    }
  }

  /**
   * Câu trước
   */
  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.focusQuestion(this.currentQuestionIndex);
    }
  }

  /**
   * Giải toàn bộ
   */
  async solveAll() {
    if (this.questions.length === 0) {
      this.showStatus('⚠️ Hãy scan câu hỏi trước', 'warning');
      return;
    }

    this.showStatus('⚡ Đang giải toàn bộ...', 'info');
    this.solvedCount = 0;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      
      try {
        chrome.runtime.sendMessage(
          {
            action: 'findAnswer',
            question: question,
            useAI: true
          },
          (response) => {
            if (response && response.success && response.answer) {
              chrome.tabs.sendMessage(tab.id, {
                action: 'selectAnswer',
                questionId: question.id,
                answer: response.answer
              });
              
              this.solvedCount++;
              document.getElementById('solvedCount').textContent = this.solvedCount;
              this.showStatus(`⏳ ${this.solvedCount}/${this.questions.length} câu đã giải`, 'info');
            }
          }
        );
      } catch (error) {
        console.error('Lỗi giải câu:', error);
      }

      // Delay giữa các câu
      await this.delay(1500);
    }

    this.showStatus(`✅ Hoàn tất! Đã giải ${this.solvedCount}/${this.questions.length} câu`, 'success');
  }

  /**
   * Refresh Answer Vault
   */
  async refreshVault() {
    this.showStatus('🔄 Đang tải Answer Vault...', 'info');

    chrome.runtime.sendMessage({ action: 'getAllAnswers' }, (response) => {
      if (response && response.answers) {
        const answers = response.answers;
        const list = document.getElementById('vaultList');
        list.innerHTML = '';

        if (answers.length === 0) {
          list.innerHTML = '<div class="info-text">Kho đáp án trống</div>';
          document.getElementById('totalAnswers').textContent = '0';
          document.getElementById('confirmedAnswers').textContent = '0';
          return;
        }

        answers.forEach((answer, index) => {
          const item = document.createElement('div');
          item.className = 'answer-item';
          item.innerHTML = `
            <div class="answer-text" title="${answer.questionText}">
              ${answer.questionText.substring(0, 50)}...
            </div>
            <div class="answer-value">${answer.correctAnswer}</div>
            <button class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="popupController.deleteAnswer(${answer.id})">Xóa</button>
          `;
          list.appendChild(item);
        });

        document.getElementById('totalAnswers').textContent = answers.length;
        const confirmed = answers.filter(a => a.confirmed).length;
        document.getElementById('confirmedAnswers').textContent = confirmed;

        this.showStatus(`✅ Tải xong ${answers.length} đáp án`, 'success');
      }
    });
  }

  /**
   * Xóa một đáp án
   */
  async deleteAnswer(id) {
    if (confirm('Xác nhận xóa?')) {
      chrome.runtime.sendMessage(
        { action: 'deleteAnswer', id },
        () => this.refreshVault()
      );
    }
  }

  /**
   * Xóa toàn bộ
   */
  async clearVault() {
    if (confirm('Xóa toàn bộ Answer Vault? Hành động này không thể hoàn tác!')) {
      // Lấy tất cả và xóa
      chrome.runtime.sendMessage({ action: 'getAllAnswers' }, (response) => {
        if (response && response.answers) {
          response.answers.forEach(answer => {
            chrome.runtime.sendMessage({ action: 'deleteAnswer', id: answer.id });
          });
          this.refreshVault();
          this.showStatus('✅ Đã xóa toàn bộ Answer Vault', 'success');
        }
      });
    }
  }

  /**
   * Toggle UI based on AI Provider
   */
  toggleAIProvider(provider) {
    const ollamaSettings = document.getElementById('ollamaSettings');
    const openaiSettings = document.getElementById('openaiSettings');
    
    if (provider === 'ollama') {
      ollamaSettings.style.display = 'block';
      openaiSettings.style.display = 'none';
    } else {
      ollamaSettings.style.display = 'none';
      openaiSettings.style.display = 'block';
    }
  }

  /**
   * Load cài đặt
   */
  loadSettings() {
    chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
      if (response && response.config) {
        const config = response.config;
        
        // AI Provider & Ollama
        const provider = config.aiProvider || 'ollama';
        document.getElementById('aiProvider').value = provider;
        document.getElementById('ollamaEndpoint').value = config.ollamaEndpoint || 'http://localhost:11434/api/chat';
        document.getElementById('ollamaModel').value = config.ollamaModel || 'mistral';
        this.toggleAIProvider(provider);
        
        // OpenAI (fallback)
        document.getElementById('apiKey').value = config.aiApiKey || '';
        
        // SQL
        document.getElementById('sqlConnection').value = config.sqlServerConnection ? JSON.stringify(config.sqlServerConnection, null, 2) : '';
        
        // Features
        document.getElementById('autoSolve').checked = config.autoSolve !== false;
        document.getElementById('useAI').checked = config.useAI !== false;
        document.getElementById('highlightCorrect').checked = config.highlightCorrect !== false;
        document.getElementById('scanImages').checked = config.scanImages === true;
      }
    });
  }

  /**
   * Lưu cài đặt
   */
  async saveSettings() {
    this.showStatus('💾 Đang lưu cài đặt...', 'info');

    const config = {
      // AI
      aiProvider: document.getElementById('aiProvider').value,
      ollamaEndpoint: document.getElementById('ollamaEndpoint').value,
      ollamaModel: document.getElementById('ollamaModel').value,
      aiApiKey: document.getElementById('apiKey').value,
      
      // SQL
      sqlServerConnection: this.parseSqlConnection(document.getElementById('sqlConnection').value),
      
      // Features
      autoSolve: document.getElementById('autoSolve').checked,
      useAI: document.getElementById('useAI').checked,
      highlightCorrect: document.getElementById('highlightCorrect').checked,
      scanImages: document.getElementById('scanImages').checked
    };

    chrome.runtime.sendMessage(
      { action: 'updateConfig', config },
      (response) => {
        if (response && response.success) {
          this.showStatus('✅ Cài đặt đã lưu! (Reload extension để áp dụng)', 'success');
        } else {
          this.showStatus('❌ Lỗi lưu cài đặt', 'error');
        }
      }
    );
  }

  /**
   * Parse JSON SQL connection
   */
  parseSqlConnection(jsonStr) {
    try {
      return jsonStr ? JSON.parse(jsonStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Hiển thị status message
   */
  showStatus(message, type = 'info') {
    const statusBox = document.getElementById('status-message');
    statusBox.innerHTML = `<div class="status-box ${type}">${message}</div>`;
    
    // Auto clear sau 3 giây nếu là info
    if (type === 'info') {
      setTimeout(() => {
        statusBox.innerHTML = '';
      }, 3000);
    }
  }

  /**
   * Update stats
   */
  updateStats() {
    document.getElementById('questionsCount').textContent = this.questions.length;
    document.getElementById('solvedCount').textContent = this.solvedCount;
  }

  /**
   * Delay async
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Khởi tạo controller
const popupController = new PopupController();
