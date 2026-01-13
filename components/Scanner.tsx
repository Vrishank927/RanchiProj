
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { ScanResult, RecommendedAction, RiskLevel, RiskType } from '../types';

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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">V2.6 Protekt</span>
        </div>
        
        <div className="relative">
          <textarea
            className="w-full h-44 p-5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 placeholder-slate-400 font-medium leading-relaxed"
            placeholder="Paste text, URLs, or chat logs... &#10;&#10;Ex: 'Hey, don't tell your mom we're playing this game...'"
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
          
          {/* Risk Type Identifier */}
          <div className="mb-6 flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              result.riskType === RiskType.PHISHING ? 'bg-rose-600 text-white border-rose-700' :
              result.riskType === RiskType.GROOMING ? 'bg-indigo-600 text-white border-indigo-700' :
              'bg-slate-800 text-white border-slate-900'
            }`}>
              <i className={`fas ${
                result.riskType === RiskType.PHISHING ? 'fa-fish-fins' :
                result.riskType === RiskType.GROOMING ? 'fa-user-shield' :
                'fa-shield-heart'
              } mr-2`}></i>
              {result.riskType} Detected
            </span>
            {result.signalsDetected && result.signalsDetected.map(sig => (
              <span key={sig} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold text-slate-500 uppercase">
                {sig.replace('_', ' ')}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl border ${getRiskUI(result.riskLevel).bg} ${getRiskUI(result.riskLevel).border} transition-all`}>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest flex items-center gap-1.5">
                <i className={`fas ${getRiskUI(result.riskLevel).icon} ${getRiskUI(result.riskLevel).color}`}></i>
                Severity
              </div>
              <div className={`text-xl font-black ${getRiskUI(result.riskLevel).color}`}>{result.riskLevel}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest text-center">Safety Action</div>
              <div className="text-xl font-black text-slate-800 text-center uppercase tracking-tighter">{result.recommendedAction}</div>
            </div>
          </div>

          {/* Intervention Logic */}
          <div className="space-y-4">
            {/* Phishing Warning Logic */}
            {result.riskType === RiskType.PHISHING && (
              <div className="p-5 bg-rose-600 text-white rounded-2xl shadow-lg border-b-4 border-rose-800">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-circle-exclamation text-xl"></i>
                  <h3 className="font-black text-sm uppercase tracking-wider">Fake Website Alert</h3>
                </div>
                <p className="text-xs font-medium opacity-90 leading-relaxed">
                  This site is pretending to be something else to trick you. Never enter passwords or personal info here.
                </p>
              </div>
            )}

            {/* Educational Moment */}
            <div className="p-5 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <i className="fas fa-graduation-cap text-white text-xs"></i>
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Safety Insight</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">The Risk</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.safetyConsequences}
                  </p>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">What to do</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.educationalGuidance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
