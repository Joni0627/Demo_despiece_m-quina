
/**
 * ARCHIVO: App.tsx
 * DESCRIPCIÓN: Orquestador central adaptado para integración con MySQL vía API.
 */
import React, { useState, useEffect } from 'react';
import { Machine, Part, Hotspot, AppMode } from './types';
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

  // Carga inicial de datos desde MySQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [machinesData, partsData] = await Promise.all([
          api.getMachines(),
          api.getParts()
        ]);
        setMachines(machinesData);
        setParts(partsData);
        
        const hasVisited = localStorage.getItem('cv_visited');
        if (!hasVisited) {
          setShowWelcome(true);
          localStorage.setItem('cv_visited', 'true');
        }
      } catch (error) {
        console.error("Error sincronizando con la base de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setSelectedPart(null);
    if (mode === AppMode.CATALOG) setMode(AppMode.VIEWER);
  };

  const handleAddMachine = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const newMachineData = {
          name: file.name.split('.')[0].toUpperCase(),
          imageUrl: result
        };
        
        const createdMachine = await api.uploadMachine(newMachineData);
        setMachines(prev => [...prev, createdMachine]);
        setSelectedMachine(createdMachine);
        setMode(AppMode.EDITOR);
      } catch (error) {
        alert("Error al subir el plano a la base de datos");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHotspot = async (x: number, y: number, partId: string) => {
    if (!selectedMachine) return;
    
    try {
      const newHotspot = await api.saveHotspot(selectedMachine.id, { partId, x, y });
      
      const updatedMachines = machines.map(m => {
        if (m.id === selectedMachine.id) {
          const updatedM = { ...m, hotspots: [...m.hotspots, newHotspot] };
          setSelectedMachine(updatedM);
          return updatedM;
        }
        return m;
      });
      setMachines(updatedMachines);
    } catch (error) {
      alert("Error al guardar el punto en MySQL");
    }
  };

  const handleDeleteHotspot = async (hotspotId: string) => {
    if (!selectedMachine) return;
    
    try {
      await api.deleteHotspot(hotspotId);
      
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
    } catch (error) {
      alert("Error al eliminar el punto de la base de datos");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white flex-col gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando con MySQL...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      
      {machineToDelete && (
        <DeleteMachineModal 
          machineName={machineToDelete.name}
          onConfirm={() => {}} // Implementar borrado real si es necesario
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

      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-white">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          mode={mode}
          title={mode === AppMode.CATALOG ? 'Catálogo Maestro' : (selectedMachine ? selectedMachine.name : 'Bienvenido')}
          onLogout={() => setShowWelcome(true)}
        />

        <div className="flex-1 relative flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-4 lg:p-8 overflow-auto">
            {mode === AppMode.CATALOG ? (
              <CatalogView parts={parts} onImport={() => {}} />
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
              <div className="text-center bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-slate-100 max-w-xl mx-4">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-2xl animate-float">
                  <Target className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Datos en la nube</h3>
                <p className="text-slate-500 text-sm md:text-lg mb-8 md:mb-12 leading-relaxed font-medium">Su sistema está conectado a MySQL. Seleccione un activo del panel lateral para comenzar.</p>
              </div>
            )}
          </div>

          {mode !== AppMode.CATALOG && selectedPart && (
            <div className="fixed bottom-0 left-0 right-0 lg:static lg:w-[32rem] bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-6 lg:p-12 overflow-y-auto z-40 max-h-[85vh] lg:max-h-full shadow-[0_-30px_60px_rgba(0,0,0,0.08)] lg:shadow-none">
              <PartDetailsCard part={selectedPart} onClose={() => setSelectedPart(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
