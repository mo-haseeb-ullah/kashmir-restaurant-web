import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, User as UserIcon, LogOut, Truck, Clock, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getUserActiveOrder } from '../services/db';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <>
      <nav className="fixed w-full z-50 transition-all duration-300 bg-luxury-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Mobile Left: Hamburger */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-luxury-text hover:text-luxury-gold transition p-1 -ml-1"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Desktop Left: Logo */}
            <Link to="/" className="hidden md:flex items-center gap-3">
              <div className="bg-luxury-gold p-2 rounded-full text-luxury-bg">
                <ChefHat size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-widest text-luxury-text uppercase">Kashmir</h1>
                <p className="text-xs tracking-[0.2em] text-luxury-gold uppercase">Restaurant</p>
              </div>
            </Link>

            {/* Mobile Center: Logo */}
            <Link to="/" className="md:hidden flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl font-bold text-luxury-text font-serif tracking-wide">Kashmir</h1>
              <div className="w-16 h-[2px] bg-luxury-gold mt-0.5"></div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-widest uppercase text-luxury-text">
              <Link to="/" className="hover:text-luxury-gold transition">Menu</Link>
              <Link to="/about" className="hover:text-luxury-gold transition">About Us</Link>
              <Link to="/contact" className="hover:text-luxury-gold transition">Contact</Link>
            </div>

            {/* Right Side: Auth + Cart */}
            <div className="flex items-center gap-3 md:gap-6">
              
              {/* Active Order Tracker Widget (Desktop) */}
              {activeOrder && (
                <div className="hidden md:flex items-center bg-luxury-red/20 border border-luxury-red/50 rounded-full px-4 py-2 gap-3 cursor-help">
                  <Truck size={18} className="text-luxury-gold animate-bounce" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-luxury-gold uppercase tracking-widest leading-none mb-1">
                      {activeOrder.status}
                    </span>
                    <span className="text-xs font-bold text-luxury-text leading-none tracking-wider">
                      {timeRemaining}
                    </span>
                  </div>
                </div>
              )}

              {/* Auth Button/Icon */}
              {user ? (
                <div className="relative group flex items-center">
                  <button className="text-luxury-text hover:text-luxury-gold transition">
                    <UserIcon size={22} className="md:w-5 md:h-5" />
                  </button>
                  {/* Dropdown for Desktop */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-luxury-card text-luxury-text rounded-lg shadow-xl border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden hidden md:block">
                    <button onClick={logout} className="w-full text-left px-4 py-3 text-xs tracking-widest font-bold hover:bg-gray-800 transition uppercase text-luxury-red">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-luxury-text hover:text-luxury-gold transition"
                >
                  <UserIcon size={22} className="md:w-5 md:h-5" />
                </button>
              )}

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-luxury-text hover:text-luxury-gold transition flex items-center justify-center p-1"
              >
                <ShoppingCart size={22} className="md:w-6 md:h-6" />
                <span className="absolute -top-1 -right-1 bg-luxury-red text-luxury-text text-[10px] w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-[#111827] border-r border-gray-900 shadow-2xl flex flex-col p-6 animate-slideInLeft">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-800">
              <div className="bg-[#D4AF37] p-2 rounded-full text-[#111827]">
                <ChefHat size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-widest text-white uppercase leading-none">Kashmir</h1>
                <p className="text-[10px] tracking-[0.2em] text-red-600 uppercase mt-1">Restaurant</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 text-sm font-bold tracking-widest uppercase">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-red-600 transition flex items-center gap-4">
                Menu
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-red-600 transition flex items-center gap-4">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-red-600 transition flex items-center gap-4">
                Contact
              </Link>
              
              {user && (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-red-600 transition flex items-center gap-4 pt-6 border-t border-gray-800">
                  Profile & Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
