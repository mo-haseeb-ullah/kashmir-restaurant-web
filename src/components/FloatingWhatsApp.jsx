import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function FloatingWhatsApp() {
  const location = useLocation();
  if (location.pathname === '/admin') return null;

  const phoneNumber = "923005400476";
  const message = "Hello Kashmir Restaurant! I have a question about my order.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-16 bg-white text-[#111827] text-xs font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Chat with us!
      </span>
      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-75"></div>
    </a>
  );
}
