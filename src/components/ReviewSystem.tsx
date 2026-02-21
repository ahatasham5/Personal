import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, AlertCircle, TrendingUp, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { gemini } from '../services/gemini';
import Markdown from 'react-markdown';

export default function ReviewSystem() {
  const [activeReview, setActiveReview] = useState<'daily' | 'weekly'>('daily');
  const [reviews, setReviews] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [formData, setFormData] = useState({
    win: '', mistake: '', priority: '', losses: '', goal_movement: '', time_waste: '', next_theme: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [revRes, logRes] = await Promise.all([
      fetch('/api/reviews'),
      fetch('/api/logs')
    ]);
    setReviews(await revRes.json());
    setLogs(await logRes.json());
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const s = await gemini.summarizeWeek(logs.slice(0, 20));
      setSummary(s);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: activeReview,
        date: new Date().toISOString().split('T')[0],
        ...formData,
        summary: summary
      })
    });
    setFormData({ win: '', mistake: '', priority: '', losses: '', goal_movement: '', time_waste: '', next_theme: '' });
    setSummary('');
    fetchData();
    alert(`${activeReview} review saved!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('daily')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeReview === 'daily' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Daily Review
        </button>
        <button 
          onClick={() => setActiveTab('weekly')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeReview === 'weekly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Weekly Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              {activeReview === 'daily' ? 'End of Day Reflection' : 'Weekly Operating Review'}
            </h3>
            
            {activeReview === 'daily' ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Biggest Win Today</label>
                  <input 
                    value={formData.win} onChange={e => setFormData({...formData, win: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What's one thing that went well?"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">One Mistake / Lesson</label>
                  <input 
                    value={formData.mistake} onChange={e => setFormData({...formData, mistake: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What would you do differently?"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">#1 Priority Tomorrow</label>
                  <input 
                    value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="The one thing that must happen."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Wins</label>
                    <textarea 
                      value={formData.win} onChange={e => setFormData({...formData, win: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-border outline-none h-24"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Losses</label>
                    <textarea 
                      value={formData.losses} onChange={e => setFormData({...formData, losses: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-border outline-none h-24"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">What moved my long-term goals?</label>
                  <input 
                    value={formData.goal_movement} onChange={e => setFormData({...formData, goal_movement: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Next Week's Focus (1 Theme Only)</label>
                  <input 
                    value={formData.next_theme} onChange={e => setFormData({...formData, next_theme: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border outline-none font-bold text-indigo-600"
                    placeholder="e.g. SHIP PRODUCT"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={generateSummary}
                disabled={loadingSummary}
                className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-700 disabled:opacity-50"
              >
                <Sparkles size={16} />
                {loadingSummary ? 'AI Summarizing...' : 'Generate AI Summary'}
              </button>
              <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                Complete Review
              </button>
            </div>

            {summary && (
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">AI Summary of Activity</h4>
                <div className="prose prose-sm prose-indigo">
                  <Markdown>{summary}</Markdown>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Past Reviews</h4>
          <div className="space-y-4">
            {reviews.filter(r => r.type === activeReview).map(review => (
              <div key={review.id} className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(review.date).toLocaleDateString()}</span>
                  <Trophy size={14} className="text-amber-500" />
                </div>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{review.win}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">"{review.mistake || review.next_theme}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function setActiveTab(tab: 'daily' | 'weekly') {
    setActiveReview(tab);
    setFormData({ win: '', mistake: '', priority: '', losses: '', goal_movement: '', time_waste: '', next_theme: '' });
    setSummary('');
  }
}
