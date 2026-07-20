import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

export default function Contact() {
  const WHATSAPP_NUMBER = "+923005400476"; 
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`;

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message! (This is a demo, please use WhatsApp for real orders)");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-800 flex flex-col">
      <SEO title="Contact" description="Get in touch with Kashmir Restaurant on Khushab - Sakesar Road. Call us or order via WhatsApp for delicious authentic desi food." preloadImage="/pexels-photo-9738992.avif" />
      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative min-h-[90vh] overflow-hidden flex items-center justify-center pt-32 pb-12 border-b border-gray-200"
        style={{ backgroundImage: 'url(/pexels-photo-9738992.avif)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-black text-[#D4AF37] mb-1 uppercase tracking-widest font-serif">
            Get in Touch
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-serif" dir="rtl">
            ہم سے رابطہ کریں
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details */}
          <div>
            <h2 className="text-luxury-red text-sm font-bold tracking-[0.2em] uppercase mb-4">Visit Us</h2>
            <h3 className="text-4xl font-black text-luxury-card font-serif mb-8">We are here for you</h3>
            <p className="text-gray-600 leading-relaxed mb-10">
              Whether you want to place a large catering order, ask about our menu, or simply drop by for the best Karahi in Khushab, we'd love to hear from you.
            </p>

            <div className="flex flex-col gap-8 mb-12">
              <div className="flex items-start gap-6">
                <div className="bg-luxury-card text-luxury-gold p-4 rounded-xl shadow-md">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-luxury-card mb-1 font-serif">Location</h4>
                  <p className="text-gray-600">Chak 54MB, Khushab - Sakesar Road<br/>Khushab, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-luxury-card text-luxury-gold p-4 rounded-xl shadow-md">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-luxury-card mb-1 font-serif">Phone & WhatsApp</h4>
                  <p className="text-gray-600">{WHATSAPP_NUMBER}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-luxury-card text-luxury-gold p-4 rounded-xl shadow-md">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-luxury-card mb-1 font-serif">Working Hours</h4>
                  <p className="text-gray-600">Monday - Sunday<br/>Open 24/7</p>
                </div>
              </div>
            </div>

            <a href={WHATSAPP_URL} className="bg-[#25D366] hover:bg-[#1fae54] text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3 transition shadow-xl uppercase tracking-widest w-full justify-center">
              <MessageCircle size={24} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="text-3xl font-serif font-black text-[#111827] mb-8">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 uppercase tracking-widest mt-6"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
