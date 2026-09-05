import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  title: string;
  subtitle: string;
  userRole: 'USER' | 'ADMIN';
  onToggleUserRole: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onTriggerScan: () => void;
  onOpenSearch: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  title,
  subtitle,
  userRole,
  onToggleUserRole,
  darkMode,
  onToggleDarkMode,
  onTriggerScan,
  onOpenSearch,
  children
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a11] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Admin Sidebar */}
      <AdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* Main Content Container */}
      <div className="lg:pl-60 flex flex-col flex-1">
        {/* Admin Topbar */}
        <AdminTopbar
          title={title}
          subtitle={subtitle}
          userRole={userRole}
          onToggleUserRole={onToggleUserRole}
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenSearch={onOpenSearch}
          onTriggerScan={onTriggerScan}
        />

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
