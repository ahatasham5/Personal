import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Target, 
  ClipboardCheck, 
  ShieldCheck, 
  Lightbulb, 
  Sparkles,
  ChevronRight,
  Plus,
  TrendingUp,
  Clock,
  Zap,
  Users,
  Briefcase,
  Rocket,
  Menu,
  X,
  Calendar,
  AlertCircle,
  Book,
  BookOpen,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

// Components
import Dashboard from './components/Dashboard';
import DailyLog from './components/DailyLog';
import Goals from './components/Goals';
import ReviewSystem from './components/ReviewSystem';
import Regulation from './components/Regulation';
import IdeaVault from './components/IdeaVault';
import ContentLab from './components/ContentLab';
import DiaryEntry from './components/DiaryEntry';
import DiaryBrowser from './components/DiaryBrowser';
import Auth from './components/Auth';

type Tab = 'dashboard' | 'logs' | 'goals' | 'reviews' | 'regulation' | 'ideas' | 'content' | 'diary-new' | 'diary-browse';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Daily Log', icon: ClipboardList },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reviews', label: 'Reviews', icon: Calendar },
    { id: 'regulation', label: 'Regulation', icon: ShieldCheck },
    { id: 'diary-new', label: 'Write Diary', icon: Book },
    { id: 'diary-browse', label: 'Diary Archive', icon: BookOpen },
    { id: 'ideas', label: 'Idea Vault', icon: Lightbulb },
    { id: 'content', label: 'Content Lab', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-border flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-xl font-bold tracking-tight text-slate-800"
            >
              FutureSelf<span className="text-indigo-600">OS</span>
            </motion.h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600 font-medium" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(
                "shrink-0",
                activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl",
            isSidebarOpen ? "bg-slate-50" : ""
          )}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {session.user.email?.[0].toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{session.user.email}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 mt-0.5"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-border px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
              <Zap size={14} />
              <span>6 Day Streak</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'logs' && <DailyLog />}
              {activeTab === 'goals' && <Goals />}
              {activeTab === 'reviews' && <ReviewSystem />}
              {activeTab === 'regulation' && <Regulation />}
              {activeTab === 'diary-new' && <DiaryEntry />}
              {activeTab === 'diary-browse' && <DiaryBrowser />}
              {activeTab === 'ideas' && <IdeaVault />}
              {activeTab === 'content' && <ContentLab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
