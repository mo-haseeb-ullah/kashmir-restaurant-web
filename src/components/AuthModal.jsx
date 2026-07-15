import React, { useState } from 'react';
import { X, User, Lock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // JS Validation
    if (!formData.phone || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!isLoginMode && !formData.name) {
      setError('Please provide your name for registration.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(formData.phone, formData.password);
      } else {
        await register(formData.name, formData.phone, formData.password);
      }
      setIsAuthModalOpen(false);
      setFormData({ name: '', phone: '', password: '' }); // Reset
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#111827]/80 z-[100] backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-[#111827] text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black font-serif tracking-widest text-[#D4AF37] uppercase">
              {isLoginMode ? 'Welcome Back' : 'Join the Family'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {isLoginMode ? 'Login to track your active orders.' : 'Create an account for faster checkouts.'}
            </p>
          </div>
          <button onClick={() => setIsAuthModalOpen(false)} className="bg-gray-800 hover:bg-red-500 hover:text-white transition p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 bg-gray-50 flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-bold text-[#111827]" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-bold text-[#111827]" 
                  placeholder="0300 1234567" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-bold text-[#111827]" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white py-4 rounded-xl font-bold uppercase tracking-widest transition shadow-xl mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In Securely' : 'Create Account')}
            </button>
            
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="ml-2 font-bold text-[#D4AF37] hover:text-[#111827] transition underline"
              >
                {isLoginMode ? "Sign Up Now" : "Login Here"}
              </button>
            </p>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
