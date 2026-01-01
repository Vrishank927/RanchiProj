
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { ScanResult, RecommendedAction, RiskLevel } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [content, setContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (isScanning) {
      setProgress(0);
      timer = window.setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + Math.random() * 15 : prev));
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  const handleScan = async () => {
    if (!content.trim()) return;
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await apiService.scanContent(content);
      setResult(scanResult);
      onScanComplete(scanResult);
    } catch (err: any) {
      setError(err.message || "Engine timeout. Please verify your connection.");
    } finally {
      setIsScanning(false);
      setProgress(100);
    }
  };

  const getRiskUI = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: 'fa-triangle-exclamation' };
      case RiskLevel.MEDIUM: return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'fa-circle-exclamation' };
      case RiskLevel.LOW: return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'fa-circle-check' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'fa-shield' };
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all duration-300">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="bg-indigo-600/10 p-2 rounded-lg">
              <i className="fas fa-microscope text-indigo-600"></i>
            </div>
            Safety Analyzer
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">V2.4 Native</span>
        </div>
        
        <div className="relative">
          <textarea
            className="w-full h-44 p-5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 placeholder-slate-400 font-medium leading-relaxed"
            placeholder="Paste text snippets, chat logs, or URLs to analyze... &#10;&#10;Example: 'Hey, don't tell your parents we are talking about this...'"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded border border-slate-100">
            {content.length} characters
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {isScanning && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={isScanning || !content.trim()}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 ${
              isScanning || !content.trim() 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-indigo-200 active:scale-[0.99]'
            }`}
          >
            {isScanning ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing Insights...
              </>
            ) : (
              <>
                <i className="fas fa-bolt-lightning text-indigo-400"></i>
                Analyze Security
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-3">
            <i className="fas fa-circle-info"></i>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.recommendedAction === RecommendedAction.BLOCK && (
            <div className="mb-6 p-4 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-lg">
                <i className="fas fa-hand text-xl"></i>
              </div>
              <div>
                <div className="font-bold text-sm uppercase tracking-wider">Critical Block Triggered</div>
                <div className="text-xs opacity-80 font-medium">Content contains restricted elements. Safety measures active.</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${getRiskUI(result.riskLevel).bg} ${getRiskUI(result.riskLevel).border} transition-all hover:scale-[1.02]`}>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest flex items-center gap-1.5">
                <i className={`fas ${getRiskUI(result.riskLevel).icon} ${getRiskUI(result.riskLevel).color}`}></i>
                Risk Level
              </div>
              <div className={`text-xl font-black ${getRiskUI(result.riskLevel).color}`}>{result.riskLevel}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:scale-[1.02]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">AI Confidence</div>
              <div className="flex items-center gap-2.5">
                <div className="text-xl font-black text-slate-800">{(result.confidenceScore * 100).toFixed(0)}%</div>
                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${result.confidenceScore * 100}%` }}
                   ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Analysis Insight</div>
              <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{result.category}</div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              <i className="fas fa-quote-left text-slate-200 mr-2"></i>
              {result.reason}
            </p>
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-50">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[11px] font-bold text-slate-500">Recommended: <span className="text-slate-800">{result.recommendedAction}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
