
import React from 'react';
// Note: This component requires a ClerkProvider context to function correctly.
// The import is resolved by the importmap added in index.html.
import { PricingTable } from '@clerk/clerk-react'; 

interface PricingPageProps {
  onLogin: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onLogin }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm" aria-label="Main Navigation">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2" aria-label="Homepage">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-2xl font-bold">Detailer's AI Planner</span>
          </a>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-white transition font-medium">Home</a>
            <button onClick={onLogin} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition">
              Sign In
            </button>
          </div>
        </div>
      </header>
      <main className="py-20">
        <div className="container mx-auto px-6 text-center" style={{ maxWidth: '900px' }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4">
            Find the Perfect Plan for Your Business
          </h1>
          <p className="text-lg text-gray-300 mt-2 mb-12">Start your 7-day free trial. Cancel anytime.</p>
          
          {/* 
            This Clerk component will dynamically render the pricing plans 
            (e.g., Solo, Pro, Enterprise) configured in your Clerk Dashboard for B2B billing.
          */}
          <div className="text-left">
            <PricingTable forOrganizations />
          </div>

        </div>
      </main>
    </div>
  );
};

export default PricingPage;
