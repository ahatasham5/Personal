import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Clock, Target, AlertTriangle, BrainCircuit, Zap, Briefcase, Rocket, Users, Calendar, ChevronRight } from 'lucide-react';
import { gemini } from '../services/gemini';
import Markdown from 'react-markdown';

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [identityScore, setIdentityScore] = useState<any>(null);
  const [coaching, setCoaching] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, scoreRes, statsRes] = await Promise.all([
        fetch('/api/logs'),
        fetch('/api/identity-score'),
        fetch('/api/stats')
      ]);
      const logsData = await logsRes.json();
      const scoreData = await scoreRes.json();
      const statsData = await statsRes.json();
      
      setLogs(logsData);
      setIdentityScore(scoreData);
      setStats(statsData);

      if (logsData.length > 0) {
        // Filter for last 7 days for AI coaching
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const filteredLogs = logsData.filter((l: any) => new Date(l.date) >= sevenDaysAgo);

        const coachMsg = await gemini.getBehavioralCoaching({
          logs: filteredLogs,
          stats: statsData
        });
        setCoaching(coachMsg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = [
    { name: 'Corporate', value: stats?.categorySplit?.job || 0, color: '#6366f1' },
    { name: 'Personal', value: stats?.categorySplit?.company || 0, color: '#10b981' },
    { name: 'Family', value: stats?.categorySplit?.family || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Regularity (Streak)" 
          value={`${stats?.streak || 0} Days`} 
          icon={Calendar} 
          trend="Consistency is key" 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatCard 
          title="Growth Ratio" 
          value={`${stats?.growthRatio || 0}%`} 
          icon={TrendingUp} 
          trend="Future vs Present" 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          title="Identity Alignment" 
          value={`${stats?.avgIdentityScore || 'N/A'}/10`} 
          icon={Target} 
          trend="Last 30 days avg" 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatCard 
          title="Goal Momentum" 
          value={`${stats?.goalProgress || 0}%`} 
          icon={Award} 
          trend="Weekly targets" 
          color="text-rose-600" 
          bg="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Split & Regularity Details */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Family vs Personal vs Corporate</h3>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data logged yet
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-600">Corporate (Job)</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.categorySplit?.job || 0} logs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-f59e0b" style={{ backgroundColor: '#f59e0b' }} />
                  <span className="text-slate-600">Family</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.categorySplit?.family || 0} logs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Personal (Growth)</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.categorySplit?.company || 0} logs</span>
              </div>
            </div>
          </div>

          {/* Regularity Indicator */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Regularity</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="flex gap-1.5 h-8">
              {[...Array(14)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-sm",
                    i < (stats?.streak || 0) ? "bg-indigo-500" : "bg-slate-100"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Last 14 Days Activity</p>
          </div>
        </div>

        {/* AI Coaching */}
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <BrainCircuit className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold tracking-tight">Future Self Operating Report</h3>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300">
                <Markdown>{coaching || "Continue logging your daily actions to unlock deep behavioral insights and growth strategies."}</Markdown>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Growth Velocity</span>
                <span className="text-lg font-bold text-emerald-400">+{stats?.growthRatio || 0}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Trust</span>
                <span className="text-lg font-bold text-indigo-400">High</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* High Impact & Goal Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">High Impact Actions</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {stats?.impactSplit?.high || 0} Total
            </span>
          </div>
          <div className="divide-y divide-border">
            {logs.filter(l => l.impact_level === 'High').slice(0, 4).map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    log.category === 'job' ? "bg-indigo-50 text-indigo-600" :
                    log.category === 'company' ? "bg-emerald-50 text-emerald-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    {log.category === 'job' ? <Briefcase size={18} /> :
                     log.category === 'company' ? <Rocket size={18} /> :
                     <Users size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{log.title}</p>
                    <p className="text-xs text-slate-500">{log.category} • {log.time_spent}m</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Growth vs Maintenance Ratio</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                <span>Personal Growth (Company)</span>
                <span>{stats?.growthRatio || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000" 
                  style={{ width: `${stats?.growthRatio || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                <span>Maintenance (Job)</span>
                <span>{100 - (stats?.growthRatio || 0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full transition-all duration-1000" 
                  style={{ width: `${100 - (stats?.growthRatio || 0)}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Insight:</span> Your growth ratio is {stats?.growthRatio > 30 ? 'healthy' : 'low'}. 
                {stats?.growthRatio > 30 
                  ? ' You are investing significantly in your future self.' 
                  : ' You are spending most of your time on current maintenance. Consider scheduling more Company blocks.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", bg, color)}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live</span>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <span className="text-xs font-medium text-emerald-600">{trend}</span>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
