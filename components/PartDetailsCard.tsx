
import React from 'react';
import { Part } from '../types';
import { X, Box, MapPin, Tag, ClipboardList } from 'lucide-react';

interface Props {
  part: Part;
  onClose: () => void;
}

const PartDetailsCard: React.FC<Props> = ({ part, onClose }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded mb-1">
            {part.category}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{part.name}</h2>
          <p className="text-indigo-600 font-mono text-sm font-medium tracking-tight">CÓDIGO: {part.code}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5" /> Descripción
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            {part.description}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Box className="w-3 h-3" /> En Stock
            </h4>
            <p className={`text-xl font-bold ${part.stock < 5 ? 'text-red-500' : 'text-slate-900'}`}>
              {part.stock} <span className="text-xs font-normal text-slate-500 uppercase">uds</span>
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Ubicación
            </h4>
            <p className="text-sm font-semibold text-slate-900">{part.location}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Acciones Rápidas
            </h4>
            <div className="grid grid-cols-1 gap-2">
                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    Solicitar Repuesto
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Ver historial de stock
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetailsCard;
