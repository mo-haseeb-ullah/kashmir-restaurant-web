import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, User as UserIcon, LogOut, Truck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getUserActiveOrder } from '../services/db';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!user) {
      setActiveOrder(null);
      return;
    }
    
    const checkOrder = () => {
      const order = getUserActiveOrder(user.id);
      setActiveOrder(order);
      
      if (order && order.estimatedDeliveryTime) {
        const diff = new Date(order.estimatedDeliveryTime) - new Date();
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          setTimeRemaining(`${mins} min`);
        } else {
          setTimeRemaining('Arriving');
        }
      }
    };
    
    checkOrder();
    const interval = setInterval(checkOrder, 30000);
    const handleDbUpdate = () => checkOrder();
    window.addEventListener('db_updated', handleDbUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('db_updated', handleDbUpdate);
    };
  }, [user]);

  return (
    <nav className="bg-[#111827] text-white sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-2 rounded-full text-[#111827]">
              <ChefHat size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-[#D4AF37] uppercase">Kashmir</h1>
              <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">Restaurant</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-widest uppercase">
            <Link to="/" className="hover:text-[#D4AF37] transition">Menu</Link>
            <Link to="/about" className="hover:text-[#D4AF37] transition">About Us</Link>
            <Link to="/contact" className="hover:text-[#D4AF37] transition">Contact</Link>
          </div>

          {/* Right Side: Tracker + Auth + Cart */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Active Order Tracker Widget */}
            {activeOrder && (
              <div className="hidden md:flex items-center bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-2 gap-3 cursor-help" title={`Order Status: ${activeOrder.status}`}>
                {activeOrder.status === 'New' || activeOrder.status === 'Cooking' ? (
                  <ChefHat size={18} className="text-[#D4AF37] animate-pulse" />
                ) : (
                  <Truck size={18} className="text-[#D4AF37] animate-bounce" />
                )}
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest leading-none mb-1">
                    {activeOrder.status}
                  </span>
                  <span className="text-xs font-bold text-white leading-none tracking-wider">
                    {timeRemaining}
                  </span>
                </div>
              </div>
            )}

            {/* Auth Dropdown / Button */}
            {user ? (
              <div className="relative group pb-4 pt-4 -mb-4 -mt-4">
                <button className="flex items-center gap-2 hover:text-[#D4AF37] transition font-bold text-sm tracking-widest uppercase">
                  <UserIcon size={18} />
                  <span className="hidden md:inline">{user?.name?.split(' ')[0] || 'USER'}</span>
                </button>
                <div className="absolute right-0 mt-4 w-56 bg-white text-[#111827] rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#111827] text-[#D4AF37] rounded-full flex items-center justify-center font-black text-xl mb-3">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <p className="font-bold text-sm uppercase tracking-widest">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{user?.phone || ''}</p>
                  </div>
                  <Link to="/profile" className="w-full text-center px-4 py-3 text-xs tracking-widest font-bold text-[#111827] hover:bg-gray-100 transition flex items-center justify-center gap-2 uppercase border-b border-gray-100">
                    <UserIcon size={16} /> Profile & History
                  </Link>
                  <button onClick={logout} className="w-full text-center px-4 py-4 text-xs tracking-widest font-bold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2 uppercase">
                    <LogOut size={16} /> Sign Out securely
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex font-bold text-sm tracking-widest uppercase hover:text-[#D4AF37] transition items-center gap-2"
              >
                <UserIcon size={18} /> Sign In
              </button>
            )}

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#D4AF37] hover:bg-[#c5a02e] text-[#111827] p-3 rounded-full font-bold flex items-center justify-center transition shadow-lg shadow-[#D4AF37]/20"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#991B1B] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#111827]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
