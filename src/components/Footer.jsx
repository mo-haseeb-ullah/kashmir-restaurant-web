import React from 'react';
import { Phone, MapPin, Clock, MessageCircle, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const WHATSAPP_NUMBER = "+923005400476"; 
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`;

  return (
    <footer id="contact" className="bg-luxury-card text-white pt-20 pb-10 border-t-4 border-luxury-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 inline-flex">
              <div className="bg-luxury-gold p-2 rounded-full text-luxury-bg">
                <ChefHat size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-widest text-luxury-gold uppercase">Kashmir</h1>
                <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">Restaurant</p>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed font-light">
              Experience the authentic taste of Pakistan with our premium Karahi, BBQ, and traditional breakfast dishes.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-luxury-gold text-sm font-bold tracking-[0.2em] uppercase mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="text-luxury-red mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-300 font-light">Chak 54MB, Khushab - Sakesar Road<br/>Khushab, Pakistan</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-luxury-red flex-shrink-0" size={20} />
                <span className="text-gray-300 font-light">{WHATSAPP_NUMBER}</span>
              </li>
              <li className="flex items-center gap-4">
                <Clock className="text-luxury-red flex-shrink-0" size={20} />
                <span className="text-gray-300 font-light">Open 24/7 for you</span>
              </li>
            </ul>
          </div>

          {/* Socials & Ordering */}
          <div>
            <h4 className="text-luxury-gold text-sm font-bold tracking-[0.2em] uppercase mb-6">Connect</h4>
            <div className="flex gap-4 mb-8">
              <a href="https://www.facebook.com/share/1B6FxabAe9/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-luxury-gold hover:text-luxury-bg px-5 py-2 rounded-full transition font-bold text-sm flex items-center justify-center">Facebook</a>
              <a href="https://vt.tiktok.com/ZSXXSm9tq/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-luxury-gold hover:text-luxury-bg px-5 py-2 rounded-full transition font-bold text-sm flex items-center justify-center">TikTok</a>
            </div>
            <a href={WHATSAPP_URL} className="bg-luxury-red hover:bg-luxury-red/80 text-white px-6 py-3 rounded-sm font-bold flex items-center justify-center gap-2 transition w-full uppercase tracking-widest text-sm">
              <MessageCircle size={18} />
              Order via WhatsApp
            </a>
          </div>

        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Kashmir Restaurant. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/admin" className="hover:text-luxury-gold">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
