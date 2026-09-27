import React, { useState, useEffect } from 'react';
import { 
  fetchPatients, fetchPatient, fetchMemoryBank 
} from './api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PatientJourney from './components/PatientJourney';
import AgentWorkspace from './components/AgentWorkspace';
import BeforeAfterComparison from './components/BeforeAfterComparison';
import MemoryExplorer from './components/MemoryExplorer';
import NewInteractionModal from './components/NewInteractionModal';
import DemoTour from './components/DemoTour';
import { 
  ChevronLeft, Calendar, Brain, Zap, RefreshCw, Activity 
} from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'agent' | 'compare'
  const [loading, setLoading] = useState(true);
  const [isMemoryExplorerOpen, setIsMemoryExplorerOpen] = useState(false);
  const [isNewInteractionModalOpen, setIsNewInteractionModalOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [memoryBankSize, setMemoryBankSize] = useState(0);

  // Load all patients
  const loadPatients = async () => {
    try {
      const data = await fetchPatients();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load single patient details
  const loadPatientDetail = async (id) => {
    try {
      const data = await fetchPatient(id);
      setPatientDetail(data);
      if (data.memoryBank) {
        setMemoryBankSize(data.memoryBank.totalMemories || 0);
      }
    } catch (err) {
      console.error('Failed to load patient detail:', err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetail(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setActiveTab('journey');
  };

  const handleRefreshCurrent = async () => {
    await loadPatients();
    if (selectedPatientId) {
      await loadPatientDetail(selectedPatientId);
    }
  };

  const currentPatientObj = patientDetail?.patient || patients.find(p => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        onOpenNewInteraction={() => setIsNewInteractionModalOpen(true)}
        onToggleMemoryExplorer={() => setIsMemoryExplorerOpen(!isMemoryExplorerOpen)}
        onToggleDemoTour={() => setIsDemoTourOpen(true)}
        onResetToDashboard={() => setSelectedPatientId(null)}
        currentPatient={currentPatientObj}
        memoryBankSize={memoryBankSize}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {loading && (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400" />
            <p className="text-sm font-semibold">Initializing CareContinuity & syncing memory banks...</p>
          </div>
        )}

        {/* Dashboard View (when no patient is selected) */}
        {!loading && !selectedPatientId && (
          <Dashboard
            patients={patients}
            onSelectPatient={handleSelectPatient}
          />
        )}

        {/* Patient Detail View */}
        {!loading && selectedPatientId && currentPatientObj && (
          <div className="space-y-6">
            
            {/* Breadcrumb Back Button & Patient Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPatientId(null)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to All Patients</span>
              </button>

              {/* Patient Quick Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Switch Patient:</span>
                <div className="flex space-x-1">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-semibold transition-colors ${
                        p.id === selectedPatientId
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex border-b border-slate-800 gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('journey')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'journey'
                    ? 'border-teal-500 text-teal-400 bg-slate-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Patient Journey Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('agent')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'agent'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Care Continuity Agent</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'compare'
                    ? 'border-amber-500 text-amber-400 bg-slate-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Before vs After Memory</span>
              </button>
            </div>

            {/* Tab 1: Journey Timeline */}
            {activeTab === 'journey' && (
              <PatientJourney
                patient={currentPatientObj}
                timeline={patientDetail?.timeline || []}
                continuity={patientDetail?.continuity}
                onOpenNewInteraction={() => setIsNewInteractionModalOpen(true)}
                onSwitchToAgent={() => setActiveTab('agent')}
              />
            )}

            {/* Tab 2: Agent Workspace */}
            {activeTab === 'agent' && (
              <AgentWorkspace
                patient={currentPatientObj}
                onSwitchToComparison={() => setActiveTab('compare')}
                onOpenMemoryExplorer={() => setIsMemoryExplorerOpen(true)}
              />
            )}

            {/* Tab 3: Before vs After Comparison */}
            {activeTab === 'compare' && (
              <BeforeAfterComparison
                patient={currentPatientObj}
              />
            )}

          </div>
        )}

      </main>

      {/* Memory Explorer Slide-Over Drawer */}
      <MemoryExplorer
        isOpen={isMemoryExplorerOpen}
        onClose={() => setIsMemoryExplorerOpen(false)}
        patientId={selectedPatientId || 'P001'}
        patientName={currentPatientObj?.name || 'Ravi Kumar'}
        onMemoryChanged={handleRefreshCurrent}
      />

      {/* New Clinical Interaction Modal */}
      <NewInteractionModal
        isOpen={isNewInteractionModalOpen}
        onClose={() => setIsNewInteractionModalOpen(false)}
        patient={currentPatientObj || patients[0]}
        onInteractionCreated={handleRefreshCurrent}
      />

      {/* 60-Second Demo Storyboard Guide */}
      <DemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onSelectDemoCase={(id) => {
          setSelectedPatientId(id);
          setActiveTab('journey');
        }}
      />

      {/* Sticky Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        CareContinuity • Memory-Powered Patient Journey Assistant • Powered by Hindsight Agent Memory
      </footer>

    </div>
  );
}
