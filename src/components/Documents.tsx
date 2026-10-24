import React, { useMemo, useState } from 'react';
import { ExternalLink, FileText, Link2, Plus, Search, Trash2, UploadCloud } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Documents: React.FC = () => {
  const { documents, properties, units, tenants, addDocument, deleteDocument } = useAppContext();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Vertrag');
  const [entityType, setEntityType] = useState<'unit' | 'tenant' | 'calculation'>('unit');
  const [entityId, setEntityId] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const entities = useMemo(() => {
    if (entityType === 'unit') return units.map(unit => {
      const property = properties.find(p => p.id === unit.propertyId);
      return { id: unit.id, label: `${property?.name || 'Immobilie'} · ${unit.name}` };
    });
    if (entityType === 'tenant') return tenants.map(tenant => ({ id: tenant.id, label: `${tenant.firstName} ${tenant.lastName}` }));
    return [];
  }, [entityType, units, properties, tenants]);

  const visible = documents.filter(doc => [doc.name, doc.type, doc.entityType].some(value => value.toLowerCase().includes(query.toLowerCase())));
  const formatSize = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!name.trim()) { setError('Bitte einen Dokumentnamen eingeben.'); return; }
    if (!file && !url.trim()) { setError('Bitte eine Datei auswählen oder eine URL eintragen.'); return; }
    if (file && file.size > 5 * 1024 * 1024) { setError('Dateien dürfen maximal 5 MB groß sein.'); return; }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') { setError('Die Datei konnte nicht gelesen werden.'); return; }
        addDocument({ name: name.trim(), type, size: file.size, url: reader.result, entityType, entityId: entityId || 'unassigned' });
        reset();
      };
      reader.onerror = () => setError('Die Datei konnte nicht gelesen werden.');
      reader.readAsDataURL(file);
    } else {
      addDocument({ name: name.trim(), type, size: 0, url: url.trim(), entityType, entityId: entityId || 'unassigned' });
      reset();
    }
  }

  function reset() {
    setName(''); setType('Vertrag'); setEntityType('unit'); setEntityId(''); setUrl(''); setFile(null); setShowForm(false); setError('');
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Ablage</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dokumente</h1><p className="mt-2 text-sm text-slate-500">Verträge, Protokolle und weitere Unterlagen zentral ablegen und wiederfinden.</p></div>
      <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" />Dokument hinzufügen</button>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Dokumente</p><p className="mt-2 text-3xl font-bold">{documents.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Dateien</p><p className="mt-2 text-3xl font-bold">{documents.filter(d => d.url.startsWith('data:')).length}</p></div><div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1"><p className="text-sm text-slate-500">Verlinkte Unterlagen</p><p className="mt-2 text-3xl font-bold">{documents.filter(d => !d.url.startsWith('data:')).length}</p></div></div>
    {showForm && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Neues Dokument</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Name *<input required value={name} onChange={e => setName(e.target.value)} placeholder="z. B. Mietvertrag Wohnung 1" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
        <label className="text-sm font-medium text-slate-700">Dokumenttyp<select value={type} onChange={e => setType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">{['Vertrag','Übergabeprotokoll','Nebenkosten','Rechnung','Foto','Korrespondenz','Sonstiges'].map(t => <option key={t}>{t}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Zuordnen zu<select value={entityType} onChange={e => { setEntityType(e.target.value as typeof entityType); setEntityId(''); }} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="unit">Einheit</option><option value="tenant">Mieter</option><option value="calculation">Allgemein / Berechnung</option></select></label>
        {entityType !== 'calculation' && <label className="text-sm font-medium text-slate-700">Einheit / Mieter<select value={entityId} onChange={e => setEntityId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="">Nicht zugeordnet</option>{entities.map(entity => <option key={entity.id} value={entity.id}>{entity.label}</option>)}</select></label>}
        <label className="text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><UploadCloud className="h-4 w-4" />Datei (max. 5 MB)</span><input type="file" onChange={e => { setFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setUrl(''); }} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-medium" /></label>
        <label className="text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Link2 className="h-4 w-4" />Oder URL</span><input type="url" value={url} onChange={e => { setUrl(e.target.value); if (e.target.value) setFile(null); }} placeholder="https://…" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" /></label>
      </div>
      {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Abbrechen</button><button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Speichern</button></div>
      <p className="text-xs text-slate-400">Dateien bis 5 MB werden in den App-Daten gespeichert. Bei Google-Drive-Synchronisierung beachten, dass eingebettete Dateien den Speicherbedarf erhöhen.</p>
    </form>}
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Dokumente suchen…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div></div>
      {visible.length === 0 ? <div className="px-6 py-14 text-center"><FileText className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">Noch keine Dokumente</h3><p className="mt-1 text-sm text-slate-500">Fügen Sie eine Datei oder einen Link hinzu.</p></div> :
        <div className="divide-y divide-slate-100">{visible.map(doc => <div key={doc.id} className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><FileText className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{doc.name}</p><p className="mt-0.5 text-xs text-slate-500">{doc.type} · {new Date(doc.createdAt).toLocaleDateString('de-DE')}{doc.size ? ` · ${formatSize(doc.size)}` : ''}</p></div><a href={doc.url} target="_blank" rel="noreferrer" download={doc.url.startsWith('data:') ? doc.name : undefined} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" aria-label={`Dokument ${doc.name} öffnen`}><ExternalLink className="h-4 w-4" /></a><button onClick={() => { if (window.confirm(`„${doc.name}“ wirklich löschen?`)) deleteDocument(doc.id); }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Dokument ${doc.name} löschen`}><Trash2 className="h-4 w-4" /></button></div>)}</div>}
    </div>
  </div>;
};
