# 🔌 API Documentation

## Backend REST API

Base URL: `http://localhost:3000/api`

### Authentication
Hiện tại không cần authentication. Sắp thêm API key-based auth.

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-09-14T10:30:00.000Z",
  "database": "connected"
}
```

---

### Get All Answers

```
GET /api/answers
```

**Query Parameters**:
- `source` (optional): `ai`, `manual`, `vault`
- `confirmed` (optional): `true`, `false`
- `limit` (optional): số lượng (default 100)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "answers": [
    {
      "id": 1,
      "questionHash": "hash_001",
      "questionText": "Câu hỏi 1?",
      "correctAnswer": "B",
      "explanation": "Vì...",
      "timestamp": "2024-09-14T10:20:00.000Z",
      "confirmed": 1,
      "source": "ai"
    }
  ]
}
```

---

### Get Answer by Hash

```
GET /api/answers/:questionHash
```

**Parameters**:
- `questionHash` (string, required): Hash của câu hỏi

**Response**:
```json
{
  "success": true,
  "answer": {
    "id": 1,
    "questionHash": "hash_001",
    "questionText": "Câu hỏi?",
    "correctAnswer": "A",
    "explanation": "...",
    "timestamp": "2024-09-14T10:20:00.000Z",
    "confirmed": 1,
    "source": "ai"
  }
}
```

**Error Response**:
```json
{
  "error": "Answer not found"
}
```

---

### Create or Update Answer

```
POST /api/answers
Content-Type: application/json
```

**Request Body**:
```json
{
  "questionHash": "hash_001",
  "questionText": "Câu hỏi mới?",
  "correctAnswer": "C",
  "explanation": "Giải thích...",
  "confirmed": false,
  "source": "ai"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Answer saved/updated",
  "rowsAffected": 1
}
```

**Validations**:
- `questionHash`: required, unique
- `questionText`: required
- `correctAnswer`: required, 1 char (A-Z, 0-9)
- `explanation`: optional
- `confirmed`: optional (default false)
- `source`: optional (default 'ai')

---

### Batch Insert Answers

```
POST /api/answers/batch
Content-Type: application/json
```

**Request Body**:
```json
{
  "answers": [
    {
      "questionHash": "hash_001",
      "questionText": "Câu 1?",
      "correctAnswer": "A",
      "source": "manual"
    },
    {
      "questionHash": "hash_002",
      "questionText": "Câu 2?",
      "correctAnswer": "B",
      "source": "ai"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "2 answers inserted",
  "totalInserted": 2
}
```

---

### Search Answers (Similarity)

```
POST /api/answers/search
Content-Type: application/json
```

**Request Body**:
```json
{
  "questionText": "Hà Nội",
  "limit": 5
}
```

**Response**:
```json
{
  "success": true,
  "count": 2,
  "answers": [
    {
      "id": 1,
      "questionText": "Hà Nội là?",
      "correctAnswer": "A",
      ...
    }
  ]
}
```

---

### Delete Answer

```
DELETE /api/answers/:id
```

**Parameters**:
- `id` (integer, required): Answer ID

**Response**:
```json
{
  "success": true,
  "message": "Answer deleted"
}
```

**Error**:
```json
{
  "error": "Answer not found"
}
```

---

### Delete All Answers

```
DELETE /api/answers?confirm=yes
```

**⚠️ Warning**: Không thể undo!

**Response**:
```json
{
  "success": true,
  "message": "All answers deleted",
  "rowsAffected": 15
}
```

**Safety**:
```json
{
  "error": "Confirmation required",
  "message": "Add ?confirm=yes to delete all answers"
}
```

---

### Get Statistics

```
GET /api/stats
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalAnswers": 42,
    "confirmedAnswers": 38,
    "aiAnswers": 30,
    "manualAnswers": 12,
    "vaultAnswers": 0,
    "firstAnswer": "2024-09-01T08:00:00.000Z",
    "lastAnswer": "2024-09-14T10:30:00.000Z"
  }
}
```

---

## Chrome Extension Messages

### Content Script → Background

#### Scan Questions

```javascript
chrome.runtime.sendMessage(
  { action: 'scanQuestions' },
  (response) => {
    // response.success: true|false
    // response.questions: Array<Question>
  }
);
```

**Question Object**:
```typescript
interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'checkbox' | 'essay';
  options: Array<{
    id: string;
    text: string;
    element: HTMLElement;
    value: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
    recognizedText?: string;
  }>;
  position: {
    top: number;
    left: number;
    element: HTMLElement;
  };
}
```

---

#### Find Answer

```javascript
chrome.runtime.sendMessage(
  {
    action: 'findAnswer',
    question: { /* Question object */ },
    useAI: true
  },
  (response) => {
    if (response.success) {
      // response.answer: 'A'
      // response.source: 'vault' | 'ai'
      // response.explanation: string
      // response.confidence: 0-1 (nếu từ AI)
    }
  }
);
```

---

#### Select Answer

```javascript
chrome.tabs.sendMessage(
  tabId,
  {
    action: 'selectAnswer',
    questionId: 'q-123',
    answer: 'A'
  },
  (response) => {
    // response.success: true|false
  }
);
```

---

#### Save Answer to Vault

```javascript
chrome.runtime.sendMessage(
  {
    action: 'saveAnswer',
    question: { /* Question object */ },
    answer: 'B'
  },
  (response) => {
    // response.success: true|false
  }
);
```

---

## Data Models

### Answer Schema (SQL)

```sql
CREATE TABLE Answers (
    id INT PRIMARY KEY IDENTITY(1,1),
    questionHash VARCHAR(255) NOT NULL UNIQUE,
    questionText NVARCHAR(MAX) NOT NULL,
    correctAnswer VARCHAR(10) NOT NULL,
    explanation NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETDATE(),
    confirmed BIT DEFAULT 0,
    source VARCHAR(50) DEFAULT 'ai'
);
```

### JavaScript Types

```typescript
interface Answer {
  id: number;
  questionHash: string;
  questionText: string;
  correctAnswer: string;
  explanation?: string;
  timestamp: Date;
  confirmed: boolean;
  source: 'ai' | 'manual' | 'vault';
}

interface FindAnswerResponse {
  success: boolean;
  answer?: string;
  source?: 'vault' | 'ai';
  explanation?: string;
  confidence?: number;
  error?: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
  images: Image[];
  position: Position;
}

interface Option {
  id: string;
  text: string;
  element: HTMLElement;
  value: string;
}

interface Image {
  src: string;
  alt: string;
  recognizedText?: string;
}

interface Position {
  top: number;
  left: number;
  element: HTMLElement;
}
```

---

## Examples

### cURL Examples

**Get all answers**:
```bash
curl http://localhost:3000/api/answers
```

**Get by hash**:
```bash
curl http://localhost:3000/api/answers/hash_001
```

**Add answer**:
```bash
curl -X POST http://localhost:3000/api/answers \
  -H "Content-Type: application/json" \
  -d '{
    "questionHash": "hash_003",
    "questionText": "Hà Nội là thành phố gì?",
    "correctAnswer": "A",
    "confirmed": true,
    "source": "manual"
  }'
```

**Search**:
```bash
curl -X POST http://localhost:3000/api/answers/search \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Hà Nội",
    "limit": 10
  }'
```

**Stats**:
```bash
curl http://localhost:3000/api/stats
```

### JavaScript Examples

**Fetch in Extension**:
```javascript
// Get all answers from backend
async function syncAnswers() {
  try {
    const response = await fetch('http://localhost:3000/api/answers');
    const data = await response.json();
    console.log('Total answers:', data.count);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Post new answer
async function submitAnswer(question, answer) {
  try {
    const response = await fetch('http://localhost:3000/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionHash: hashQuestion(question.text),
        questionText: question.text,
        correctAnswer: answer,
        source: 'ai'
      })
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Submit failed:', error);
  }
}
```

---

## Rate Limiting

Hiện không có rate limiting. Sẽ thêm sau:

```
- Max 100 requests/minute per IP
- Max 1000 requests/day per IP
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "message": "Detailed explanation"
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (missing fields, invalid data)
- `404`: Not Found (answer, endpoint)
- `500`: Server Error
- `503`: Service Unavailable (database down)

---

## CORS

Kích hoạt CORS cho các domain:

```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'chrome-extension://*'
  ]
}));
```

---

## Future Enhancements

- [ ] Authentication (API key / OAuth)
- [ ] Rate limiting
- [ ] Pagination
- [ ] Webhooks
- [ ] GraphQL endpoint
- [ ] WebSocket for real-time sync
- [ ] Version 2 API

---

**Last Updated**: 2024-09-14
**API Version**: 1.0.0
