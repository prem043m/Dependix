import { ChevronRight, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  repositories: any[];
};

export default function RepositoryTable({ repositories }: Props) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
          <tr>
            <th className="px-6 py-4">Security Asset</th>
            <th className="px-6 py-4">Environment</th>
            <th className="px-6 py-4">Scan Status</th>
            <th className="px-6 py-4">Risk Level</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {repositories.map((repo) => (
            <tr key={repo.id} className="hover:bg-slate-50/80 transition-all group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black text-lg border border-slate-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {repo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 tracking-tight">{repo.name}</span>
                      {repo.visibility === "public" ? <Globe size={12} className="text-slate-400" /> : <Lock size={12} className="text-slate-400" />}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{repo.owner}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-900 font-bold text-xs uppercase tracking-wider">
                    {repo.analysis?.language || "Unknown"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-black uppercase">
                    {repo.analysis?.framework || "Cloud Native"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    repo.latestScan?.status === "PASSED" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  }`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${
                    repo.latestScan?.status === "PASSED" ? "text-green-600" : "text-rose-600"
                  }`}>
                    {repo.latestScan?.status || "PENDING"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  repo.latestGovernance?.riskLevel === "HIGH" 
                    ? "bg-rose-50 text-rose-600 border border-rose-100" 
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}>
                  {repo.latestGovernance?.riskLevel || "LOW"} RISK
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <Link 
                  to={`/repositories/${repo.id}`}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110"
                >
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
