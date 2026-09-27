import React from 'react';
import { Activity, Brain, PlusCircle, Database, HelpCircle, Sparkles } from 'lucide-react';

export default function Navbar({ 
  onOpenNewInteraction, 
  onToggleMemoryExplorer, 
  onToggleDemoTour,
  onResetToDashboard,
  currentPatient,
  memoryBankSize = 0 
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div 
          onClick={onResetToDashboard}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">CareContinuity</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Memory Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">A Memory-Powered Patient Journey Assistant</p>
          </div>
        </div>

        {/* Hindsight Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-slate-300">
            Hindsight Memory: <strong className="text-teal-400">Active</strong>
          </span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs text-slate-400 font-mono">
            {memoryBankSize} memories synced
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleDemoTour}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 transition-colors"
            title="60-Second Demo Storyboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">60s Demo Guide</span>
          </button>

          <button
            onClick={onToggleMemoryExplorer}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-colors"
            title="Inspect Hindsight Memory Bank"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Memory Explorer</span>
          </button>

          <button
            onClick={onOpenNewInteraction}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Encounter</span>
          </button>
        </div>

      </div>
    </header>
  );
}
