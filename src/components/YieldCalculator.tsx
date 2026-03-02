import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, Plus, Trash2, ChevronDown, ChevronUp, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { DocumentList } from './DocumentList';

export const YieldCalculator: React.FC = () => {
  const { calculations, addCalculation, deleteCalculation } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'buy_and_hold' | 'fix_and_flip'>('buy_and_hold');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [purchaseCostsPercentage, setPurchaseCostsPercentage] = useState<number | ''>(10);
  const [renovationCosts, setRenovationCosts] = useState<number | ''>(0);
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');
  const [maintenanceCostsYearly, setMaintenanceCostsYearly] = useState<number | ''>('');
  const [expectedSalePrice, setExpectedSalePrice] = useState<number | ''>('');
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState<number | ''>(6);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');

  const handleAddLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || purchasePrice === '' || purchaseCostsPercentage === '' || renovationCosts === '') return;

    addCalculation({
      name,
      type,
      purchasePrice: Number(purchasePrice),
      purchaseCostsPercentage: Number(purchaseCostsPercentage),
      renovationCosts: Number(renovationCosts),
      monthlyRent: type === 'buy_and_hold' ? Number(monthlyRent) : undefined,
      maintenanceCostsYearly: type === 'buy_and_hold' ? Number(maintenanceCostsYearly) : undefined,
      expectedSalePrice: type === 'fix_and_flip' ? Number(expectedSalePrice) : undefined,
      holdingPeriodMonths: type === 'fix_and_flip' ? Number(holdingPeriodMonths) : undefined,
      links
    });

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType('buy_and_hold');
    setPurchasePrice('');
    setPurchaseCostsPercentage(10);
    setRenovationCosts(0);
    setMonthlyRent('');
    setMaintenanceCostsYearly('');
    setExpectedSalePrice('');
    setHoldingPeriodMonths(6);
    setLinks([]);
    setNewLink('');
  };

  // Helper for formatting
  const formatCurrency = (value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Renditerechner</h2>
        <button 
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Neue Berechnung</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Neue Berechnung anlegen</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung (z.B. Adresse)</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Musterstraße 1" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Strategie</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={type === 'buy_and_hold'} onChange={() => setType('buy_and_hold')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span>Buy & Hold (Vermietung)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={type === 'fix_and_flip'} onChange={() => setType('fix_and_flip')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span>Fix & Flip (Verkauf)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kaufpreis (€)</label>
                <input required value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kaufnebenkosten (%)</label>
                <input required value={purchaseCostsPercentage} onChange={(e) => setPurchaseCostsPercentage(Number(e.target.value))} type="number" step="0.1" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Renovierungskosten (€)</label>
                <input required value={renovationCosts} onChange={(e) => setRenovationCosts(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {type === 'buy_and_hold' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Erwartete Kaltmiete mtl. (€)</label>
                    <input required={type === 'buy_and_hold'} value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Instandhaltungsrücklage jährl. (€)</label>
                    <input required={type === 'buy_and_hold'} value={maintenanceCostsYearly} onChange={(e) => setMaintenanceCostsYearly(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </>
              )}

              {type === 'fix_and_flip' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Erwarteter Verkaufspreis (€)</label>
                    <input required={type === 'fix_and_flip'} value={expectedSalePrice} onChange={(e) => setExpectedSalePrice(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Haltedauer (Monate)</label>
                    <input required={type === 'fix_and_flip'} value={holdingPeriodMonths} onChange={(e) => setHoldingPeriodMonths(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </>
              )}

              <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Links (z.B. Exposé, Inserat)</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    value={newLink} 
                    onChange={(e) => setNewLink(e.target.value)} 
                    type="url" 
                    placeholder="https://..." 
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                  />
                  <button type="button" onClick={handleAddLink} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">Hinzufügen</button>
                </div>
                {links.length > 0 && (
                  <ul className="space-y-1">
                    {links.map((link, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm">
                        <span className="truncate max-w-[80%] text-indigo-600">{link}</span>
                        <button type="button" onClick={() => removeLink(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">Speichern</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {calculations.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Noch keine Berechnungen angelegt.</p>
          </div>
        )}

        {calculations.map(calc => {
          const isExpanded = expandedId === calc.id;
          
          // Calculations
          const purchaseCosts = calc.purchasePrice * (calc.purchaseCostsPercentage / 100);
          const totalInvestment = calc.purchasePrice + purchaseCosts + calc.renovationCosts;

          let yieldValue = 0;
          let yieldLabel = '';
          let profit = 0;

          if (calc.type === 'buy_and_hold') {
            const annualRent = (calc.monthlyRent || 0) * 12;
            const netAnnualRent = annualRent - (calc.maintenanceCostsYearly || 0);
            yieldValue = totalInvestment > 0 ? (netAnnualRent / totalInvestment) * 100 : 0;
            yieldLabel = 'Nettomietrendite';
          } else {
            profit = (calc.expectedSalePrice || 0) - totalInvestment;
            yieldValue = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
            yieldLabel = 'ROI (Return on Investment)';
          }

          return (
            <div key={calc.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(isExpanded ? null : calc.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl hidden sm:block ${calc.type === 'buy_and_hold' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{calc.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${calc.type === 'buy_and_hold' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                        {calc.type === 'buy_and_hold' ? 'Buy & Hold' : 'Fix & Flip'}
                      </span>
                      • {new Date(calc.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{yieldLabel}</p>
                    <p className={`font-semibold text-lg ${yieldValue >= 5 ? 'text-emerald-600' : yieldValue >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                      {yieldValue.toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCalculation(calc.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Investitionskosten */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Investitionskosten</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Kaufpreis:</span>
                        <span className="font-medium">{formatCurrency(calc.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Kaufnebenkosten ({calc.purchaseCostsPercentage}%):</span>
                        <span className="font-medium">{formatCurrency(purchaseCosts)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Renovierungskosten:</span>
                        <span className="font-medium">{formatCurrency(calc.renovationCosts)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                        <span className="text-slate-800">Gesamtinvestition:</span>
                        <span className="text-slate-900">{formatCurrency(totalInvestment)}</span>
                      </div>
                    </div>

                    {/* Ertrag / Rendite */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">
                        {calc.type === 'buy_and_hold' ? 'Ertrag (Buy & Hold)' : 'Ertrag (Fix & Flip)'}
                      </h4>
                      
                      {calc.type === 'buy_and_hold' ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Kaltmiete (jährlich):</span>
                            <span className="font-medium">{formatCurrency((calc.monthlyRent || 0) * 12)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Instandhaltung (jährlich):</span>
                            <span className="font-medium text-red-600">-{formatCurrency(calc.maintenanceCostsYearly || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-800">Nettoertrag (jährlich):</span>
                            <span className="text-emerald-700">{formatCurrency(((calc.monthlyRent || 0) * 12) - (calc.maintenanceCostsYearly || 0))}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Erwarteter Verkaufspreis:</span>
                            <span className="font-medium">{formatCurrency(calc.expectedSalePrice || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Haltedauer:</span>
                            <span className="font-medium">{calc.holdingPeriodMonths} Monate</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-800">Gewinn (vor Steuern):</span>
                            <span className={profit >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                              {formatCurrency(profit)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Links & Docs */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Gespeicherte Links
                      </h4>
                      {calc.links && calc.links.length > 0 ? (
                        <ul className="space-y-2">
                          {calc.links.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate">
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{link}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Keine Links gespeichert.</p>
                      )}
                    </div>
                    
                    <div>
                      <DocumentList entityType="calculation" entityId={calc.id} />
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
