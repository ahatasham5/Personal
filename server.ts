import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://cbavndsrvoyinqkaiqhk.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_QB8mSFVKpEN3mAyHGMks1A_j2NdGc5g";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());

// API Routes
app.get("/api/logs", async (req, res) => {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase Error (logs):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/logs", async (req, res) => {
  const { title, category, time_spent, impact_level, notes, next_action } = req.body;
  const { data, error } = await supabase
    .from("daily_logs")
    .insert([{ title, category, time_spent, impact_level, notes, next_action }])
    .select();
  if (error) {
    console.error("Supabase Error (post logs):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/goals", async (req, res) => {
  const { data, error } = await supabase.from("goals").select("*");
  if (error) {
    console.error("Supabase Error (goals):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/goals", async (req, res) => {
  const { type, title, target_value } = req.body;
  const { data, error } = await supabase
    .from("goals")
    .insert([{ type, title, target_value }])
    .select();
  if (error) {
    console.error("Supabase Error (post goals):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/non-negotiables", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("non_negotiables")
    .select("*")
    .eq("date", date);
  if (error) {
    console.error("Supabase Error (nn):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/non-negotiables/toggle", async (req, res) => {
  const { date, task, completed } = req.body;
  const { data, error } = await supabase
    .from("non_negotiables")
    .upsert({ date, task, completed: completed ? 1 : 0 }, { onConflict: "date,task" })
    .select();
  if (error) {
    console.error("Supabase Error (toggle nn):", error);
    return res.status(500).json(error);
  }
  res.json({ success: true });
});

app.get("/api/identity-score", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("identity_scores")
    .select("*")
    .eq("date", date)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error("Supabase Error (identity):", error);
    return res.status(500).json(error);
  }
  res.json(data || null);
});

app.post("/api/identity-score", async (req, res) => {
  const { date, score, energy, stress } = req.body;
  const { data, error } = await supabase
    .from("identity_scores")
    .upsert({ date, score, energy, stress }, { onConflict: "date" })
    .select();
  if (error) {
    console.error("Supabase Error (post identity):", error);
    return res.status(500).json(error);
  }
  res.json({ success: true });
});

app.get("/api/ideas", async (req, res) => {
  const { data, error } = await supabase
    .from("idea_vault")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase Error (ideas):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/ideas", async (req, res) => {
  const { title, content, tags } = req.body;
  const { data, error } = await supabase
    .from("idea_vault")
    .insert([{ title, content, tags }])
    .select();
  if (error) {
    console.error("Supabase Error (post ideas):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/diary", async (req, res) => {
  const { search, month, year } = req.query;
  let query = supabase.from("diary").select("*");

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }
  
  const { data, error } = await query.order("date", { ascending: false });
  if (error) {
    console.error("Supabase Error (diary):", error);
    return res.status(500).json(error);
  }
  
  let filteredData = data;
  if (month && month !== "") {
    filteredData = filteredData.filter((d: any) => d.date.split('-')[1] === month.toString().padStart(2, '0'));
  }
  if (year && year !== "") {
    filteredData = filteredData.filter((d: any) => d.date.split('-')[0] === year.toString());
  }

  res.json(filteredData);
});

app.post("/api/diary", async (req, res) => {
  const { title, content, mood, date } = req.body;
  const entryDate = date || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("diary")
    .insert([{ title, content, mood, date: entryDate }])
    .select();
  if (error) {
    console.error("Supabase Error (post diary):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/stop-doing", async (req, res) => {
  const { data, error } = await supabase
    .from("stop_doing")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase Error (stop-doing):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/stop-doing", async (req, res) => {
  const { item } = req.body;
  const { data, error } = await supabase
    .from("stop_doing")
    .insert([{ item }])
    .select();
  if (error) {
    console.error("Supabase Error (post stop-doing):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/reviews", async (req, res) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase Error (reviews):", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post("/api/reviews", async (req, res) => {
  const { type, date, win, mistake, priority, summary, losses, goal_movement, time_waste, next_theme } = req.body;
  const { data, error } = await supabase
    .from("reviews")
    .insert([{ type, date, win, mistake, priority, summary, losses, goal_movement, time_waste, next_theme }])
    .select();
  if (error) {
    console.error("Supabase Error (post reviews):", error);
    return res.status(500).json(error);
  }
  res.json(data[0]);
});

app.get("/api/stats", async (req, res) => {
  const [logsRes, goalsRes, reviewsRes, scoresRes] = await Promise.all([
    supabase.from("daily_logs").select("*"),
    supabase.from("goals").select("*"),
    supabase.from("reviews").select("*"),
    supabase.from("identity_scores").select("*").order("date", { ascending: false }).limit(30)
  ]);

  const logs = logsRes.data || [];
  const goals = goalsRes.data || [];
  const reviews = reviewsRes.data || [];
  const scores = scoresRes.data || [];

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

async function startServer() {
  const PORT = 3000;

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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
