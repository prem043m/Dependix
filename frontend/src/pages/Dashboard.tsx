import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Shield, GitBranch, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import RepositoryTable from "../components/tables/RepositoryTable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: any, icon: any, color: string, trend?: string }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 hover-card flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const response = await api.get("/repositories");
      return response.data;
    },
  });

  const repositories = data?.repositories || [];

  const healthy = repositories.filter(
    (r: any) => r.latestScan?.status === "PASSED"
  ).length;

  const risky = repositories.filter(
    (r: any) => r.latestScan?.status === "FAILED"
  ).length;

  // Mock data for the trend chart
  const trendData = [
    { name: "Mon", scans: 4 },
    { name: "Tue", scans: 7 },
    { name: "Wed", scans: 5 },
    { name: "Thu", scans: 8 },
    { name: "Fri", scans: 12 },
    { name: "Sat", scans: 9 },
    { name: "Sun", scans: 15 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">
          <Activity size={14} />
          System Overview
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900">Security Command</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Monitored Assets" 
          value={repositories.length} 
          icon={GitBranch} 
          color="bg-slate-900" 
          trend="+12%"
        />
        <StatCard 
          title="Safe Repositories" 
          value={healthy} 
          icon={Shield} 
          color="bg-blue-600" 
          trend="Stable"
        />
        <StatCard 
          title="Vulnerabilities Found" 
          value={risky} 
          icon={AlertTriangle} 
          color="bg-rose-500" 
          trend="-24%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200/60 p-10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Scanning Activity</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/10">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScans)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Security Tip</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enable "Auto-Merge" for low-risk patch updates to keep your dependencies fresh without manual overhead.
            </p>
          </div>
          <div className="relative z-10 pt-10">
            <button className="group flex items-center gap-2 font-black text-sm text-blue-400">
              LEARN MORE
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
          {/* Background decoration */}
          <Shield size={200} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Active Repositories</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Live Security Posture</p>
          </div>
          <button className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800 transition-colors">
            View All Projects
          </button>
        </div>
        <div className="px-4">
          {isLoading ? (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</div>
          ) : (
            <RepositoryTable repositories={repositories} />
          )}
        </div>
      </div>
    </div>
  );
}

import { Activity } from "lucide-react";