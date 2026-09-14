/**
 * Backend Server - Node.js
 * Kết nối Extension với SQL Server
 * 
 * Để chạy:
 * 1. npm install express mssql cors dotenv
 * 2. Tạo .env file
 * 3. node backend/server.js
 */

require('dotenv').config();
const express = require('express');
const mssql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Xác định loại authentication
 * - windows: Dùng Windows Authentication (tài khoản mặc định)
 * - sql: Dùng SQL Server Authentication (sa account)
 */
function getAuthConfig() {
    const authType = process.env.DB_AUTH_TYPE || 'windows';
    
    if (authType.toLowerCase() === 'windows') {
        console.log('📊 Using Windows Authentication (NTLM)');
        return {
            type: 'ntlm',
            options: {
                domain: process.env.DB_DOMAIN || undefined
            }
        };
    } else {
        console.log('📊 Using SQL Server Authentication');
        return {
            type: 'default',
            options: {
                userName: process.env.DB_USER || 'sa',
                password: process.env.DB_PASSWORD || 'password'
            }
        };
    }
}

// SQL Server Connection Config
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'QuizAnswerVault',
    authentication: getAuthConfig(),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false,
        trustServerCertificate: true,
        connectionTimeout: 15000,
        requestTimeout: 30000
    }
};

let pool = null;

/**
 * Kết nối đến database
 */
async function connectDB() {
    try {
        pool = new mssql.ConnectionPool(dbConfig);
        await pool.connect();
        console.log('✅ Connected to SQL Server');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: pool ? 'connected' : 'disconnected'
    });
});

/**
 * Lấy tất cả đáp án
 */
app.get('/api/answers', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const request = pool.request();
        const result = await request.query(`
            SELECT id, questionHash, questionText, correctAnswer, explanation, 
                   timestamp, confirmed, source
            FROM Answers
            ORDER BY timestamp DESC
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            answers: result.recordset
        });
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Tìm đáp án bằng question hash
 */
app.get('/api/answers/:questionHash', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { questionHash } = req.params;
        const request = pool.request();
        const result = await request
            .input('questionHash', mssql.VarChar, questionHash)
            .query(`
                SELECT TOP 1 *
                FROM Answers
                WHERE questionHash = @questionHash
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Answer not found' });
        }

        res.json({
            success: true,
            answer: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching answer:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Thêm/Update đáp án
 */
app.post('/api/answers', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { questionHash, questionText, correctAnswer, explanation, confirmed, source } = req.body;

        if (!questionHash || !questionText || !correctAnswer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const request = pool.request();
        const result = await request
            .input('questionHash', mssql.VarChar, questionHash)
            .input('questionText', mssql.NVarChar, questionText)
            .input('correctAnswer', mssql.VarChar, correctAnswer)
            .input('explanation', mssql.NVarChar, explanation || null)
            .input('confirmed', mssql.Bit, confirmed ? 1 : 0)
            .input('source', mssql.VarChar, source || 'ai')
            .query(`
                MERGE Answers AS target
                USING (SELECT @questionHash as questionHash) AS source
                ON target.questionHash = source.questionHash
                WHEN MATCHED THEN
                    UPDATE SET correctAnswer = @correctAnswer, 
                               explanation = @explanation,
                               confirmed = @confirmed,
                               source = @source
                WHEN NOT MATCHED THEN
                    INSERT (questionHash, questionText, correctAnswer, explanation, confirmed, source)
                    VALUES (@questionHash, @questionText, @correctAnswer, @explanation, @confirmed, @source);
            `);

        res.json({
            success: true,
            message: 'Answer saved/updated',
            rowsAffected: result.rowsAffected[0]
        });
    } catch (error) {
        console.error('Error saving answer:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Batch insert đáp án
 */
app.post('/api/answers/batch', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: 'Invalid answers array' });
        }

        let totalInserted = 0;

        for (const answer of answers) {
            const request = pool.request();
            const result = await request
                .input('questionHash', mssql.VarChar, answer.questionHash)
                .input('questionText', mssql.NVarChar, answer.questionText)
                .input('correctAnswer', mssql.VarChar, answer.correctAnswer)
                .input('explanation', mssql.NVarChar, answer.explanation || null)
                .input('confirmed', mssql.Bit, answer.confirmed ? 1 : 0)
                .input('source', mssql.VarChar, answer.source || 'ai')
                .query(`
                    MERGE Answers AS target
                    USING (SELECT @questionHash as questionHash) AS source
                    ON target.questionHash = source.questionHash
                    WHEN NOT MATCHED THEN
                        INSERT (questionHash, questionText, correctAnswer, explanation, confirmed, source)
                        VALUES (@questionHash, @questionText, @correctAnswer, @explanation, @confirmed, @source);
                `);
            
            totalInserted += result.rowsAffected[0] || 0;
        }

        res.json({
            success: true,
            message: `${totalInserted} answers inserted`,
            totalInserted
        });
    } catch (error) {
        console.error('Error batch inserting answers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Xóa đáp án
 */
app.delete('/api/answers/:id', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { id } = req.params;
        const request = pool.request();
        const result = await request
            .input('id', mssql.Int, id)
            .query('DELETE FROM Answers WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Answer not found' });
        }

        res.json({ success: true, message: 'Answer deleted' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Xóa tất cả đáp án
 */
app.delete('/api/answers', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        if (!req.query.confirm || req.query.confirm !== 'yes') {
            return res.status(400).json({ 
                error: 'Confirmation required',
                message: 'Add ?confirm=yes to delete all answers'
            });
        }

        const request = pool.request();
        const result = await request.query('DELETE FROM Answers');

        res.json({ 
            success: true, 
            message: 'All answers deleted',
            rowsAffected: result.rowsAffected[0]
        });
    } catch (error) {
        console.error('Error clearing answers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Thống kê
 */
app.get('/api/stats', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const request = pool.request();
        const result = await request.query(`
            SELECT 
                COUNT(*) as totalAnswers,
                SUM(CASE WHEN confirmed = 1 THEN 1 ELSE 0 END) as confirmedAnswers,
                SUM(CASE WHEN source = 'ai' THEN 1 ELSE 0 END) as aiAnswers,
                SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manualAnswers,
                SUM(CASE WHEN source = 'vault' THEN 1 ELSE 0 END) as vaultAnswers,
                MIN(timestamp) as firstAnswer,
                MAX(timestamp) as lastAnswer
            FROM Answers
        `);

        res.json({
            success: true,
            stats: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Tìm tương tự (similarity search)
 */
app.post('/api/answers/search', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { questionText, limit = 5 } = req.body;

        if (!questionText) {
            return res.status(400).json({ error: 'questionText required' });
        }

        const request = pool.request();
        const result = await request
            .input('questionText', mssql.NVarChar, `%${questionText}%`)
            .input('limit', mssql.Int, limit)
            .query(`
                SELECT TOP (@limit) *
                FROM Answers
                WHERE questionText LIKE @questionText
                ORDER BY timestamp DESC
            `);

        res.json({
            success: true,
            count: result.recordset.length,
            answers: result.recordset
        });
    } catch (error) {
        console.error('Error searching answers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

/**
 * Khởi động server
 */
async function startServer() {
    const connected = await connectDB();
    
    if (!connected) {
        console.warn('⚠️ Warning: Database not connected, server starting in offline mode');
    }

    app.listen(PORT, () => {
        console.log(`
🚀 Quiz Auto Solver Backend Server
📡 Running on http://localhost:${PORT}
📊 Database: ${connected ? 'Connected' : 'Offline'}
        `);
    });
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (pool) {
        await pool.close();
    }
    process.exit(0);
});

// Start server
startServer();

module.exports = app;
