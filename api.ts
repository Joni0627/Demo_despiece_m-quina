
/**
 * ARCHIVO: api.ts
 * DESCRIPCIÓN: Cliente API con diagnóstico avanzado para errores 404 (rutas no encontradas).
 */
import { Machine, Part, Hotspot } from './types';

const API_BASE = '/api';

async function handleResponse(res: Response, endpoint: string) {
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Ruta no encontrada (404). Asegúrate de que el archivo 'api/${endpoint}' existe en tu servidor y acepta peticiones.`);
    }
    
    let errorMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  async getMachines(): Promise<Machine[]> {
    const res = await fetch(`${API_BASE}/machines`);
    return handleResponse(res, 'machines');
  },

  async getParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`);
    return handleResponse(res, 'parts');
  },

  async saveHotspot(machineId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const res = await fetch(`${API_BASE}/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId, ...hotspot }),
    });
    return handleResponse(res, 'hotspots');
  },

  async deleteHotspot(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/hotspots/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('No se pudo eliminar el punto en la DB');
  },

  async uploadMachine(machine: Omit<Machine, 'id' | 'hotspots'>): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machine),
    });
    return handleResponse(res, 'machines');
  }
};
