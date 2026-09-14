/**
 * OCR Module - Chuyển hình ảnh trong câu hỏi thành text
 * Sử dụng Tesseract.js hoặc API online
 */

class OCREngine {
  constructor() {
    this.useOnlineAPI = true;
    this.apiKey = null;
    this.cache = new Map();
  }

  /**
   * Set API key
   */
  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Scan hình ảnh và trả về text
   */
  async recognizeImage(imageUrl) {
    try {
      // Check cache
      if (this.cache.has(imageUrl)) {
        return this.cache.get(imageUrl);
      }

      console.log('[OCR] Scanning image:', imageUrl);

      let text = '';

      // Phương pháp 1: Dùng API online (nhanh hơn)
      if (this.useOnlineAPI) {
        text = await this.recognizeWithFreeAPI(imageUrl);
      }

      // Fallback: Dùng Tesseract.js
      if (!text) {
        text = await this.recognizeWithTesseract(imageUrl);
      }

      // Cache kết quả
      if (text) {
        this.cache.set(imageUrl, text);
      }

      return text;
    } catch (error) {
      console.error('[OCR] Lỗi OCR:', error);
      return null;
    }
  }

  /**
   * Dùng API OCR miễn phí
   */
  async recognizeWithFreeAPI(imageUrl) {
    try {
      // Dùng OCR.space API (miễn phí, không cần API key)
      const response = await fetch('https://api.ocr.space/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: imageUrl,
          language: 'vie', // Vietnamese
          apikey: 'K87899142372957' // Free key
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.IsErroredOnProcessing) {
        console.error('[OCR] API Error:', data.ErrorMessage);
        return null;
      }

      return data.ParsedText || '';
    } catch (error) {
      console.error('[OCR] API Error:', error);
      return null;
    }
  }

  /**
   * Dùng Tesseract.js (client-side, không gửi lên server)
   */
  async recognizeWithTesseract(imageUrl) {
    try {
      // Load Tesseract động
      if (!window.Tesseract) {
        console.log('[OCR] Loading Tesseract.js...');
        await this.loadTesseract();
      }

      const result = await Tesseract.recognize(imageUrl, 'vie', {
        logger: m => console.log('[OCR] Progress:', m.status, m.progress)
      });

      return result.data.text || '';
    } catch (error) {
      console.error('[OCR] Tesseract Error:', error);
      return null;
    }
  }

  /**
   * Load Tesseract.js library
   */
  async loadTesseract() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@2/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Scan tất cả hình ảnh trong câu hỏi
   */
  async scanQuestionImages(question) {
    if (!question.images || question.images.length === 0) {
      return question;
    }

    console.log('[OCR] Scanning', question.images.length, 'images');

    for (const image of question.images) {
      try {
        const text = await this.recognizeImage(image.src);
        if (text) {
          image.recognizedText = text;
          console.log('[OCR] Recognized text:', text);
        }
      } catch (error) {
        console.error('[OCR] Error scanning image:', error);
      }
    }

    return question;
  }

  /**
   * Trích xuất text từ tất cả hình ảnh
   */
  async extractAllImageTexts(question) {
    const texts = [];

    for (const image of question.images || []) {
      const text = await this.recognizeImage(image.src);
      if (text) {
        texts.push(text);
      }
    }

    return texts.join('\n');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      memory: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Export để dùng ở chỗ khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OCREngine;
}
