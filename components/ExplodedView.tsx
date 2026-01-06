
import React, { useState, useRef } from 'react';
import { Machine, Hotspot, Part, AppMode } from '../types';
import { Plus, X, Info } from 'lucide-react';

interface Props {
  machine: Machine;
  parts: Part[];
  mode: AppMode;
  onHotspotClick: (partId: string) => void;
  onAddHotspot: (x: number, y: number, partId: string) => void;
  onDeleteHotspot: (id: string) => void;
}

const ExplodedView: React.FC<Props> = ({ 
  machine, 
  parts, 
  mode, 
  onHotspotClick, 
  onAddHotspot,
  onDeleteHotspot
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showEditorMenu, setShowEditorMenu] = useState<{ x: number, y: number } | null>(null);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState('');

  const handleImageClick = (e: React.MouseEvent) => {
    if (mode !== AppMode.EDITOR) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setShowEditorMenu({ x, y });
  };

  const submitHotspot = () => {
    if (showEditorMenu && selectedPartToAdd) {
      onAddHotspot(showEditorMenu.x, showEditorMenu.y, selectedPartToAdd);
      setShowEditorMenu(null);
      setSelectedPartToAdd('');
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative max-w-full h-auto rounded-2xl shadow-2xl overflow-hidden bg-white group cursor-crosshair"
      onClick={handleImageClick}
      style={{ minWidth: '600px', minHeight: '400px' }}
    >
      <img 
        src={machine.imageUrl} 
        alt={machine.name} 
        className="block w-full h-auto select-none pointer-events-none"
      />

      {/* Hotspots */}
      {machine.hotspots.map((h) => {
        const part = parts.find(p => p.id === h.partId);
        return (
          <div
            key={h.id}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 z-10 group/spot
            `}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {/* The Dot */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHotspotClick(h.partId);
              }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                ${mode === AppMode.EDITOR 
                  ? 'bg-amber-500 hover:bg-amber-600 scale-110' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-125'}
                text-white ring-4 ring-white
              `}
            >
              {mode === AppMode.EDITOR ? <X className="w-4 h-4" onClick={(e) => { e.stopPropagation(); onDeleteHotspot(h.id); }} /> : <Info className="w-4 h-4" />}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/spot:block pointer-events-none z-20">
              <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                <span className="font-bold">{part?.code}</span> - {part?.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Editor Modal Overlay */}
      {showEditorMenu && (
        <div 
          className="absolute z-30 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 w-64 -translate-x-1/2"
          style={{ left: `${showEditorMenu.x}%`, top: `${showEditorMenu.y}%` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Asociar Pieza</h4>
            <button onClick={() => setShowEditorMenu(null)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <select 
            value={selectedPartToAdd}
            onChange={(e) => setSelectedPartToAdd(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg p-2 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecciona pieza...</option>
            {parts.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
          <button 
            disabled={!selectedPartToAdd}
            onClick={submitHotspot}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Guardar Punto
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplodedView;
