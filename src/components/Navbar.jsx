import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User as UserIcon, Truck, ChefHat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getUserActiveOrder } from '../services/db';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { cartCount, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setActiveOrder(null);
      return;
    }
    
    const checkOrder = async () => {
      const order = await getUserActiveOrder(user.id);
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

  const navLinks = [
    { name: "Menu", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // The navbar should always have a white background as requested.
  const textColorClass = "text-[#111827]";
  const primaryColorClass = "#D4AF37"; // Kashmir Gold

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white border-b border-[#111827] py-4 shadow-sm`}
    >
      <div className="max-w-[95%] mx-auto px-4 md:px-8 relative z-10">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 z-50">
            <div className="flex items-center gap-2">
              <ChefHat size={24} className="text-[#D4AF37]" />
              <span className="font-serif text-xl tracking-widest text-[#111827] leading-none uppercase font-black">
                Kashmir Restaurant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-end items-center gap-10 pr-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[11px] tracking-[0.2em] uppercase font-bold transition-colors hover:opacity-80 ${textColorClass}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex flex-shrink-0 items-center gap-6 z-50">
            {/* Active Order Widget */}
            {activeOrder && (
              <div className={`flex items-center border rounded-full px-4 py-2 gap-3 cursor-help ${isScrolled ? 'bg-red-50 border-red-200' : 'bg-black/50 border-white/20 backdrop-blur-md'}`}>
                <Truck size={18} className="text-red-500 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">
                    {activeOrder.status}
                  </span>
                  <span className={`text-xs font-bold leading-none tracking-wider ${textColorClass}`}>
                    {timeRemaining}
                  </span>
                </div>
              </div>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative group flex items-center">
                <button className={`${textColorClass} hover:opacity-80 transition`}>
                  <UserIcon size={22} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white text-[#111827] rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-xs tracking-widest font-bold hover:bg-gray-50 transition uppercase text-red-600">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className={`${textColorClass} hover:opacity-80 transition`}
              >
                <UserIcon size={22} />
              </button>
            )}

            {/* Cart Button matches requested style layout but functional */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-[#D4AF37] text-[#111827] px-6 py-[12px] text-[11px] tracking-[0.2em] uppercase font-black transition-all hover:brightness-110 flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              <span>Cart ({cartCount})</span>
            </button>
          </div>

          {/* Mobile Actions (Cart + Hamburger) */}
          <div className="lg:hidden flex items-center gap-4 z-50">
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative ${isMobileMenuOpen ? 'text-[#111827]' : textColorClass}`}
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            </button>
            <button
              className={`p-2 ${isMobileMenuOpen ? 'text-[#111827]' : textColorClass}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X strokeWidth={2} /> : <Menu strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-32 px-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-3xl font-serif transition-colors font-bold ${
                location.pathname === link.path
                  ? "text-[#D4AF37] italic"
                  : "text-[#111827]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {user && (
            <button
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
              className="text-3xl font-serif text-red-600 text-left font-bold"
            >
              Sign Out
            </button>
          )}
          {!user && (
            <button
              onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
              className="text-3xl font-serif text-[#111827] text-left font-bold"
            >
              Log In
            </button>
          )}

          <div className="w-8 h-px bg-[#111827] my-4" />
          
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
            className="w-full text-center bg-[#D4AF37] text-[#111827] py-5 text-[14px] tracking-widest uppercase font-black shadow-lg"
          >
            View Cart ({cartCount})
          </button>
        </div>
      )}
    </nav>
  );
}
