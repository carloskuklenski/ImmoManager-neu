import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, FileSpreadsheet, Trash2, Printer, ChevronDown, ChevronUp, Euro, Upload, Loader2 } from 'lucide-react';
import { UtilityCostItem } from '../types';
import Tesseract from 'tesseract.js';

export const UtilitySettlements: React.FC = () => {
  const { settlements, tenants, units, properties, addSettlement, deleteSettlement } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Form state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [advancePayments, setAdvancePayments] = useState<number>(0);
  const [totalPropertySqm, setTotalPropertySqm] = useState<number>(0);
  const [tenantUnitSqm, setTenantUnitSqm] = useState<number>(0);
  const [costItems, setCostItems] = useState<UtilityCostItem[]>([
    { id: crypto.randomUUID(), name: 'Heizung', amount: 0 },
    { id: crypto.randomUUID(), name: 'Wasser/Abwasser', amount: 0 },
    { id: crypto.randomUUID(), name: 'Müllabfuhr', amount: 0 },
    { id: crypto.randomUUID(), name: 'Grundsteuer', amount: 0 },
    { id: crypto.randomUUID(), name: 'Versicherungen', amount: 0 },
  ]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      // Default advance payments to 12 months of utilities
      setAdvancePayments(tenant.utilities * 12);
      
      const unit = units.find(u => u.id === tenant.unitId);
      if (unit) {
        setTenantUnitSqm(unit.sizeSqm);
        const propUnits = units.filter(u => u.propertyId === unit.propertyId);
        const totalSqm = propUnits.reduce((sum, u) => sum + u.sizeSqm, 0);
        setTotalPropertySqm(totalSqm);
        
        // Recalculate existing items if they have a totalAmount
        setCostItems(prev => prev.map(item => {
          if (item.totalAmount && totalSqm > 0) {
            return { ...item, amount: (item.totalAmount * unit.sizeSqm) / totalSqm };
          }
          return item;
        }));
      }
    } else {
      setTenantUnitSqm(0);
      setTotalPropertySqm(0);
    }
  };

  const handleCostItemChange = (id: string, field: 'name' | 'amount' | 'totalAmount', value: string | number) => {
    setCostItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      // Auto-calculate share if totalAmount changes
      if (field === 'totalAmount' && totalPropertySqm > 0) {
        updatedItem.amount = (Number(value) * tenantUnitSqm) / totalPropertySqm;
      }
      
      return updatedItem;
    }));
  };

  const addCostItem = () => {
    setCostItems(prev => [...prev, { id: crypto.randomUUID(), name: '', amount: 0 }]);
  };

  const removeCostItem = (id: string) => {
    setCostItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      const result = await Tesseract.recognize(
        file,
        'deu',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      
      const amountRegex = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,3}(?:,\d{3})*\.\d{2})/g;
      const amounts = text.match(amountRegex);
      
      const lowerText = text.toLowerCase();
      let detectedName = 'Unbekannte Position';
      if (lowerText.includes('heizung') || lowerText.includes('gas') || lowerText.includes('fernwärme')) detectedName = 'Heizung';
      else if (lowerText.includes('wasser') || lowerText.includes('abwasser')) detectedName = 'Wasser/Abwasser';
      else if (lowerText.includes('müll') || lowerText.includes('abfall')) detectedName = 'Müllabfuhr';
      else if (lowerText.includes('grundsteuer')) detectedName = 'Grundsteuer';
      else if (lowerText.includes('versicherung')) detectedName = 'Versicherungen';

      let detectedAmount = 0;
      if (amounts && amounts.length > 0) {
        const parsedAmounts = amounts.map(a => {
          // Handle both 1.234,56 and 1,234.56 formats
          if (a.includes(',') && a.includes('.')) {
            const lastComma = a.lastIndexOf(',');
            const lastDot = a.lastIndexOf('.');
            if (lastComma > lastDot) {
              return parseFloat(a.replace(/\./g, '').replace(',', '.'));
            } else {
              return parseFloat(a.replace(/,/g, ''));
            }
          } else if (a.includes(',')) {
            return parseFloat(a.replace(',', '.'));
          } else {
            return parseFloat(a);
          }
        });
        // Filter out unrealistic amounts and find max
        const validAmounts = parsedAmounts.filter(a => !isNaN(a) && a < 100000);
        if (validAmounts.length > 0) {
          detectedAmount = Math.max(...validAmounts);
        }
      }

      if (detectedAmount > 0) {
        setCostItems(prev => {
          const existingItemIndex = prev.findIndex(i => i.name === detectedName);
          if (existingItemIndex >= 0) {
            const newItems = [...prev];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              totalAmount: detectedAmount,
              amount: totalPropertySqm > 0 ? (detectedAmount * tenantUnitSqm) / totalPropertySqm : 0
            };
            return newItems;
          } else {
            return [...prev, {
              id: crypto.randomUUID(),
              name: detectedName,
              totalAmount: detectedAmount,
              amount: totalPropertySqm > 0 ? (detectedAmount * tenantUnitSqm) / totalPropertySqm : 0
            }];
          }
        });
        alert(`Erfolgreich erkannt: ${detectedName} mit ${detectedAmount.toLocaleString('de-DE')}€`);
      } else {
        alert('Konnte keinen Betrag sicher erkennen. Bitte manuell eintragen.');
      }

    } catch (error) {
      console.error("OCR Error:", error);
      alert("Fehler bei der Texterkennung.");
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !periodStart || !periodEnd) return;

    addSettlement({
      tenantId: selectedTenantId,
      periodStart,
      periodEnd,
      advancePayments,
      costItems: costItems.filter(item => item.name.trim() !== '' && item.amount > 0)
    });

    setIsAdding(false);
    setSelectedTenantId('');
    setPeriodStart('');
    setPeriodEnd('');
    setAdvancePayments(0);
    setCostItems([
      { id: crypto.randomUUID(), name: 'Heizung', amount: 0 },
      { id: crypto.randomUUID(), name: 'Wasser/Abwasser', amount: 0 },
      { id: crypto.randomUUID(), name: 'Müllabfuhr', amount: 0 },
      { id: crypto.randomUUID(), name: 'Grundsteuer', amount: 0 },
      { id: crypto.randomUUID(), name: 'Versicherungen', amount: 0 },
    ]);
  };

  const handlePrint = (settlementId: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    const tenant = tenants.find(t => t.id === settlement.tenantId);
    const unit = units.find(u => u.id === tenant?.unitId);
    const property = properties.find(p => p.id === unit?.propertyId);

    if (!tenant || !unit || !property) return;

    const propertyUnits = units.filter(u => u.propertyId === property.id);
    const totalPropSqm = propertyUnits.reduce((sum, u) => sum + u.sizeSqm, 0);

    const totalCosts = settlement.costItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const difference = settlement.advancePayments - totalCosts;
    const isRefund = difference >= 0;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nebenkostenabrechnung - ${tenant.firstName} ${tenant.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .address-block { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: #f8fafc; font-weight: bold; }
          .right { text-align: right; }
          .total-row { font-weight: bold; background-color: #f1f5f9; }
          .result-box { border: 2px solid ${isRefund ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 8px; margin-top: 30px; background-color: ${isRefund ? '#f0fdf4' : '#fef2f2'}; }
          .result-title { font-size: 1.2em; font-weight: bold; color: ${isRefund ? '#047857' : '#b91c1c'}; margin-bottom: 10px; }
          .footer { margin-top: 60px; font-size: 0.9em; color: #64748b; text-align: center; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>Nebenkostenabrechnung</h2>
            <p>Abrechnungszeitraum: <strong>${new Date(settlement.periodStart).toLocaleDateString('de-DE')} - ${new Date(settlement.periodEnd).toLocaleDateString('de-DE')}</strong></p>
          </div>
          <div style="text-align: right;">
            <p>Datum: ${new Date(settlement.createdAt).toLocaleDateString('de-DE')}</p>
          </div>
        </div>

        <div class="address-block">
          <strong>Mieter:</strong><br/>
          ${tenant.firstName} ${tenant.lastName}<br/>
          ${property.street}<br/>
          ${property.zipCode} ${property.city}<br/>
          Wohnung: ${unit.name} (${unit.sizeSqm} m²)
        </div>

        <p>Sehr geehrte(r) Frau/Herr ${tenant.lastName},</p>
        <p>anbei erhalten Sie die Nebenkostenabrechnung für den oben genannten Zeitraum.</p>

        <table>
          <thead>
            <tr>
              <th>Kostenart</th>
              <th class="right">Gesamtkosten</th>
              <th class="right">Verteilerschlüssel</th>
              <th class="right">Ihr Anteil (€)</th>
            </tr>
          </thead>
          <tbody>
            ${settlement.costItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="right">${item.totalAmount ? Number(item.totalAmount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '-'}</td>
                <td class="right">${item.totalAmount ? `${unit.sizeSqm} / ${totalPropSqm} m²` : '-'}</td>
                <td class="right">${Number(item.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">Summe der umzulegenden Kosten</td>
              <td class="right">${totalCosts.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td colspan="3">Abzüglich geleisteter Vorauszahlungen</td>
              <td class="right">- ${Number(settlement.advancePayments).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="result-box">
          <div class="result-title">
            ${isRefund ? 'Ihr Guthaben:' : 'Ihre Nachzahlung:'} 
            €${Math.abs(difference).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p>
            ${isRefund 
              ? 'Wir werden das Guthaben in den nächsten Tagen auf Ihr Konto überweisen.' 
              : 'Bitte überweisen Sie den Nachzahlungsbetrag innerhalb von 14 Tagen auf unser Konto.'}
          </p>
        </div>

        <p style="margin-top: 40px;">Mit freundlichen Grüßen</p>
        <p>Ihre Hausverwaltung</p>

        <div class="footer">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Jetzt Drucken / als PDF speichern
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Nebenkostenabrechnungen</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Neue Abrechnung</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Abrechnung erstellen</h3>
          {tenants.length === 0 ? (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              <p>Es gibt aktuell keine Mieter. Bitte legen Sie zuerst einen Mieter an.</p>
              <button 
                onClick={() => setIsAdding(false)} 
                className="mt-3 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors"
              >
                Schließen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mieter auswählen</label>
                  <select 
                    required 
                    value={selectedTenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Bitte wählen...</option>
                    {tenants.map(tenant => {
                      const unit = units.find(u => u.id === tenant.unitId);
                      const property = properties.find(p => p.id === unit?.propertyId);
                      return (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName} ({property?.name} - {unit?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zeitraum von</label>
                  <input 
                    required 
                    type="date" 
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zeitraum bis</label>
                  <input 
                    required 
                    type="date" 
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Geleistete Vorauszahlungen im Zeitraum (€)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    value={advancePayments}
                    onChange={(e) => setAdvancePayments(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Wird standardmäßig auf 12 Monatsabschläge gesetzt, kann aber angepasst werden.</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h4 className="font-medium text-slate-800">Kostenpositionen</h4>
                  <div className="flex flex-wrap gap-2">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Scanne ({scanProgress}%)...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Beleg scannen (OCR)
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={addCostItem}
                      className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Position hinzufügen
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-center text-xs font-medium text-slate-500 px-1 hidden sm:flex">
                    <div className="flex-1">Kostenart</div>
                    <div className="w-32">Gesamtkosten (€)</div>
                    <div className="w-32">Anteil Mieter (€)</div>
                    <div className="w-8"></div>
                  </div>
                  {costItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start">
                      <div className="flex-1 w-full">
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleCostItemChange(item.id, 'name', e.target.value)}
                          placeholder="Kostenart (z.B. Heizung)"
                          className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-full sm:w-32 flex gap-2 sm:block">
                        <span className="sm:hidden text-xs text-slate-500 self-center w-24">Gesamt:</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.totalAmount || ''}
                          onChange={(e) => handleCostItemChange(item.id, 'totalAmount', Number(e.target.value))}
                          placeholder="Gesamt (€)"
                          className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-full sm:w-32 flex gap-2 sm:block">
                        <span className="sm:hidden text-xs text-slate-500 self-center w-24">Anteil:</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.amount || ''}
                          onChange={(e) => handleCostItemChange(item.id, 'amount', Number(e.target.value))}
                          placeholder="Anteil (€)"
                          className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeCostItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {totalPropertySqm > 0 && (
                  <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Automatischer Verteilerschlüssel:</strong> Wohnfläche ({tenantUnitSqm} m² von {totalPropertySqm} m² = {((tenantUnitSqm/totalPropertySqm)*100).toFixed(2)}%). 
                    Tragen Sie die Gesamtkosten ein, der Anteil wird automatisch berechnet. Sie können den Anteil bei Bedarf manuell überschreiben.
                  </p>
                )}
                
                <div className="mt-4 p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="font-medium text-slate-700">Summe der Kosten:</span>
                  <span className="font-bold text-slate-900">
                    €{costItems.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">Abrechnung speichern</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {settlements.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Noch keine Abrechnungen erstellt.</p>
          </div>
        )}

        {[...settlements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(settlement => {
          const tenant = tenants.find(t => t.id === settlement.tenantId);
          const isExpanded = expandedId === settlement.id;
          const totalCosts = settlement.costItems.reduce((sum, item) => sum + Number(item.amount), 0);
          const difference = settlement.advancePayments - totalCosts;
          const isRefund = difference >= 0;
          
          return (
            <div key={settlement.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(isExpanded ? null : settlement.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl hidden sm:block">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unbekannter Mieter'}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      Zeitraum: {new Date(settlement.periodStart).toLocaleDateString('de-DE')} - {new Date(settlement.periodEnd).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Ergebnis</p>
                    <p className={`font-semibold ${isRefund ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isRefund ? 'Guthaben: ' : 'Nachzahlung: '}
                      €{Math.abs(difference).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrint(settlement.id); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Drucken / PDF"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSettlement(settlement.id); }}
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
                    <div>
                      <h4 className="font-medium text-slate-800 mb-4 border-b border-slate-200 pb-2">Zusammenfassung</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Summe der Kosten:</span>
                          <span className="font-medium">€{totalCosts.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Geleistete Vorauszahlungen:</span>
                          <span className="font-medium">€{Number(settlement.advancePayments).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                          <span className={isRefund ? 'text-emerald-700' : 'text-red-700'}>
                            {isRefund ? 'Guthaben Mieter:' : 'Nachzahlung Mieter:'}
                          </span>
                          <span className={isRefund ? 'text-emerald-700' : 'text-red-700'}>
                            €{Math.abs(difference).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-800 mb-4 border-b border-slate-200 pb-2">Kostenpositionen</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500 text-xs font-medium mb-1">
                          <span>Position</span>
                          <div className="flex gap-4 text-right">
                            <span className="w-20 hidden sm:block">Gesamt</span>
                            <span className="w-20">Anteil</span>
                          </div>
                        </div>
                        {settlement.costItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center border-t border-slate-100 pt-2">
                            <span className="text-slate-600">{item.name}</span>
                            <div className="flex gap-4 text-right">
                              <span className="w-20 text-slate-400 hidden sm:block">{item.totalAmount ? `€${Number(item.totalAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '-'}</span>
                              <span className="w-20 font-medium">€{Number(item.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => handlePrint(settlement.id)}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Abrechnung drucken / als PDF speichern
                    </button>
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
