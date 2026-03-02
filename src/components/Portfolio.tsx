import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Share2, UserPlus, Shield, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

export const Portfolio: React.FC = () => {
  const { user, portfolios, activePortfolioId, switchPortfolio, sharePortfolio, login } = useAppContext();
  const [shareEmail, setShareEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write'>('read');
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Share2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Sharing</h2>
        <p className="text-slate-500 max-w-md mb-6">
          Melden Sie sich mit Google an, um Ihr Portfolio mit anderen zu teilen oder auf geteilte Portfolios zuzugreifen.
        </p>
        <button 
          onClick={login}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          Anmelden & Drive verbinden
        </button>
      </div>
    );
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail) return;
    
    setIsSharing(true);
    setMessage(null);
    
    try {
      const ownedPortfolio = portfolios.owned[0];
      if (!ownedPortfolio) throw new Error("Kein Portfolio gefunden");
      
      await sharePortfolio(ownedPortfolio.id, shareEmail, permission);
      setMessage({ type: 'success', text: `Portfolio erfolgreich mit ${shareEmail} geteilt.` });
      setShareEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Fehler beim Teilen des Portfolios.' });
    } finally {
      setIsSharing(false);
    }
  };

  const currentActiveId = activePortfolioId || (portfolios.owned[0]?.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Portfolio & Sharing</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Neue Person einladen</h3>
          </div>

          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Adresse</label>
              <input 
                type="email" 
                required
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="beispiel@email.de"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Berechtigung</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPermission('read')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    permission === 'read' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-medium">Nur Lesen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPermission('write')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    permission === 'write' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span className="text-xs font-medium">Vollzugriff</span>
                </button>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSharing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSharing ? 'Wird geteilt...' : 'Einladung senden'}
            </button>
          </form>
        </div>

        {/* Portfolios List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Ihre Portfolios</h3>
            <div className="space-y-3">
              {portfolios.owned.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  currentActiveId === p.id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      currentActiveId === p.id ? 'bg-white border-emerald-200' : 'bg-white border-slate-200'
                    }`}>
                      <Share2 className={`w-5 h-5 ${currentActiveId === p.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">Eigentümer</p>
                    </div>
                  </div>
                  {currentActiveId === p.id ? (
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">Aktiv</span>
                  ) : (
                    <button 
                      onClick={() => switchPortfolio(p.id)}
                      className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
                    >
                      Wechseln
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Mit Ihnen geteilt</h3>
            {portfolios.shared.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Keine geteilten Portfolios vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {portfolios.shared.map(p => (
                  <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    currentActiveId === p.id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        currentActiveId === p.id ? 'bg-white border-emerald-200' : 'bg-white border-slate-200'
                      }`}>
                        <Share2 className={`w-5 h-5 ${currentActiveId === p.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.permission === 'write' ? 'Vollzugriff' : 'Nur Lesen'}</p>
                      </div>
                    </div>
                    {currentActiveId === p.id ? (
                      <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">Aktiv</span>
                    ) : (
                      <button 
                        onClick={() => switchPortfolio(p.id)}
                        className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
                      >
                        Wechseln
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900">Google Drive Synchronisierung</h4>
            <p className="text-sm text-amber-800 mt-1">
              Ihre Daten werden automatisch in Ihrem Google Drive im Ordner "ImmoManager" gespeichert. 
              Dies ermöglicht Ihnen den Zugriff von verschiedenen Geräten und dient als Backup. 
              Wenn Sie Ihr Portfolio teilen, erhalten die eingeladenen Personen Zugriff auf die Daten in Ihrem Drive (entsprechend der gewählten Berechtigung).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
