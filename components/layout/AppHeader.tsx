import React from 'react';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

interface AppHeaderProps {
  isLoadingDB: boolean;
  lastSync: string | null;
  onSync: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ isLoadingDB, lastSync, onSync }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">GenBI Analytics v2.0</h1>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Supabase Live Connection</p>
      </div>

      <div className="flex items-center gap-4">
        {lastSync && (
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" /> SYNCED: {lastSync}
          </div>
        )}

        <button
          onClick={onSync}
          disabled={isLoadingDB}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isLoadingDB ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isLoadingDB ? 'Connecting DB...' : 'Update Data'}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
