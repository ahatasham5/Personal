import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DiaryBrowser() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    month: '',
    year: new Date().getFullYear().toString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/diary?${params}`);
      setEntries(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { val: '01', label: 'January' }, { val: '02', label: 'February' }, { val: '03', label: 'March' },
    { val: '04', label: 'April' }, { val: '05', label: 'May' }, { val: '06', label: 'June' },
    { val: '07', label: 'July' }, { val: '08', label: 'August' }, { val: '09', label: 'September' },
    { val: '10', label: 'October' }, { val: '11', label: 'November' }, { val: '12', label: 'December' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Diary Archive</h3>
          <p className="text-slate-500 text-sm">Browse your history and patterns.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              placeholder="Search thoughts..."
              className="pl-10 pr-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <select 
            value={filters.month}
            onChange={e => setFilters({...filters, month: e.target.value})}
            className="px-4 py-2 rounded-xl border border-border outline-none text-sm bg-white"
          >
            <option value="">All Months</option>
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
          <input 
            type="number"
            value={filters.year}
            onChange={e => setFilters({...filters, year: e.target.value})}
            className="w-24 px-4 py-2 rounded-xl border border-border outline-none text-sm bg-white"
            placeholder="Year"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading archive...</div>
        ) : entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.id} className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:border-indigo-200 transition-all group">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      entry.mood === 'Great' ? "bg-emerald-50 text-emerald-600" :
                      entry.mood === 'Low' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                    )}>
                      {entry.mood} Mood
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{entry.title}</h4>
                  <p className="text-slate-600 leading-relaxed line-clamp-3">{entry.content}</p>
                </div>
                <div className="shrink-0 pt-2">
                  <button className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <BookOpen size={32} />
            </div>
            <p className="text-slate-500 italic">No entries found for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
