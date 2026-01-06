
/**
 * ARCHIVO: api.ts
 * DESCRIPCIÓN: Motor de Base de Datos conectado a Firebase Cloud.
 * Gestiona persistencia en Firestore y almacenamiento de imágenes en Firebase Storage
 * utilizando variables de entorno para mayor seguridad.
 */
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  setDoc,
  query,
  where,
  getDoc
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { Machine, Part, Hotspot } from './types';
import { INITIAL_MACHINES, INITIAL_PARTS } from './data';

// Configuración de Firebase obtenida de variables de entorno
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAtHMhw4ecCZy5MMWHn32wKxdm1B6TUqIU",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demodespiecemaquina.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demodespiecemaquina",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demodespiecemaquina.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "618607332118",
  appId: process.env.FIREBASE_APP_ID || "1:618607332118:web:ee3eeae543a0a170061e37"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Nombres de colecciones
const COLL_MACHINES = "machines";
const COLL_PARTS = "parts";

/**
 * Función de sembrado inicial (Seeding)
 * Si las colecciones están vacías en Firebase, las puebla con datos de ejemplo.
 */
const seedCloudDatabase = async () => {
  try {
    const partsSnap = await getDocs(collection(db, COLL_PARTS));
    if (partsSnap.empty) {
      console.log("Poblando catálogo de partes en la nube...");
      for (const p of INITIAL_PARTS) {
        await setDoc(doc(db, COLL_PARTS, p.id), p);
      }
    }

    const machinesSnap = await getDocs(collection(db, COLL_MACHINES));
    if (machinesSnap.empty) {
      console.log("Poblando lista de máquinas en la nube...");
      for (const m of INITIAL_MACHINES) {
        await setDoc(doc(db, COLL_MACHINES, m.id), m);
      }
    }
  } catch (e) {
    console.error("Error en el seeding inicial:", e);
  }
};

// Ejecutamos el seeding
seedCloudDatabase();

export const api = {
  /**
   * Obtiene todas las máquinas desde Firestore
   */
  async getMachines(): Promise<Machine[]> {
    const querySnapshot = await getDocs(collection(db, COLL_MACHINES));
    return querySnapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as Machine));
  },

  /**
   * Obtiene todo el catálogo de partes desde Firestore
   */
  async getParts(): Promise<Part[]> {
    const querySnapshot = await getDocs(collection(db, COLL_PARTS));
    return querySnapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as Part));
  },

  /**
   * Guarda un nuevo punto de interés en una máquina específica
   */
  async saveHotspot(machineId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const machineDocRef = doc(db, COLL_MACHINES, machineId);
    const machineSnap = await getDoc(machineDocRef);
    
    if (!machineSnap.exists()) throw new Error("La máquina no existe en la nube.");

    const currentData = machineSnap.data() as Machine;
    const newHotspot: Hotspot = {
      ...hotspot,
      id: `h-${Date.now()}`
    };

    const updatedHotspots = [...(currentData.hotspots || []), newHotspot];
    
    await updateDoc(machineDocRef, {
      hotspots: updatedHotspots
    });

    return newHotspot;
  },

  /**
   * Elimina un punto de interés
   */
  async deleteHotspot(id: string): Promise<void> {
    const machines = await this.getMachines();
    const machine = machines.find(m => m.hotspots.some(h => h.id === id));
    
    if (machine) {
      const machineDocRef = doc(db, COLL_MACHINES, machine.id);
      const filteredHotspots = machine.hotspots.filter(h => h.id !== id);
      await updateDoc(machineDocRef, {
        hotspots: filteredHotspots
      });
    }
  },

  /**
   * Sube una imagen a Firebase Storage y guarda los metadatos en Firestore
   */
  async uploadMachine(machine: Omit<Machine, 'id' | 'hotspots'>): Promise<Machine> {
    const machineId = `m-${Date.now()}`;
    let finalImageUrl = machine.imageUrl;

    if (machine.imageUrl.startsWith('data:')) {
      const storagePath = `blueprints/${machineId}_${Date.now()}.png`;
      const storageRef = ref(storage, storagePath);
      
      const uploadResult = await uploadString(storageRef, machine.imageUrl, 'data_url');
      finalImageUrl = await getDownloadURL(uploadResult.ref);
    }

    const newMachine: Machine = {
      id: machineId,
      name: machine.name,
      imageUrl: finalImageUrl,
      hotspots: []
    };

    await setDoc(doc(db, COLL_MACHINES, machineId), newMachine);
    return newMachine;
  },

  /**
   * Elimina la máquina de Firestore y su imagen de Storage
   */
  async deleteMachine(id: string): Promise<void> {
    const machineDocRef = doc(db, COLL_MACHINES, id);
    const machineSnap = await getDoc(machineDocRef);
    
    if (machineSnap.exists()) {
      const data = machineSnap.data() as Machine;
      if (data.imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const imageRef = ref(storage, data.imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.warn("No se pudo borrar el archivo de imagen.");
        }
      }
      await deleteDoc(machineDocRef);
    }
  }
};
