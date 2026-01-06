
/**
 * ARCHIVO: components/Header.tsx
 * DESCRIPCIÓN: Cabecera con botón de menú, indicador de modo y opción de salida.
 */
import React from 'react';
import { Menu, Settings, Package, Eye, LogOut } from 'lucide-react';
import { AppMode } from '../types';

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  mode: AppMode;
  title: string;
  onLogout: () => void;
}

const Header: React.FC<Props> = ({ isSidebarOpen, setIsSidebarOpen, mode, title, onLogout }) => {
  const getModeIcon = () => {
    switch (mode) {
      case AppMode.EDITOR: return <Settings className="w-4 h-4" />;
      case AppMode.CATALOG: return <Package className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 border border-transparent hover:border-slate-200"
          title={isSidebarOpen ? "Cerrar Menú" : "Abrir Menú"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-slate-800 tracking-tight flex items-center gap-2 max-w-[150px] sm:max-w-none">
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="truncate">{title}</span>
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`
          hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider
          ${mode === AppMode.EDITOR ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
            mode === AppMode.CATALOG ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
            'bg-emerald-100 text-emerald-700 border border-emerald-200'}
        `}>
          {getModeIcon()}
          <span>{mode}</span>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs group"
          title="Salir al inicio"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
