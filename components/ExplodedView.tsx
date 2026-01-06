
import React, { useState, useRef, useEffect } from 'react';
import { Machine, Hotspot, Part, AppMode } from '../types';
import { Plus, X, Info, Crosshair } from 'lucide-react';

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

  const submitHotspot = () => {
    if (showEditorMenu && selectedPartToAdd) {
      onAddHotspot(showEditorMenu.x, showEditorMenu.y, selectedPartToAdd);
      setShowEditorMenu(null);
      setPendingPoint(null);
      setSelectedPartToAdd('');
    }
  };

  const getModalStyle = () => {
    if (!showEditorMenu) return {};
    const { x, y } = showEditorMenu;
    const translateX = x < 20 ? '0%' : x > 80 ? '-100%' : '-50%';
    const translateY = y > 70 ? 'calc(-100% - 30px)' : '30px';

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(${translateX}, ${translateY})`,
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative max-w-full h-auto rounded-2xl shadow-2xl bg-white group select-none ${mode === AppMode.EDITOR ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ minWidth: '600px' }}
    >
      <img 
        src={machine.imageUrl} 
        alt={machine.name} 
        className="block w-full h-auto select-none pointer-events-none rounded-2xl"
      />

      {/* Visualización del área de demarcación mientras se mantiene el click */}
      {isHolding && pendingPoint && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            {/* Círculo pulsante de área */}
            <div className="absolute w-16 h-16 bg-indigo-500/20 rounded-full animate-ping border-2 border-indigo-400"></div>
            <div className="absolute w-10 h-10 bg-indigo-500/10 rounded-full border border-indigo-500/30 backdrop-blur-[1px]"></div>
            <Crosshair className="w-6 h-6 text-indigo-600 drop-shadow-md" />
          </div>
        </div>
      )}

      {/* Hotspots Existentes */}
      {machine.hotspots.map((h) => {
        const part = parts.find(p => p.id === h.partId);
        return (
          <div
            key={h.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group/spot"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onMouseDown={(e) => e.stopPropagation()} // Evitar crear nuevo punto al clickear uno viejo
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (mode === AppMode.EDITOR) {
                  onDeleteHotspot(h.id);
                } else {
                  onHotspotClick(h.partId);
                }
              }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                ${mode === AppMode.EDITOR 
                  ? 'bg-amber-500 hover:bg-amber-600 scale-110' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-125'}
                text-white ring-4 ring-white
              `}
            >
              {mode === AppMode.EDITOR ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/spot:block pointer-events-none z-20">
              <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/10">
                <span className="font-bold text-indigo-300">{part?.code}</span> • {part?.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicador visual del punto seleccionado para editar (si el menú está abierto) */}
      {showEditorMenu && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg animate-pulse"
          style={{ left: `${showEditorMenu.x}%`, top: `${showEditorMenu.y}%` }}
        />
      )}

      {/* Editor Modal Overlay */}
      {showEditorMenu && (
        <div 
          className="absolute z-30 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 w-72 transition-all duration-200 animate-in zoom-in-95 fade-in"
          style={getModalStyle()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Asignar Material</h4>
              <p className="text-[10px] text-slate-500">Posición: {showEditorMenu.x.toFixed(1)}%, {showEditorMenu.y.toFixed(1)}%</p>
            </div>
            <button 
              onClick={() => { setShowEditorMenu(null); setPendingPoint(null); }}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <select 
                value={selectedPartToAdd}
                onChange={(e) => setSelectedPartToAdd(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
              >
                <option value="">Seleccionar del catálogo...</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button 
              disabled={!selectedPartToAdd}
              onClick={submitHotspot}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" /> Guardar Punto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplodedView;
