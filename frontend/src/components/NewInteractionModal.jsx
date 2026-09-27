import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { recordInteraction } from '../api';

export default function NewInteractionModal({ isOpen, onClose, patient, onInteractionCreated }) {
  const [provider, setProvider] = useState('Dr. Sameer Mehta');
  const [role, setRole] = useState('Gastroenterologist');
  const [type, setType] = useState('Diagnostic Result & Review');
  const [date, setDate] = useState('2026-02-06');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  const presets = [
    {
      title: 'Resolve Ultrasound Blocker (Recommended Demo)',
      provider: 'Dr. Sameer Mehta / Imaging Dept',
      role: 'Gastroenterologist',
      type: 'Diagnostic Report & Follow-up',
      date: '2026-02-06',
      text: `Abdominal Ultrasound completed today. Imaging reveals mild hepatic steatosis (fatty liver) with normal biliary duct caliber and no gallstones or focal liver lesions. Dr. Mehta reviewed both the ultrasound and previous transaminitis. Advised dietary modifications, regular aerobic exercise, and 6-month routine hepatic panel follow-up. Primary continuity blocker resolved.`
    },
    {
      title: 'Telephone Follow-up Check',
      provider: 'Staff Nurse Sarah',
      role: 'Clinical Care Coordinator',
      type: 'Follow-up Check',
      date: '2026-02-06',
      text: `Patient checked in by phone. Symptoms have partially settled with diet adjustments. Reminded patient to attend scheduled diagnostic appointment tomorrow morning.`
    }
  ];

  const applyPreset = (preset) => {
    setProvider(preset.provider);
    setRole(preset.role);
    setType(preset.type);
    setDate(preset.date);
    setNotes(preset.text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmitting(true);
    try {
      await recordInteraction({
        patientId: patient.id,
        provider,
        role,
        type,
        date,
        notes
      });
      if (onInteractionCreated) {
        await onInteractionCreated();
      }
      onClose();
    } catch (err) {
      console.error('Failed to record encounter:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Clinical Encounter</h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{patient.name}</strong> ({patient.id})
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

        {/* Demo Fast-fill Presets */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>1-Click Demo Encounter Presets:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal-950/40 text-teal-300 border border-teal-800/50 hover:bg-teal-900/50 transition-colors flex items-center space-x-1"
              >
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Clinician / Provider Name
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Clinical Role / Department
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Encounter Type
              </label>
              <input
                type="text"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Date of Encounter
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Clinical Encounter Notes
            </label>
            <textarea
              required
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter consultation summary, investigation results, specialist directives, or follow-up instructions..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white outline-none font-sans"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              On submit, this note is parsed by the extractor and ingested into Hindsight as structured longitudinal memories.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !notes.trim()}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Retaining to Hindsight...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ingest & Retain Memory</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
