import React, { useState } from 'react';
import { 
  Search, User, AlertTriangle, Clock, ArrowRight, ShieldCheck, 
  Activity, FileText, CheckCircle2, ChevronRight, Stethoscope, Sparkles 
} from 'lucide-react';

export default function Dashboard({ patients, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryConcern.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'FOLLOWUP') return p.status === 'Follow-up Pending';
    if (activeFilter === 'TESTS') return p.status === 'Test Result Pending';
    if (activeFilter === 'SPECIALIST') return p.status === 'Specialist Review';
    return true;
  });

  const totalGaps = patients.reduce((acc, p) => acc + (p.hasBlockers ? 1 : 0), 0);
  const pendingTestsCount = patients.reduce((acc, p) => acc + (p.pendingInvestigations?.length || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Problem & Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solved: Clinical Context Fragmentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            CareContinuity Assistant
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            An AI agent that remembers a patient's care journey across multiple interactions, doctors, and diagnostics — giving healthcare staff the longitudinal context they need for the next clinical step.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Not autonomous diagnosis</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Contextual continuity support</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Powered by Hindsight Long-term Memory</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Cohort</span>
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{patients.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Synthetic clinical profiles</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Continuity Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">{totalGaps} Cases</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Blocked care pathways</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-400 font-medium">Pending Diagnostics</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-300">{pendingTestsCount} Tests</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Imaging & blood work</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-400 font-medium">Memory Engine</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-300">Biomimetic</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Retain • Recall • Synthesize</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by name, ID (e.g. P001), or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Cases' },
            { id: 'FOLLOWUP', label: 'Follow-up Pending' },
            { id: 'TESTS', label: 'Test Pending' },
            { id: 'SPECIALIST', label: 'Specialist Review' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === pill.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPatients.map((patient) => {
          const isFlagshipDemo = patient.id === 'P001';

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                isFlagshipDemo
                  ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-teal-500/50 hover:border-teal-400 shadow-lg shadow-teal-500/5'
                  : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Flagship Demo Badge */}
              {isFlagshipDemo && (
                <div className="absolute -top-3 left-6">
                  <span className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Primary Demo Scenario</span>
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 group-hover:scale-105 transition-transform">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors">
                        {patient.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-800">
                        {patient.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {patient.age}y • {patient.gender} • Blood: {patient.bloodGroup}
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  patient.statusSeverity === 'warning'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : patient.statusSeverity === 'info'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {patient.status}
                </span>
              </div>

              {/* Clinical Concern */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-300">
                  <strong className="text-slate-400 font-medium">Concern: </strong>
                  {patient.primaryConcern}
                </div>

                {/* Continuity Pending Action Callout */}
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-tight">
                    <span className="font-semibold text-amber-300">Action Pending: </span>
                    {patient.pendingAction}
                  </div>
                </div>
              </div>

              {/* Continuity Score & Bottom Link */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Care Continuity:</span>
                  <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        patient.continuityScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${patient.continuityScore}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">{patient.continuityScore}%</span>
                </div>

                <div className="flex items-center space-x-1 text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Enter Journey</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
