
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

  /**
   * Lógica de posicionamiento inteligente:
   * Calcula el desplazamiento del modal basado en la proximidad a los bordes.
   */
  const getModalStyle = () => {
    if (!showEditorMenu) return {};
    const { x, y } = showEditorMenu;
    
    // Determinar dirección horizontal
    let translateX = '-50%';
    if (x > 75) translateX = '-90%'; // Muy a la derecha -> mover modal a la izquierda
    if (x < 25) translateX = '-10%'; // Muy a la izquierda -> mover modal a la derecha

    // Determinar dirección vertical
    let translateY = '20px'; // Por defecto debajo
    if (y > 65) translateY = 'calc(-100% - 20px)'; // Muy abajo -> mover modal arriba

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(${translateX}, ${translateY})`,
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block mx-auto max-w-full h-auto bg-white shadow-2xl rounded-xl overflow-hidden select-none border border-slate-200 ${mode === AppMode.EDITOR ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img src={machine.imageUrl} alt={machine.name} className="block w-full h-auto max-h-[80vh] object-contain pointer-events-none" />

      {/* Cruz de posicionamiento con Contraste Inteligente */}
      {isHolding && pendingPoint && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none" 
          style={{ 
            left: `${pendingPoint.x}%`, 
            top: `${pendingPoint.y}%`,
            mixBlendMode: 'difference' // Esto hace que sea blanca sobre negro y viceversa
          }}
        >
          <Crosshair className="w-10 h-10 text-white" strokeWidth={1.5} />
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

      {/* Modal de Asignación con posicionamiento inteligente */}
      {showEditorMenu && (
        <div 
          className="absolute z-50 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 w-80 animate-in zoom-in-95 fade-in duration-200" 
          style={getModalStyle()} 
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Vincular Material</h4>
            <button onClick={() => setShowEditorMenu(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Seleccionar del catálogo</label>
              <select 
                value={selectedPartToAdd} 
                onChange={e => setSelectedPartToAdd(e.target.value)} 
                className="w-full text-sm border-2 border-slate-100 p-3 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Buscar código o nombre...</option>
                {parts.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
              </select>
            </div>
            <button 
              disabled={!selectedPartToAdd} 
              onClick={() => { onAddHotspot(showEditorMenu.x, showEditorMenu.y, selectedPartToAdd); setShowEditorMenu(null); setSelectedPartToAdd(''); }} 
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirmar Punto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplodedView;
