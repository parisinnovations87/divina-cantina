export enum WineType {
  RED = 'Rosso',
  WHITE = 'Bianco',
  ROSE = 'Rosato',
  SPARKLING = 'Bollicine',
  DESSERT = 'Dolce/Passito'
}

export interface Wine {
  id: string;
  userId: string; // Collegamento all'utente
  name: string;
  producer: string;
  vintage: string;
  type: WineType;
  grape: string;
  region: string;
  alcoholContent?: string;
  price?: number;
  quantity: number;
  rating?: number; // 1-5
  notes?: string;
  pairing?: string;
  imageUrl?: string;
  dateAdded: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  picture?: string;
  isAuthenticated: boolean;
}

export interface AIAnalysisResult {
  name: string;
  producer: string;
  vintage: string;
  type: WineType;
  grape: string;
  region: string;
  pairing: string;
  description: string;
}