import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ArrowLeft, Shield, GitBranch, Terminal, ExternalLink, AlertTriangle } from "lucide-react";

export default function RepositoryDetails() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["repository", id],
    queryFn: async () => {
      const response = await api.get(`/repositories/${id}`);
      return response.data;
    },
  });

  const repo = data?.repository;

  if (isLoading) return <div className="p-8">Loading Repository Details...</div>;
  if (!repo) return <div className="p-8 text-red-500">Repository not found.</div>;

  return (
    <div className="p-8 space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl border border-blue-100">
            {repo.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight">{repo.name}</h1>
            <div className="flex items-center gap-2 text-slate-400">
              <GitBranch size={16} />
              <span className="text-sm">{repo.owner} / {repo.defaultBranch}</span>
            </div>
          </div>
        </div>
        <a 
          href={repo.url} 
          target="_blank" 
          rel="noreferrer"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-sm"
        >
          View on GitHub
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              Stack Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Language</span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {repo.analysis?.language || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Framework</span>
                <span className="text-slate-700 font-semibold">{repo.analysis?.framework || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Packager</span>
                <span className="text-slate-700 font-semibold">{repo.analysis?.packageManager || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Terminal size={18} className="text-blue-600" />
              Governance Policy
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Risk</div>
                <div className={`text-xl font-bold ${
                  repo.latestGovernance?.riskLevel === "HIGH" ? "text-red-600" : "text-blue-600"
                }`}>
                  {repo.latestGovernance?.riskLevel || "LOW"}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Auto-Merge Enabled</span>
                <div className={`w-3 h-3 rounded-full ${repo.latestGovernance?.autoMerge ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Pipeline Blocked</span>
                <div className={`w-3 h-3 rounded-full ${repo.latestGovernance?.blocked ? "bg-red-500" : "bg-green-500"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scan History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold">Vulnerability Scan History</h2>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">Run New Scan</button>
            </div>
            <div className="divide-y divide-slate-100">
              {repo.securityScans?.length > 0 ? (
                repo.securityScans.map((scan: any) => (
                  <div key={scan.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        scan.status === "PASSED" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{scan.tool} Analysis</div>
                        <div className="text-xs text-slate-400">{new Date(scan.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center px-3 py-1 bg-red-50 text-red-700 rounded-lg">
                        <div className="text-xs font-bold uppercase">Critical</div>
                        <div className="text-lg font-bold leading-none">{scan.critical}</div>
                      </div>
                      <div className="text-center px-3 py-1 bg-orange-50 text-orange-700 rounded-lg">
                        <div className="text-xs font-bold uppercase">High</div>
                        <div className="text-lg font-bold leading-none">{scan.high}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <AlertTriangle size={32} className="mx-auto mb-2 opacity-20" />
                  No security scans found for this repository.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
