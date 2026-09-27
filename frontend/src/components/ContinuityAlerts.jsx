import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ContinuityAlerts({ continuity }) {
  if (!continuity || (!continuity.alerts || continuity.alerts.length === 0)) {
    return (
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-3 text-emerald-300 text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>No critical care continuity gaps detected. All investigations and follow-ups are synchronized.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Active Care Continuity Gaps ({continuity.alerts.length})</span>
        </div>
        <span className="text-xs text-slate-400">
          Last touchpoint: <strong className="text-slate-200">{continuity.daysSinceLastInteraction} days ago</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {continuity.alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all ${
              alert.severity === 'high'
                ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                : 'bg-indigo-950/20 border-indigo-700/40 text-indigo-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${
                  alert.severity === 'high' ? 'text-amber-400' : 'text-indigo-400'
                }`} />
                <span className="font-bold text-sm text-white">{alert.title}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                alert.severity === 'high'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {alert.type}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {alert.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start space-x-2 text-xs">
              <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span className="text-teal-300 font-medium leading-tight">
                <strong>Continuity Action:</strong> {alert.recommendation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
