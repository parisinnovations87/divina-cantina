import React from 'react';
import { useWine } from '../contexts/WineContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CircleDollarSign, Wine as WineIcon, TrendingUp } from 'lucide-react';
import { WineType } from '../types';

const Dashboard: React.FC = () => {
  const { getStats } = useWine();
  const { totalBottles, totalValue, typeDistribution } = getStats();

  const pieData = Object.entries(typeDistribution)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = {
    [WineType.RED]: '#711e1e', // wine-900
    [WineType.WHITE]: '#eab308', // yellow-500
    [WineType.ROSE]: '#f43f5e', // rose-500
    [WineType.SPARKLING]: '#94a3b8', // slate-400
    [WineType.DESSERT]: '#d97706', // amber-600
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl font-bold text-slate-800">Panoramica Cantina</h2>
        <p className="text-slate-500">Stato attuale della tua collezione.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-wine-50 text-wine-600 rounded-full">
            <WineIcon size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Totale Bottiglie</p>
            <p className="text-3xl font-bold text-slate-800">{totalBottles}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
            <CircleDollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Valore Stimato</p>
            <p className="text-3xl font-bold text-slate-800">€ {totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Prezzo Medio</p>
            <p className="text-3xl font-bold text-slate-800">
              € {totalBottles > 0 ? (totalValue / totalBottles).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="font-serif text-lg font-bold text-slate-800 mb-4">Distribuzione per Tipologia</h3>
          {totalBottles > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as WineType] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Nessun dato disponibile</div>
          )}
        </div>

        {/* Legend / Stats Detail */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96 overflow-y-auto">
          <h3 className="font-serif text-lg font-bold text-slate-800 mb-4">Dettaglio Inventario</h3>
          <div className="space-y-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[item.name as WineType] || '#cbd5e1' }}
                  />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-slate-500 text-sm">{Math.round((item.value / totalBottles) * 100)}%</span>
                   <span className="font-bold text-slate-800">{item.value} bott.</span>
                </div>
              </div>
            ))}
            {pieData.length === 0 && <p className="text-center text-slate-400 mt-10">Aggiungi vini per vedere le statistiche.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;