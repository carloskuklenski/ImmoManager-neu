import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Home, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-6">
          <Home className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ImmoManager</h1>
        <p className="text-slate-500 mb-8">
          Verwalten Sie Ihre Immobilien, Mieter und Nebenkostenabrechnungen sicher in Ihrem Google Drive.
        </p>
        
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-200"
        >
          <LogIn className="w-5 h-5" />
          Mit Google anmelden
        </button>
        
        <p className="mt-8 text-xs text-slate-400">
          Durch die Anmeldung erhalten wir Zugriff auf Ihr Google Drive, um dort Ihre Dokumente und App-Daten sicher zu speichern.
        </p>
      </div>
    </div>
  );
};
