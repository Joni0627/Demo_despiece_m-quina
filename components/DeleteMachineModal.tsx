
/**
 * ARCHIVO: components/DeleteMachineModal.tsx
 * DESCRIPCIÓN: Modal de seguridad para confirmación de borrado de activos.
 */
import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface Props {
  machineName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteMachineModal: React.FC<Props> = ({ machineName, onConfirm, onCancel }) => {
  const [sequence, setSequence] = useState('');
  const CORRECT_SEQUENCE = '1234';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Confirmación de Seguridad</h3>
            <p className="text-xs text-red-600 font-medium">Acción irreversible de borrado</p>
          </div>
          <button onClick={onCancel} className="ml-auto p-2 hover:bg-red-100 rounded-full text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Está a punto de eliminar el plano <span className="font-bold text-slate-900 underline">"{machineName}"</span> y todos sus puntos de interés asociados. 
            <br/><br/>
            Por favor, introduzca la secuencia de seguridad <span className="font-mono font-bold bg-slate-100 px-1.5 rounded">1234</span> para confirmar la operación:
          </p>

          <div className="relative mb-8">
            <input 
              type="password"
              maxLength={4}
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-red-500 focus:ring-0 outline-none transition-all font-mono"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
               <ShieldAlert className={`w-6 h-6 transition-colors ${sequence === CORRECT_SEQUENCE ? 'text-green-500' : 'text-slate-300'}`} />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button 
              disabled={sequence !== CORRECT_SEQUENCE}
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-30 disabled:grayscale transition-all text-sm shadow-lg shadow-red-100"
            >
              Eliminar Plano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMachineModal;
