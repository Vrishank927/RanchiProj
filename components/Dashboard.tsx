
import React, { useState, useMemo } from 'react';
import { HistoryItem, RiskLevel, RecommendedAction } from '../types';

interface DashboardProps {
  history: HistoryItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');

  const filteredHistory = useMemo(() => {
    if (filter === 'ALL') return history;
    return history.filter(item => item.riskLevel === filter);
  }, [history, filter]);

  const stats = useMemo(() => {
    const highRisk = history.filter(h => h.riskLevel === RiskLevel.HIGH).length;
    const blocks = history.filter(h => h.recommendedAction === RecommendedAction.BLOCK).length;
    return { highRisk, blocks, total: history.length };
  }, [history]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRiskStyles = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return 'bg-rose-100 text-rose-700 border-rose-200';
      case RiskLevel.MEDIUM: return 'bg-amber-100 text-amber-700 border-amber-200';
      case RiskLevel.LOW: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionStyles = (action: RecommendedAction) => {
    switch (action) {
      case RecommendedAction.BLOCK: return 'bg-slate-900 text-white';
      case RecommendedAction.MONITOR: return 'bg-indigo-100 text-indigo-700';
      case RecommendedAction.ALLOW: return 'bg-emerald-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Safety Index</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
            <div className="text-xs font-bold text-slate-400">Total Scans</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all border-l-4 border-l-rose-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Alert</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-rose-600">{stats.highRisk}</div>
            <div className="text-xs font-bold text-slate-400">High Risk Detected</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preventative</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-indigo-600">{stats.blocks}</div>
            <div className="text-xs font-bold text-slate-400">Filtered Actions</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-7 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="bg-indigo-600/10 p-2 rounded-lg">
                <i className="fas fa-tower-observation text-indigo-600"></i>
              </div>
              Incident Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Detailed audit log with educational context</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            {['ALL', RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH].map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tight ${
                  filter === r 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em]">
              <tr>
                <th className="px-7 py-5">Event Time</th>
                <th className="px-7 py-5">Classification</th>
                <th className="px-7 py-5">Action</th>
                <th className="px-7 py-5">Alert Message</th>
                <th className="px-7 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-7 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <i className="fas fa-folder-open text-4xl"></i>
                      <span className="text-sm font-bold tracking-wide italic">No incidents recorded in database</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => toggleExpand(item.id)}
                      className={`cursor-pointer transition-all duration-200 ${expandedId === item.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="px-7 py-5 text-xs text-slate-600 font-bold whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </td>
                      <td className="px-7 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getRiskStyles(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="px-7 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getActionStyles(item.recommendedAction)}`}>
                          {item.recommendedAction}
                        </span>
                      </td>
                      <td className="px-7 py-5 text-sm text-slate-500 max-w-[200px] truncate font-medium">
                        {item.parentAlert}
                      </td>
                      <td className="px-7 py-5 text-slate-300">
                        <i className={`fas fa-chevron-right transition-transform duration-300 ${expandedId === item.id ? 'rotate-90 text-indigo-500' : ''}`}></i>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr className="bg-indigo-50/20">
                        <td colSpan={5} className="px-7 py-8 animate-in fade-in zoom-in-95 duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7 space-y-6">
                              <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <i className="fas fa-align-left text-slate-300"></i> Source Content Log
                                </h4>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 italic font-medium leading-relaxed shadow-sm">
                                  "{item.contentSnippet}"
                                </div>
                              </div>
                              <div className="bg-indigo-900 p-5 rounded-2xl text-indigo-50 shadow-lg relative overflow-hidden group">
                                <i className="fas fa-graduation-cap absolute -bottom-4 -right-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform duration-700"></i>
                                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3">AI Education Log</h4>
                                <div className="space-y-4">
                                  <div>
                                    <h5 className="text-[9px] font-black text-indigo-400 uppercase mb-1">Security Consequence Summary</h5>
                                    <p className="text-xs leading-relaxed opacity-90">{item.safetyConsequences}</p>
                                  </div>
                                  <div className="pt-3 border-t border-indigo-800">
                                    <h5 className="text-[9px] font-black text-emerald-400 uppercase mb-1">Guided Safe Alternative</h5>
                                    <p className="text-xs leading-relaxed text-emerald-100">{item.educationalGuidance}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="lg:col-span-5 space-y-5">
                              <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <i className="fas fa-brain text-slate-300"></i> AI Reasoning Insight
                                </h4>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-medium leading-relaxed shadow-sm text-slate-600">
                                  {item.reason}
                                </div>
                              </div>
                              <div className="p-4 bg-white border border-indigo-100 rounded-xl border-l-4 border-l-indigo-500 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Alert Message</h4>
                                <p className="text-xs text-slate-800 font-bold">{item.parentAlert}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
