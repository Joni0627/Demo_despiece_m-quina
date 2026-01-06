
import { Machine, Part } from './types';

export const INITIAL_PARTS: Part[] = [
  {
    id: 'p1',
    code: 'ENG-001',
    name: 'Engranaje Principal A1',
    description: 'Engranaje de acero endurecido para transmisión de alta potencia.',
    stock: 12,
    location: 'Pasillo A, Estante 4',
    category: 'Transmisión'
  },
  {
    id: 'p2',
    code: 'BRG-442',
    name: 'Rodamiento de Bolas 6205',
    description: 'Rodamiento sellado de alta velocidad para ejes rotatorios.',
    stock: 45,
    location: 'Caja B2, Cajón 1',
    category: 'Rodamientos'
  },
  {
    id: 'p3',
    code: 'MTR-500',
    name: 'Servomotor Trifásico',
    description: 'Motor de 5kW con encoder integrado para posicionamiento preciso.',
    stock: 3,
    location: 'Zona C, Almacén Especial',
    category: 'Eléctrico'
  },
  {
    id: 'p4',
    code: 'HYD-09',
    name: 'Válvula de Alivio Hidráulica',
    description: 'Controla la presión máxima del sistema de lubricación central.',
    stock: 8,
    location: 'Estante Hidráulica 1',
    category: 'Hidráulica'
  },
  {
    id: 'p5',
    code: 'SCR-M8-20',
    name: 'Tornillo Allen M8x20',
    description: 'Tornillo de cabeza cilíndrica grado 8.8.',
    stock: 1500,
    location: 'Ferretería General',
    category: 'Fijación'
  }
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm1',
    name: 'Prensa Hidráulica PH-500',
    imageUrl: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200',
    hotspots: [
      { id: 'h1', partId: 'p1', x: 35, y: 42 },
      { id: 'h2', partId: 'p2', x: 60, y: 25 },
      { id: 'h3', partId: 'p4', x: 20, y: 70 }
    ]
  },
  {
    id: 'm2',
    name: 'Torno CNC Mazak QTN',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
    hotspots: [
      { id: 'h4', partId: 'p3', x: 75, y: 55 },
      { id: 'h5', partId: 'p2', x: 45, y: 30 }
    ]
  }
];
