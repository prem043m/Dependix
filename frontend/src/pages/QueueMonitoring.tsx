import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Activity, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function QueueMonitoring() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await api.get("/jobs");
      return response.data;
    },
    refetchInterval: 5000,
  });

  const jobs = data?.jobs || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Queue Monitoring</h1>
        <p className="text-slate-500">Live background job status and worker performance.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h2 className="font-bold">Active Worker Queue</h2>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isLoading ? "Refreshing..." : "Auto-refreshing"}
          </span>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No active or recent jobs found in the queue.
                </td>
              </tr>
            ) : (
              jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">#{job.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">Security Scan</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {job.state === "completed" ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : job.state === "failed" ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : (
                        <Clock size={16} className="text-blue-500 animate-pulse" />
                      )}
                      <span className={`text-sm font-bold uppercase ${
                        job.state === "completed" ? "text-green-700" : 
                        job.state === "failed" ? "text-red-700" : "text-blue-700"
                      }`}>
                        {job.state}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500" 
                        style={{ width: `${job.progress}%` }} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(job.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
