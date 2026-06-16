
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Restrict CORS to local dev origins only
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Rate limit login to 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'planify_db'
};

let pool;
async function connectDB() {
    pool = await mysql.createPool(dbConfig);
    console.log('Connected to MySQL Database');
}
connectDB();

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const id = uuidv4();
        const avatar = `https://picsum.photos/seed/${id}/100/100`;
        const hashedPassword = await bcrypt.hash(password, 12);
        await pool.query('INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)', [id, name, email, hashedPassword, avatar]);
        await pool.query('INSERT INTO settings (user_id) VALUES (?)', [id]);
        res.status(201).json({ id, name, email, avatar });
    } catch (e) {
        console.error('Signup error:', e);
        res.status(400).json({ error: 'Email already exists' });
    }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = rows[0];
        
        let match = false;
        if (user.password && user.password.startsWith('$2')) {
            match = await bcrypt.compare(password, user.password);
        } else {
            match = (password === user.password);
        }

        if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        // Never send the hashed password back to the client
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- TASKS ROUTES (USER SCOPED) ---
app.get('/api/tasks', async (req, res) => {
    const { userId, deleted } = req.query;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ? AND is_deleted = ?', [userId, deleted === 'true']);
    res.json(rows.map(row => ({
        ...row,
        location: row.location_name ? { name: row.location_name, address: row.location_address, url: row.location_url } : null
    })));
});

app.post('/api/tasks', async (req, res) => {
    const { user_id, id, title, date, time, type, status, color, reminder, location } = req.body;
    const query = `INSERT INTO tasks (id, user_id, title, date, time, type, status, color, reminder, location_name, location_address, location_url) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(query, [id, user_id, title, date, time, type, status, color, reminder, location?.name, location?.address, location?.url]);
    res.status(201).json({ success: true });
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, ...updates } = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id, user_id];
    await pool.query(`UPDATE tasks SET ${fields} WHERE id = ? AND user_id = ?`, values);
    res.json({ success: true });
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { userId, permanent } = req.query;
    if (permanent === 'true') {
        await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    } else {
        await pool.query('UPDATE tasks SET is_deleted = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    }
    res.json({ success: true });
});

// --- BILLS ROUTES (USER SCOPED) ---
app.get('/api/bills', async (req, res) => {
    const { userId, deleted } = req.query;
    const [rows] = await pool.query('SELECT * FROM bills WHERE user_id = ? AND is_deleted = ?', [userId, deleted === 'true']);
    res.json(rows);
});

app.post('/api/bills', async (req, res) => {
    const { user_id, id, name, amount, dueDate, status, category, reminder } = req.body;
    const query = `INSERT INTO bills (id, user_id, name, amount, dueDate, status, category, reminder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(query, [id, user_id, name, amount, dueDate, status, category, reminder]);
    res.status(201).json({ success: true });
});

app.put('/api/bills/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, ...updates } = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id, user_id];
    await pool.query(`UPDATE bills SET ${fields} WHERE id = ? AND user_id = ?`, values);
    res.json({ success: true });
});

// --- SETTINGS ---
app.get('/api/settings/:userId', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [req.params.userId]);
    res.json(rows[0] || { darkMode: false, language: 'fr', timeFormat: '24h' });
});

app.put('/api/settings/:userId', async (req, res) => {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.userId];
    await pool.query(`UPDATE settings SET ${fields} WHERE user_id = ?`, values);
    res.json({ success: true });
});

// --- AI CHATBOT ROUTE (PROXY) ---
app.post('/api/chat', async (req, res) => {
    const { messages, tools, systemPrompt } = req.body;
    try {
        const apiKey = process.env.VITE_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not set on the server' });
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                tools: tools,
                tool_choice: 'auto'
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Mistral API Error: ${response.status} ${err}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error('Chat API Error:', e);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

// --- SERVE STATIC FILES (PRODUCTION) ---
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: serve index.html for all non-API routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
