import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { FactTransaction } from './types';
import { fetchTransactions } from './services/supabaseService';
import { supabase } from './services/supabase';
import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';

type ActiveTab = 'dashboard' | 'chat';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<FactTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Hook 1: Validate initial session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hook 2: Load data only if session is active
  useEffect(() => {
    if (session) {
      loadDB();
    }
  }, [session]);

  const loadDB = async () => {
    setIsLoadingDB(true);
    setFetchError(null);
    const result = await fetchTransactions();
    setData(result.data);
    setIsTruncated(result.truncated);
    if (result.error) {
      setFetchError(result.error);
    }
    setLastSync(new Date().toLocaleTimeString());
    setIsLoadingDB(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleGuestLogin = () => {
    // Simulate a guest session
    const mockSession = {
      access_token: 'guest',
      refresh_token: 'guest',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'guest-id',
        email: 'guest@portfolio.demo',
        app_metadata: {},
        user_metadata: { full_name: 'Guest Visitor' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      }
    } as Session;
    
    setSession(mockSession);
  };

  // State: Initializing auth
  if (isInitializingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium">Verifying secure session...</p>
      </div>
    );
  }

  // State: No session → show Login
  if (!session) {
    return <Login onLoginSuccess={() => {}} onGuestLogin={handleGuestLogin} />;
  }

  // State: Authenticated → show application
  return (
    <>
      {isTruncated && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Showing the first 5,000 records. Apply date filters in Supabase to see more recent data.
        </div>
      )}
      {fetchError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-xs font-bold text-center py-2 px-4 flex items-center center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Error connecting to the database: {fetchError}
        </div>
      )}
      <MainLayout
        data={data}
        isLoadingDB={isLoadingDB}
        lastSync={lastSync}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSync={loadDB}
        onLogout={handleLogout}
      />
    </>
  );
};

export default App;
