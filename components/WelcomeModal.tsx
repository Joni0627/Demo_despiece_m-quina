
/**
 * ARCHIVO: components/WelcomeModal.tsx
 * DESCRIPCIÓN: Pantalla de inicio de Check Vector simplificada y minimalista.
 */
import React from 'react';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const WelcomeModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-700">
      <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-3xl w-full text-center py-8">
          
          {/* Logo animado - Ahora más prominente */}
          <div className="mb-10 md:mb-14 flex justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-float">
              <Target className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          {/* Títulos con tipografía impactante */}
          <div className="space-y-6 mb-12 md:mb-20">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              <span className="inline-block animate-in slide-in-from-left-10 duration-700 fill-mode-both">
                Check
              </span>
              <br className="sm:hidden" />
              <span className="inline-block animate-in slide-in-from-right-10 duration-700 fill-mode-both sm:ml-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Vector
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 max-w-xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both px-4 leading-relaxed">
              Visualiza, gestiona y explota tus activos industriales con una precisión sin precedentes.
            </p>
          </div>

          {/* Botón de acción principal - Centrado y limpio */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both pb-8 md:pb-0">
            <button 
              onClick={onClose}
              className="group relative inline-flex items-center justify-center px-10 md:px-16 py-5 md:py-6 font-bold text-lg md:text-xl text-white transition-all duration-200 bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95"
            >
              Empezar ahora
              <ArrowRight className="ml-3 md:ml-4 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
                Acceso Instantáneo
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
                Enterprise v4.0.2
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
