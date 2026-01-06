
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Machine, Part, AppMode } from '../types';
import { Plus, X, Info, Crosshair, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

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
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Estados de Zoom y Pan
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Estados del Editor
  const [showEditorMenu, setShowEditorMenu] = useState<{ x: number, y: number, rawX: number, rawY: number } | null>(null);
  const [pendingPoint, setPendingPoint] = useState<{ x: number, y: number } | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState('');

  // Resetear vista cuando cambia la máquina
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setShowEditorMenu(null);
  }, [machine.id]);

  // Manejador de Zoom con la Rueda
  const handleWheel = (e: React.WheelEvent) => {
    if (showEditorMenu) return;
    
    e.preventDefault();
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 100);
    
    const newScale = Math.min(Math.max(scale * factor, 0.5), 10);
    
    // Zoom hacia el puntero
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
    const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);
    
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Manejo de Desplazamiento (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Si es clic central o estamos en modo visor y no es clic izquierdo sobre un punto
    if (e.button === 1 || (mode === AppMode.VIEWER && e.button === 0)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    if (mode !== AppMode.EDITOR || showEditorMenu || e.button !== 0) return;

    // Lógica para añadir punto (Editor)
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calcular coordenadas reales relativas a la imagen transformada
    const x = ((e.clientX - rect.left - offset.x) / scale);
    const y = ((e.clientY - rect.top - offset.y) / scale);
    
    // Convertir a porcentaje de la imagen original
    const imgWidth = imageRef.current?.clientWidth || 1;
    const imgHeight = imageRef.current?.clientHeight || 1;
    
    const pctX = (x / imgWidth) * 100;
    const pctY = (y / imgHeight) * 100;

    setPendingPoint({ x: pctX, y: pctY });
    setIsHolding(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (!isHolding || mode !== AppMode.EDITOR) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left - offset.x) / scale);
    const y = ((e.clientY - rect.top - offset.y) / scale);
    
    const imgWidth = imageRef.current?.clientWidth || 1;
    const imgHeight = imageRef.current?.clientHeight || 1;
    
    setPendingPoint({ x: (x / imgWidth) * 100, y: (y / imgHeight) * 100 });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isHolding && pendingPoint) {
      // Necesitamos guardar también la posición en pantalla para el menú
      setShowEditorMenu({ 
        ...pendingPoint, 
        rawX: ((pendingPoint.x / 100) * (imageRef.current?.clientWidth || 0) * scale) + offset.x,
        rawY: ((pendingPoint.y / 100) * (imageRef.current?.clientHeight || 0) * scale) + offset.y
      });
      setIsHolding(false);
    }
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const getModalStyle = () => {
    if (!showEditorMenu) return {};
    const { rawX, rawY, x, y } = showEditorMenu;
    
    // El menú se posiciona absolutamente en el contenedor, ignorando el transform del grupo de la imagen
    // para que no se escale ni se mueva con el pan de forma extraña.
    let translateX = '-50%';
    if (x > 75) translateX = '-90%';
    if (x < 25) translateX = '-10%';

    let translateY = '20px';
    if (y > 65) translateY = 'calc(-100% - 20px)';

    return {
      left: `${rawX}px`,
      top: `${rawY}px`,
      transform: `translate(${translateX}, ${translateY})`,
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100 rounded-3xl border border-slate-200 shadow-inner group/view">
      
      {/* Controles de Zoom Flotantes */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2 scale-90 sm:scale-100">
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white flex flex-col gap-1">
          <button onClick={() => setScale(s => Math.min(s * 1.2, 10))} className="p-3 hover:bg-indigo-50 rounded-xl transition-colors text-indigo-600" title="Acercar"><ZoomIn className="w-5 h-5" /></button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={() => setScale(s => Math.max(s / 1.2, 0.5))} className="p-3 hover:bg-indigo-50 rounded-xl transition-colors text-indigo-600" title="Alejar"><ZoomOut className="w-5 h-5" /></button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={resetView} className="p-3 hover:bg-indigo-50 rounded-xl transition-colors text-indigo-600" title="Ajustar Vista"><Maximize className="w-5 h-5" /></button>
        </div>
        <div className={`bg-indigo-600 p-3 rounded-2xl shadow-lg text-white transition-opacity ${mode === AppMode.VIEWER ? 'opacity-100' : 'opacity-0'}`}>
          <Move className="w-5 h-5" />
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center ${isPanning ? 'cursor-grabbing' : mode === AppMode.EDITOR ? 'cursor-crosshair' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsPanning(false); setIsHolding(false); }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Contenedor Transformable (Imagen + Hotspots) */}
        <div 
          className="relative transition-transform duration-75 ease-out"
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          <img 
            ref={imageRef}
            src={machine.imageUrl} 
            alt={machine.name} 
            className="block max-w-none h-auto pointer-events-none select-none shadow-2xl rounded-sm"
            style={{ width: 'auto', maxHeight: '85vh' }}
          />

          {/* Cruz de Posicionamiento */}
          {isHolding && pendingPoint && (
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none" 
              style={{ 
                left: `${pendingPoint.x}%`, 
                top: `${pendingPoint.y}%`,
                mixBlendMode: 'difference'
              }}
            >
              <Crosshair className="w-10 h-10 text-white" strokeWidth={1} />
            </div>
          )}

          {/* Puntos de Interés */}
          {machine.hotspots.map((h) => {
            const part = parts.find(p => p.id === h.partId);
            return (
              <div 
                key={h.id} 
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group/spot" 
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    mode === AppMode.EDITOR ? onDeleteHotspot(h.id) : onHotspotClick(h.partId); 
                  }}
                  onMouseDown={e => e.stopPropagation()} // Evitar inicio de pan al tocar un punto
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all border-2 border-white text-white ${mode === AppMode.EDITOR ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-125'}`}
                  style={{ transform: `scale(${1/scale})` }} // Invertir escala para que el punto mantenga tamaño visual
                >
                  {mode === AppMode.EDITOR ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </button>
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/spot:block pointer-events-none z-20"
                  style={{ transform: `translateX(-50%) scale(${1/scale})`, transformOrigin: 'top' }}
                >
                  <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/20 shadow-2xl">
                    <span className="font-bold text-indigo-300">{part?.code}</span> • {part?.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Asignación - Fuera del transform para no distorsionarse */}
        {showEditorMenu && (
          <div 
            className="absolute z-50 bg-white p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-200 w-80 animate-in zoom-in-95 fade-in duration-200" 
            style={getModalStyle()} 
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Asignar Material</h4>
              <button onClick={() => setShowEditorMenu(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <select 
                value={selectedPartToAdd} 
                onChange={e => setSelectedPartToAdd(e.target.value)} 
                className="w-full text-sm border-2 border-slate-100 p-3 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Buscar en catálogo...</option>
                {parts.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
              </select>
              <button 
                disabled={!selectedPartToAdd} 
                onClick={() => { onAddHotspot(showEditorMenu.x, showEditorMenu.y, selectedPartToAdd); setShowEditorMenu(null); setSelectedPartToAdd(''); }} 
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                Vincular Punto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplodedView;
