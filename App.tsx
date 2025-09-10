

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from './convex/_generated/api';
import { Id } from './convex/_generated/dataModel';

import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import Toast from './components/Toast';
import SettingsModal from './components/SettingsModal';
import Spinner from './components/Spinner';
import { Role } from './types';
import PricingPage from './components/PricingPage';

const App: React.FC = () => {
  const data = useQuery(api.users.getCurrentUser);
  const [currentOrgId, setCurrentOrgId] = useState<Id<"organizations"> | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Set initial organization when data loads
  useEffect(() => {
    if (data?.organizations && data.organizations.length > 0 && !currentOrgId) {
      setCurrentOrgId(data.organizations[0]._id);
    }
  }, [data, currentOrgId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);
  const handleOpenSettings = () => setIsSettingsModalOpen(true);
  const handleCloseSettings = () => setIsSettingsModalOpen(false);

  const handleSwitchOrganization = (orgId: Id<"organizations">) => {
    setCurrentOrgId(orgId);
  };
  
  // This is a placeholder for Clerk's real login flow
  const handleLogin = () => {
    // In a real app, Clerk would handle this, and the useQuery would update automatically
    // For this simulation, we'll just show a toast as there's no real login action
    showToast("Please sign in to continue.", "error"); 
  };
  
  // This is a placeholder for Clerk's real logout flow
  const handleLogout = () => {
    // In a real app, Clerk would handle this
    window.location.reload();
  };

  const currentOrganization = useMemo(() => {
    return data?.organizations?.find(org => org._id === currentOrgId);
  }, [currentOrgId, data?.organizations]);

  const currentUserRole = useMemo(() => {
    if (!data?.user || !currentOrgId) return null;
    const membership = data.memberships.find(m => m.orgId === currentOrgId);
    return membership?.role as Role ?? null;
  }, [data, currentOrgId]);

  const canManageRoles = useMemo(() => {
    if (!currentOrganization) return false;
    return currentOrganization.plan === 'pro' || currentOrganization.plan === 'enterprise';
  }, [currentOrganization]);
  
  if (data === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const path = window.location.pathname;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      {data.user && currentOrganization ? (
        <>
          <Header 
            userName={data.user.name} 
            currentOrganization={currentOrganization}
            userOrganizations={data.organizations}
            currentUserRole={currentUserRole}
            canManageRoles={canManageRoles}
            onSwitchOrganization={handleSwitchOrganization}
            onLogout={handleLogout}
            onOpenSettings={handleOpenSettings}
          />
          <main className="p-4 sm:p-6 lg:p-8">
            <Dashboard user={data.user} organization={currentOrganization} key={currentOrganization._id} showToast={showToast} />
          </main>
          {isSettingsModalOpen && canManageRoles && currentUserRole === Role.Admin && (
            <SettingsModal 
              isOpen={isSettingsModalOpen}
              onClose={handleCloseSettings}
              organization={currentOrganization}
              showToast={showToast}
            />
          )}
        </>
      ) : (
        path === '/pricing' 
          ? <PricingPage onLogin={handleLogin} />
          : <LandingPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;