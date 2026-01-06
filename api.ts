
/**
 * ARCHIVO: api.ts
 * DESCRIPCIÓN: Servicio de comunicación con el Backend. 
 * Asume que los endpoints están disponibles en el mismo dominio bajo /api/...
 */
import { Machine, Part, Hotspot } from './types';

const API_BASE = '/api';

export const api = {
  // Obtener todas las máquinas y sus puntos de interés
  async getMachines(): Promise<Machine[]> {
    const res = await fetch(`${API_BASE}/machines`);
    if (!res.ok) throw new Error('Error al cargar máquinas');
    return res.json();
  },

  // Obtener catálogo de piezas
  async getParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`);
    if (!res.ok) throw new Error('Error al cargar catálogo');
    return res.json();
  },

  // Guardar un nuevo punto de interés (Hotspot)
  async saveHotspot(machineId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const res = await fetch(`${API_BASE}/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId, ...hotspot }),
    });
    if (!res.ok) throw new Error('Error al guardar punto');
    return res.json();
  },

  // Eliminar un punto de interés
  async deleteHotspot(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/hotspots/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar punto');
  },

  // Subir nueva máquina (plano)
  async uploadMachine(machine: Omit<Machine, 'id' | 'hotspots'>): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machine),
    });
    if (!res.ok) throw new Error('Error al subir máquina');
    return res.json();
  }
};
