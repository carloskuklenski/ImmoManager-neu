import React, { useMemo, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, Circle, ClipboardList, Plus, Search, Wrench, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { WorkItem, WorkKind, WorkStatus } from '../types';



const kinds: WorkKind[] = ['Leerstand', 'Übergabe', 'Wartung', 'Zähler', 'Bewerbung', 'Aufgabe'];
const statuses: WorkStatus[] = ['Offen', 'In Bearbeitung', 'Erledigt'];
const kindStyles: Record<WorkKind, string> = {
  Leerstand: 'bg-amber-50 text-amber-700 ring-amber-200',
  Übergabe: 'bg-violet-50 text-violet-700 ring-violet-200',
  Wartung: 'bg-rose-50 text-rose-700 ring-rose-200',
  Zähler: 'bg-sky-50 text-sky-700 ring-sky-200',
  Bewerbung: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Aufgabe: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const Operations: React.FC = () => {
  const { operations: items, addOperation, updateOperation, deleteOperation } = useAppContext();
  const [filter, setFilter] = useState<'Alle' | WorkKind>('Alle');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<WorkKind>('Aufgabe');
  const [location, setLocation] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const visibleItems = useMemo(() => items.filter(item =>
    (filter === 'Alle' || item.kind === filter) &&
    [item.title, item.location, item.notes, item.status].some(value => value.toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')), [items, filter, query]);

  const counts = { total: items.length, open: items.filter(i => i.status === 'Offen').length, progress: items.filter(i => i.status === 'In Bearbeitung').length, done: items.filter(i => i.status === 'Erledigt').length };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addOperation({ title: title.trim(), kind, location: location.trim(), dueDate, status: 'Offen', notes: notes.trim() });
    setTitle(''); setKind('Aufgabe'); setLocation(''); setDueDate(''); setNotes(''); setShowForm(false);
  }

  function updateStatus(id: string, status: WorkStatus) {
    updateOperation(id, { status });
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Objektbetrieb</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Vorgänge & Aufgaben</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Leerstände, Übergaben, Wartungen und weitere Abläufe zentral koordinieren.</p>
      </div>
      <button onClick={() => setShowForm(value => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? 'Schließen' : 'Vorgang anlegen'}
      </button>
    </div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-sm text-slate-500">Alle Vorgänge <Activity className="h-4 w-4" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{counts.total}</p></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"><div className="flex items-center justify-between text-sm text-amber-800">Offen <Circle className="h-4 w-4" /></div><p className="mt-3 text-3xl font-bold text-amber-900">{counts.open}</p></div>
      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4"><div className="flex items-center justify-between text-sm text-sky-800">In Bearbeitung <Wrench className="h-4 w-4" /></div><p className="mt-3 text-3xl font-bold text-sky-900">{counts.progress}</p></div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center justify-between text-sm text-emerald-800">Erledigt <CheckCircle2 className="h-4 w-4" /></div><p className="mt-3 text-3xl font-bold text-emerald-900">{counts.done}</p></div>
    </div>

    {showForm && <form onSubmit={submit} className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-slate-900">Neuen Vorgang erfassen</h2></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Titel *<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Wohnungsübergabe vorbereiten" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        <label className="text-sm font-medium text-slate-700">Kategorie<select value={kind} onChange={e => setKind(e.target.value as WorkKind)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500">{kinds.map(k => <option key={k}>{k}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Immobilie / Einheit<input value={location} onChange={e => setLocation(e.target.value)} placeholder="z. B. Lindenstraße 12 · Whg. 3" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
        <label className="text-sm font-medium text-slate-700">Fällig am<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notizen<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Zusätzliche Informationen…" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      </div>
      <div className="mt-4 flex justify-end"><button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Vorgang speichern</button></div>
    </form>}

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">{(['Alle', ...kinds] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{value}</button>)}</div>
        <div className="relative w-full lg:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Vorgänge durchsuchen…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div>
      </div>
      {visibleItems.length === 0 ? <div className="px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100"><ClipboardList className="h-6 w-6 text-slate-400" /></div><h3 className="mt-4 font-semibold text-slate-900">{items.length === 0 ? 'Noch keine Vorgänge erfasst' : 'Keine passenden Vorgänge gefunden'}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{items.length === 0 ? 'Legen Sie den ersten Vorgang an, um Übergaben, Wartungen, Leerstände und Aufgaben nachzuverfolgen.' : 'Ändern Sie den Filter oder den Suchbegriff.'}</p></div> :
        <div className="divide-y divide-slate-100">{visibleItems.map(item => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${kindStyles[item.kind]}`}>{item.kind}</span><span className="text-xs text-slate-400">Erstellt {new Date(item.createdAt).toLocaleDateString('de-DE')}</span></div><h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>{item.location && <p className="mt-1 text-sm text-slate-600">{item.location}</p>}{item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}{item.dueDate && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Fällig am {new Date(item.dueDate + 'T12:00:00').toLocaleDateString('de-DE')}</p>}</div>
          <div className="flex items-center gap-3 sm:min-w-48 sm:justify-end"><select aria-label={`Status für ${item.title}`} value={item.status} onChange={e => updateStatus(item.id, e.target.value as WorkStatus)} className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500">{statuses.map(status => <option key={status}>{status}</option>)}</select><button title="Vorgang löschen" onClick={() => deleteOperation(item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button></div>
        </article>)}</div>}
    </div>
    <p className="text-xs text-slate-400">Hinweis: Im Demo-Modus werden Vorgänge lokal gespeichert. Nach Google-Anmeldung nutzt die App die vorhandene Datensynchronisierung des Portfolios.</p>
  </div>;
};
