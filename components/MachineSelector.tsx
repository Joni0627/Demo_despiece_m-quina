
/**
 * ARCHIVO: components/MachineSelector.tsx
 * DESCRIPCIÓN: Renderiza la lista de máquinas disponibles con controles de borrado.
 */
import React from 'react';
import { Machine } from '../types';
import { Layout, ChevronRight, Trash2 } from 'lucide-react';

interface Props {
  machines: Machine[];
  selectedId: string | null;
  onSelect: (m: Machine) => void;
  onDeleteRequest: (m: Machine) => void;
}

const MachineSelector: React.FC<Props> = ({ machines, selectedId, onSelect, onDeleteRequest }) => {
  return (
    <div className="px-6">
      <div className="space-y-3">
        {machines.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">Base de datos de planos vacía</p>
          </div>
        )}
        {machines.map((machine) => (
          <div key={machine.id} className="relative group">
            <button
              onClick={() => onSelect(machine)}
              className={`
                w-full text-left p-4 rounded-2xl transition-all border-2
                ${selectedId === machine.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all overflow-hidden border
                    ${selectedId === machine.id ? 'bg-white border-indigo-100 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-400 group-hover:bg-slate-200'}
                  `}>
                     {machine.imageUrl ? (
                       <img src={machine.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                     ) : (
                       <Layout className="w-5 h-5" />
                     )}
                  </div>
                  <div className="flex flex-col pr-8">
                    <p className={`text-sm font-bold truncate max-w-[120px] ${selectedId === machine.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {machine.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {machine.hotspots.length} Nodos
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === machine.id ? 'text-indigo-400 translate-x-1' : 'text-slate-200'}`} />
              </div>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(machine);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all z-10"
              title="Eliminar activo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineSelector;
