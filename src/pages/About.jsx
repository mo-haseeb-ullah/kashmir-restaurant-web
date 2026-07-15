import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-800 flex flex-col pt-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-luxury-bg overflow-hidden flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1600&q=80" 
          alt="Restaurant Ambiance" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-black text-luxury-gold mb-1 uppercase tracking-widest font-serif">
            About Us
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-luxury-text mb-4 font-serif" dir="rtl">
            ہمارے بارے میں
          </h2>
          <div className="w-16 h-1 bg-luxury-red mx-auto"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-luxury-red text-sm font-bold tracking-[0.2em] uppercase mb-4">Our Story</h2>
            <h3 className="text-3xl font-black text-luxury-card font-serif mb-6 leading-snug">
              A Legacy of Authentic Taste in Khushab
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Located on the bustling Khushab - Sakesar Road, Kashmir Restaurant has been a cornerstone of traditional Pakistani dining for years. We pride ourselves on using original recipes, premium spices, and the freshest ingredients available.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From our famous slow-cooked Karahis to our rich, buttery breakfasts, every dish is crafted to deliver an unforgettable, mouth-watering experience that keeps our guests coming back.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-luxury-gold transform translate-x-4 translate-y-4 rounded-sm"></div>
            <img 
              src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80" 
              alt="Our Food" 
              className="relative z-10 w-full h-auto rounded-sm shadow-xl"
            />
          </div>
        </div>

        <div className="bg-luxury-card text-luxury-text rounded-sm p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-luxury-gold"></div>
          <h3 className="text-2xl font-serif mb-4 text-luxury-gold">"No Compromise on Quality"</h3>
          <p className="text-gray-300 font-light italic text-lg max-w-2xl mx-auto">
            Our mission is simple: To serve the most delicious, hygienic, and authentic desi food in Khushab. We treat every customer like family.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
