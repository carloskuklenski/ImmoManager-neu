import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { RentIncrease, Tenant } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const RentIncreases: React.FC = () => {
  const { tenants, properties, units, rentIncreases, addRentIncrease, updateRentIncrease, deleteRentIncrease, updateTenant } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [reason, setReason] = useState<RentIncrease['reason']>('mietspiegel');
  const [newRent, setNewRent] = useState<number>(0);
  const [capPercentage, setCapPercentage] = useState<number>(15);
  const [justificationText, setJustificationText] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>('');

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const selectedUnit = units.find(u => u.id === selectedTenant?.unitId);
  const selectedProperty = properties.find(p => p.id === selectedUnit?.propertyId);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !selectedUnit) return;

    // Basic calculation logic based on inputs
    // In a real app, this would be more complex and check §558 BGB specifically
    const currentRent = selectedTenant.rent;
    const maxIncrease = currentRent * (1 + capPercentage / 100);
    
    // Ensure new rent doesn't exceed cap
    const calculatedRent = Math.min(newRent, maxIncrease);
    setNewRent(calculatedRent);
  };

  const handleSave = () => {
    if (!selectedTenant) return;

    const increase: Omit<RentIncrease, 'id' | 'createdAt'> = {
      tenantId: selectedTenant.id,
      date: new Date().toISOString().split('T')[0],
      effectiveDate,
      oldRent: selectedTenant.rent,
      newRent,
      reason,
      capPercentage,
      justificationText,
      status: 'draft'
    };

    addRentIncrease(increase);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTenantId('');
    setReason('mietspiegel');
    setNewRent(0);
    setCapPercentage(15);
    setJustificationText('');
    setEffectiveDate('');
  };

  const applyIncrease = (increase: RentIncrease) => {
    if (confirm(`Möchten Sie die Miete für diesen Mieter wirklich auf €${increase.newRent} anpassen?`)) {
      updateTenant(increase.tenantId, { rent: increase.newRent });
      updateRentIncrease(increase.id, { status: 'accepted' });
    }
  };

  const generatePDF = (increase: RentIncrease) => {
    const tenant = tenants.find(t => t.id === increase.tenantId);
    const unit = units.find(u => u.id === tenant?.unitId);
    const property = properties.find(p => p.id === unit?.propertyId);

    if (!tenant || !unit || !property) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Mieterhöhungsverlangen', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 30);
    
    // Addresses
    doc.text('Vermieter:', 20, 45);
    doc.text('Max Musterviemieter', 20, 52); // Placeholder
    
    doc.text('Mieter:', 120, 45);
    doc.text(`${tenant.firstName} ${tenant.lastName}`, 120, 52);
    doc.text(`${property.street}`, 120, 59);
    doc.text(`${property.zipCode} ${property.city}`, 120, 66);

    // Subject
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Zustimmung zur Mieterhöhung für die Wohnung: ${unit.name}`, 20, 85);
    
    // Body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const bodyText = `Sehr geehrte(r) Frau/Herr ${tenant.lastName},

hiermit bitte ich Sie um Zustimmung zu einer Erhöhung der monatlichen Kaltmiete für die oben genannte Wohnung.

Bisherige Kaltmiete: €${increase.oldRent.toFixed(2)}
Neue Kaltmiete: €${increase.newRent.toFixed(2)}
Wirksam ab: ${new Date(increase.effectiveDate).toLocaleDateString('de-DE')}

Begründung (${increase.reason}):
${increase.justificationText}

Die Erhöhung entspricht den gesetzlichen Vorgaben und überschreitet nicht die geltende Kappungsgrenze von ${increase.capPercentage}%.

Bitte senden Sie mir die beigefügte Zustimmungserklärung bis zum [Datum in 2 Monaten] unterschrieben zurück.

Mit freundlichen Grüßen,
[Unterschrift Vermieter]`;

    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, 100);

    // Signature Area
    doc.line(20, 250, 80, 250);
    doc.text('Ort, Datum', 20, 255);
    
    doc.line(110, 250, 180, 250);
    doc.text('Unterschrift Mieter', 110, 255);

    doc.save(`Mieterhoehung_${tenant.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Mieterhöhungen</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Neue Mieterhöhung</span>
        </button>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>Rechtlicher Hinweis:</strong> Die hier durchgeführten Berechnungen und generierten Dokumente dienen lediglich als Hilfestellung. Bitte prüfen Sie alle Mieterhöhungsverlangen vor Versand rechtlich (z.B. durch einen Anwalt oder Haus- und Grundbesitzerverein), insbesondere hinsichtlich der Einhaltung der Kappungsgrenze nach §558 BGB und der ortsüblichen Vergleichsmiete.
        </p>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Mieterhöhung berechnen</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mieter auswählen</label>
              <select 
                value={selectedTenantId} 
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  const t = tenants.find(t => t.id === e.target.value);
                  if (t) setNewRent(t.rent);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Bitte wählen...</option>
                {tenants.map(t => {
                  const u = units.find(u => u.id === t.unitId);
                  const p = properties.find(p => p.id === u?.propertyId);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({p?.name} - {u?.name}) - Aktuell: €{t.rent}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedTenant && selectedUnit && (
              <form onSubmit={handleCalculate} className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sachgrund</label>
                    <select 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="mietspiegel">Anpassung an Mietspiegel</option>
                      <option value="index">Indexmiete (VPI)</option>
                      <option value="modernisierung">Modernisierungsumlage</option>
                      <option value="energieeffizienz">Energieeffizienz</option>
                      <option value="sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kappungsgrenze (%)</label>
                    <select 
                      value={capPercentage} 
                      onChange={(e) => setCapPercentage(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value={15}>15% (Angespannter Wohnungsmarkt)</option>
                      <option value={20}>20% (Normaler Wohnungsmarkt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ziel-Miete (Kalt, €)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newRent}
                      onChange={(e) => setNewRent(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                    <p className="text-xs text-slate-500 mt-1">Aktuell: €{selectedTenant.rent} ({ (selectedTenant.rent / selectedUnit.sizeSqm).toFixed(2) } €/m²)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Wirksam ab</label>
                    <input 
                      type="date" 
                      required
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Begründungstext (für Anschreiben)</label>
                    <textarea 
                      required
                      value={justificationText}
                      onChange={(e) => setJustificationText(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="Gemäß dem aktuellen Mietspiegel der Stadt..."
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">Berechnungsvorschau</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Bisherige Miete:</p>
                      <p className="font-medium">€{selectedTenant.rent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Max. Erhöhung ({capPercentage}%):</p>
                      <p className="font-medium">€{(selectedTenant.rent * (1 + capPercentage / 100)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Neue Ziel-Miete:</p>
                      <p className={`font-medium ${newRent > selectedTenant.rent * (1 + capPercentage / 100) ? 'text-red-600' : 'text-emerald-600'}`}>
                        €{newRent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Erhöhung um:</p>
                      <p className="font-medium">€{(newRent - selectedTenant.rent).toFixed(2)} ({((newRent / selectedTenant.rent - 1) * 100).toFixed(1)}%)</p>
                    </div>
                  </div>
                  {newRent > selectedTenant.rent * (1 + capPercentage / 100) && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Achtung: Die Ziel-Miete überschreitet die Kappungsgrenze!
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
                  <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">Speichern & Dokument erstellen</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rentIncreases.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Noch keine Mieterhöhungen erfasst.</p>
          </div>
        )}

        {rentIncreases.map(increase => {
          const tenant = tenants.find(t => t.id === increase.tenantId);
          const isExpanded = expandedId === increase.id;
          
          return (
            <div key={increase.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(isExpanded ? null : increase.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hidden sm:block">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unbekannter Mieter'}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <span>Erstellt am {new Date(increase.createdAt).toLocaleDateString('de-DE')}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        increase.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                        increase.status === 'sent' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {increase.status === 'accepted' ? 'Akzeptiert' : increase.status === 'sent' ? 'Gesendet' : 'Entwurf'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Neue Miete</p>
                    <p className="font-semibold text-slate-900">€{increase.newRent.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteRentIncrease(increase.id); }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Alte Miete</p>
                          <p className="font-medium text-slate-900">€{increase.oldRent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Erhöhung</p>
                          <p className="font-medium text-slate-900">+ €{(increase.newRent - increase.oldRent).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Wirksam ab</p>
                          <p className="font-medium text-slate-900">{new Date(increase.effectiveDate).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Grund</p>
                          <p className="font-medium text-slate-900 capitalize">{increase.reason}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm mb-1">Begründung</p>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">{increase.justificationText}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Aktionen</h4>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => generatePDF(increase)}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Download className="w-4 h-4" /> PDF generieren / drucken
                        </button>
                        
                        {increase.status !== 'accepted' && (
                          <button 
                            onClick={() => applyIncrease(increase)}
                            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" /> Miete im System anpassen (Akzeptiert)
                          </button>
                        )}
                      </div>
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
