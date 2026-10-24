import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, Unit, Tenant, Document, UtilitySettlement, YieldCalculation, RentIncrease, User, Portfolio, WorkItem } from '../types';

interface AppState {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  documents: Document[];
  settlements: UtilitySettlement[];
  calculations: YieldCalculation[];
  rentIncreases: RentIncrease[];
  operations: WorkItem[];
}

interface AppContextType extends AppState {
  user: User | null;
  portfolios: { owned: Portfolio[], shared: Portfolio[] };
  activePortfolioId: string | null;
  isLoading: boolean;
  
  login: () => Promise<void>;
  startDemo: () => void;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<void>;
  switchPortfolio: (portfolioId: string | null) => void;
  sharePortfolio: (portfolioId: string, email: string, permission: 'read' | 'write') => Promise<void>;
  
  addProperty: (property: Omit<Property, 'id'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  addDocument: (document: Omit<Document, 'id' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;

  addSettlement: (settlement: Omit<UtilitySettlement, 'id' | 'createdAt'>) => void;
  deleteSettlement: (id: string) => void;

  addCalculation: (calculation: Omit<YieldCalculation, 'id' | 'createdAt'>) => void;
  deleteCalculation: (id: string) => void;

  addRentIncrease: (increase: Omit<RentIncrease, 'id' | 'createdAt'>) => void;
  updateRentIncrease: (id: string, increase: Partial<RentIncrease>) => void;
  deleteRentIncrease: (id: string) => void;
  addOperation: (operation: Omit<WorkItem, 'id' | 'createdAt'>) => void;
  updateOperation: (id: string, updates: Partial<WorkItem>) => void;
  deleteOperation: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultState: AppState = {
  properties: [],
  units: [],
  tenants: [],
  documents: [],
  settlements: [],
  calculations: [],
  rentIncreases: [],
  operations: []
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [portfolios, setPortfolios] = useState<{ owned: Portfolio[], shared: Portfolio[] }>({ owned: [], shared: [] });
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  };

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('immo-manager-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse state from localStorage', e);
      }
    }
    return defaultState;
  });

  // Auth & Sync Logic
  useEffect(() => {
    // Check URL for token
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log("Received OAUTH_AUTH_SUCCESS");
        if (event.data.token) {
          localStorage.setItem('auth_token', event.data.token);
        }
        setIsLoading(true);
        try {
          const meRes = await apiFetch('/api/auth/me');
          if (meRes.ok) {
            const userData = await meRes.json();
            setUser(userData);
            
            const portRes = await apiFetch('/api/portfolios');
            if (portRes.ok) setPortfolios(await portRes.json());
            
            const driveRes = await apiFetch('/api/drive/data');
            if (driveRes.ok) {
              const driveData = await driveRes.json();
              if (driveData) setState(driveData);
            }
          } else {
            console.error("Auth check failed after login success message");
          }
        } catch (e) {
          console.error("Auth Refresh Error:", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem('immo-demo-mode') === 'true') {
        setUser({ id: 'local-demo-user', email: 'demo@immomanager.local', name: 'Demo-Nutzer' });
        setIsLoading(false);
        return;
      }
      try {
        const meRes = await apiFetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
          
          // Fetch portfolios
          const portRes = await apiFetch('/api/portfolios');
          if (portRes.ok) {
            const ports = await portRes.json();
            setPortfolios(ports);
          }

          // Fetch Drive data for current user by default
          const driveRes = await apiFetch('/api/drive/data');
          if (driveRes.ok) {
            const driveData = await driveRes.json();
            if (driveData) setState(driveData);
          }
        }
      } catch (e) {
        console.error("Init Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Fetch data when switching portfolio
  useEffect(() => {
    if (!user || !activePortfolioId) return;
    const fetchData = async () => {
      const res = await apiFetch(`/api/drive/data?portfolioId=${activePortfolioId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setState(data);
      }
    };
    fetchData();
  }, [activePortfolioId, user]);

  useEffect(() => {
    if (!user || user.id === 'local-demo-user') {
      localStorage.setItem('immo-manager-state', JSON.stringify(state));
    } else {
      // Sync to Drive (debounced or on change)
      const sync = async () => {
        try {
          const url = activePortfolioId 
            ? `/api/drive/data?portfolioId=${activePortfolioId}` 
            : '/api/drive/data';
          await apiFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
          });
        } catch (e) {
          console.error("Sync Error:", e);
        }
      };
      const timeout = setTimeout(sync, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state, user, activePortfolioId]);

  const login = async () => {
    // Safari fix: Open popup immediately to satisfy user gesture requirement
    const popup = window.open('about:blank', 'google_login', 'width=600,height=700');
    
    if (!popup) {
      alert("Popup wurde blockiert! Bitte erlauben Sie Popups für diese Seite.");
      return;
    }

    try {
      const res = await apiFetch('/api/auth/google/url');
      if (!res.ok) {
        popup.close();
        throw new Error("Konnte Auth-URL nicht laden");
      }
      const { url } = await res.json();
      
      console.log("Redirecting popup to Google Auth URL");
      popup.location.href = url;

      // Aggressive polling: Check every 1000ms if the popup is closed OR if we are logged in
      // Wait 1s before first poll to allow server to save session
      setTimeout(() => {
        const pollInterval = setInterval(async () => {
          // Check if we are already logged in (maybe postMessage worked)
          if (user) {
            clearInterval(pollInterval);
            return;
          }

        // Check auth status
        try {
          const meRes = await apiFetch('/api/auth/me');
          if (meRes.ok) {
            const userData = await meRes.json();
            if (userData) {
              console.log("Auth detected via polling!");
              setUser(userData);
              clearInterval(pollInterval);
              if (!popup.closed) popup.close();
              
              // Trigger data fetch
              const portRes = await apiFetch('/api/portfolios');
              if (portRes.ok) setPortfolios(await portRes.json());
              const driveRes = await apiFetch('/api/drive/data');
              if (driveRes.ok) {
                const driveData = await driveRes.json();
                if (driveData) setState(driveData);
              }
              return;
            }
          }
        } catch (e) {
          // Ignore polling errors
        }

        if (popup.closed) {
          clearInterval(pollInterval);
          console.log("Popup closed, final auth check...");
          // One last check
          const meRes = await apiFetch('/api/auth/me');
          if (meRes.ok) {
            const userData = await meRes.json();
            setUser(userData);
          }
        }
      }, 1000);
    }, 1000);

    } catch (e) {
      console.error("Login Error:", e);
      alert("Fehler beim Starten der Anmeldung: " + (e instanceof Error ? e.message : "Unbekannter Fehler"));
    }
  };

  const startDemo = () => {
    localStorage.setItem('immo-demo-mode', 'true');
    setUser({ id: 'local-demo-user', email: 'demo@immomanager.local', name: 'Demo-Nutzer' });
    setState(prev => {
      if ((prev.properties || []).length || (prev.units || []).length || (prev.tenants || []).length || (prev.operations || []).length) return prev;
      return {
        ...prev,
        properties: [{ id: 'demo-property-1', name: 'Altbau am Park', street: 'Parkstraße 18', zipCode: '65189', city: 'Wiesbaden', purchasePrice: 685000, purchaseDate: '2022-06-01' }],
        units: [{ id: 'demo-unit-1', propertyId: 'demo-property-1', name: 'Wohnung 1. OG links', sizeSqm: 78, rooms: 3 }],
        tenants: [{ id: 'demo-tenant-1', unitId: 'demo-unit-1', firstName: 'Anna', lastName: 'Becker', email: 'anna.becker@example.com', phone: '+49 611 555010', rent: 980, utilities: 220, deposit: 2940, leaseStart: '2024-04-01' }],
        operations: [{ id: 'demo-operation-1', title: 'Heizungswartung terminieren', kind: 'Wartung', location: 'Parkstraße 18 · Wohnung 1. OG links', dueDate: '2026-11-15', status: 'Offen', notes: 'Beispielvorgang – kann angepasst oder gelöscht werden.', createdAt: new Date().toISOString() }]
      };
    });
  };

  const checkLoginStatus = async () => {
    setIsLoading(true);
    try {
      const meRes = await apiFetch('/api/auth/me');
      if (meRes.ok) {
        const userData = await meRes.json();
        if (userData) {
          setUser(userData);
          const portRes = await apiFetch('/api/portfolios');
          if (portRes.ok) setPortfolios(await portRes.json());
          const driveRes = await apiFetch('/api/drive/data');
          if (driveRes.ok) {
            const driveData = await driveRes.json();
            if (driveData) setState(driveData);
          }
        } else {
          alert("Keine aktive Sitzung gefunden. Bitte melden Sie sich erneut an.");
        }
      } else {
        alert("Anmelde-Check fehlgeschlagen.");
      }
    } catch (e) {
      console.error("Manual Check Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user?.id === 'local-demo-user') localStorage.removeItem('immo-demo-mode');
    else await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setPortfolios({ owned: [], shared: [] });
    setActivePortfolioId(null);
    setState(defaultState);
  };

  const switchPortfolio = (id: string | null) => {
    setActivePortfolioId(id);
  };

  const sharePortfolio = async (portfolioId: string, email: string, permission: 'read' | 'write') => {
    await apiFetch('/api/portfolios/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId, email, permission })
    });
  };

  const generateId = () => crypto.randomUUID();

  const addProperty = (property: Omit<Property, 'id'>) => {
    setState(prev => ({
      ...prev,
      properties: [...prev.properties, { ...property, id: generateId() }]
    }));
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProperty = (id: string) => {
    setState(prev => {
      const unitsToDelete = (prev.units || []).filter(u => u.propertyId === id).map(u => u.id);
      const tenantsToDelete = (prev.tenants || []).filter(t => unitsToDelete.includes(t.unitId)).map(t => t.id);
      
      return {
        ...prev,
        properties: (prev.properties || []).filter(p => p.id !== id),
        units: (prev.units || []).filter(u => u.propertyId !== id),
        tenants: (prev.tenants || []).filter(t => !tenantsToDelete.includes(t.id)),
        documents: (prev.documents || []).filter(d => 
          !(d.entityType === 'unit' && unitsToDelete.includes(d.entityId)) &&
          !(d.entityType === 'tenant' && tenantsToDelete.includes(d.entityId))
        )
      };
    });
  };

  const addUnit = (unit: Omit<Unit, 'id'>) => {
    setState(prev => ({
      ...prev,
      units: [...prev.units, { ...unit, id: generateId() }]
    }));
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteUnit = (id: string) => {
    setState(prev => {
      const tenantsToDelete = (prev.tenants || []).filter(t => t.unitId === id).map(t => t.id);
      return {
        ...prev,
        units: (prev.units || []).filter(u => u.id !== id),
        tenants: (prev.tenants || []).filter(t => t.unitId !== id),
        documents: (prev.documents || []).filter(d => 
          !(d.entityType === 'unit' && d.entityId === id) &&
          !(d.entityType === 'tenant' && tenantsToDelete.includes(d.entityId))
        )
      };
    });
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    setState(prev => ({
      ...prev,
      tenants: [...prev.tenants, { ...tenant, id: generateId() }]
    }));
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setState(prev => ({
      ...prev,
      tenants: prev.tenants.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTenant = (id: string) => {
    setState(prev => ({
      ...prev,
      tenants: (prev.tenants || []).filter(t => t.id !== id),
      documents: (prev.documents || []).filter(d => !(d.entityType === 'tenant' && d.entityId === id)),
      settlements: (prev.settlements || []).filter(s => s.tenantId !== id),
      rentIncreases: (prev.rentIncreases || []).filter(r => r.tenantId !== id)
    }));
  };

  const addDocument = (document: Omit<Document, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      documents: [...(prev.documents || []), { 
        ...document, 
        id: generateId(),
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const deleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }));
  };

  const addSettlement = (settlement: Omit<UtilitySettlement, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      settlements: [...(prev.settlements || []), {
        ...settlement,
        id: generateId(),
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const deleteSettlement = (id: string) => {
    setState(prev => ({
      ...prev,
      settlements: (prev.settlements || []).filter(s => s.id !== id)
    }));
  };

  const addCalculation = (calculation: Omit<YieldCalculation, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      calculations: [...(prev.calculations || []), {
        ...calculation,
        id: generateId(),
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const deleteCalculation = (id: string) => {
    setState(prev => ({
      ...prev,
      calculations: (prev.calculations || []).filter(c => c.id !== id),
      documents: (prev.documents || []).filter(d => !(d.entityType === 'calculation' && d.entityId === id))
    }));
  };

  const addRentIncrease = (increase: Omit<RentIncrease, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      rentIncreases: [...(prev.rentIncreases || []), {
        ...increase,
        id: generateId(),
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const updateRentIncrease = (id: string, updates: Partial<RentIncrease>) => {
    setState(prev => ({
      ...prev,
      rentIncreases: (prev.rentIncreases || []).map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const deleteRentIncrease = (id: string) => {
    setState(prev => ({
      ...prev,
      rentIncreases: (prev.rentIncreases || []).filter(r => r.id !== id)
    }));
  };

  const addOperation = (operation: Omit<WorkItem, 'id' | 'createdAt'>) => {
    setState(prev => ({ ...prev, operations: [...(prev.operations || []), { ...operation, id: generateId(), createdAt: new Date().toISOString() }] }));
  };
  const updateOperation = (id: string, updates: Partial<WorkItem>) => {
    setState(prev => ({ ...prev, operations: (prev.operations || []).map(item => item.id === id ? { ...item, ...updates } : item) }));
  };
  const deleteOperation = (id: string) => {
    setState(prev => ({ ...prev, operations: (prev.operations || []).filter(item => item.id !== id) }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      user,
      portfolios,
      activePortfolioId,
      isLoading,
      login,
      startDemo,
      logout,
      checkLoginStatus,
      switchPortfolio,
      sharePortfolio,
      properties: state.properties || [],
      units: state.units || [],
      tenants: state.tenants || [],
      documents: state.documents || [],
      settlements: state.settlements || [],
      calculations: state.calculations || [],
      rentIncreases: state.rentIncreases || [],
      operations: state.operations || [],
      addProperty, updateProperty, deleteProperty,
      addUnit, updateUnit, deleteUnit,
      addTenant, updateTenant, deleteTenant,
      addDocument, deleteDocument,
      addSettlement, deleteSettlement,
      addCalculation, deleteCalculation,
      addRentIncrease, updateRentIncrease, deleteRentIncrease,
      addOperation, updateOperation, deleteOperation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
