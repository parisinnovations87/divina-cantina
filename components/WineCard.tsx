import React from 'react';
import { Wine, WineType } from '../types';
import { Droplet, Calendar, MapPin, Edit2, Trash2, Plus, Minus, Percent } from 'lucide-react';

interface WineCardProps {
  wine: Wine;
  onUpdate: (id: string, updates: Partial<Wine>) => void;
  onDelete: (id: string) => void;
  onEdit: (wine: Wine) => void;
}

const getTypeColor = (type: WineType) => {
  switch (type) {
    case WineType.RED: return 'bg-red-100 text-red-800 border-red-200';
    case WineType.WHITE: return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case WineType.ROSE: return 'bg-rose-100 text-rose-800 border-rose-200';
    case WineType.SPARKLING: return 'bg-slate-100 text-slate-800 border-slate-200';
    case WineType.DESSERT: return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const WineCard: React.FC<WineCardProps> = ({ wine, onUpdate, onDelete, onEdit }) => {
  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(0, wine.quantity + delta);
    onUpdate(wine.id, { quantity: newQty });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${getTypeColor(wine.type)}`}>
            {wine.type}
          </span>
          <div className="flex gap-2 text-slate-400">
             <button 
              onClick={() => onEdit(wine)} 
              className="hover:text-amber-500 transition-colors"
              title="Modifica"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(wine.id)} 
              className="hover:text-red-500 transition-colors"
              title="Elimina"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="font-serif text-xl font-bold text-slate-800 leading-tight mb-1">{wine.name}</h3>
        <p className="text-sm font-medium text-slate-500 mb-3">{wine.producer}</p>

        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-wine-400" />
            <span>{wine.vintage}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-wine-400" />
            <span className="truncate">{wine.region}</span>
          </div>
           <div className="flex items-center gap-2">
            <Droplet size={14} className="text-wine-400" />
            <span className="truncate">{wine.grape}</span>
          </div>
          {wine.alcoholContent && (
             <div className="flex items-center gap-2">
                <Percent size={14} className="text-wine-400" />
                <span className="truncate">{wine.alcoholContent}</span>
            </div>
          )}
        </div>

        {wine.pairing && (
          <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 italic border border-slate-100 mb-4">
             🍽️ {wine.pairing}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => handleQuantityChange(-1)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
            disabled={wine.quantity === 0}
          >
            <Minus size={14} />
          </button>
          <span className={`font-bold w-4 text-center ${wine.quantity < 3 ? 'text-red-500' : 'text-slate-700'}`}>
            {wine.quantity}
          </span>
          <button 
            onClick={() => handleQuantityChange(1)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="text-right">
             <p className="text-xs text-slate-400">Prezzo</p>
             <p className="font-bold text-slate-700">€{wine.price?.toFixed(2) || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default WineCard;