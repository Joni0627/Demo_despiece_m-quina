
/**
 * ARCHIVO: api.ts
 * DESCRIPCIÓN: Servicio de comunicación con el Backend. 
 * Incluye reporte detallado de errores para depuración de base de datos.
 */
import { Machine, Part, Hotspot } from './types';

const API_BASE = '/api';

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Si no es JSON, mantenemos el mensaje de texto
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  async getMachines(): Promise<Machine[]> {
    const res = await fetch(`${API_BASE}/machines`);
    return handleResponse(res);
  },

  async getParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`);
    return handleResponse(res);
  },

  async saveHotspot(machineId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const res = await fetch(`${API_BASE}/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId, ...hotspot }),
    });
    return handleResponse(res);
  },

  async deleteHotspot(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/hotspots/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('No se pudo eliminar el punto');
  },

  async uploadMachine(machine: Omit<Machine, 'id' | 'hotspots'>): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machine),
    });
    return handleResponse(res);
  }
};
