import React, { useState, useEffect } from 'react';
import { MessageCircle, ShoppingCart, Search as SearchIcon, X, Star, Utensils, ChefHat, Flame, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { listenToMenu } from '../services/db';

export default function Home() {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  
  // Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToMenu((data) => {
      setMenuItems(data);
    });
    return () => unsubscribe();
  }, []);

  const dynamicCategories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredMenu = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDirectAddToCart = (item) => {
    addToCart({
      ...item,
      id: `${item.id}-${Date.now()}`,
      quantity: 1
    });
    setIsCartOpen(true);
  };

  const handleSubmitReview = () => {
    if (reviewText.trim()) {
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewSubmitted(false);
        setReviewModalItem(null);
        setReviewText('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-800 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] bg-[#111827] overflow-hidden flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80" 
          alt="Premium Dining" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h2 className="text-[#D4AF37] text-sm font-bold tracking-[0.3em] uppercase mb-4">Taste the Tradition</h2>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight font-serif">
            Authentic <span className="text-[#991B1B]">Desi</span> Cuisine
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl mb-10 font-light">
            Serving Khushab's finest Karahi, Handi, and Breakfast dishes since the beginning.
          </p>
          <a href="#menu" className="bg-[#991B1B] hover:bg-[#7a1515] text-white px-8 py-4 rounded-sm font-bold text-lg inline-flex items-center gap-3 transition shadow-2xl uppercase tracking-widest">
            <Utensils size={20} />
            View Full Menu
          </a>
        </div>
      </div>

      {/* Success Story Section */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-[#D4AF37] transform -translate-x-4 translate-y-4 rounded-xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80" 
                alt="Chef cooking with fire" 
                className="relative z-10 w-full h-[400px] object-cover rounded-xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-[#991B1B] text-sm font-bold tracking-[0.3em] uppercase mb-4">Our Success Story | ہماری کہانی</h2>
              <h3 className="text-4xl font-black text-[#111827] font-serif mb-6 leading-tight">
                From a Small Kitchen to Khushab's Favorite
                <span className="block text-3xl mt-3 font-normal text-[#D4AF37]" dir="rtl">ایک چھوٹے سے کچن سے خوشاب کا پسندیدہ</span>
              </h3>
              
              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-gray-600 leading-relaxed text-lg mb-2">
                    Years ago, Kashmir Restaurant started with a simple goal: to serve the most authentic, flavorful Desi food on the Sakesar Road. What began as a humble roadside stop quickly became a famous destination for travelers and locals alike.
                  </p>
                  <p className="text-gray-500 leading-relaxed text-lg" dir="rtl">
                    برسوں پہلے، کشمیر ریسٹورنٹ کا آغاز ایک سادہ سے مقصد کے ساتھ ہوا: سکیسر روڈ پر سب سے مستند اور ذائقہ دار دیسی کھانا پیش کرنا۔ جو ایک عام سے روڈ سائیڈ اسٹاپ کے طور پر شروع ہوا، وہ جلد ہی مسافروں اور مقامی لوگوں کے لیے ایک مشہور مقام بن گیا۔
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600 leading-relaxed text-lg mb-2">
                    Today, our signature Karahi and rich traditional breakfasts bring people together from all over the region. Our secret? Never compromising on quality, using pure ingredients, and treating every guest like family.
                  </p>
                  <p className="text-gray-500 leading-relaxed text-lg" dir="rtl">
                    آج، ہماری مشہور کڑاہی اور روایتی ناشتہ پورے علاقے سے لوگوں کو ایک ساتھ لاتا ہے۔ ہمارا راز؟ معیار پر کبھی سمجھوتہ نہ کرنا، خالص اجزاء کا استعمال، اور ہر مہمان کے ساتھ خاندان کے فرد جیسا سلوک کرنا۔
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-[#111827] font-bold">
                  <div className="bg-[#D4AF37] w-12 h-1"></div>
                  The Kashmir Restaurant Family
                </div>
                <div className="flex items-center gap-4 text-[#D4AF37] font-bold" dir="rtl">
                  <div className="bg-[#111827] w-12 h-1"></div>
                  کشمیر ریسٹورنٹ فیملی
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Menu */}
      <main id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow bg-[#F5F5F0]">
        <div className="text-center mb-12">
          <h2 className="text-[#D4AF37] text-sm font-bold tracking-[0.3em] uppercase mb-2">Our Menu</h2>
          <h3 className="text-4xl font-black text-[#111827] font-serif">Culinary Excellence</h3>
          <div className="w-24 h-1 bg-[#991B1B] mx-auto mt-6 mb-10"></div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Karahi, Biryani, Sweets..." 
              className="w-full bg-white border-2 border-gray-100 rounded-full pl-12 pr-6 py-4 shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition text-lg font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="relative max-w-full overflow-hidden mb-10">
          <div 
            className="flex justify-start gap-3 overflow-x-auto pb-4 px-4 sm:px-6 snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {dynamicCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-start whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition uppercase tracking-wide border-2 ${
                activeCategory === cat 
                ? 'bg-[#111827] text-[#D4AF37] border-[#111827]' 
                : 'bg-transparent text-[#111827] border-gray-300 hover:border-[#111827]'
              }`}
            >
              {cat}
            </button>
          ))}
          </div>
        </div>

        {/* Menu Grid - Salt n Pepper Style */}
        <div className="bg-black pt-6 pb-20">
          <h2 className="text-white text-center font-serif text-2xl font-bold mb-8">Our Deals</h2>
          
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-black flex flex-col items-center group cursor-pointer pb-4">
                
                {/* Image */}
                <div className="w-full aspect-square overflow-hidden mb-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                  />
                </div>
                
                {/* Title */}
                <h4 className="text-white text-[11px] md:text-sm font-bold text-center leading-tight mb-2 px-1 line-clamp-2">
                  {item.name}
                </h4>
                
                {/* Price */}
                <div className="text-[#D4AF37] text-[10px] md:text-xs font-bold mb-3">
                  Rs {item.price}.00
                </div>
                
                {/* Add Button */}
                <button 
                  onClick={() => handleDirectAddToCart(item)}
                  className="bg-red-600 hover:bg-red-700 text-white w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-[2px] transition-colors"
                >
                  <Plus size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Modal */}
        {reviewModalItem && (
          <div className="fixed inset-0 bg-[#111827]/80 z-[100] backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#111827] text-white">
                <div>
                  <h3 className="text-xl font-black font-serif">{reviewModalItem.name}</h3>
                  <div className="flex items-center gap-1 text-[#D4AF37] mt-1">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{(4.0 + (reviewModalItem.id % 10) / 10).toFixed(1)} Rating</span>
                  </div>
                </div>
                <button onClick={() => setReviewModalItem(null)} className="hover:bg-red-500 p-2 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-gray-50">
                <h4 className="font-bold text-[#111827] uppercase tracking-widest text-xs">Customer Reviews</h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-[#111827]">Ali Khan</p>
                      <div className="flex text-[#D4AF37]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    </div>
                    <p className="text-sm text-gray-500">Absolutely amazing! The taste is perfectly authentic and reminds me of home.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-[#111827]">Sarah Ahmed</p>
                      <div className="flex text-[#D4AF37]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    </div>
                    <p className="text-sm text-gray-500">Very good portion size and packaging was neat. Will definitely order again.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white">
                <h4 className="font-bold text-[#111827] uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <MessageCircle size={16} className="text-[#D4AF37]" /> Write a Review
                </h4>
                {reviewSubmitted ? (
                  <div className="bg-green-50 text-green-600 p-4 rounded-xl font-bold text-sm text-center border border-green-200">
                    Thank you! Your review has been submitted for approval.
                  </div>
                ) : (
                  <>
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How was the food?"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] resize-none h-20 transition mb-3"
                    ></textarea>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={!reviewText.trim()}
                      className="w-full bg-[#111827] disabled:bg-gray-300 hover:bg-[#D4AF37] disabled:text-gray-500 hover:text-[#111827] text-white py-3 font-black uppercase tracking-widest text-xs rounded-xl transition"
                    >
                      Submit Review
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
