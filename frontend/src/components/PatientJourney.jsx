import React from 'react';
import { 
  Calendar, UserCheck, Stethoscope, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Clock, PlusCircle, Sparkles, Brain
} from 'lucide-react';
import ContinuityAlerts from './ContinuityAlerts';

export default function PatientJourney({ 
  patient, 
  timeline = [], 
  continuity, 
  onOpenNewInteraction,
  onSwitchToAgent
}) {
  return (
    <div className="space-y-6">
      
      {/* Patient Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/20">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white">{patient.name}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {patient.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {patient.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {patient.age} years old • {patient.gender} • Blood Group: <strong className="text-slate-300">{patient.bloodGroup}</strong> • Contact: {patient.contact}
            </p>
            <p className="text-xs text-teal-300 mt-1 font-medium">
              Primary Concern: <span className="text-slate-200">{patient.primaryConcern}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          <button
            onClick={onSwitchToAgent}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Brain className="w-4 h-4" />
            <span>Consult AI Agent</span>
          </button>
          <button
            onClick={onOpenNewInteraction}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>Add Interaction</span>
          </button>
        </div>
      </div>

      {/* Continuity Alerts Section */}
      <ContinuityAlerts continuity={continuity} />

      {/* Vertical Care Journey Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Longitudinal Patient Journey</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accumulated clinical milestones recorded across visits, diagnostics, and specialists.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {timeline.length} Recorded Touchpoints
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-8">
          {timeline.map((item, index) => {
            const ext = item.extracted || {};
            const isLast = index === timeline.length - 1;

            return (
              <div key={item.id || index} className="relative pl-6 sm:pl-8 group">
                
                {/* Node Marker */}
                <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  item.type.includes('Specialist') 
                    ? 'bg-indigo-600 text-white' 
                    : item.type.includes('Result')
                    ? 'bg-teal-600 text-white'
                    : item.type.includes('Follow-up')
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {item.type.includes('Specialist') ? (
                    <Stethoscope className="w-3.5 h-3.5" />
                  ) : item.type.includes('Result') ? (
                    <FileText className="w-3.5 h-3.5" />
                  ) : item.type.includes('Follow-up') ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Event Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{item.type}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-teal-400 font-semibold">{item.provider}</span>
                      <span className="text-xs text-slate-400 font-normal">({item.role})</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{item.date}</span>
                    </span>
                  </div>

                  {/* Clinical Notes Body */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mt-2">
                    {item.notes}
                  </p>

                  {/* Extracted Memory Pills */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
                    
                    {/* Completed Tests */}
                    {(ext.investigationsCompleted || []).map((t, idx) => (
                      <span key={`comp-${idx}`} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Completed: {t}</span>
                      </span>
                    ))}

                    {/* Pending Tests */}
                    {(ext.investigationsPending || []).map((t, idx) => (
                      <span key={`pend-${idx}`} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/50 font-medium">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Pending: {t}</span>
                      </span>
                    ))}

                    {/* Recommendations */}
                    {(ext.recommendations || []).map((r, idx) => (
                      <span key={`rec-${idx}`} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        <span>Plan: {r}</span>
                      </span>
                    ))}

                    {/* Follow-up condition */}
                    {ext.followUpCondition && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/50">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>Follow-up: {ext.followUpCondition}</span>
                      </span>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
