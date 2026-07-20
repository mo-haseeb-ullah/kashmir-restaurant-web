import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Minus, Trash2, Send, ArrowLeft, ShoppingBag, CheckCircle2, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { addOrder } from '../services/db';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart, addToCart } = useCart();
  const { user, register, setIsAuthModalOpen } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutError, setCheckoutError] = useState('');
  const [orderType, setOrderType] = useState('Delivery');
  
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  
  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, phone: user.phone }));
    }
  }, [user]);

  const applyPromoCode = () => {
    const code = promoCodeInput.toUpperCase();
    if (code === 'WELCOME10') {
      const discountVal = Math.round(cartTotal * 0.1);
      setDiscount(discountVal);
      setPromoMessage('10% Discount Applied! (WELCOME10)');
    } else if (code === 'MEGADEAL') {
      setDiscount(200);
      setPromoMessage('Rs. 200 Discount Applied! (MEGADEAL)');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid Promo Code');
    }
  };

  // Calculate Tax & Final Total
  const taxRate = paymentMethod === 'card' ? 0.05 : 0.16;
  const taxableAmount = Math.max(0, cartTotal - discount);
  const taxAmount = Math.round(taxableAmount * taxRate);
  const finalTotal = taxableAmount + taxAmount;

  if (!isCartOpen) {
    if (isCheckingOut) setIsCheckingOut(false);
    if (isSuccess) setIsSuccess(false);
    return null;
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty! Please add some dishes.");
      return;
    }
    
    if (!formData.name || !formData.phone || (orderType === 'Delivery' && !formData.address)) {
      setCheckoutError(orderType === 'Delivery' ? "Please fill in all delivery details." : "Please provide your name and phone number.");
      return;
    }
    
    if (formData.phone.length < 10) {
      setCheckoutError("Please enter a valid phone number (min 10 digits).");
      return;
    }

    let finalUserId = user ? user.id : null;

    if (!user && createAccount) {
      if (!password || password.length < 6) {
        setCheckoutError("Please provide a password of at least 6 characters.");
        return;
      }
      try {
        setIsSubmitting(true);
        const newUser = await register(formData.name, formData.phone, password);
        finalUserId = newUser.id;
      } catch (err) {
        setIsSubmitting(false);
        setCheckoutError(err.message === 'Phone number already registered!' ? 'Phone number already registered! Please login instead.' : 'Failed to create account.');
        return;
      }
    }

    const orderData = {
      orderType,
      userId: finalUserId,
      customer: formData,
      paymentMethod,
      items: cartItems,
      subtotal: cartTotal,
      discount: discount,
      tax: taxAmount,
      total: finalTotal
    };

    try {
      setIsSubmitting(true);
      // Save to Database instantly
      await addOrder(orderData);
      
      clearCart();
      setIsCheckingOut(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#F5F5F0] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#111827] text-white shadow-md relative z-10">
          <div className="flex items-center gap-3">
            {isCheckingOut && !isSuccess ? (
              <button onClick={() => setIsCheckingOut(false)} className="hover:text-[#D4AF37] transition">
                <ArrowLeft size={24} />
              </button>
            ) : (
              <ShoppingBag className="text-[#D4AF37]" size={24} />
            )}
            <h2 className="text-xl font-bold font-serif tracking-widest uppercase text-white">
              {isSuccess ? "Order Confirmed" : isCheckingOut ? "Checkout" : "Your Cart"}
            </h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:text-[#991B1B] transition bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto">
          {isSuccess ? (
            /* SUCCESS SCREEN */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black text-[#111827] font-serif mb-4">Order Placed!</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your order has been securely sent to our kitchen. We are preparing it fresh for you right now!
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#111827] transition"
              >
                Close Cart
              </button>
            </div>
          ) : cartItems.length === 0 && !isCheckingOut ? (
            /* EMPTY CART */
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <p className="font-bold text-xl text-[#111827] mb-2 font-serif">Cart is Empty</p>
              <p className="text-sm text-center">Looks like you haven't added any Desi goodness yet.</p>
            </div>
          ) : (
            <>
              {!isCheckingOut ? (
                /* STEP 1: CART ITEMS */
                <div className="p-6 space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                      
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[#111827] text-sm leading-tight pr-2">{item.name}</h4>
                            <p className="text-[#991B1B] font-bold text-sm mt-1">Rs. {item.price}</p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-300 hover:text-[#991B1B] transition p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-gray-700 w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-[#111827]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-gray-700 w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-[#111827]">
                            Rs. {parseInt(item.price) * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Frequently Bought Together (Upsell) */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-[#111827] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <Plus size={16} className="text-[#D4AF37]" /> Frequently Bought Together
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&q=80" alt="Drink" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm text-[#111827]">Cold Drink (1.5L)</p>
                            <p className="text-xs font-bold text-[#991B1B]">Rs. 120</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToCart({id: 'addon-drink-1.5L', name: 'Cold Drink (1.5L)', price: '120', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&q=80'})}
                          className="bg-white border-2 border-gray-200 text-[#111827] hover:border-[#D4AF37] hover:bg-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-widest"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=100&q=80" alt="Raita" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm text-[#111827]">Fresh Zeera Raita</p>
                            <p className="text-xs font-bold text-[#991B1B]">Rs. 70</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToCart({id: 'addon-raita', name: 'Fresh Zeera Raita', price: '70', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=100&q=80'})}
                          className="bg-white border-2 border-gray-200 text-[#111827] hover:border-[#D4AF37] hover:bg-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-widest"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-6">
                  {/* STEP 2: CHECKOUT FORM (PREMIUM REDESIGN) */}
                  
                  {checkoutError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <p className="font-bold text-sm">{checkoutError}</p>
                    </div>
                  )}

                  <div className="bg-[#111827] text-white p-6 md:p-8 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#991B1B] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                    
                    <h3 className="font-black text-[#D4AF37] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <MapPin size={16} /> Order Details
                    </h3>

                    {/* ORDER TYPE TOGGLE */}
                    <div className="flex bg-gray-800 p-1 rounded-xl mb-6 relative z-10 shadow-inner border border-gray-700">
                      <button 
                        type="button"
                        onClick={() => setOrderType('Delivery')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${orderType === 'Delivery' ? 'bg-[#D4AF37] text-[#111827] shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                      >
                        🛵 Delivery
                      </button>
                      <button 
                        type="button"
                        onClick={() => setOrderType('Takeaway')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${orderType === 'Takeaway' ? 'bg-[#D4AF37] text-[#111827] shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                      >
                        🛍️ Pick-up
                      </button>
                    </div>
                    
                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5 relative z-10">
                      
                      {!user && (
                        <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl mb-4 text-xs text-gray-300 flex justify-between items-center">
                          <span>Sign in for faster checkout!</span>
                          <button 
                            type="button" 
                            onClick={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }} 
                            className="text-[#D4AF37] font-bold tracking-wider uppercase"
                          >
                            Login
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37]" />
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            readOnly={!!user}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className={`w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#D4AF37] text-sm text-white font-medium transition ${user ? 'opacity-70 cursor-not-allowed' : ''}`}
                            placeholder="e.g. John Doe"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37]" />
                          <input 
                            type="tel" 
                            required
                            value={formData.phone}
                            readOnly={!!user}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className={`w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#D4AF37] text-sm text-white font-medium transition ${user ? 'opacity-70 cursor-not-allowed' : ''}`}
                            placeholder="e.g. 0300 1234567"
                          />
                        </div>
                      </div>
                      
                      {!user && (
                        <div className="pt-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox"
                                checked={createAccount}
                                onChange={(e) => setCreateAccount(e.target.checked)}
                                className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-800 checked:bg-[#D4AF37] checked:border-[#D4AF37] transition cursor-pointer"
                              />
                              <CheckCircle2 size={14} className="absolute text-[#111827] opacity-0 peer-checked:opacity-100 transition pointer-events-none" strokeWidth={4} />
                            </div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition">Save my info for next time</span>
                          </label>
                          
                          {createAccount && (
                            <div className="mt-4 space-y-1 animate-[fadeIn_0.2s_ease-out]">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Create Password *</label>
                              <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37]" />
                                <input 
                                  type="password" 
                                  required={createAccount}
                                  value={password}
                                  onChange={e => setPassword(e.target.value)}
                                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#D4AF37] text-sm text-white font-medium transition"
                                  placeholder="Minimum 6 characters"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {orderType === 'Delivery' ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Complete Delivery Address</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-4 text-[#D4AF37]" />
                            <textarea 
                              required
                              rows="3"
                              value={formData.address}
                              onChange={e => setFormData({...formData, address: e.target.value})}
                              className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#D4AF37] text-sm text-white font-medium resize-none transition"
                              placeholder="House No, Street, Area, City"
                            ></textarea>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-5 rounded-xl text-center">
                          <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-1">Pick up your order from:</p>
                          <p className="text-white font-black text-xl font-serif">Kashmir Restaurant</p>
                          <p className="text-gray-400 text-sm mt-1">Main Bazaar, Khushab</p>
                        </div>
                      )}
                    </form>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100">
                     <h3 className="font-black text-[#111827] uppercase tracking-widest text-xs mb-4">Payment Method</h3>
                     <div className="flex gap-4 mb-8">
                       <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition flex flex-col items-center gap-2 ${paymentMethod === 'cash' ? 'border-[#111827] bg-gray-50 shadow-inner' : 'border-gray-100 hover:border-gray-200'}`}>
                         <input type="radio" name="payment" value="cash" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                         <span className={`font-black text-sm uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-[#111827]' : 'text-gray-400'}`}>Cash</span>
                         <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md">16% Tax</span>
                       </label>
                       <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition flex flex-col items-center gap-2 ${paymentMethod === 'card' ? 'border-[#111827] bg-gray-50 shadow-inner' : 'border-gray-100 hover:border-gray-200'}`}>
                         <input type="radio" name="payment" value="card" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                         <span className={`font-black text-sm uppercase tracking-widest ${paymentMethod === 'card' ? 'text-[#111827]' : 'text-gray-400'}`}>Card</span>
                         <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">5% Tax</span>
                       </label>
                     </div>

                     <h3 className="font-black text-[#111827] uppercase tracking-widest text-xs mb-4">Promo Code</h3>
                     <div className="flex gap-2 mb-2">
                       <input 
                         type="text" 
                         value={promoCodeInput}
                         onChange={e => setPromoCodeInput(e.target.value)}
                         className="flex-grow border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] uppercase font-bold"
                         placeholder="Enter code (e.g. WELCOME10)"
                       />
                       <button 
                         type="button"
                         onClick={applyPromoCode}
                         className="bg-[#111827] text-white px-6 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition"
                       >
                         Apply
                       </button>
                     </div>
                     {promoMessage && (
                       <p className={`text-xs font-bold mb-6 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{promoMessage}</p>
                     )}

                     <h3 className="font-black text-[#111827] uppercase tracking-widest text-xs mb-4">Order Summary</h3>
                     <div className="space-y-4">
                       {cartItems.map(item => (
                         <div key={item.id} className="flex justify-between text-sm font-medium">
                           <span className="text-gray-500">{item.quantity}x <span className="text-[#111827]">{item.name}</span></span>
                           <span className="font-bold text-[#111827]">Rs. {item.quantity * item.price}</span>
                         </div>
                       ))}
                       <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between text-sm font-medium mt-2">
                         <span className="text-gray-500">Subtotal</span>
                         <span className="font-bold text-[#111827]">Rs. {cartTotal}</span>
                       </div>
                       {discount > 0 && (
                         <div className="flex justify-between text-sm font-medium">
                           <span className="text-green-600 font-bold">Discount</span>
                           <span className="font-bold text-green-600">- Rs. {discount}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-sm font-medium">
                         <span className="text-gray-500">Tax ({paymentMethod === 'card' ? '5%' : '16%'})</span>
                         <span className="font-bold text-red-500">+ Rs. {taxAmount}</span>
                       </div>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {cartItems.length > 0 && !isSuccess && (
          <div className="border-t border-gray-200 bg-white p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Amount</p>
                <p className="text-3xl font-black text-[#111827] font-serif leading-none">Rs. {finalTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium mb-1">Includes Rs. {taxAmount} Tax</p>
                <p className="text-xs font-bold text-green-600">Free Delivery</p>
              </div>
            </div>

            {!isCheckingOut ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-[#111827] font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] md:text-sm"
                >
                  Continue Menu
                </button>
                <button 
                  onClick={() => setIsCheckingOut(true)}
                  className="flex-[1.5] bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] md:text-sm shadow-xl"
                >
                  Checkout
                </button>
              </div>
            ) : (
              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white'} font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {isSubmitting ? 'Processing Order...' : 'Confirm Order Securely'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
