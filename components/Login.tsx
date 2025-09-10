
import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 max-w-md w-full">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          Detailer's AI Planner
        </h1>
        <p className="text-gray-300 mb-8">
          Unlock insights and drive growth for your detailing business.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Sign In
        </button>
        <p className="text-xs text-gray-500 mt-6">
          (This is a simulated login for demonstration purposes)
        </p>
      </div>
    </div>
  );
};

export default Login;
