import React, { useState, useEffect } from 'react';
import { 
  Zap, AlertOctagon, CheckCircle2, RefreshCw, ArrowRight, 
  Database, Brain, HelpCircle, ShieldAlert 
} from 'lucide-react';
import { compareAgent } from '../api';

export default function BeforeAfterComparison({ patient }) {
  const [query, setQuery] = useState(
    `What has happened with ${patient.name.split(' ')[0]} so far, and what are we currently waiting for?`
  );
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const testQueries = [
    `What has happened with ${patient.name.split(' ')[0]} so far, and what are we currently waiting for?`,
    "Why are we waiting for the ultrasound imaging?",
    "What changed between the first doctor visit and the specialist consultation?"
  ];

  const runComparison = async (qText) => {
    const q = qText || query;
    setLoading(true);
    try {
      const data = await compareAgent(patient.id, q);
      setComparison(data);
      if (qText) setQuery(qText);
    } catch (err) {
      console.error('Failed to run comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [patient.id]);

  return (
    <div className="space-y-6">
      
      {/* Banner on Why Memory is Central */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-600/30 shadow-lg space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Judges' Evaluation: Making Memory Central (25% Weight)</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Side-by-Side: Without Hindsight vs. With Hindsight
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          If you remove Hindsight, the agent degrades to a stateless chatbot that constantly forces clinicians to repeat history. With Hindsight, the agent retains structured longitudinal memory across clinicians and diagnostics.
        </p>

        {/* Prompt Selectors */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Select Query:</span>
          {testQueries.map((tq, idx) => (
            <button
              key={idx}
              onClick={() => runComparison(tq)}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                query === tq
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {idx === 0 ? "Flagship Question" : idx === 1 ? "Why Waiting?" : "What Changed?"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400" />
          <p className="text-sm font-semibold">Running dual inference: evaluating with and without memory...</p>
        </div>
      )}

      {/* Side-by-Side Panels */}
      {comparison && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Without Hindsight */}
          <div className="rounded-2xl bg-slate-900 border-2 border-rose-900/40 p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-900/30">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                    0M
                  </div>
                  <span className="font-bold text-sm text-rose-400">WITHOUT HINDSIGHT</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40">
                  Stateless Context
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <strong>Clinician Query:</strong> "{query}"
              </div>

              <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed space-y-2">
                {comparison.withoutMemory.answer}
              </div>
            </div>

            {/* Critique Callout */}
            <div className="mt-6 pt-4 border-t border-rose-900/30 text-xs text-rose-300/90 flex items-start space-x-2 bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                <strong>The Problem:</strong> The agent has zero knowledge of Dr. Roy's Jan 10 consultation, the transaminitis in the blood work, or Dr. Mehta's directive. Clinicians are forced to waste time re-reading fragmented records.
              </span>
            </div>
          </div>

          {/* RIGHT: With Hindsight */}
          <div className="rounded-2xl bg-slate-900 border-2 border-teal-500/50 p-6 flex flex-col justify-between shadow-xl shadow-teal-500/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-500/30">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                    HM
                  </div>
                  <span className="font-bold text-sm text-teal-300">WITH HINDSIGHT MEMORY</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40 flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>{comparison.withMemory.recalledCount} Facts Recalled</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <strong>Clinician Query:</strong> "{query}"
              </div>

              <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed space-y-2">
                {comparison.withMemory.answer}
              </div>
            </div>

            {/* Value Callout */}
            <div className="mt-6 pt-4 border-t border-teal-500/30 text-xs text-teal-200 flex items-start space-x-2 bg-teal-950/30 p-3 rounded-xl border border-teal-800/40">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
              <span>
                <strong>The Value:</strong> Hindsight maintained longitudinal context across 4 separate interactions. The agent immediately identifies the missing ultrasound as the critical care blocker and cites Dr. Sameer Mehta's recommendation.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* 3-Point Takeaway for Judges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-slate-200">1. Longitudinal Persistence</div>
          <p className="text-slate-400">
            Care context spans weeks across primary doctors and specialists without re-sending full conversation history.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-slate-200">2. Structured Fact Extraction</div>
          <p className="text-slate-400">
            Hindsight retains discrete clinical entities: test orders, completions, directives, and unresolved issues.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-slate-200">3. Actionable Next Steps</div>
          <p className="text-slate-400">
            Instead of general medical knowledge, the assistant pinpoints the exact operational blocker for the attending clinician.
          </p>
        </div>
      </div>

    </div>
  );
}
