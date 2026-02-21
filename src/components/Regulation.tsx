import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, BookOpen, Users, Moon, Check, X, AlertCircle, Clock, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Regulation() {
  const [nonNegotiables, setNonNegotiables] = useState<any[]>([]);
  const [identity, setIdentity] = useState({ score: 5, energy: 3, stress: 3 });
  const [stopDoing, setStopDoing] = useState<any[]>([]);
  const [newStopItem, setNewStopItem] = useState('');

  const defaultTasks = [
    { task: '90 min Deep Work (Company)', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { task: '20 min Learning/Build', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { task: 'Family Time Block', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { task: 'Sleep Threshold (7h+)', icon: Moon, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [nnRes, idRes, sdRes] = await Promise.all([
      fetch('/api/non-negotiables'),
      fetch('/api/identity-score'),
      fetch('/api/stop-doing')
    ]);
    setNonNegotiables(await nnRes.json());
    const idData = await idRes.json();
    if (idData) setIdentity(idData);
    setStopDoing(await sdRes.json());
  };

  const toggleNN = async (task: string, current: boolean) => {
    await fetch('/api/non-negotiables/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString().split('T')[0], task, completed: !current })
    });
    fetchData();
  };

  const saveIdentity = async () => {
    await fetch('/api/identity-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString().split('T')[0], ...identity })
    });
    alert('Identity score saved!');
  };

  const addStopItem = async () => {
    if (!newStopItem) return;
    await fetch('/api/stop-doing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newStopItem })
    });
    setNewStopItem('');
    fetchData();
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Non-Negotiables */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <ShieldCheck className="text-indigo-600" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Daily Non-Negotiables</h4>
          </div>
          <div className="space-y-3">
            {defaultTasks.map((item) => {
              const status = nonNegotiables.find(n => n.task === item.task);
              const isCompleted = status?.completed === 1;
              return (
                <button 
                  key={item.task}
                  onClick={() => toggleNN(item.task, isCompleted)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                    isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-white border-border hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                      <item.icon size={18} />
                    </div>
                    <span className={cn("font-medium", isCompleted ? "text-emerald-700" : "text-slate-700")}>
                      {item.task}
                    </span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                  )}>
                    {isCompleted && <Check size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Identity Score */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <Zap className="text-amber-500" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Identity & Energy</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Did I act like my future self today?</label>
                <span className="text-lg font-bold text-indigo-600">{identity.score}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={identity.score} 
                onChange={e => setIdentity({...identity, score: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Energy</label>
                  <span className="text-xs font-bold text-slate-900">{identity.energy}/5</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={identity.energy} 
                  onChange={e => setIdentity({...identity, energy: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stress</label>
                  <span className="text-xs font-bold text-slate-900">{identity.stress}/5</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={identity.stress} 
                  onChange={e => setIdentity({...identity, stress: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
            <button 
              onClick={saveIdentity}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Save Daily Reflection
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Stop Doing List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <X className="text-rose-500" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Stop Doing List</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex gap-2">
              <input 
                value={newStopItem}
                onChange={e => setNewStopItem(e.target.value)}
                placeholder="Remove a hidden time leak..."
                className="flex-1 px-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button 
                onClick={addStopItem}
                className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {stopDoing.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-rose-700 text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>{item.item}</span>
                </div>
              ))}
              {stopDoing.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">No items yet. What's wasting your time?</p>}
            </div>
          </div>
        </div>

        {/* Simple Time Block Planner */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <Clock className="text-slate-600" size={20} />
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Simple Time-Block Planner</h4>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {['Must Do', 'Should Do', 'Nice To Do'].map((type, i) => (
              <div key={type} className="bg-white p-4 rounded-2xl border border-border flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-indigo-600 text-white" : i === 1 ? "bg-slate-200 text-slate-700" : "bg-slate-50 text-slate-400"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{type}</p>
                  <input 
                    placeholder="Plan your core block..."
                    className="w-full text-sm font-medium text-slate-900 bg-transparent outline-none border-none p-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
