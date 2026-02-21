import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("futureself.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    title TEXT NOT NULL,
    category TEXT CHECK(category IN ('job', 'company', 'family')),
    time_spent INTEGER,
    impact_level TEXT CHECK(impact_level IN ('Low', 'Med', 'High')),
    notes TEXT,
    next_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('outcome', 'weekly')),
    title TEXT NOT NULL,
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('daily', 'weekly')),
    date TEXT DEFAULT (date('now')),
    win TEXT,
    mistake TEXT,
    priority TEXT,
    summary TEXT,
    losses TEXT,
    goal_movement TEXT,
    time_waste TEXT,
    next_theme TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS non_negotiables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    UNIQUE(date, task)
  );

  CREATE TABLE IF NOT EXISTS stop_doing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT NOT NULL,
    week_start TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS idea_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS identity_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    score INTEGER,
    energy INTEGER,
    stress INTEGER,
    UNIQUE(date)
  );

  CREATE TABLE IF NOT EXISTS time_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    block_type TEXT CHECK(block_type IN ('Must', 'Should', 'Nice')),
    category TEXT,
    task TEXT,
    UNIQUE(date, block_type)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM daily_logs ORDER BY created_at DESC").all();
    res.json(logs);
  });

  app.post("/api/logs", (req, res) => {
    const { title, category, time_spent, impact_level, notes, next_action } = req.body;
    const info = db.prepare(`
      INSERT INTO daily_logs (title, category, time_spent, impact_level, notes, next_action)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, category, time_spent, impact_level, notes, next_action);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/goals", (req, res) => {
    const goals = db.prepare("SELECT * FROM goals").all();
    res.json(goals);
  });

  app.post("/api/goals", (req, res) => {
    const { type, title, target_value } = req.body;
    const info = db.prepare("INSERT INTO goals (type, title, target_value) VALUES (?, ?, ?)").run(type, title, target_value);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/non-negotiables", (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const items = db.prepare("SELECT * FROM non_negotiables WHERE date = ?").all(date);
    res.json(items);
  });

  app.post("/api/non-negotiables/toggle", (req, res) => {
    const { date, task, completed } = req.body;
    db.prepare(`
      INSERT INTO non_negotiables (date, task, completed)
      VALUES (?, ?, ?)
      ON CONFLICT(date, task) DO UPDATE SET completed = excluded.completed
    `).run(date, task, completed ? 1 : 0);
    res.json({ success: true });
  });

  app.get("/api/identity-score", (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const score = db.prepare("SELECT * FROM identity_scores WHERE date = ?").get(date);
    res.json(score || null);
  });

  app.post("/api/identity-score", (req, res) => {
    const { date, score, energy, stress } = req.body;
    db.prepare(`
      INSERT INTO identity_scores (date, score, energy, stress)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET score=excluded.score, energy=excluded.energy, stress=excluded.stress
    `).run(date, score, energy, stress);
    res.json({ success: true });
  });

  app.get("/api/ideas", (req, res) => {
    const ideas = db.prepare("SELECT * FROM idea_vault ORDER BY created_at DESC").all();
    res.json(ideas);
  });

  app.post("/api/ideas", (req, res) => {
    const { title, content, tags } = req.body;
    const info = db.prepare("INSERT INTO idea_vault (title, content, tags) VALUES (?, ?, ?)").run(title, content, tags);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/diary", (req, res) => {
    const { search, month, year } = req.query;
    let query = "SELECT * FROM diary WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (month && month !== "") {
      query += " AND strftime('%m', date) = ?";
      params.push(month.toString().padStart(2, '0'));
    }
    if (year && year !== "") {
      query += " AND strftime('%Y', date) = ?";
      params.push(year.toString());
    }

    query += " ORDER BY date DESC";
    const entries = db.prepare(query).all(...params);
    res.json(entries);
  });

  app.post("/api/diary", (req, res) => {
    const { title, content, mood, date } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    const info = db.prepare("INSERT INTO diary (title, content, mood, date) VALUES (?, ?, ?, ?)").run(title, content, mood, entryDate);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/stop-doing", (req, res) => {
    const items = db.prepare("SELECT * FROM stop_doing ORDER BY created_at DESC").all();
    res.json(items);
  });

  app.post("/api/stop-doing", (req, res) => {
    const { item } = req.body;
    const info = db.prepare("INSERT INTO stop_doing (item) VALUES (?)").run(item);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/reviews", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { type, date, win, mistake, priority, summary, losses, goal_movement, time_waste, next_theme } = req.body;
    const info = db.prepare(`
      INSERT INTO reviews (type, date, win, mistake, priority, summary, losses, goal_movement, time_waste, next_theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(type, date, win, mistake, priority, summary, losses, goal_movement, time_waste, next_theme);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/stats", (req, res) => {
    const logs = db.prepare("SELECT * FROM daily_logs").all();
    const goals = db.prepare("SELECT * FROM goals").all();
    const reviews = db.prepare("SELECT * FROM reviews").all();
    const scores = db.prepare("SELECT * FROM identity_scores ORDER BY date DESC LIMIT 30").all();

    // Calculate Streak
    const logDates = [...new Set(logs.map((l: any) => l.date))].sort().reverse() as string[];
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    if (logDates.length > 0 && (logDates[0] === today || new Date(today).getTime() - new Date(logDates[0]).getTime() <= 86400000)) {
      for (let i = 0; i < logDates.length; i++) {
        const expected = new Date();
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (logDates[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }
    }

    res.json({
      totalLogs: logs.length,
      streak,
      categorySplit: {
        job: logs.filter((l: any) => l.category === 'job').length,
        company: logs.filter((l: any) => l.category === 'company').length,
        family: logs.filter((l: any) => l.category === 'family').length,
      },
      impactSplit: {
        high: logs.filter((l: any) => l.impact_level === 'High').length,
        med: logs.filter((l: any) => l.impact_level === 'Med').length,
        low: logs.filter((l: any) => l.impact_level === 'Low').length,
      },
      growthRatio: logs.length > 0 ? ((logs.filter((l: any) => l.category === 'company' || l.impact_level === 'High').length / logs.length) * 100).toFixed(1) : 0,
      goalProgress: goals.length > 0 ? (goals.filter((g: any) => g.status === 'completed').length / goals.length * 100).toFixed(1) : 0,
      avgIdentityScore: scores.length > 0 ? (scores.reduce((acc: number, s: any) => acc + s.score, 0) / scores.length).toFixed(1) : 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
