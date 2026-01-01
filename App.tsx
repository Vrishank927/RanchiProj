
import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { ScanResult, HistoryItem } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await apiService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Critical: Failed to load history engine", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScanComplete = (result: ScanResult) => {
    fetchHistory();
  };

  const clearHistory = async () => {
    if (window.confirm("Permanent Action: Are you sure you want to purge all historical security logs?")) {
      try {
        await apiService.clearHistory();
        setHistory([]);
      } catch (error) {
        alert("Operation failed. Database connection error.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Premium Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <i className="fas fa-shield-halved text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                SafeBrowse<span className="text-indigo-600 font-extrabold ml-0.5 italic text-lg uppercase tracking-tighter">AI</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protection Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#" className="text-xs font-bold text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg">Overview</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Safety Rules</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Audit Logs</a>
            </nav>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-900">Parental Control</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Admin Account</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-100 border-2 border-white ring-1 ring-slate-100">
                <i className="fas fa-user-gear text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Protection Module */}
        <section className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <div>
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Security Module</h2>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Content Intelligence</h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">Detect patterns of harm using neural language processing.</p>
          </div>
          
          <Scanner onScanComplete={handleScanComplete} />
          
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <i className="fas fa-lock text-6xl"></i>
            </div>
            <h3 className="text-sm font-black mb-3 flex items-center gap-2">
              <i className="fas fa-shield text-indigo-400"></i>
              Encryption Status
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Scans are end-to-end encrypted. No raw chat logs are stored in plain text. Analysis is ephemeral and compliant with digital safety protocols.
            </p>
            <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
              View Privacy Audit <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </section>

        {/* Supervision Module */}
        <section className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-700 delay-100">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Supervision Module</h2>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Insight Dashboard</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Review and respond to identified safety risks.</p>
            </div>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="group px-4 py-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-all border border-slate-200 bg-white shadow-sm flex items-center gap-2"
              >
                <i className="fas fa-trash-can opacity-50 group-hover:opacity-100"></i>
                Purge Database
              </button>
            )}
          </div>
          
          <div className={isLoadingHistory ? 'opacity-50 pointer-events-none blur-[1px]' : 'transition-all duration-500'}>
            <Dashboard history={history} />
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-10">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-60">
             <i className="fas fa-shield-halved text-slate-400 text-xl"></i>
             <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Secure Infrastructure</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Global Safety Standard</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Parental Guidance</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Legal Framework</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Expert</a>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            © 2024 SafeBrowse AI Toolkit
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
