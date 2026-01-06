
import React, { useState } from 'react';
import { Part } from '../types';
import { FileDown, PackagePlus, Search, Plus, X } from 'lucide-react';
import { api } from '../api';

interface Props {
  parts: Part[];
  onImport: (parts: Part[]) => void;
  onRefresh: () => void;
}

const CatalogView: React.FC<Props> = ({ parts, onImport, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPart, setNewPart] = useState({ code: '', name: '', description: '', stock: 0, location: '', category: 'General' });
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!newPart.code || !newPart.name) return;
    setIsSaving(true);
    try {
      await api.savePart(newPart);
      onRefresh();
      setShowCreateModal(false);
      setNewPart({ code: '', name: '', description: '', stock: 0, location: '', category: 'General' });
    } catch (e) {
      alert("Error al crear material");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar material..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" /> Nuevo Material
          </button>
          <label className="cursor-pointer bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 border border-slate-200">
            <PackagePlus className="w-4 h-4" /> Importar CSV
            <input type="file" className="hidden" accept=".csv" onChange={(e) => {/* Lógica existente */}} />
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ubicación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{part.code}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{part.description}</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">{part.category}</td>
                <td className="px-6 py-4 text-center font-bold text-sm">{part.stock}</td>
                <td className="px-6 py-4 text-right text-xs font-semibold text-slate-500">{part.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Crear Nuevo Material</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Código Interno</label>
                <input type="text" value={newPart.code} onChange={e => setNewPart({...newPart, code: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="MTR-001" />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Categoría</label>
                <input type="text" value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Motores" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nombre del Material</label>
                <input type="text" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Bomba Hidráulica Axial" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Descripción</label>
                <textarea value={newPart.description} onChange={e => setNewPart({...newPart, description: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-20" placeholder="Detalles técnicos..." />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Stock Inicial</label>
                <input type="number" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ubicación</label>
                <input type="text" value={newPart.location} onChange={e => setNewPart({...newPart, location: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Pasillo 4, B1" />
              </div>
            </div>
            <button onClick={handleCreate} disabled={isSaving || !newPart.code} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
              {isSaving ? 'Guardando...' : 'Crear Material'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
