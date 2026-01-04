import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wine, WineType } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface WineContextType {
  wines: Wine[];
  addWine: (wine: Omit<Wine, 'id' | 'dateAdded' | 'userId'>) => Promise<void>;
  updateWine: (id: string, updates: Partial<Wine>) => Promise<void>;
  deleteWine: (id: string) => Promise<void>;
  getStats: () => { totalBottles: number; totalValue: number; typeDistribution: Record<string, number> };
  isLoading: boolean;
}

const WineContext = createContext<WineContextType | undefined>(undefined);

export const WineProvider = ({ children }: { children: ReactNode }) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Se DB o User mancano, resetta e ferma il loading
    if (!db || !user) {
      setWines([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, "wines"),
      where("userId", "==", user.uid),
      orderBy("dateAdded", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const winesData: Wine[] = [];
      querySnapshot.forEach((doc) => {
        winesData.push({ id: doc.id, ...doc.data() } as Wine);
      });
      setWines(winesData);
      setIsLoading(false);
    }, (error) => {
        console.error("Errore recupero vini:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addWine = async (wineData: Omit<Wine, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user || !db) return;
    
    try {
      await addDoc(collection(db, "wines"), {
        ...wineData,
        userId: user.uid,
        dateAdded: new Date().toISOString()
      });
    } catch (e) {
      console.error("Errore aggiunta vino: ", e);
    }
  };

  const updateWine = async (id: string, updates: Partial<Wine>) => {
    if (!user || !db) return;
    try {
      const wineRef = doc(db, "wines", id);
      await updateDoc(wineRef, updates);
    } catch (e) {
      console.error("Errore aggiornamento vino: ", e);
    }
  };

  const deleteWine = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, "wines", id));
    } catch (e) {
      console.error("Errore cancellazione vino: ", e);
    }
  };

  const getStats = () => {
    const totalBottles = wines.reduce((acc, w) => acc + w.quantity, 0);
    const totalValue = wines.reduce((acc, w) => acc + (w.quantity * (w.price || 0)), 0);
    const typeDistribution: Record<string, number> = {};
    
    Object.values(WineType).forEach(t => typeDistribution[t] = 0);
    
    wines.forEach(w => {
      if (typeDistribution[w.type] !== undefined) {
        typeDistribution[w.type] += w.quantity;
      }
    });

    return { totalBottles, totalValue, typeDistribution };
  };

  return (
    <WineContext.Provider value={{ wines, addWine, updateWine, deleteWine, getStats, isLoading }}>
      {children}
    </WineContext.Provider>
  );
};

export const useWine = () => {
  const context = useContext(WineContext);
  if (!context) throw new Error('useWine must be used within a WineProvider');
  return context;
};