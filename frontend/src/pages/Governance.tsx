import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ShieldCheck, CheckCircle2, Award, Zap } from "lucide-react";

export default function Governance() {
  const { data, isLoading } = useQuery({
    queryKey: ["governance-summary"],
    queryFn: async () => {
      const response = await api.get("/governance/summary");
      return response.data;
    },
  });

  if (isLoading) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Calculating Compliance...</div>;

  const summary = data?.summary || {
    totalRepositories: 0,
    compliantRepositories: 0,
    nonCompliantRepositories: 0,
    complianceRate: "0%",
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">
          <ShieldCheck size={14} />
          Compliance Engine
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900">Governance Policy</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              <Award size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Global Health Score</span>
            </div>
            <div>
              <div className="text-8xl font-black tracking-tighter mb-2">{summary.complianceRate}</div>
              <p className="text-blue-100 font-semibold">Organization-wide security compliance across all active assets.</p>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/10">
              <div className="bg-white h-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: summary.complianceRate }} />
            </div>
          </div>
          <ShieldCheck size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm flex-1 flex flex-col justify-between">
            <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Total Repositories</div>
            <div className="text-4xl font-black text-slate-900">{summary.totalRepositories}</div>
            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1 rounded-full">
              <Zap size={14} />
              Scanning Active
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm flex-1 flex flex-col justify-between">
            <div className="text-rose-500 font-black text-[10px] uppercase tracking-widest mb-2">Policy Failures</div>
            <div className="text-4xl font-black text-rose-600">{summary.nonCompliantRepositories}</div>
            <div className="mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Requires Attention</div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-center gap-6 relative overflow-hidden">
          <h3 className="text-xl font-black tracking-tight relative z-10">Compliance Status</h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Compliant</span>
              <span className="text-green-400 font-black">{summary.compliantRepositories}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-400 h-full" style={{ width: `${(summary.compliantRepositories / summary.totalRepositories) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Risky</span>
              <span className="text-rose-400 font-black">{summary.nonCompliantRepositories}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full" style={{ width: `${(summary.nonCompliantRepositories / summary.totalRepositories) * 100}%` }} />
            </div>
          </div>
          <CheckCircle2 size={120} className="absolute -bottom-10 -right-10 text-white/5" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Governance Log</h2>
          <div className="flex gap-2">
            <button className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all">Export Report</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Policy Settings</button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
            <tr>
              <th className="px-10 py-5">Repository ID</th>
              <th className="px-6 py-5">Security Status</th>
              <th className="px-6 py-5">Scanner Tool</th>
              <th className="px-6 py-5 text-right">Evaluation Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.latestScans?.map((scan: any) => (
              <tr key={scan.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-10 py-6">
                  <div className="font-mono text-xs font-bold text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {scan.repositoryId}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    scan.status === "FAILED" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-green-50 text-green-600 border border-green-100"
                  }`}>
                    {scan.status === "FAILED" ? "ACTION REQUIRED" : "COMPLIANT"}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{scan.tool}</span>
                </td>
                <td className="px-6 py-6 text-right">
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
