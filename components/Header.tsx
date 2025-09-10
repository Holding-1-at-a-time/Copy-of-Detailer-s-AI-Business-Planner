

import React from 'react';
import { Id } from '../convex/_generated/dataModel';
import { Organization, Role } from '../types';

interface HeaderProps {
  userName: string;
  currentOrganization: Organization;
  userOrganizations: Organization[];
  currentUserRole: Role | null;
  canManageRoles: boolean;
  onSwitchOrganization: (orgId: Id<"organizations">) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, currentOrganization, userOrganizations, currentUserRole, canManageRoles, onSwitchOrganization, onLogout, onOpenSettings }) => {

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-cyan-500/20 p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {userOrganizations.length > 1 ? (
             <select
                value={currentOrganization._id}
                onChange={(e) => onSwitchOrganization(e.target.value as Id<"organizations">)}
                className="text-xl font-bold text-white bg-gray-800/0 border-none focus:ring-0 focus:outline-none appearance-none"
                aria-label="Switch Organization"
             >
                {userOrganizations.map(org => (
                    <option key={org._id} value={org._id} className="bg-gray-800 font-bold">
                        {org.name}
                    </option>
                ))}
             </select>
          ) : (
            <span className="text-xl font-bold text-white">{currentOrganization.name}</span>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-gray-300 hidden sm:block">Welcome, {userName}</span>
          {currentUserRole === Role.Admin && canManageRoles && (
            <button onClick={onOpenSettings} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Organization Settings" title="Organization Settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
          )}
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;