
import React, { useState, useEffect } from 'react';
import { Machine, Part, AppMode } from './types';
import { api } from './api';
import ExplodedView from './components/ExplodedView';
import PartDetailsCard from './components/PartDetailsCard';
import CatalogView from './components/CatalogView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeModal from './components/WelcomeModal';
import DeleteMachineModal from './components/DeleteMachineModal';
import { Target, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.VIEWER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);

  const fetchData = async () => {
    try {
      const [m, p] = await Promise.all([api.getMachines(), api.getParts()]);
      setMachines(m);
      setParts(p);
      if (m.length > 0 && !selectedMachine) setSelectedMachine(m[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!localStorage.getItem('cv_visited')) {
      setShowWelcome(true);
      localStorage.setItem('cv_visited', 'true');
    }
  }, []);

  const handleAddHotspot = async (x: number, y: number, partId: string) => {
    if (!selectedMachine) return;
    const newH = await api.saveHotspot(selectedMachine.id, { partId, x, y });
    const updated = machines.map(m => m.id === selectedMachine.id ? { ...m, hotspots: [...m.hotspots, newH] } : m);
    setMachines(updated);
    setSelectedMachine(updated.find(m => m.id === selectedMachine.id) || null);
  };

  const handleDeleteHotspot = async (id: string) => {
    await api.deleteHotspot(id);
    const updated = machines.map(m => ({ ...m, hotspots: m.hotspots.filter(h => h.id !== id) }));
    setMachines(updated);
    if (selectedMachine) setSelectedMachine(updated.find(m => m.id === selectedMachine.id) || null);
    setSelectedPart(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white flex-col gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Activos desde la Nube...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden text-slate-900 font-sans">
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {machineToDelete && <DeleteMachineModal machineName={machineToDelete.name} onConfirm={async () => { await api.deleteMachine(machineToDelete.id); setMachines(machines.filter(m => m.id !== machineToDelete.id)); setMachineToDelete(null); }} onCancel={() => setMachineToDelete(null)} />}

      <Sidebar 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} mode={mode} setMode={setMode} machines={machines} 
        selectedMachineId={selectedMachine?.id || null} onSelectMachine={(m) => { setSelectedMachine(m); setSelectedPart(null); setMode(AppMode.VIEWER); }} 
        onAddMachine={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const m = await api.uploadMachine({ name: file.name.split('.')[0].toUpperCase(), imageUrl: ev.target?.result as string });
            setMachines([...machines, m]);
            setSelectedMachine(m);
            setMode(AppMode.EDITOR);
          };
          reader.readAsDataURL(file);
        }}
        onDeleteMachine={setMachineToDelete} setSelectedPart={setSelectedPart}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} mode={mode} title={mode === AppMode.CATALOG ? 'Catálogo Maestro' : (selectedMachine?.name || 'Inicio')} onLogout={() => setShowWelcome(true)} />
        <div className="flex-1 relative flex flex-col lg:flex-row min-h-0 bg-slate-50">
          <div className="flex-1 relative flex items-center justify-center p-0 overflow-hidden">
            {mode === AppMode.CATALOG ? (
              <div className="w-full h-full p-6 lg:p-12"><CatalogView parts={parts} onImport={fetchData} onRefresh={fetchData} /></div>
            ) : selectedMachine ? (
              <ExplodedView machine={selectedMachine} parts={parts} mode={mode} onHotspotClick={(pid) => setSelectedPart(parts.find(p => p.id === pid) || null)} onAddHotspot={handleAddHotspot} onDeleteHotspot={handleDeleteHotspot} />
            ) : (
              <div className="text-center"><Target className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase text-[10px]">Cargue un plano para comenzar</p></div>
            )}
          </div>
          {mode !== AppMode.CATALOG && selectedPart && (
            <div className="w-full lg:w-[28rem] bg-white border-l border-slate-100 p-8 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl z-40">
              <PartDetailsCard part={selectedPart} onClose={() => setSelectedPart(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
