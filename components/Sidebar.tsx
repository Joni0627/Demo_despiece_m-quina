
/**
 * ARCHIVO: components/Sidebar.tsx
 * DESCRIPCIÓN: Panel de navegación lateral Check Vector sin scrollbars visibles.
 */
import React from 'react';
import { LayoutDashboard, Eye, Package, Upload, X, Target } from 'lucide-react';
import { AppMode, Machine } from '../types';
import MachineSelector from './MachineSelector';

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  machines: Machine[];
  selectedMachineId: string | null;
  onSelectMachine: (m: Machine) => void;
  onAddMachine: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteMachine: (m: Machine) => void;
  setSelectedPart: (p: any) => void;
}

const Sidebar: React.FC<Props> = ({ 
  isOpen, setIsOpen, mode, setMode, machines, 
  selectedMachineId, onSelectMachine, onAddMachine, onDeleteMachine, setSelectedPart 
}) => {
  return (
    <aside className={`
      ${isOpen ? 'w-80' : 'w-0'} 
      transition-all duration-300 bg-white border-r border-slate-200 flex flex-col z-20 h-full overflow-hidden
    `}>
      <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tighter leading-none">
              Check<span className="text-indigo-600">Vector</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Intelligence</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg lg:hidden">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-6 mt-8 flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Bases de Datos</h3>
          <label className="cursor-pointer bg-slate-50 text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 border border-indigo-100 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <input type="file" className="hidden" accept="image/*" onChange={onAddMachine} />
          </label>
        </div>

        <MachineSelector 
          machines={machines} 
          selectedId={selectedMachineId}
          onSelect={onSelectMachine}
          onDeleteRequest={onDeleteMachine}
        />
        
        <div className="mt-10 px-6 pb-10">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Modo de Trabajo</h3>
          <nav className="space-y-1.5">
            {[
              { id: AppMode.VIEWER, icon: Eye, label: 'Visor de Activos' },
              { id: AppMode.EDITOR, icon: LayoutDashboard, label: 'Editor de Planos' },
              { id: AppMode.CATALOG, icon: Package, label: 'Catálogo Maestro' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setMode(item.id); setSelectedPart(null); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-bold tracking-tight transition-all
                  ${mode === item.id 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`w-4 h-4 ${mode === item.id ? 'text-indigo-200' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v4.0.2 Live</span>
          </div>
          <div className="text-[10px] font-medium text-slate-300">© 2025 CV Systems</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
