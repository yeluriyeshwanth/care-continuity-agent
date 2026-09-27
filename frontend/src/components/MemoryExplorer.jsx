import React, { useState, useEffect } from 'react';
import { 
  X, Database, RefreshCw, Trash2, CheckCircle2, 
  AlertTriangle, ArrowRight, Clock, FileText, Brain, ShieldCheck 
} from 'lucide-react';
import { fetchMemoryBank, clearMemoryBank, seedMemoryBank } from '../api';

export default function MemoryExplorer({ isOpen, onClose, patientId, patientName, onMemoryChanged }) {
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadBank = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const data = await fetchMemoryBank(patientId);
      setBankData(data);
    } catch (err) {
      console.error('Failed to load memory bank:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      loadBank();
    }
  }, [isOpen, patientId]);

  const handleClear = async () => {
    if (!window.confirm('Reset this patient\'s memory bank to empty? This will demonstrate the agent without memory.')) return;
    setLoading(true);
    try {
      await clearMemoryBank(patientId);
      setActionMessage('Memory bank cleared.');
      await loadBank();
      if (onMemoryChanged) onMemoryChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    setLoading(true);
    try {
      await seedMemoryBank(patientId);
      setActionMessage('Memory bank re-synchronized from clinical encounters.');
      await loadBank();
      if (onMemoryChanged) onMemoryChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Hindsight Memory Explorer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {bankData?.bankId || `patient_${patientId}`}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparent view of retained facts for <strong className="text-slate-200">{patientName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Status Banner */}
        {actionMessage && (
          <div className="px-5 py-2 bg-teal-950/60 border-b border-teal-800/40 text-teal-300 text-xs flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-teal-400 font-bold ml-2">×</button>
          </div>
        )}

        {/* Memory Stats Bar */}
        {bankData && (
          <div className="p-5 bg-slate-950/40 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Retained Facts:</span>
              <span className="font-mono text-base font-bold text-teal-300">{bankData.totalMemories}</span>
            </div>

            {/* Categories breakdown pills */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Encounter</div>
                <div className="font-bold text-slate-200 mt-0.5">{bankData.categories?.encounter || 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Investig.</div>
                <div className="font-bold text-teal-300 mt-0.5">{bankData.categories?.investigation || 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Directives</div>
                <div className="font-bold text-indigo-300 mt-0.5">{bankData.categories?.recommendation || 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Follow-up</div>
                <div className="font-bold text-purple-300 mt-0.5">{bankData.categories?.followup || 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-amber-400 uppercase font-semibold">Gaps</div>
                <div className="font-bold text-amber-300 mt-0.5">{bankData.categories?.unresolved || 0}</div>
              </div>
            </div>

            {/* Bank Management Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleReseed}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/40 font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-sync from History</span>
              </button>

              <button
                onClick={handleClear}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Bank (Empty)</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Memories List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400" />
              <p className="text-xs">Synchronizing memory bank...</p>
            </div>
          )}

          {!loading && bankData?.memories?.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Brain className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Memory bank is currently empty.</p>
              <p className="text-[11px] text-slate-500">
                Click "Re-sync from History" above to populate, or add a new interaction.
              </p>
            </div>
          )}

          {!loading && bankData?.memories?.map((mem, idx) => (
            <div
              key={mem.id || idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>{mem.id}</span>
                </span>
                <span className="font-mono text-slate-500">
                  {mem.retainedAt?.slice(0, 10) || '2026-02'}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-sans">
                {mem.content}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {(mem.tags || []).map((tag, tidx) => (
                  <span
                    key={tidx}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      tag === 'unresolved' || tag === 'continuity-blocker' || tag === 'test-pending'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : tag === 'test-completed'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500 bg-slate-900/60">
          Integrated with Vectorize Hindsight Agent Memory Architecture
        </div>

      </div>
    </div>
  );
}
