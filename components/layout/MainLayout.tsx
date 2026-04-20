import React from 'react';
import { Database, Loader2 } from 'lucide-react';
import { FactTransaction } from '../../types';
import Dashboard from '../Dashboard';
import ChatAssistant from '../ChatAssistant';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

type ActiveTab = 'dashboard' | 'chat';

interface MainLayoutProps {
  data: FactTransaction[];
  isLoadingDB: boolean;
  lastSync: string | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSync: () => void;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  data,
  isLoadingDB,
  lastSync,
  activeTab,
  onTabChange,
  onSync,
  onLogout,
}) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          isLoadingDB={isLoadingDB}
          lastSync={lastSync}
          onSync={onSync}
        />

        <main className="flex-1 overflow-y-auto p-8">
          {isLoadingDB ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold mb-3 text-slate-800">Connecting to Supabase...</h2>
              <p className="text-slate-500">Please wait while we load the transaction table.</p>
            </div>
          ) : data.length > 0 ? (
            <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-8">
              <div className={`flex-1 transition-all ${activeTab === 'chat' ? 'lg:flex-[0.35] hidden lg:block opacity-50 blur-[1px]' : ''}`}>
                <Dashboard data={data} />
              </div>

              {activeTab === 'chat' && (
                <div className="flex-1 lg:flex-[0.65] h-full animate-in slide-in-from-right duration-500 bg-white rounded-xl shadow-xl border border-slate-200">
                  <ChatAssistant data={data} />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center max-w-lg">
                <Database className="w-16 h-16 text-indigo-200 mb-6" />
                <h2 className="text-2xl font-bold mb-3 text-slate-800">No data found</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Your fact_transactions table seems to be empty or the access key is incorrect.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
