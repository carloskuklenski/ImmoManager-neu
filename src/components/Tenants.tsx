import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Users, Mail, Phone, Home, Trash2, Edit2, ChevronDown, ChevronUp, Euro } from 'lucide-react';
import { Tenant } from '../types';
import { DocumentList } from './DocumentList';

export const Tenants: React.FC = () => {
  const { tenants, properties, units, addTenant, updateTenant, deleteTenant } = useAppContext();
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

  const availableUnits = units.filter(u => !tenants.some(t => t.unitId === u.id && t.id !== editingTenantId));

  const handleAddTenant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantData = {
      unitId: formData.get('unitId') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      rent: Number(formData.get('rent')),
      utilities: Number(formData.get('utilities')),
      deposit: Number(formData.get('deposit')),
      leaseStart: formData.get('leaseStart') as string,
      leaseEnd: formData.get('leaseEnd') as string || undefined,
    };

    if (editingTenantId) {
      updateTenant(editingTenantId, tenantData);
      setEditingTenantId(null);
    } else {
      addTenant(tenantData);
      setIsAddingTenant(false);
    }
  };

  const startEditTenant = (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTenantId(tenant.id);
    setIsAddingTenant(false);
  };

  const cancelEditTenant = () => {
    setEditingTenantId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Meine Mieter</h2>
        <button 
          onClick={() => { setIsAddingTenant(true); setEditingTenantId(null); }}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Mieter hinzufügen</span>
        </button>
      </div>

      {(isAddingTenant || editingTenantId) && (() => {
        const editingTenant = editingTenantId ? tenants.find(t => t.id === editingTenantId) : null;
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingTenantId ? 'Mieter bearbeiten' : 'Neuer Mieter'}
            </h3>
            {availableUnits.length === 0 && !editingTenantId ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                <p>Es gibt aktuell keine freien Einheiten. Bitte legen Sie zuerst eine neue Einheit an oder kündigen Sie einen bestehenden Mieter.</p>
                <button 
                  onClick={() => setIsAddingTenant(false)} 
                  className="mt-3 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors"
                >
                  Schließen
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddTenant} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Einheit zuweisen</label>
                    <select required name="unitId" defaultValue={editingTenant?.unitId || ''} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none bg-white">
                      <option value="">Bitte wählen...</option>
                      {availableUnits.map(unit => {
                        const prop = properties.find(p => p.id === unit.propertyId);
                        return (
                          <option key={unit.id} value={unit.id}>
                            {prop?.name} - {unit.name} ({unit.sizeSqm}m²)
                          </option>
                        );
                      })}
                      {editingTenant && !availableUnits.some(u => u.id === editingTenant.unitId) && (() => {
                        const unit = units.find(u => u.id === editingTenant.unitId);
                        const prop = properties.find(p => p.id === unit?.propertyId);
                        return unit ? (
                          <option key={unit.id} value={unit.id}>
                            {prop?.name} - {unit.name} ({unit.sizeSqm}m²)
                          </option>
                        ) : null;
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                    <input required name="firstName" defaultValue={editingTenant?.firstName || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Max" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                    <input required name="lastName" defaultValue={editingTenant?.lastName || ''} type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Mustermann" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                    <input required name="email" defaultValue={editingTenant?.email || ''} type="email" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="max@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                    <input required name="phone" defaultValue={editingTenant?.phone || ''} type="tel" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="+49 123 456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kaltmiete (€)</label>
                    <input required name="rent" defaultValue={editingTenant?.rent || ''} type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nebenkosten (€)</label>
                    <input required name="utilities" defaultValue={editingTenant?.utilities || ''} type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kaution (€)</label>
                    <input required name="deposit" defaultValue={editingTenant?.deposit || ''} type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="2400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mietbeginn</label>
                    <input required name="leaseStart" defaultValue={editingTenant?.leaseStart || ''} type="date" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => { setIsAddingTenant(false); cancelEditTenant(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
                  <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors">Speichern</button>
                </div>
              </form>
            )}
          </div>
        );
      })()}

      <div className="space-y-4">
        {tenants.length === 0 && !isAddingTenant && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Noch keine Mieter angelegt.</p>
          </div>
        )}

        {tenants.map(tenant => {
          const unit = units.find(u => u.id === tenant.unitId);
          const property = properties.find(p => p.id === unit?.propertyId);
          const isExpanded = expandedTenant === tenant.id;
          
          return (
            <div key={tenant.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedTenant(isExpanded ? null : tenant.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-violet-100 text-violet-600 rounded-xl hidden sm:block">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{tenant.firstName} {tenant.lastName}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <Home className="w-4 h-4" />
                      {property?.name || 'Unbekannt'} - {unit?.name || 'Unbekannt'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Warmmiete</p>
                    <p className="font-semibold text-slate-900">€{(Number(tenant.rent) + Number(tenant.utilities)).toLocaleString('de-DE')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => startEditTenant(tenant, e)}
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTenant(tenant.id); }}
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
                <div className="border-t border-slate-100 bg-slate-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Kontaktdaten</h4>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <a href={`mailto:${tenant.email}`} className="hover:text-violet-600">{tenant.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <a href={`tel:${tenant.phone}`} className="hover:text-violet-600">{tenant.phone}</a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Vertragsdetails</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Mietbeginn</p>
                        <p className="font-medium text-slate-900">{new Date(tenant.leaseStart).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Kaution</p>
                        <p className="font-medium text-slate-900">€{Number(tenant.deposit).toLocaleString('de-DE')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Kaltmiete</p>
                        <p className="font-medium text-slate-900">€{Number(tenant.rent).toLocaleString('de-DE')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Nebenkosten</p>
                        <p className="font-medium text-slate-900">€{Number(tenant.utilities).toLocaleString('de-DE')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200">
                    <DocumentList entityType="tenant" entityId={tenant.id} />
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
