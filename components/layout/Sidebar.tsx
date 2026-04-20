import React from 'react';
import {
  Database,
  LayoutDashboard,
  MessageSquare,
  LogOut
} from 'lucide-react';

type ActiveTab = 'dashboard' | 'chat';

interface NavIconButtonProps {
  icon: React.ReactElement<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  label: string;
}

const NavIconButton: React.FC<NavIconButtonProps> = ({ icon, active, onClick, label }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-4 rounded-2xl transition-all group relative w-full flex justify-center ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-300 hover:bg-white/10'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-6 h-6' })}
    {!active && (
      <span className="absolute left-20 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    )}
  </button>
);

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <aside className="w-20 bg-indigo-900 flex flex-col items-center py-8 justify-between border-r border-indigo-800">
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="bg-white/10 p-3 rounded-2xl">
          <Database className="w-6 h-6 text-white" />
        </div>
        <nav className="flex flex-col gap-4 w-full px-2">
          <NavIconButton
            icon={<LayoutDashboard />}
            active={activeTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
            label="Dashboard"
          />
          <NavIconButton
            icon={<MessageSquare />}
            active={activeTab === 'chat'}
            onClick={() => onTabChange('chat')}
            label="Assistant"
          />
        </nav>
      </div>

      <div className="w-full px-2">
        <NavIconButton
          icon={<LogOut className="text-red-400" />}
          active={false}
          onClick={onLogout}
          label="Log Out"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
