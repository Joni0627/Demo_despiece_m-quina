
import React from 'react';
import { Part } from '../types';
import { FileDown, PackagePlus, Search, Filter } from 'lucide-react';

interface Props {
  parts: Part[];
  onImport: (parts: Part[]) => void;
}

const CatalogView: React.FC<Props> = ({ parts, onImport }) => {
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newParts: Part[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const [code, name, category, stock, location, description] = line.split(',');
        return {
          id: `imp-${Date.now()}-${index}`,
          code: code?.trim() || 'N/A',
          name: name?.trim() || 'Sin nombre',
          category: category?.trim() || 'General',
          stock: parseInt(stock?.trim()) || 0,
          location: location?.trim() || 'Almacén',
          description: description?.trim() || '-'
        };
      });
      onImport(newParts);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
            <PackagePlus className="w-4 h-4" />
            Importar Listado
            <input type="file" className="hidden" accept=".csv,.txt" onChange={handleImportCSV} />
          </label>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material / Descripción</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {part.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{part.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">{part.category}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${part.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                    {part.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    {part.location}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 text-center shrink-0">
        Total de materiales registrados: <span className="font-bold text-slate-600">{parts.length}</span>
      </div>
    </div>
  );
};

export default CatalogView;
