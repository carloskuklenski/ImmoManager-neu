import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building, Home, Users, Euro } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { properties, units, tenants } = useAppContext();

  const totalRent = tenants.reduce((sum, t) => sum + Number(t.rent), 0);
  const totalUtilities = tenants.reduce((sum, t) => sum + Number(t.utilities), 0);
  
  const totalUnits = units.length;
  const occupiedUnits = tenants.length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const stats = [
    { label: 'Immobilien', value: properties.length, icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Wohnungen', value: totalUnits, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Mieter', value: occupiedUnits, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Mieteinnahmen (mtl.)', value: `€${totalRent.toLocaleString('de-DE')}`, icon: Euro, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Auslastung</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Vermietete Einheiten</span>
            <span className="text-sm font-medium text-slate-900">{occupiedUnits} von {totalUnits}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500 mt-2 text-right">{occupancyRate}% vermietet</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Einnahmen Übersicht</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Kaltmiete gesamt</span>
              <span className="font-semibold text-slate-900">€{totalRent.toLocaleString('de-DE')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Nebenkosten gesamt</span>
              <span className="font-semibold text-slate-900">€{totalUtilities.toLocaleString('de-DE')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-800 font-medium">Warmmiete gesamt</span>
              <span className="font-bold text-emerald-700">€{(totalRent + totalUtilities).toLocaleString('de-DE')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
