import React, { useState } from 'react';
import { 
  Send, Brain, Sparkles, AlertTriangle, CheckCircle2, 
  ChevronDown, ChevronUp, Database, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { queryAgent } from '../api';

export default function AgentWorkspace({ patient, onSwitchToComparison, onOpenMemoryExplorer }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [showRecalled, setShowRecalled] = useState(true);

  const samplePrompts = [
    { label: "Summarize journey", query: `Summarize ${patient.name.split(' ')[0]}'s care journey so far.` },
    { label: "What are we waiting for?", query: "What is currently pending or blocking the next clinical step?" },
    { label: "What changed since visit 1?", query: "What changed since the initial consultation?" },
    { label: "Previous clinician directives", query: "What did the previous specialist recommend and why?" }
  ];

  const handleAsk = async (promptText) => {
    const q = promptText || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const data = await queryAgent(patient.id, q);
      setResponse(data);
      if (promptText) setQuery(promptText);
    } catch (err) {
      console.error('Error querying continuity agent:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Care Continuity Agent</span>
                <span className="text-[10px] font-mono uppercase bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-semibold">
                  Hindsight Recall Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Longitudinal clinical memory for <strong className="text-slate-200">{patient.name}</strong> ({patient.id})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSwitchToComparison}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Before vs After Memory</span>
          </button>
          <button
            onClick={onOpenMemoryExplorer}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Bank</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Quick Clinical Queries (Click to test):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(p.query)}
              disabled={loading}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask anything about ${patient.name.split(' ')[0]}'s previous consultations, tests, or pending actions...`}
          className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white placeholder-slate-500 outline-none shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Recalling...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Query Agent</span>
            </>
          )}
        </button>
      </form>

      {/* Agent Response Card */}
      {response && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
            
            {/* Answer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
                  CC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Continuity Synthesis</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Provider: {response.provider} • Mode: {response.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-teal-950/60 border border-teal-800/40 text-teal-300 font-medium flex items-center space-x-1">
                  <Database className="w-3 h-3 text-teal-400" />
                  <span>{response.recalledMemories?.length || 0} memories recalled</span>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                  Score: {response.continuityScore}%
                </span>
              </div>
            </div>

            {/* Answer Body (Rendered with custom markdown-style structure) */}
            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 font-sans whitespace-pre-line">
              {response.answer}
            </div>

            {/* Recalled Memories Transparency Accordion */}
            {response.recalledMemories && response.recalledMemories.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowRecalled(!showRecalled)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
                >
                  <span className="flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recalled Memory Evidence ({response.recalledMemories.length} facts retrieved from Hindsight bank)</span>
                  </span>
                  {showRecalled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRecalled && (
                  <div className="mt-3 space-y-2">
                    {response.recalledMemories.map((mem, index) => (
                      <div
                        key={mem.id || index}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-teal-400 flex items-center space-x-1">
                            <span>Memory #{index + 1}</span>
                            <span className="text-slate-500">•</span>
                            <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {mem.type || 'Fact'}
                            </span>
                          </span>
                          <span className="font-mono text-slate-500">
                            Relevance: {Math.round((mem.score || 0.95) * 100)}%
                          </span>
                        </div>
                        <p className="text-slate-300 leading-snug">
                          {mem.content}
                        </p>
                        {mem.tags && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {mem.tags.map((t, tidx) => (
                              <span key={tidx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Initial Prompt Prompting if no response yet */}
      {!response && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-teal-400">
            <Brain className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Ask the Continuity Assistant</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click any prompt above or type a question. The agent will retrieve persistent memories from Hindsight and synthesize an immediate clinical briefing.
          </p>
        </div>
      )}

    </div>
  );
}
