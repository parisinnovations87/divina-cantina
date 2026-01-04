import React, { useState, useMemo } from 'react';
import { useWine } from '../contexts/WineContext';
import WineCard from '../components/WineCard';
import { Search, Filter } from 'lucide-react';
import { WineType } from '../types';

const Inventory: React.FC = () => {
  const { wines, updateWine, deleteWine } = useWine();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredWines = useMemo(() => {
    return wines.filter(wine => {
      const matchesSearch = 
        wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wine.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wine.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || wine.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [wines, searchTerm, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-800">La Mia Cantina</h2>
          <p className="text-slate-500">Gestisci le tue {wines.length} bottiglie.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cerca vino, produttore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>
          
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
             <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wine-500 focus:border-transparent outline-none appearance-none bg-white w-full sm:w-48 cursor-pointer"
            >
              <option value="all">Tutte le tipologie</option>
              {Object.values(WineType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredWines.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-lg">Nessun vino trovato.</p>
          <p className="text-slate-400 text-sm">Prova a cambiare i filtri o aggiungi una nuova bottiglia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWines.map(wine => (
            <WineCard 
              key={wine.id} 
              wine={wine} 
              onUpdate={updateWine} 
              onDelete={deleteWine} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;