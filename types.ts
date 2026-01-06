
/**
 * ARCHIVO: types.ts
 * DESCRIPCIÓN: Contiene las interfaces y enums fundamentales para el modelo de datos
 * de piezas, máquinas, puntos de interés y estados de la aplicación.
 */

export interface Part {
  id: string;
  code: string;
  name: string;
  description: string;
  stock: number;
  location: string;
  category: string;
}

export interface Hotspot {
  id: string;
  partId: string;
  x: number; // Porcentaje 0-100
  y: number; // Porcentaje 0-100
}

export interface Machine {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

export enum AppMode {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  CATALOG = 'CATALOG'
}
