import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/db';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShoppingBag, Clock, CheckCircle2, ChevronRight, User as UserIcon, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const fetchOrders = async () => {
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    };
    fetchOrders();
  }, [user, navigate]);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart({ ...item, id: `${item.id}-${Date.now()}` });
    });
    setIsCartOpen(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-red-100 text-red-600 border-red-200';
      case 'Cooking': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Out for Delivery': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-600 border-green-200';
      case 'Cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-800 flex flex-col">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="bg-[#111827] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-[#D4AF37] text-[#111827] rounded-2xl flex items-center justify-center font-black text-4xl shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white font-serif uppercase tracking-widest">{user.name}</h1>
              <p className="text-gray-400 mt-1 font-medium">{user.phone}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#111827] mb-6 uppercase tracking-widest">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-[#111827] mb-2">No orders yet</h3>
            <p className="text-gray-500">Looks like you haven't tasted our delicious menu yet.</p>
            <button onClick={() => navigate('/')} className="mt-6 bg-[#D4AF37] text-[#111827] px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#c5a02e] transition">
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between hover:shadow-md transition">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      {new Date(order.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs font-bold text-gray-300">ID: #{order.orderId || order.id}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm font-medium text-gray-600">
                        <span className="w-6 text-gray-400">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-lg font-black text-[#111827]">Rs. {order.total}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</p>
                      <p className="text-sm font-bold text-gray-600 capitalize">{order.paymentMethod || 'Cash'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-end gap-3 md:w-48 shrink-0">
                  <button 
                    onClick={() => handleReorder(order)}
                    className="w-full bg-[#111827] hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw size={14} /> Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
