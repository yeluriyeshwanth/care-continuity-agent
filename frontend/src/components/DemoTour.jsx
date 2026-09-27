import React from 'react';
import { X, Sparkles, CheckCircle2, Clock, ArrowRight, Brain, Zap, Database } from 'lucide-react';

export default function DemoTour({ isOpen, onClose, onSelectDemoCase }) {
  if (!isOpen) return null;

  const steps = [
    {
      time: '0:00 - 0:15',
      title: '1. The Continuity Fragmentation Problem',
      action: 'Select patient Ravi Kumar (P001) from dashboard.',
      talkingPoint: '"In healthcare, patient data exists across multiple encounters: General Physician, Lab Diagnostic, Specialist, and Follow-up desk. The problem is that the next doctor lacks context at the right moment."'
    },
    {
      time: '0:15 - 0:30',
      title: '2. The Hindsight Accumulation',
      action: 'Open Journey Timeline to show Jan 10, Jan 14, and Jan 20 encounters.',
      talkingPoint: '"Ravi had a blood test (elevated LFT) and saw Dr. Sameer Mehta, who recommended an abdominal ultrasound. Instead of storing just raw text, Hindsight retains structured memories: tests, directives, and blockers."'
    },
    {
      time: '0:30 - 0:45',
      title: '3. The Hindsight Recall Moment',
      action: 'Click AI Agent -> "What are we waiting for?"',
      talkingPoint: '"Two weeks later, a different clinician opens the chart and asks what is pending. The agent uses Hindsight recall to pinpoint the ultrasound as the exact blocker and cites Dr. Mehta\'s directive."'
    },
    {
      time: '0:45 - 0:55',
      title: '4. The Contrast: Without vs With Hindsight',
      action: 'Click "Before vs After Memory" tab.',
      talkingPoint: '"Look at the contrast: without Hindsight, a stateless LLM has amnesia and asks the doctor to provide the history. With Hindsight, the agent immediately knows the patient\'s entire longitudinal path."'
    },
    {
      time: '0:55 - 1:00',
      title: '5. Transparent Memory Bank',
      action: 'Click "Memory Explorer" in the top bar.',
      talkingPoint: '"We open the Hindsight Memory Explorer to show the actual memory bank, categories, and similarity scores. Memory isn\'t a side feature—it is the entire brain of CareContinuity."'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">60-Second Judge Demo Storyboard</h3>
              <p className="text-xs text-slate-300">
                A tight, high-impact walkthrough designed to win the Hackathon's 25% Hindsight criteria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-teal-300">{s.title}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{s.time}</span>
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-indigo-400 font-semibold">On-screen action: </strong>
                {s.action}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-200 italic border-l-2 border-teal-500">
                {s.talkingPoint}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Target Demo Time: <strong className="text-slate-200">55–60 Seconds</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              if (onSelectDemoCase) onSelectDemoCase('P001');
            }}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <span>Launch Ravi Kumar (P001) Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
