import React, { useState, useEffect } from 'react';
import { MessageCircle, ShoppingCart, Search as SearchIcon, X, Star, Utensils, ChefHat, Flame, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { listenToMenu } from '../services/db';

const STANDARD_ADDONS = [
  { id: 'add-1', name: 'Khameeri Roti', price: 65, image: 'https://images.unsplash.com/photo-1626082895617-2c6afda2c046?w=100&q=80' },
  { id: 'add-2', name: 'Roghni Naan', price: 95, image: 'https://images.unsplash.com/photo-1626082895617-2c6afda2c046?w=100&q=80' },
  { id: 'add-3', name: 'Sada Naan', price: 65, image: 'https://images.unsplash.com/photo-1626082895617-2c6afda2c046?w=100&q=80' },
  { id: 'add-4', name: 'Pudina Raita', price: 175, image: 'https://images.unsplash.com/photo-1626201314643-d9d1502dc87e?w=100&q=80' },
  { id: 'add-5', name: 'Fresh Salad', price: 275, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&q=80' },
];

export default function Home() {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Variant Modal State
  const [variantModalItem, setVariantModalItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [variantQuantity, setVariantQuantity] = useState(1);

  useEffect(() => {
    const unsubscribe = listenToMenu((data) => {
      setMenuItems(data);
    });
    return () => unsubscribe();
  }, []);

  const uniqueCategories = [];
  const seenCategories = new Set();
  
  menuItems.forEach(item => {
    const rawCat = item.category || '';
    const normalized = rawCat.trim().toLowerCase();
    if (normalized !== '' && !seenCategories.has(normalized)) {
      seenCategories.add(normalized);
      uniqueCategories.push(rawCat.trim()); // Keep original casing of first found
    }
  });
  
  const dynamicCategories = ['All', ...uniqueCategories];

  const filteredMenu = menuItems.filter(item => {
    const itemCatNormalized = (item.category || '').trim().toLowerCase();
    const activeCatNormalized = activeCategory.trim().toLowerCase();
    
    const matchesCategory = activeCategory === 'All' || itemCatNormalized === activeCatNormalized;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDirectAddToCart = (item) => {
    if (item.variants && item.variants.length > 0) {
      setVariantModalItem(item);
      setSelectedVariant(item.variants[0]); // Default to first variant
      setSelectedAddons([]); // Clear previous addons
      setVariantQuantity(1); // Reset quantity
      return;
    }
    
    addToCart({
      ...item,
      cartItemId: item.id.toString(), // Base item ID for grouping
      quantity: 1
    });
    showToast(`Added ${item.name} to cart!`);
  };

  const handleAddVariantToCart = () => {
    if (!variantModalItem || !selectedVariant) return;
    
    // Calculate final price based on multiplier
    const finalPrice = Math.round(parseInt(variantModalItem.price) * selectedVariant.priceMultiplier);
    
    // Add main item
    addToCart({
      ...variantModalItem,
      id: `${variantModalItem.id}-${selectedVariant.label}`, 
      name: `${variantModalItem.name} (${selectedVariant.label})`,
      price: finalPrice.toString(),
      quantity: variantQuantity
    });

    // Add selected addons
    selectedAddons.forEach(addon => {
      addToCart({
        id: addon.id,
        name: addon.name,
        price: addon.price.toString(),
        quantity: variantQuantity,
        cartItemId: addon.id,
        image: addon.image
      });
    });
    
    setVariantModalItem(null);
    setSelectedVariant(null);
    setSelectedAddons([]);
    setVariantQuantity(1);
    showToast(`Added ${variantModalItem.name} to cart!`);
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
      <SEO title="Home" />
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-[#111827] px-6 py-3 rounded-full font-bold shadow-xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Hero Section */}
      <div 
        className="relative min-h-[90vh] overflow-hidden flex items-center justify-center pt-24 pb-12 border-b border-gray-200"
        style={{ backgroundImage: 'url(/ChickenKarahi.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mt-12 md:mt-0">
          <h2 className="text-[#D4AF37] text-sm font-bold tracking-[0.3em] uppercase mb-4 shadow-black drop-shadow-md">Taste the Tradition</h2>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight dir-rtl font-urdu drop-shadow-lg">
            لاجواب <span className="text-[#D4AF37]">دیسی</span> پکوان
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed dir-rtl font-urdu drop-shadow-md">
            خوشاب کی بہترین کڑاہی، ہانڈی، اور ناشتے کے پکوان کی شاندار پیشکش۔
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                const menuElement = document.getElementById('menu-section');
                if (menuElement) {
                  menuElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-red-600 text-white px-8 py-4 rounded-none font-bold tracking-widest text-sm uppercase hover:bg-red-700 transition flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center"
            >
              <Utensils size={18} />
              View Full Menu
            </button>
          </div>
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
                    برسوں پہلے، کشمیر ریسٹورنٹ کا آغاز ایک سادہ سے مقصد کے ساتھ ہوا: سکیسر روڈ پر سب سے خالص اور ذائقہ دار دیسی کھانا پیش کرنا۔ جو ایک عام سے روڈ سائیڈ اسٹاپ کے طور پر شروع ہوا، وہ جلد ہی مسافروں اور مقامی لوگوں کے لیے ایک مشہور مقام بن گیا۔
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
      <main id="menu" className="w-full flex-grow pb-20">
        
        {/* Header & Search */}
        <div className="text-center pt-10 pb-6 px-4">
          <h2 className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-1">Our Menu</h2>
          <h3 className="text-3xl font-black text-[#111827] font-serif">Culinary Excellence</h3>
          <div className="w-16 h-1 bg-[#991B1B] mx-auto mt-4 mb-8"></div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative px-2">
            <SearchIcon size={20} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..." 
              className="w-full bg-white text-[#111827] border border-gray-200 rounded-full pl-12 pr-6 py-3 focus:outline-none focus:border-[#D4AF37] transition text-sm font-medium placeholder-gray-400 shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="w-full overflow-hidden mb-6">
          <div 
            className="flex justify-start gap-3 overflow-x-auto pb-4 px-4 snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {dynamicCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-bold text-xs transition tracking-wide border ${
                activeCategory === cat 
                ? 'bg-[#991B1B] text-white border-[#991B1B]' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
          </div>
        </div>

        {/* Menu Grid - Luxury Style */}
        <div className="w-full px-2">
          <h2 className="text-[#111827] text-center font-serif text-2xl font-bold mb-6">Our Deals</h2>
          
          {/* We use Flexbox to guarantee 2 boxes per row on mobile, up to 5 on desktop */}
          <div className="flex flex-wrap max-w-[1400px] mx-auto px-1">
            {filteredMenu.map(item => (
              <div key={item.id} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 p-2">
                <div 
                  className="bg-white group h-full border border-gray-200 shadow-sm rounded-xl transition-all relative overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  
                  {/* Content below image */}
                  <div className="p-3 pb-4 flex flex-col flex-grow text-left relative">
                    <h4 className="text-[#111827] text-sm md:text-base font-bold leading-tight mb-1 line-clamp-2">
                      {item.name}
                    </h4>
                    <div className="text-gray-600 text-xs md:text-sm font-medium mb-1">
                      from Rs. {item.price}
                    </div>
                  </div>
                  
                  {/* Circular Add Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDirectAddToCart(item); }}
                    className="absolute bottom-3 right-3 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50 transition text-[#111827]"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
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
                      <p className="font-bold text-sm text-[#111827]">Fatima S.</p>
                      <div className="flex text-[#D4AF37]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} className="text-gray-200" fill="currentColor"/></div>
                    </div>
                    <p className="text-sm text-gray-500">Good portion sizes and well packaged. Arrived piping hot.</p>
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
        {/* Variant Selection Modal */}
        {variantModalItem && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden relative flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] animate-[slideUp_0.3s_ease-out]">
              
              {/* Image & Close Button */}
              <div className="relative h-56 shrink-0 bg-gray-100">
                <img 
                  src={variantModalItem.image} 
                  alt={variantModalItem.name} 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setVariantModalItem(null)} 
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-800 p-2 rounded-full shadow-sm hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto bg-gray-50 pb-24">
                
                {/* Title & Desc */}
                <div className="bg-white p-5 mb-2">
                  <h3 className="text-2xl font-black text-[#111827] mb-1">
                    {variantModalItem.name}
                  </h3>
                  <p className="text-[#111827] font-bold text-sm mb-2">
                    from Rs. {variantModalItem.price}.00
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {variantModalItem.desc}
                  </p>
                </div>

                {/* Variations */}
                <div className="bg-white mb-2">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-[#111827] text-lg">Variation</h4>
                      <p className="text-xs text-gray-500">Select 1</p>
                    </div>
                    <span className="bg-[#111827] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Required</span>
                  </div>
                  <div className="px-4">
                    {variantModalItem.variants.map((variant, idx) => {
                      const variantPrice = Math.round(parseInt(variantModalItem.price) * variant.priceMultiplier);
                      const isSelected = selectedVariant?.label === variant.label;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedVariant(variant)}
                          className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 cursor-pointer"
                        >
                          <span className="font-bold text-gray-700">{variant.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Rs. {variantPrice}.00</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#D4AF37]' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frequently Bought Together */}
                <div className="bg-white">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-[#111827] text-lg">Frequently bought together</h4>
                      <p className="text-xs text-gray-500">Other customers also ordered these</p>
                    </div>
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Optional</span>
                  </div>
                  <div className="px-4">
                    {STANDARD_ADDONS.map((addon) => {
                      const isSelected = selectedAddons.find(a => a.id === addon.id);
                      return (
                        <div 
                          key={addon.id} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                            } else {
                              setSelectedAddons(prev => [...prev, addon]);
                            }
                          }}
                          className="flex items-center py-4 border-b border-gray-100 last:border-0 cursor-pointer"
                        >
                          <img src={addon.image} alt={addon.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
                          <span className="font-bold text-gray-700 ml-3 flex-grow">{addon.name}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm text-gray-600">+Rs. {addon.price}.00</span>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-300'}`}>
                              {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Sticky Bottom Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex items-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4 px-2">
                  <button 
                    onClick={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg">{variantQuantity}</span>
                  <button 
                    onClick={() => setVariantQuantity(variantQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddVariantToCart}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#c5a02e] text-[#111827] py-3.5 rounded-xl font-bold transition shadow-md flex justify-center items-center"
                >
                  Add to cart
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
