
/**
 * ARCHIVO: api.ts
 * DESCRIPCIÓN: Motor de Base de Datos conectado a Firebase Cloud.
 */
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  setDoc,
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

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAtHMhw4ecCZy5MMWHn32wKxdm1B6TUqIU",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demodespiecemaquina.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demodespiecemaquina",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demodespiecemaquina.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "618607332118",
  appId: process.env.FIREBASE_APP_ID || "1:618607332118:web:ee3eeae543a0a170061e37"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const COLL_MACHINES = "machines";
const COLL_PARTS = "parts";

const seedCloudDatabase = async () => {
  try {
    const partsSnap = await getDocs(collection(db, COLL_PARTS));
    if (partsSnap.empty) {
      for (const p of INITIAL_PARTS) {
        await setDoc(doc(db, COLL_PARTS, p.id), p);
      }
    }
    const machinesSnap = await getDocs(collection(db, COLL_MACHINES));
    if (machinesSnap.empty) {
      for (const m of INITIAL_MACHINES) {
        await setDoc(doc(db, COLL_MACHINES, m.id), m);
      }
    }
  } catch (e) {
    console.error("Error en el seeding:", e);
  }
};

seedCloudDatabase();

export const api = {
  async getMachines(): Promise<Machine[]> {
    const querySnapshot = await getDocs(collection(db, COLL_MACHINES));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Machine));
  },

  async getParts(): Promise<Part[]> {
    const querySnapshot = await getDocs(collection(db, COLL_PARTS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Part));
  },

  async savePart(part: Omit<Part, 'id'>): Promise<Part> {
    const id = `p-${Date.now()}`;
    const newPart = { ...part, id };
    await setDoc(doc(db, COLL_PARTS, id), newPart);
    return newPart;
  },

  async saveHotspot(machineId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const machineDocRef = doc(db, COLL_MACHINES, machineId);
    const machineSnap = await getDoc(machineDocRef);
    if (!machineSnap.exists()) throw new Error("Máquina no encontrada.");
    const currentData = machineSnap.data() as Machine;
    const newHotspot = { ...hotspot, id: `h-${Date.now()}` };
    await updateDoc(machineDocRef, { hotspots: [...(currentData.hotspots || []), newHotspot] });
    return newHotspot;
  },

  async deleteHotspot(id: string): Promise<void> {
    const machines = await this.getMachines();
    const machine = machines.find(m => m.hotspots.some(h => h.id === id));
    if (machine) {
      await updateDoc(doc(db, COLL_MACHINES, machine.id), {
        hotspots: machine.hotspots.filter(h => h.id !== id)
      });
    }
  },

  async uploadMachine(machine: Omit<Machine, 'id' | 'hotspots'>): Promise<Machine> {
    const machineId = `m-${Date.now()}`;
    let finalImageUrl = machine.imageUrl;
    if (machine.imageUrl.startsWith('data:')) {
      const storageRef = ref(storage, `blueprints/${machineId}.png`);
      const uploadResult = await uploadString(storageRef, machine.imageUrl, 'data_url');
      finalImageUrl = await getDownloadURL(uploadResult.ref);
    }
    const newMachine = { id: machineId, name: machine.name, imageUrl: finalImageUrl, hotspots: [] };
    await setDoc(doc(db, COLL_MACHINES, machineId), newMachine);
    return newMachine;
  },

  async deleteMachine(id: string): Promise<void> {
    const machineDocRef = doc(db, COLL_MACHINES, id);
    const machineSnap = await getDoc(machineDocRef);
    if (machineSnap.exists()) {
      const data = machineSnap.data() as Machine;
      if (data.imageUrl.includes('firebasestorage')) {
        try { await deleteObject(ref(storage, data.imageUrl)); } catch(e) {}
      }
      await deleteDoc(machineDocRef);
    }
  }
};
