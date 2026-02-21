import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Tag, Search, Sparkles, ChevronRight, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

export default function IdeaVault() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    const res = await fetch('/api/ideas');
    setIdeas(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsAdding(false);
    setFormData({ title: '', content: '', tags: '' });
    fetchIdeas();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Idea Vault</h3>
          <p className="text-slate-500 text-sm">Capture sparks before they fade. AI will help turn them into MVP plans.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm"
        >
          <Plus size={18} />
          New Idea
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Idea Title</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. AI-powered recipe generator"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Details / Content</label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border outline-none h-32"
                placeholder="Describe the spark..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Tags (comma separated)</label>
              <input 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-border outline-none"
                placeholder="automation, saas, content"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Save Idea</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:border-indigo-200 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Lightbulb size={20} />
              </div>
              <div className="flex gap-1">
                {idea.tags.split(',').map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{idea.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">{idea.content}</p>
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                <Sparkles size={14} />
                AI MVP Plan
                <ChevronRight size={14} />
              </button>
              <span className="text-[10px] text-slate-400">{new Date(idea.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {ideas.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 italic">
            Your vault is empty. Capture your next big idea.
          </div>
        )}
      </div>
    </div>
  );
}
