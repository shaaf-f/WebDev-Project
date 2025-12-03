import React, { useState } from 'react';
import { Link2, Eye, EyeOff, Facebook } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-300 font-inter">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6">
        <div className="flex items-center space-x-2 text-white font-semibold">
          <Link2 className="w-5 h-5" />
          <span>UCL FANTASY</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-center text-gray-400 mb-8">Login or create an account to start playing.</p>

          {/* Tabs */}
          <div className="flex bg-gray-700/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'login' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === 'signup' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
            >
              Log In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-sm text-gray-400">Or continue with</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center p-6">
        <p className="text-xs text-gray-500">
          © 2024 UCL Fantasy. All rights reserved.
          <a href="#" className="ml-2 text-gray-400 hover:text-gray-300">Terms of Service</a>
          <span className="mx-1">·</span>
          <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}