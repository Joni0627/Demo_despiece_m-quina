
import React, { useState, useEffect } from 'react';
import { INITIAL_MACHINES, INITIAL_PARTS } from './data';
import { Machine, Part, Hotspot, AppMode } from './types';
import ExplodedView from './components/ExplodedView';
import PartDetailsCard from './components/PartDetailsCard';
import MachineSelector from './components/MachineSelector';
import CatalogView from './components/CatalogView';
import { Settings, Eye, Package, Menu, X, PlusCircle, Upload } from 'lucide-react';

const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.VIEWER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence
  useEffect(() => {
    const savedMachines = localStorage.getItem('mech_explode_machines');
    const savedParts = localStorage.getItem('mech_explode_parts');
    if (savedMachines) setMachines(JSON.parse(savedMachines));
    if (savedParts) setParts(JSON.parse(savedParts));
  }, []);

  useEffect(() => {
    localStorage.setItem('mech_explode_machines', JSON.stringify(machines));
    localStorage.setItem('mech_explode_parts', JSON.stringify(parts));
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
        name: file.name.split('.')[0],
        imageUrl: result,
        hotspots: []
      };
      setMachines([...machines, newMachine]);
      setSelectedMachine(newMachine);
      setMode(AppMode.EDITOR);
    };
    reader.readAsDataURL(file);
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

  const handleImportParts = (newParts: Part[]) => {
    setParts([...parts, ...newParts]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <div className={`
        ${isSidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 bg-white border-r border-slate-200 flex flex-col z-20
      `}>
        {isSidebarOpen && (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h1 className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
                <Settings className="w-6 h-6" />
                MechExplode
              </h1>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-6">
              <div className="px-6 mt-6 flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planos</h3>
                <label className="cursor-pointer bg-indigo-50 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleAddMachine} />
                </label>
              </div>

              <MachineSelector 
                machines={machines} 
                selectedId={selectedMachine?.id || null}
                onSelect={handleSelectMachine}
              />
              
              <div className="mt-8 px-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Navegación</h3>
                <nav className="space-y-1">
                  <button 
                    onClick={() => { setMode(AppMode.VIEWER); setSelectedPart(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.VIEWER ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Eye className="w-4 h-4" />
                    Visor de Explosión
                  </button>
                  <button 
                    onClick={() => { setMode(AppMode.EDITOR); setSelectedPart(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.EDITOR ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Settings className="w-4 h-4" />
                    Editor de Puntos
                  </button>
                  <button 
                    onClick={() => { setMode(AppMode.CATALOG); setSelectedPart(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.CATALOG ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Package className="w-4 h-4" />
                    Catálogo de Piezas
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <h2 className="font-semibold text-slate-800">
              {mode === AppMode.CATALOG ? 'Catálogo General de Materiales' : (selectedMachine ? selectedMachine.name : 'Explosión de Materiales')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide 
              ${mode === AppMode.EDITOR ? 'bg-amber-100 text-amber-700' : 
                mode === AppMode.CATALOG ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
              {mode} MODE
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 relative bg-slate-100 flex items-center justify-center p-8 overflow-auto">
            {mode === AppMode.CATALOG ? (
              <CatalogView parts={parts} onImport={handleImportParts} />
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
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 max-w-xs">Sube un nuevo plano o selecciona uno existente para comenzar la visualización.</p>
              </div>
            )}
          </div>

          {/* Details Sidebar (only in viewer/editor and if a part is selected) */}
          {mode !== AppMode.CATALOG && (
            <div className={`
              w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 
              ${selectedPart ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 lg:translate-x-full lg:opacity-0 pointer-events-none'}
              transition-all duration-300 p-6 overflow-y-auto
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
