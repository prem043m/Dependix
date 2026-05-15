import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  Activity, 
  Settings, 
  GitBranch, 
  Bell, 
  Search,
  ChevronRight,
  Plus
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link
    to={href}
    className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? "text-white" : "group-hover:text-blue-600 transition-colors"} />
      <span className="font-semibold text-sm tracking-tight">{label}</span>
    </div>
    {active && <ChevronRight size={14} className="opacity-50" />}
  </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 p-8 flex flex-col gap-10 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Shield size={26} strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-slate-900">Dependix</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 -mt-1">DevSecOps Platform</span>
          </div>
        </div>

        <div className="flex flex-col gap-8 flex-1">
          <div className="flex flex-col gap-1.5">
            <span className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Main Menu</span>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/" active={location.pathname === "/"} />
            <SidebarItem icon={Shield} label="Governance" href="/governance" active={location.pathname === "/governance"} />
            <SidebarItem icon={Activity} label="Queue Monitor" href="/queues" active={location.pathname === "/queues"} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Organization</span>
            <SidebarItem icon={GitBranch} label="Repositories" href="/repositories" active={location.pathname.startsWith("/repositories")} />
            <SidebarItem icon={Bell} label="Notifications" href="/notifications" active={location.pathname === "/notifications"} />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-6 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            New Analysis
          </button>
          <SidebarItem icon={Settings} label="System Settings" href="/settings" active={location.pathname === "/settings"} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search security assets, vulnerabilities, or jobs..."
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-900 leading-none">Security Admin</span>
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Authorized</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white shadow-sm" />
          </div>
        </header>
        
        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
