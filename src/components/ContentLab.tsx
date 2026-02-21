import React, { useState, useEffect } from 'react';
import { Sparkles, Linkedin, Youtube, Instagram, Globe, Video, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { gemini } from '../services/gemini';
import Markdown from 'react-markdown';

export default function ContentLab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [platform, setPlatform] = useState('LinkedIn');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [logRes, ideaRes] = await Promise.all([
      fetch('/api/logs'),
      fetch('/api/ideas')
    ]);
    setLogs(await logRes.json());
    setIdeas(await ideaRes.json());
  };

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const [goalsRes, diaryRes, reviewsRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/diary'),
        fetch('/api/reviews')
      ]);
      
      const userData = {
        recentLogs: logs.slice(0, 15),
        topIdeas: ideas.slice(0, 5),
        goals: await goalsRes.json(),
        diary: (await diaryRes.json()).slice(0, 5),
        reviews: (await reviewsRes.json()).slice(0, 3)
      };
      const result = await gemini.generateContentIdeas(userData, platform);
      setContent(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'YouTube', icon: Youtube, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { name: 'TikTok', icon: Video, color: 'text-slate-900', bg: 'bg-slate-100' },
    { name: 'Blog', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-serif font-bold text-slate-900">Content Lab</h3>
        <p className="text-slate-500">Transform your daily execution into authority-building content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Platform</h4>
          <div className="space-y-2">
            {platforms.map(p => (
              <button
                key={p.name}
                onClick={() => setPlatform(p.name)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  platform === p.name ? "bg-white border-indigo-200 shadow-md scale-[1.02]" : "bg-white/50 border-border hover:bg-white"
                )}
              >
                <div className={cn("p-2 rounded-xl", p.bg, p.color)}>
                  <p.icon size={18} />
                </div>
                <span className={cn("font-bold text-sm", platform === p.name ? "text-slate-900" : "text-slate-500")}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={generateIdeas}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            Generate {platform} Ideas
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-border shadow-sm min-h-[500px] flex flex-col">
            <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Content Engine</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
            </div>
            
            <div className="flex-1 p-8">
              {content ? (
                <div className="prose prose-slate max-w-none">
                  <Markdown>{content}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="p-6 bg-slate-50 rounded-full">
                    <Send size={48} className="text-slate-300" />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-bold text-slate-900">Ready to build authority?</p>
                    <p className="text-sm">Select a platform and click generate to see content ideas based on your real data.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
