
/**
 * ARCHIVO: components/WelcomeModal.tsx
 * DESCRIPCIÓN: Pantalla de inicio de Check Vector optimizada sin scrollbars visibles.
 */
import React from 'react';
import { Box, Layers, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const WelcomeModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-700">
      <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-4xl w-full text-center">
          
          {/* Logo animado */}
          <div className="mb-8 md:mb-12 flex justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-float">
              <Target className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>

          {/* Títulos con animación lateral controlada */}
          <div className="space-y-4 mb-10 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-tight">
              <span className="inline-block animate-in slide-in-from-left-10 duration-700 fill-mode-both">
                Check
              </span>
              <span className="inline-block animate-in slide-in-from-right-10 duration-700 fill-mode-both ml-3 md:ml-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Vector
              </span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both px-4">
              Visualiza, gestiona y explota tus activos industriales con una precisión sin precedentes.
            </p>
          </div>

          {/* Grid de beneficios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 animate-in fade-in zoom-in-95 duration-700 delay-500 fill-mode-both">
            {[
              { 
                icon: Layers, 
                title: "Planos Interactivos", 
                desc: "Navegación fluida por capas de explosión de materiales.",
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              { 
                icon: Target, 
                title: "Puntos de Precisión", 
                desc: "Identificación exacta de componentes en tiempo real.",
                color: "text-violet-500",
                bg: "bg-violet-50"
              },
              { 
                icon: Box, 
                title: "Gestión de Stock", 
                desc: "Control absoluto de ubicaciones y cantidades críticas.",
                color: "text-emerald-500",
                bg: "bg-emerald-50"
              }
            ].map((item, i) => (
              <div key={i} className="p-6 md:p-8 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group">
                <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Botón de acción principal */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both pb-8 md:pb-0">
            <button 
              onClick={onClose}
              className="group relative inline-flex items-center justify-center px-8 md:px-12 py-4 md:py-5 font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95"
            >
              Empezar ahora
              <ArrowRight className="ml-2 md:ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Versión Enterprise v4.0</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
