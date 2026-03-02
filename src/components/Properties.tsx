import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Building, MapPin, Euro, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Property, Unit } from '../types';
import { DocumentList } from './DocumentList';

export const Properties: React.FC = () => {
  const { properties, units, tenants, addProperty, updateProperty, deleteProperty, addUnit, updateUnit, deleteUnit } = useAppContext();
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [addingUnitTo, setAddingUnitTo] = useState<string | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const handleAddProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyData = {
      name: formData.get('name') as string,
      street: formData.get('street') as string,
      zipCode: formData.get('zipCode') as string,
      city: formData.get('city') as string,
      purchasePrice: Number(formData.get('purchasePrice')) || undefined,
      purchaseDate: formData.get('purchaseDate') as string || undefined,
    };

    if (editingPropertyId) {
      updateProperty(editingPropertyId, propertyData);
      setEditingPropertyId(null);
    } else {
      addProperty(propertyData);
      setIsAddingProperty(false);
    }
  };

  const startEditProperty = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPropertyId(property.id);
    setIsAddingProperty(false);
  };

  const cancelEditProperty = () => {
    setEditingPropertyId(null);
  };

  const handleAddUnit = (e: React.FormEvent<HTMLFormElement>, propertyId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitData = {
      propertyId,
      name: formData.get('name') as string,
      sizeSqm: Number(formData.get('sizeSqm')),
      rooms: Number(formData.get('rooms')),
    };

    if (editingUnitId) {
      updateUnit(editingUnitId, unitData);
      setEditingUnitId(null);
    } else {
      addUnit(unitData);
      setAddingUnitTo(null);
    }
  };

  const startEditUnit = (unit: Unit) => {
    setEditingUnitId(unit.id);
    setAddingUnitTo(null);
  };

  const cancelEditUnit = () => {
    setEditingUnitId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Meine Immobilien</h2>
        <button 
          onClick={() => { setIsAddingProperty(true); setEditingPropertyId(null); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Immobilie hinzufügen</span>
        </button>
      </div>

      {(isAddingProperty || editingPropertyId) && (() => {
        const editingProperty = editingPropertyId ? properties.find(p => p.id === editingPropertyId) : null;
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingPropertyId ? 'Immobilie bearbeiten' : 'Neue Immobilie'}
            </h3>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name / Bezeichnung</label>
                  <input required name="name" defaultValue={editingProperty?.name || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="z.B. Mehrfamilienhaus Berlin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Straße & Hausnr.</label>
                  <input required name="street" defaultValue={editingProperty?.street || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Musterstraße 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
                  <input required name="zipCode" defaultValue={editingProperty?.zipCode || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="10115" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stadt</label>
                  <input required name="city" defaultValue={editingProperty?.city || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Berlin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kaufpreis (€)</label>
                  <input name="purchasePrice" defaultValue={editingProperty?.purchasePrice || ''} type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kaufdatum</label>
                  <input name="purchaseDate" defaultValue={editingProperty?.purchaseDate || ''} type="date" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setIsAddingProperty(false); cancelEditProperty(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">Speichern</button>
              </div>
            </form>
          </div>
        );
      })()}

      <div className="space-y-4">
        {properties.length === 0 && !isAddingProperty && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Noch keine Immobilien angelegt.</p>
          </div>
        )}

        {properties.map(property => {
          const propertyUnits = units.filter(u => u.propertyId === property.id);
          const isExpanded = expandedProperty === property.id;
          
          return (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl hidden sm:block">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{property.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {property.street}, {property.zipCode} {property.city}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Einheiten</p>
                    <p className="font-semibold text-slate-900">{propertyUnits.length}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => startEditProperty(property, e)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProperty(property.id); }}
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
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-800">Wohnungen / Einheiten</h4>
                    <button 
                      onClick={() => { setAddingUnitTo(property.id); setEditingUnitId(null); }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Einheit hinzufügen
                    </button>
                  </div>

                  {(addingUnitTo === property.id || (editingUnitId && units.find(u => u.id === editingUnitId)?.propertyId === property.id)) && (() => {
                    const editingUnit = editingUnitId ? units.find(u => u.id === editingUnitId) : null;
                    return (
                      <form onSubmit={(e) => handleAddUnit(e, property.id)} className="bg-white p-4 rounded-xl border border-slate-200 mb-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Bezeichnung</label>
                          <input required name="name" defaultValue={editingUnit?.name || ''} type="text" className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="z.B. EG links" />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Größe (m²)</label>
                          <input required name="sizeSqm" defaultValue={editingUnit?.sizeSqm || ''} type="number" step="0.1" className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="65.5" />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Zimmer</label>
                          <input required name="rooms" defaultValue={editingUnit?.rooms || ''} type="number" step="0.5" className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="2.5" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setAddingUnitTo(null); cancelEditUnit(); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">Abbrechen</button>
                          <button type="submit" className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Speichern</button>
                        </div>
                      </form>
                    );
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {propertyUnits.length === 0 && !addingUnitTo && (
                      <p className="text-sm text-slate-500 italic col-span-full">Keine Einheiten vorhanden.</p>
                    )}
                    {propertyUnits.map(unit => {
                      const tenant = tenants.find(t => t.unitId === unit.id);
                      return (
                        <div key={unit.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-slate-800">{unit.name}</h5>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => startEditUnit(unit)}
                                  className="text-slate-400 hover:text-emerald-600 p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUnit(unit.id)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{unit.sizeSqm} m² • {unit.rooms} Zimmer</p>
                          </div>
                          
                          <div className={`p-3 rounded-lg text-sm ${tenant ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                            {tenant ? (
                              <div>
                                <p className="font-medium text-emerald-800">{tenant.firstName} {tenant.lastName}</p>
                                <p className="text-emerald-600 mt-1">€{tenant.rent} + €{tenant.utilities}</p>
                              </div>
                            ) : (
                              <p className="text-slate-500 italic">Leerstand</p>
                            )}
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <DocumentList entityType="unit" entityId={unit.id} />
                          </div>
                        </div>
                      );
                    })}
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
