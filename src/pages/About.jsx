import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-800 flex flex-col">
      <SEO title="About Us" description="Learn about the history and legacy of Kashmir Restaurant in Khushab. Discover our commitment to authentic taste and traditional recipes." />
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[90vh] bg-white overflow-hidden flex items-center justify-center pt-32 pb-12 border-b border-gray-200">
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-black text-[#D4AF37] mb-1 uppercase tracking-widest font-serif">
            About Us
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4 font-serif" dir="rtl">
            ہمارے بارے میں
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-luxury-red text-sm font-bold tracking-[0.2em] uppercase mb-4">Our Story | ہماری کہانی</h2>
            <h3 className="text-3xl font-black text-luxury-card font-serif mb-2 leading-snug">
              A Legacy of Authentic Taste in Khushab
            </h3>
            <h3 className="text-2xl font-bold text-luxury-card font-serif mb-6 leading-snug" dir="rtl">
              خوشاب میں روایتی ذائقے کی میراث
            </h3>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              Located on the bustling Khushab - Sakesar Road, Kashmir Restaurant has been a cornerstone of traditional Pakistani dining for years. We pride ourselves on using original recipes, premium spices, and the freshest ingredients available.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 font-medium text-lg" dir="rtl">
              خوشاب سکیسر روڈ پر واقع، کشمیر ریسٹورنٹ سالوں سے روایتی پاکستانی کھانوں کا ایک اہم مرکز رہا ہے۔ ہمیں اپنی اصلی ترکیبوں، بہترین مسالوں اور تازہ ترین اجزاء کے استعمال پر فخر ہے۔
            </p>

            <p className="text-gray-600 leading-relaxed mb-4">
              From our famous slow-cooked Karahis to our rich, buttery breakfasts, every dish is crafted to deliver an unforgettable, mouth-watering experience that keeps our guests coming back.
            </p>
            <p className="text-gray-600 leading-relaxed font-medium text-lg" dir="rtl">
              ہماری مشہور کڑاہی سے لے کر مکھن سے بھرپور لذیذ ناشتے تک، ہر ڈش اس طرح تیار کی جاتی ہے کہ ایک ناقابل فراموش اور منہ میں پانی لانے والا تجربہ فراہم کرے جو ہمارے مہمانوں کو بار بار آنے پر مجبور کر دیتا ہے۔
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-luxury-gold transform translate-x-4 translate-y-4 rounded-sm"></div>
            <img 
              src="/ChickenKarahi.webp" 
              alt="Chicken Karahi" 
              className="relative z-10 w-full h-auto rounded-sm shadow-xl"
            />
          </div>
        </div>

        <div className="bg-luxury-card text-luxury-text rounded-sm p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-luxury-gold"></div>
          <h3 className="text-2xl font-serif mb-2 text-luxury-gold">"No Compromise on Quality"</h3>
          <h3 className="text-2xl font-serif mb-6 text-luxury-gold" dir="rtl">"معیار پر کوئی سمجھوتہ نہیں"</h3>
          <p className="text-gray-300 font-light italic text-lg max-w-2xl mx-auto mb-4">
            Our mission is simple: To serve the most delicious, hygienic, and authentic desi food in Khushab. We treat every customer like family.
          </p>
          <p className="text-gray-300 font-light text-xl max-w-2xl mx-auto" dir="rtl">
            ہمارا مقصد بہت سادہ ہے: خوشاب میں انتہائی لذیذ، صحت بخش اور مستند دیسی کھانا پیش کرنا۔ ہم اپنے ہر گاہک کو خاندان کی طرح سمجھتے ہیں۔
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
