
import React from 'react';
import { Machine } from '../types';
import { Layout, ChevronRight } from 'lucide-react';

interface Props {
  machines: Machine[];
  selectedId: string | null;
  onSelect: (m: Machine) => void;
}

const MachineSelector: React.FC<Props> = ({ machines, selectedId, onSelect }) => {
  return (
    <div className="px-6">
      <div className="space-y-2">
        {machines.length === 0 && (
          <p className="text-xs text-slate-400 italic px-2">No hay planos cargados</p>
        )}
        {machines.map((machine) => (
          <button
            key={machine.id}
            onClick={() => onSelect(machine)}
            className={`
              w-full text-left p-3 rounded-xl transition-all group border-2
              ${selectedId === machine.id 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-50 hover:border-slate-100 hover:shadow-sm'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                  ${selectedId === machine.id ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}
                `}>
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-semibold truncate max-w-[140px] ${selectedId === machine.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {machine.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {machine.hotspots.length} puntos
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === machine.id ? 'text-indigo-400 translate-x-1' : 'text-slate-200'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MachineSelector;
