
import React, { useState, useRef } from 'react';
import { Machine, Part, AppMode } from '../types';
import { Plus, X, Info, Crosshair } from 'lucide-react';

interface Props {
  machine: Machine;
  parts: Part[];
  mode: AppMode;
  onHotspotClick: (partId: string) => void;
  onAddHotspot: (x: number, y: number, partId: string) => void;
  onDeleteHotspot: (id: string) => void;
}

const ExplodedView: React.FC<Props> = ({ machine, parts, mode, onHotspotClick, onAddHotspot, onDeleteHotspot }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showEditorMenu, setShowEditorMenu] = useState<{ x: number, y: number } | null>(null);
  const [pendingPoint, setPendingPoint] = useState<{ x: number, y: number } | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState('');

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== AppMode.EDITOR || showEditorMenu) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPoint({ x, y });
    setIsHolding(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHolding || mode !== AppMode.EDITOR) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (isHolding && pendingPoint) {
      setShowEditorMenu(pendingPoint);
      setIsHolding(false);
    }
  };

  const getModalStyle = () => {
    if (!showEditorMenu) return {};
    const { x, y } = showEditorMenu;
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(${x > 80 ? '-100%' : x < 20 ? '0%' : '-50%'}, ${y > 70 ? 'calc(-100% - 20px)' : '20px'})`,
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block mx-auto max-w-full h-auto bg-white shadow-2xl rounded-xl overflow-hidden select-none ${mode === AppMode.EDITOR ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img src={machine.imageUrl} alt={machine.name} className="block w-full h-auto max-h-[80vh] object-contain pointer-events-none" />

      {isHolding && pendingPoint && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none" style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}>
          <Crosshair className="w-8 h-8 text-indigo-600 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
        </div>
      )}

      {machine.hotspots.map((h) => {
        const part = parts.find(p => p.id === h.partId);
        return (
          <div key={h.id} className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group/spot" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
            <button
              onClick={(e) => { e.stopPropagation(); mode === AppMode.EDITOR ? onDeleteHotspot(h.id) : onHotspotClick(h.partId); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all border-2 border-white text-white ${mode === AppMode.EDITOR ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700 scale-110 hover:scale-125'}`}
            >
              {mode === AppMode.EDITOR ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/spot:block pointer-events-none z-20">
              <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/20 shadow-2xl">
                <span className="font-bold text-indigo-300">{part?.code}</span> • {part?.name}
              </div>
            </div>
          </div>
        );
      })}

      {showEditorMenu && (
        <div className="absolute z-30 bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 w-72 animate-in zoom-in-95" style={getModalStyle()} onMouseDown={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold uppercase text-slate-400">Asignar Material</h4>
            <button onClick={() => setShowEditorMenu(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <select value={selectedPartToAdd} onChange={e => setSelectedPartToAdd(e.target.value)} className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 outline-none">
              <option value="">Seleccionar material...</option>
              {parts.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
            </select>
            <button disabled={!selectedPartToAdd} onClick={() => { onAddHotspot(showEditorMenu.x, showEditorMenu.y, selectedPartToAdd); setShowEditorMenu(null); setSelectedPartToAdd(''); }} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg">Asociar Punto</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplodedView;
