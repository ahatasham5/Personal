import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Rocket, Users, Clock, Zap, MessageSquare, ChevronRight, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DailyLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'job',
    time_spent: '',
    impact_level: 'Med',
    notes: '',
    next_action: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    setLogs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        time_spent: parseInt(formData.time_spent) || 0
      })
    });
    setIsAdding(false);
    setFormData({ title: '', category: 'job', time_spent: '', impact_level: 'Med', notes: '', next_action: '' });
    fetchLogs();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Daily Activity Log</h3>
          <p className="text-slate-500 text-sm">The heart of your operating system.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Log Activity
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="What did you do?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="job">Job</option>
                  <option value="company">Company</option>
                  <option value="family">Family</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Time Spent (min)</label>
                <input 
                  type="number"
                  value={formData.time_spent}
                  onChange={e => setFormData({...formData, time_spent: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Impact Level</label>
                <select 
                  value={formData.impact_level}
                  onChange={e => setFormData({...formData, impact_level: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Med">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                placeholder="What changed because of this?"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Next Action (Closure)</label>
              <input 
                value={formData.next_action}
                onChange={e => setFormData({...formData, next_action: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="One sentence to force closure..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Save Log
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:border-indigo-200 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  log.category === 'job' ? "bg-indigo-50 text-indigo-600" :
                  log.category === 'company' ? "bg-emerald-50 text-emerald-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {log.category === 'job' ? <Briefcase size={22} /> :
                   log.category === 'company' ? <Rocket size={22} /> :
                   <Users size={22} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{log.title}</h4>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      log.impact_level === 'High' ? "bg-rose-50 text-rose-600" :
                      log.impact_level === 'Med' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-50 text-slate-500"
                    )}>
                      {log.impact_level} Impact
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{log.notes}</p>
                  {log.next_action && (
                    <div className="flex items-center gap-2 mt-3 text-xs font-medium text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg w-fit">
                      <ChevronRight size={14} />
                      <span>Next: {log.next_action}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mb-1">
                  <Clock size={12} />
                  <span>{log.time_spent}m</span>
                </div>
                <p className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <ClipboardCheck size={32} />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">No logs yet</p>
              <p className="text-sm text-slate-500">Start tracking your high-leverage actions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
