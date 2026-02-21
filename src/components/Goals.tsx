import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle2, Circle, Plus, Flag } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'outcome', target_value: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await fetch('/api/goals');
    const data = await res.json();
    setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, target_value: parseInt(formData.target_value) || 0 })
    });
    setIsAdding(false);
    setFormData({ title: '', type: 'outcome', target_value: '' });
    fetchGoals();
  };

  const outcomes = goals.filter(g => g.type === 'outcome');
  const weekly = goals.filter(g => g.type === 'weekly');

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">North Star & Targets</h3>
          <p className="text-slate-500 text-sm">Align your weekly behavior with long-term outcomes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Goal Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. AI Builder Authority"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="outcome">Outcome (Long-term)</option>
                  <option value="weekly">Weekly Target (Behavior)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Save Goal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Outcomes */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <Flag className="text-indigo-600" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Long-term Outcomes</h4>
          </div>
          <div className="space-y-4">
            {outcomes.map(goal => (
              <div key={goal.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm group hover:border-indigo-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-slate-900">{goal.title}</h5>
                  <TrendingUp size={16} className="text-slate-300 group-hover:text-indigo-400" />
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[30%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Progress: 30%</p>
              </div>
            ))}
            {outcomes.length === 0 && <p className="text-slate-400 text-sm italic">No long-term goals set.</p>}
          </div>
        </div>

        {/* Weekly Targets */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <Target className="text-emerald-600" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Weekly Behavior Targets</h4>
          </div>
          <div className="space-y-4">
            {weekly.map(goal => (
              <div key={goal.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{goal.title}</h5>
                    <p className="text-xs text-slate-500">Target: 5x per week</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={cn(
                      "w-2 h-6 rounded-sm",
                      i <= 3 ? "bg-emerald-500" : "bg-slate-100"
                    )} />
                  ))}
                </div>
              </div>
            ))}
            {weekly.length === 0 && <p className="text-slate-400 text-sm italic">No weekly targets set.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
