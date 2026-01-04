import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWine } from '../contexts/WineContext';
import { WineType } from '../types';
import { analyzeWineLabel, suggestWineDetails } from '../services/geminiService';
import { Camera, Sparkles, Loader2, Save, ArrowLeft } from 'lucide-react';

const AddWine: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Se presente, siamo in modalità modifica
  const { addWine, updateWine, wines } = useWine();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    producer: '',
    vintage: '',
    type: WineType.RED,
    grape: '',
    region: '',
    alcoholContent: '',
    price: '',
    quantity: '1',
    pairing: '',
    notes: ''
  });

  // Effetto per caricare i dati se siamo in modalità modifica
  useEffect(() => {
    if (id && wines.length > 0) {
      const wineToEdit = wines.find(w => w.id === id);
      if (wineToEdit) {
        setFormData({
          name: wineToEdit.name,
          producer: wineToEdit.producer,
          vintage: wineToEdit.vintage,
          type: wineToEdit.type,
          grape: wineToEdit.grape,
          region: wineToEdit.region,
          alcoholContent: wineToEdit.alcoholContent || '',
          price: wineToEdit.price ? wineToEdit.price.toString() : '',
          quantity: wineToEdit.quantity.toString(),
          pairing: wineToEdit.pairing || '',
          notes: wineToEdit.notes || ''
        });
      }
    }
  }, [id, wines]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setLoadingMessage('Analisi etichetta con AI in corso...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const result = await analyzeWineLabel(base64String);
            if (result) {
                setFormData(prev => ({
                    ...prev,
                    name: result.name || prev.name,
                    producer: result.producer || prev.producer,
                    vintage: result.vintage || prev.vintage,
                    type: result.type as WineType || prev.type,
                    grape: result.grape || prev.grape,
                    region: result.region || prev.region,
                    alcoholContent: result.alcoholContent || prev.alcoholContent,
                    pairing: result.pairing || prev.pairing,
                    notes: result.description || prev.notes
                }));
            }
        } catch (err) {
            alert('Errore durante l\'analisi AI. Controlla la console o riprova.');
        } finally {
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  const handleAutoFill = async () => {
    if (!formData.name) {
        alert("Inserisci almeno il nome del vino per usare l'autocompletamento.");
        return;
    }
    setIsAnalyzing(true);
    setLoadingMessage('Interrogazione Sommelier AI...');
    try {
        const result = await suggestWineDetails(`${formData.name} ${formData.producer}`);
        if (result) {
            setFormData(prev => ({
                ...prev,
                producer: prev.producer || result.producer || '',
                vintage: prev.vintage || result.vintage || '',
                type: (prev.type === WineType.RED && result.type) ? (result.type as WineType) : prev.type,
                grape: prev.grape || result.grape || '',
                region: prev.region || result.region || '',
                alcoholContent: prev.alcoholContent || result.alcoholContent || '',
                pairing: prev.pairing || result.pairing || ''
            }));
        }
    } catch (error) {
        console.error(error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      producer: formData.producer,
      vintage: formData.vintage,
      type: formData.type as WineType,
      grape: formData.grape,
      region: formData.region,
      alcoholContent: formData.alcoholContent,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 1,
      pairing: formData.pairing,
      notes: formData.notes,
    };

    if (id) {
        await updateWine(id, payload);
    } else {
        await addWine({ ...payload, rating: 0 });
    }
    
    navigate('/inventory');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
            <ArrowLeft size={24} />
        </button>
        <div>
           <h2 className="font-serif text-3xl font-bold text-slate-800">
             {id ? 'Modifica Bottiglia' : 'Aggiungi Bottiglia'}
           </h2>
           <p className="text-slate-500">
             {id ? 'Aggiorna i dettagli del vino.' : 'Inserisci manualmente o scansiona l\'etichetta.'}
           </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* AI Action Bar - Mostra solo se non siamo in modifica (o facoltativo) */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="flex gap-3 w-full sm:w-auto">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
             />
             <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-wine-700 text-white px-4 py-2 rounded-lg hover:bg-wine-800 transition-colors disabled:opacity-50"
             >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                Scansiona Etichetta
             </button>
             <button 
                type="button"
                onClick={handleAutoFill}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
             >
                <Sparkles size={18} />
                Auto-completa
             </button>
           </div>
           {isAnalyzing && <span className="text-sm text-wine-600 font-medium animate-pulse">{loadingMessage}</span>}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Vino *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                placeholder="Es. Tignanello"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produttore</label>
              <input
                type="text"
                name="producer"
                value={formData.producer}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                placeholder="Es. Antinori"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Annata</label>
                    <input
                        type="text"
                        name="vintage"
                        value={formData.vintage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                        placeholder="2020"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantità</label>
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipologia</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none bg-white"
              >
                {Object.values(WineType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prezzo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grado Alcolico</label>
                <input
                  type="text"
                  name="alcoholContent"
                  value={formData.alcoholContent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                  placeholder="Es. 13.5%"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Regione</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                placeholder="Es. Toscana"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Uvaggio (Grape)</label>
              <input
                type="text"
                name="grape"
                value={formData.grape}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                placeholder="Es. Sangiovese"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Abbinamenti Consigliati</label>
               <input
                type="text"
                name="pairing"
                value={formData.pairing}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none"
                placeholder="Es. Carne rossa, Formaggi stagionati"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Note Degustazione</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 outline-none resize-none"
                placeholder="Descrizione organolettica..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-wine-700 text-white rounded-lg hover:bg-wine-800 transition-colors flex items-center gap-2 shadow-md"
            >
              <Save size={18} />
              {id ? 'Aggiorna Vino' : 'Salva in Cantina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWine;