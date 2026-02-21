import React, { useState } from 'react';
import { Book, Save, Smile, Meh, Frown, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DiaryEntry() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'Neutral',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Diary entry saved!');
      setFormData({
        title: '',
        content: '',
        mood: 'Neutral',
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setSaving(false);
    }
  };

  const moods = [
    { name: 'Great', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Neutral', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-50' },
    { name: 'Low', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
          <Book size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Daily Diary</h3>
          <p className="text-slate-500 text-sm">Reflect on your day, capture the raw thoughts.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entry Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mood</label>
            <div className="flex gap-2">
              {moods.map(m => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setFormData({...formData, mood: m.name})}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                    formData.mood === m.name ? cn("border-transparent shadow-sm", m.bg, m.color) : "border-border text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <m.icon size={18} />
                  <span className="text-sm font-bold">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
          <input 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
            placeholder="Today's theme in a few words..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">The Reflection</label>
          <textarea 
            required
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none h-64 resize-none leading-relaxed"
            placeholder="Write freely. What happened? How did you feel? What's on your mind?"
          />
        </div>

        <div className="pt-4">
          <button 
            disabled={saving}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
