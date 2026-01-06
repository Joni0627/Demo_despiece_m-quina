
/**
 * ARCHIVO: App.tsx
 * DESCRIPCIÓN: Orquestador central Check Vector.
 */
import React, { useState, useEffect } from 'react';
import { INITIAL_MACHINES, INITIAL_PARTS } from './data';
import { Machine, Part, Hotspot, AppMode } from './types';
import ExplodedView from './components/ExplodedView';
import PartDetailsCard from './components/PartDetailsCard';
import CatalogView from './components/CatalogView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeModal from './components/WelcomeModal';
import DeleteMachineModal from './components/DeleteMachineModal';
import { Target } from 'lucide-react';

const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.VIEWER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);

  useEffect(() => {
    const savedMachines = localStorage.getItem('cv_machines');
    const savedParts = localStorage.getItem('cv_parts');
    const hasVisited = localStorage.getItem('cv_visited');

    if (savedMachines) setMachines(JSON.parse(savedMachines));
    if (savedParts) setParts(JSON.parse(savedParts));
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('cv_visited', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cv_machines', JSON.stringify(machines));
    localStorage.setItem('cv_parts', JSON.stringify(parts));
  }, [machines, parts]);

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setSelectedPart(null);
    if (mode === AppMode.CATALOG) setMode(AppMode.VIEWER);
  };

  const handleAddMachine = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newMachine: Machine = {
        id: `m-${Date.now()}`,
        name: file.name.split('.')[0].toUpperCase(),
        imageUrl: result,
        hotspots: []
      };
      setMachines([...machines, newMachine]);
      setSelectedMachine(newMachine);
      setMode(AppMode.EDITOR);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDelete = () => {
    if (!machineToDelete) return;
    const updatedMachines = machines.filter(m => m.id !== machineToDelete.id);
    setMachines(updatedMachines);
    if (selectedMachine?.id === machineToDelete.id) {
      setSelectedMachine(null);
      setSelectedPart(null);
    }
    setMachineToDelete(null);
  };

  const handleAddHotspot = (x: number, y: number, partId: string) => {
    if (!selectedMachine) return;
    
    const newHotspot: Hotspot = {
      id: `h-${Date.now()}`,
      partId,
      x,
      y
    };

    const updatedMachines = machines.map(m => {
      if (m.id === selectedMachine.id) {
        const updatedM = { ...m, hotspots: [...m.hotspots, newHotspot] };
        setSelectedMachine(updatedM);
        return updatedM;
      }
      return m;
    });
    setMachines(updatedMachines);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (!selectedMachine) return;
    
    const updatedMachines = machines.map(m => {
      if (m.id === selectedMachine.id) {
        const updatedHotspots = m.hotspots.filter(h => h.id !== hotspotId);
        const updatedM = { ...m, hotspots: updatedHotspots };
        setSelectedMachine(updatedM);
        return updatedM;
      }
      return m;
    });
    setMachines(updatedMachines);
    setSelectedPart(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      
      {machineToDelete && (
        <DeleteMachineModal 
          machineName={machineToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setMachineToDelete(null)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        mode={mode}
        setMode={setMode}
        machines={machines}
        selectedMachineId={selectedMachine?.id || null}
        onSelectMachine={handleSelectMachine}
        onAddMachine={handleAddMachine}
        onDeleteMachine={setMachineToDelete}
        setSelectedPart={setSelectedPart}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          mode={mode}
          title={mode === AppMode.CATALOG ? 'Panel de Catálogo Maestro' : (selectedMachine ? selectedMachine.name : 'Bienvenido a Check Vector')}
        />

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-4 lg:p-12 overflow-auto custom-scrollbar">
            {mode === AppMode.CATALOG ? (
              <CatalogView parts={parts} onImport={(np) => setParts([...parts, ...np])} />
            ) : selectedMachine ? (
              <ExplodedView 
                machine={selectedMachine} 
                parts={parts}
                mode={mode}
                onHotspotClick={(pid) => setSelectedPart(parts.find(p => p.id === pid) || null)}
                onAddHotspot={handleAddHotspot}
                onDeleteHotspot={handleDeleteHotspot}
              />
            ) : (
              <div className="text-center bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 max-w-xl animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-100 animate-float">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Comience su gestión</h3>
                <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium">Suba un plano técnico para empezar a identificar activos o seleccione uno de su base de datos.</p>
                <label className="inline-flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-full font-bold cursor-pointer hover:bg-indigo-700 hover:scale-105 transition-all shadow-2xl shadow-indigo-100">
                  Importar nuevo activo
                  <input type="file" className="hidden" accept="image/*" onChange={handleAddMachine} />
                </label>
              </div>
            )}
          </div>

          {mode !== AppMode.CATALOG && (
            <div className={`
              fixed bottom-0 left-0 right-0 lg:static lg:w-[32rem] bg-white border-t lg:border-t-0 lg:border-l border-slate-100
              ${selectedPart ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 lg:translate-x-full lg:opacity-0 pointer-events-none'}
              transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) p-6 lg:p-12 overflow-y-auto z-40 max-h-[85vh] lg:max-h-full
              shadow-[0_-30px_60px_rgba(0,0,0,0.08)] lg:shadow-none
            `}>
              {selectedPart && (
                <PartDetailsCard 
                  part={selectedPart} 
                  onClose={() => setSelectedPart(null)} 
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
