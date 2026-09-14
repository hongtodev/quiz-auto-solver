/**
 * Content Script - Chạy trên website được truy cập
 * Chức năng: Scan câu hỏi, tách dữ liệu, tìm đáp án, và tự động chọn
 */

class QuizScanner {
  constructor() {
    this.questions = [];
    this.answers = [];
    this.config = {
      autoSolve: true,
      useAI: true,
      highlightCorrect: true,
      autoScore: true
    };
    this.init();
  }

  async init() {
    // Lắng nghe tin nhắn từ popup hoặc background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sendResponse);
    });

    // Scan trang khi trang load
    this.monitorPageChanges();
  }

  /**
   * Scan toàn bộ câu hỏi và lựa chọn trên trang
   */
  async scanQuestions() {
    try {
      // Tìm các loại câu hỏi khác nhau (multiple choice, checkbox, input, etc)
      const quizContainers = this.findQuizContainers();
      
      for (const container of quizContainers) {
        const question = this.extractQuestionData(container);
        if (question) {
          this.questions.push(question);
        }
      }

      console.log(`[QuizScanner] Tìm được ${this.questions.length} câu hỏi`);
      return this.questions;
    } catch (error) {
      console.error('[QuizScanner] Lỗi khi scan câu hỏi:', error);
      return [];
    }
  }

  /**
   * Tìm các container chứa câu hỏi
   */
  findQuizContainers() {
    const containers = [];
    
    // Tìm theo class/id phổ biến
    const selectors = [
      '.question-container',
      '.quiz-question',
      '.question-item',
      '[data-question]',
      '.question',
      '.qa-item',
      'article[role="region"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      containers.push(...elements);
    }

    return [...new Set(containers)]; // Loại bỏ trùng
  }

  /**
   * Tách dữ liệu từ container câu hỏi
   */
  extractQuestionData(container) {
    try {
      const question = {
        id: container.id || this.generateId(),
        text: '',
        type: 'multiple-choice',
        options: [],
        images: [],
        position: this.getElementPosition(container)
      };

      // Tách text câu hỏi
      const questionText = this.extractQuestionText(container);
      if (!questionText) return null;
      question.text = questionText;

      // Tách các lựa chọn
      question.options = this.extractOptions(container);
      if (question.options.length === 0) return null;

      // Tách hình ảnh
      const images = container.querySelectorAll('img');
      question.images = Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt
      }));

      return question;
    } catch (error) {
      console.error('[QuizScanner] Lỗi tách dữ liệu:', error);
      return null;
    }
  }

  /**
   * Tách text câu hỏi từ container
   */
  extractQuestionText(container) {
    const textSelectors = [
      '.question-text',
      '.question-title',
      '.question-content',
      'h3',
      'h4'
    ];

    for (const selector of textSelectors) {
      const element = container.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    // Fallback: lấy text đầu tiên
    const text = container.textContent.trim();
    return text.split('\n')[0];
  }

  /**
   * Tách các lựa chọn (A, B, C, D, etc)
   */
  extractOptions(container) {
    const options = [];
    
    // Tìm radio buttons hoặc checkboxes
    const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    
    if (inputs.length > 0) {
      inputs.forEach((input, index) => {
        const label = this.findAssociatedLabel(input);
        options.push({
          id: input.id || `option-${index}`,
          text: label || '',
          element: input,
          value: input.value || String.fromCharCode(65 + index) // A, B, C, D
        });
      });
    } else {
      // Tìm div/span là lựa chọn
      const optionElements = container.querySelectorAll(
        '[role="radio"], [role="checkbox"], .option, .answer-option'
      );
      
      optionElements.forEach((element, index) => {
        options.push({
          id: element.id || `option-${index}`,
          text: element.textContent.trim(),
          element: element,
          value: String.fromCharCode(65 + index)
        });
      });
    }

    return options;
  }

  /**
   * Tìm label liên quan đến input
   */
  findAssociatedLabel(input) {
    if (input.labels && input.labels.length > 0) {
      return input.labels[0].textContent.trim();
    }

    const label = input.closest('label');
    if (label) {
      return label.textContent.trim();
    }

    const parent = input.parentElement;
    if (parent) {
      return parent.textContent.replace(input.value, '').trim();
    }

    return '';
  }

  /**
   * Lấy vị trí của phần tử trên trang
   */
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      element: element
    };
  }

  /**
   * Tự động chọn đáp án
   */
  async autoSelectAnswer(questionId, answerValue) {
    try {
      const question = this.questions.find(q => q.id === questionId);
      if (!question) {
        console.warn(`[QuizScanner] Không tìm được câu hỏi ${questionId}`);
        return false;
      }

      const option = question.options.find(o => o.value === answerValue);
      if (!option) {
        console.warn(`[QuizScanner] Không tìm được lựa chọn ${answerValue}`);
        return false;
      }

      // Click vào đáp án
      if (option.element.tagName === 'INPUT') {
        option.element.checked = true;
        option.element.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        option.element.click();
      }

      // Scroll đến câu hỏi
      this.scrollToQuestion(question);

      console.log(`[QuizScanner] Đã chọn ${answerValue} cho câu ${questionId}`);
      return true;
    } catch (error) {
      console.error('[QuizScanner] Lỗi khi chọn đáp án:', error);
      return false;
    }
  }

  /**
   * Scroll đến câu hỏi
   */
  scrollToQuestion(question) {
    const element = question.position.element;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Tô sáng đáp án đúng
   */
  highlightAnswer(questionId, correctAnswer) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;

    question.options.forEach(option => {
      if (option.value === correctAnswer) {
        option.element.style.border = '3px solid green';
        option.element.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
      } else {
        option.element.style.border = '';
        option.element.style.backgroundColor = '';
      }
    });
  }

  /**
   * Gửi câu hỏi cho xử lý
   */
  async processQuestion(questionIndex) {
    const question = this.questions[questionIndex];
    if (!question) return null;

    // Gửi đến background script để tìm đáp án
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: 'findAnswer',
          question: question,
          useAI: this.config.useAI
        },
        (response) => {
          resolve(response);
        }
      );
    });
  }

  /**
   * Xử lý tin nhắn từ popup/background
   */
  handleMessage(request, sendResponse) {
    if (request.action === 'scanQuestions') {
      this.scanQuestions().then(questions => {
        sendResponse({ success: true, questions });
      });
    } else if (request.action === 'autoSolve') {
      this.autoSolveQuiz().then(result => {
        sendResponse({ success: true, result });
      });
    } else if (request.action === 'selectAnswer') {
      this.autoSelectAnswer(request.questionId, request.answer).then(success => {
        sendResponse({ success });
      });
    } else if (request.action === 'updateConfig') {
      this.config = { ...this.config, ...request.config };
      sendResponse({ success: true });
    }
  }

  /**
   * Tự động giải toàn bộ quiz
   */
  async autoSolveQuiz() {
    const results = [];
    for (let i = 0; i < this.questions.length; i++) {
      const result = await this.processQuestion(i);
      results.push(result);
      
      if (result && result.answer) {
        await this.autoSelectAnswer(this.questions[i].id, result.answer);
        if (this.config.highlightCorrect) {
          this.highlightAnswer(this.questions[i].id, result.answer);
        }
      }
      
      // Delay giữa các câu để tránh block
      await this.delay(1000);
    }
    return results;
  }

  /**
   * Delay async
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate ID duy nhất
   */
  generateId() {
    return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Theo dõi thay đổi trang (lazy loading, etc)
   */
  monitorPageChanges() {
    const observer = new MutationObserver((mutations) => {
      // Nếu có phần tử mới được thêm, có thể scan lại
      if (mutations.some(m => m.addedNodes.length > 0)) {
        // Debounce scan
        clearTimeout(this.scanTimeout);
        this.scanTimeout = setTimeout(() => {
          this.scanQuestions();
        }, 2000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Khởi tạo scanner khi trang load
window.quizScanner = new QuizScanner();
console.log('[Content Script] Quiz Scanner initialized');
