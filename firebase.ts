import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper per mostrare il form di configurazione
const showConfigForm = () => {
  if (typeof window === 'undefined') return;
  
  const existingForm = document.getElementById('firebase-config-form');
  if (existingForm) return;

  const overlay = document.createElement('div');
  overlay.id = 'firebase-config-form';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95); z-index: 10000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 20px; font-family: 'Lato', sans-serif; color: white;
  `;

  overlay.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; width: 100%; color: #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <h2 style="font-family: 'Playfair Display', serif; font-size: 1.875rem; font-weight: 700; color: #711e1e; margin-bottom: 1rem; text-align: center;">Configurazione Mancante</h2>
      <p style="margin-bottom: 1.5rem; color: #64748b; font-size: 0.875rem; text-align: center;">
        Le chiavi Firebase non sono state trovate nel file .env. <br/>
        Incolla qui sotto l'oggetto di configurazione JSON che trovi nella Console Firebase (Project Settings > General).
      </p>
      
      <textarea id="config-input" placeholder='{ "apiKey": "...", "authDomain": "..." }' 
        style="width: 100%; height: 150px; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875rem;"></textarea>
      
      <div style="display: flex; gap: 1rem;">
        <button id="save-config-btn" style="flex: 1; background-color: #711e1e; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;">
          Salva e Avvia
        </button>
      </div>
      <p id="config-error" style="color: #ef4444; font-size: 0.75rem; margin-top: 0.5rem; display: none;"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('save-config-btn')?.addEventListener('click', () => {
    const input = (document.getElementById('config-input') as HTMLTextAreaElement).value;
    const errorMsg = document.getElementById('config-error');
    
    try {
      // Pulizia base dell'input (rimuove const firebaseConfig = ... se presente)
      const cleanInput = input.replace(/const\s+\w+\s*=\s*/, '').replace(/;$/, '');
      const config = JSON.parse(cleanInput);
      
      if (!config.apiKey || !config.projectId) throw new Error("Configurazione non valida");
      
      localStorage.setItem('firebase_manual_config', JSON.stringify(config));
      window.location.reload();
    } catch (e) {
      if (errorMsg) {
        errorMsg.textContent = "Errore: Assicurati di incollare un oggetto JSON valido.";
        errorMsg.style.display = 'block';
      }
    }
  });
};

// Funzione per ottenere la configurazione
const getFirebaseConfig = () => {
  // 1. Prova da variabili d'ambiente (Standard)
  // Uso una strategia difensiva per evitare crash se import.meta.env non è definito
  let env: any = {};
  try {
    // Accesso sicuro a import.meta.env
    env = import.meta.env || {};
  } catch (e) {
    console.warn("Environment variables not accessible");
  }

  const envConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };

  // Verifica se le variabili d'ambiente sono valorizzate (e non vuote/placeholder)
  if (envConfig.apiKey && envConfig.apiKey.length > 5) {
    return envConfig;
  }

  // 2. Prova da LocalStorage (Fallback Manuale)
  try {
    const local = localStorage.getItem('firebase_manual_config');
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error("Errore lettura config locale", e);
  }

  return null;
};

let app;
let auth: any;
let googleProvider: any;
let db: any;

const config = getFirebaseConfig();

if (config) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } catch (error) {
    console.error("Errore inizializzazione Firebase:", error);
    // Se la config salvata è corrotta, la rimuoviamo per permettere il reset
    localStorage.removeItem('firebase_manual_config');
    showConfigForm();
  }
} else {
  // Nessuna configurazione trovata -> Mostra UI
  showConfigForm();
}

export { auth, googleProvider, db };