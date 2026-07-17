import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Search, Bell, Clock, CheckCircle2, ChevronRight, CookingPot, ArrowLeft, LayoutDashboard, UtensilsCrossed, Plus, Edit2, Trash2, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { listenToOrders, updateOrderStatus, listenToMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/db';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // UI States
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'menu'
  const [activeOrderTab, setActiveOrderTab] = useState('New'); // New, Preparing, Delivered
  
  // Edit/Add Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: '', price: '', image: '', desc: '' });
  
  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Error state for login
  const [loginError, setLoginError] = useState('');

  const previousOrderIds = useRef(new Set());
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    if (isLoggedIn) {
      const unsubOrders = listenToOrders(data => {
        const currentIds = new Set(data.map(o => o.id));
        
        if (previousOrderIds.current.size > 0) {
          const newOrders = data.filter(o => !previousOrderIds.current.has(o.id));
          if (newOrders.length > 0) {
            notificationSound.current.play().catch(e => console.log('Audio play failed', e));
            const newest = newOrders[0];
            const name = newest.customer?.name || 'a customer';
            showToast(`🔔 New order received from ${name}!`);
          }
        }
        
        previousOrderIds.current = currentIds;
        setOrders(data);
      });
      const unsubMenu = listenToMenu(data => setMenuItems(data));
      return () => { unsubOrders(); unsubMenu(); };
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!password) {
      setLoginError('Please enter a password.');
      return;
    }
    
    if (password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Incorrect password! Access denied.');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setMenuForm({ name: '', category: '', price: '', image: '', desc: '' });
    setIsMenuModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setMenuForm({ name: item.name, category: item.category, price: item.price, image: item.image, desc: item.desc });
    setIsMenuModalOpen(true);
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMenuSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!menuForm.name || !menuForm.category || !menuForm.price || !menuForm.image || !menuForm.desc) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, menuForm);
        showToast(`Successfully updated "${menuForm.name}"!`);
      } else {
        await addMenuItem(menuForm);
        showToast(`Successfully added "${menuForm.name}" to the menu!`);
      }
      setIsMenuModalOpen(false);
    } catch (err) {
      console.error("Menu save error:", err);
      showToast("Failed to save menu item. Please try again later.", "error");
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMenuItem(itemToDelete.id);
      showToast(`"${itemToDelete.name}" was removed from the menu.`);
    } catch (err) {
      console.error("Delete menu item error:", err);
      showToast("Failed to delete item. Please try again later.", "error");
    } finally {
      setItemToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-red-100 text-red-600 border-red-200';
      case 'Preparing': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Delivered': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#991B1B] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-[#D4AF37] p-4 rounded-full shadow-lg">
              <ChefHat size={40} className="text-[#111827]" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-center text-white mb-2 font-serif tracking-widest uppercase">Admin Portal</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Secure access required</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Master Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-600 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition font-mono tracking-widest text-center"
                placeholder="••••••••"
              />
            </div>
            
            {loginError && (
              <div className="text-red-400 text-sm font-bold text-center bg-red-900/20 py-2 rounded-lg border border-red-500/30">
                {loginError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-[#D4AF37] hover:bg-[#c5a02e] text-[#111827] font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] uppercase tracking-[0.2em]"
            >
              Unlock Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => o.status === activeOrderTab);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex font-sans text-gray-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#111827] text-white hidden md:flex flex-col shadow-2xl z-20 fixed h-full">
        <div className="p-6 flex items-center gap-4 border-b border-gray-800">
          <div className="bg-[#D4AF37] p-2 rounded-full text-[#111827]">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-[#D4AF37] uppercase font-serif">Kashmir</h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">Live CMS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setAdminSection('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold tracking-widest uppercase text-xs ${adminSection === 'orders' ? 'bg-[#D4AF37] text-[#111827]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Live Orders
          </button>
          <button 
            onClick={() => setAdminSection('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold tracking-widest uppercase text-xs ${adminSection === 'menu' ? 'bg-[#D4AF37] text-[#111827]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <UtensilsCrossed size={18} /> Menu Management
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-red-600 text-white transition font-bold tracking-widest uppercase text-xs">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-black font-serif text-[#111827]">
            {adminSection === 'orders' ? 'Live Order Dashboard' : 'Menu Management CMS'}
          </h2>
          <Link to="/" target="_blank" className="text-sm font-bold text-gray-500 hover:text-[#D4AF37] transition flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg">
            View Live Website <ChevronRight size={16}/>
          </Link>
        </header>

        <div className="p-8">
          
          {/* SECTION: LIVE ORDERS */}
          {adminSection === 'orders' && (
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <h3 className="text-3xl font-black text-[#111827] font-serif">{orders.length}</h3>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-full text-gray-600"><CheckCircle2 size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">New Orders</p>
                    <h3 className="text-3xl font-black text-red-600 font-serif">{orders.filter(o=>o.status==='New').length}</h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full text-red-600 animate-pulse"><Bell size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Preparing</p>
                    <h3 className="text-3xl font-black text-orange-600 font-serif">{orders.filter(o=>o.status==='Preparing').length}</h3>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600"><CookingPot size={24}/></div>
                </div>
                <div className="bg-[#111827] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Today</p>
                   <h3 className="text-3xl font-black text-[#D4AF37] font-serif">
                     Rs. {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                   </h3>
                </div>
              </div>

              {/* Orders Kanban/List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {['New', 'Preparing', 'Delivered'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveOrderTab(tab)}
                      className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition border-b-2 ${
                        activeOrderTab === tab ? 'border-[#D4AF37] text-[#111827] bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab} Orders ({orders.filter(o => o.status === tab).length})
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-gray-50/50 min-h-[500px]">
                  {filteredOrders.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <ChefHat size={48} className="mb-4 text-gray-200" />
                      <p className="text-lg font-serif">No {activeOrderTab} orders at the moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</span>
                              <h4 className="font-bold text-[#111827] font-serif">#{order.orderId || order.id}</h4>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>{order.status}</span>
                              <p className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1"><Clock size={12}/> {new Date(order.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>

                          <div className="p-4 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p><p className="font-bold text-sm text-[#111827]">{order.customer.name}</p></div>
                              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p><p className="font-bold text-sm text-[#111827]">{order.customer.phone}</p></div>
                              
                              <div className="mt-4 border-t border-gray-100 pt-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 ${order.orderType === 'Takeaway' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                  {order.orderType === 'Takeaway' ? <ShoppingBag size={14} /> : <MapPin size={14} />}
                                  {order.orderType === 'Takeaway' ? 'Pick-Up / Takeaway' : 'Delivery'}
                                </div>
                                
                                {(!order.orderType || order.orderType === 'Delivery') && (
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100">{order.customer.address}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</p>
                              <ul className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between text-xs font-medium"><span className="text-gray-600">{item.quantity}x {item.name}</span></li>
                                ))}
                              </ul>
                              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                                <span className="font-bold text-[#D4AF37] text-lg font-serif">Rs. {order.total}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            {order.status === 'New' && (
                              <button onClick={() => updateOrderStatus(order.id, 'Preparing').catch(e => { console.error('Status update error', e); showToast('Failed to update status.', 'error'); })} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-1 shadow-md">
                                <CookingPot size={14}/> Start Preparing
                              </button>
                            )}
                            {order.status === 'Preparing' && (
                              <button onClick={() => updateOrderStatus(order.id, 'Delivered').catch(e => { console.error('Status update error', e); showToast('Failed to update status.', 'error'); })} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-1 shadow-md">
                                <CheckCircle2 size={14}/> Mark Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SECTION: MENU MANAGEMENT */}
          {adminSection === 'menu' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black font-serif text-[#111827]">Restaurant Menu</h3>
                  <p className="text-gray-500 text-sm mt-1">Changes made here instantly update the live website.</p>
                </div>
                <button 
                  onClick={openAddModal}
                  className="bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition flex items-center gap-2 shadow-lg"
                >
                  <Plus size={18} /> Add New Dish
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <th className="p-4">Image</th>
                      <th className="p-4">Dish Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                        </td>
                        <td className="p-4 font-bold text-[#111827]">{item.name}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">{item.category}</span>
                        </td>
                        <td className="p-4 font-bold text-[#D4AF37]">Rs. {item.price}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditModal(item)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition mr-2">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: ADD/EDIT MENU ITEM */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-[#111827]/80 z-[100] backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative border border-gray-100">
            
            {/* Left Column: Image Preview */}
            <div className="md:w-5/12 lg:w-2/5 bg-gray-100 flex flex-col relative hidden md:flex border-r border-gray-200 shrink-0">
              <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-[#D4AF37]" /> Live Preview
              </div>
              
              {menuForm.image ? (
                <div className="w-full h-full relative group">
                  <img src={menuForm.image} alt="Preview" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                    <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-2">{menuForm.category || 'Category'}</p>
                    <h4 className="font-bold text-3xl text-white font-serif leading-tight">{menuForm.name || 'Dish Name'}</h4>
                    <p className="text-white mt-2 font-bold text-xl">Rs. {menuForm.price || '0'}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-8 text-center bg-[#111827]/5">
                  <ImageIcon size={64} className="mb-4 text-gray-300" />
                  <p className="font-serif text-xl text-gray-400">No Image Provided</p>
                  <p className="text-sm mt-2 text-gray-400">Paste a URL in the form to see the preview here.</p>
                </div>
              )}
            </div>

            {/* Right Column: Form */}
            <div className="flex-1 flex flex-col bg-white relative min-h-0">
              
              {/* Modal Header (Fixed) */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 z-20">
                <div>
                  <h3 className="text-2xl font-black font-serif text-[#111827]">
                    {editingItem ? 'Edit Dish Details' : 'Create New Dish'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{editingItem ? 'Update the content below.' : 'Fill in the details to publish.'}</p>
                </div>
                <button onClick={() => setIsMenuModalOpen(false)} className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 transition p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Body (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto flex-grow">
                <form id="menu-form" onSubmit={handleMenuSubmit} className="space-y-6">
                  
                  {/* Dish Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Dish Name *</label>
                    <input 
                      required type="text" 
                      value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} 
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-bold text-[#111827] text-lg" 
                      placeholder="e.g. Special Chicken Karahi" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Category *</label>
                      <input 
                        required type="text" 
                        value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} 
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-medium text-gray-700" 
                        placeholder="e.g. 🥘 Karahi Specials" 
                      />
                    </div>
                    
                    {/* Price */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Price (Rs.) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                        <input 
                          required type="number" 
                          value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} 
                          className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-bold text-gray-700" 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Image URL *</label>
                    <input 
                      required type="url" 
                      value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} 
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition font-medium text-gray-700" 
                      placeholder="https://images.unsplash.com/..." 
                    />
                    {/* Mobile Image Preview */}
                    <div className="md:hidden mt-4">
                      {menuForm.image && <img src={menuForm.image} alt="Preview" className="w-full h-40 object-cover rounded-xl shadow-sm border border-gray-200" />}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Description *</label>
                    <textarea 
                      required rows="4" 
                      value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} 
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition resize-none font-medium text-gray-700" 
                      placeholder="Describe the dish, ingredients, and taste..."
                    ></textarea>
                  </div>
                  
                </form>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-4 z-20">
                <button 
                  type="button" 
                  onClick={() => setIsMenuModalOpen(false)} 
                  className="px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleMenuSubmit}
                  className="bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  {editingItem ? <CheckCircle2 size={18}/> : <Plus size={18}/>}
                  {editingItem ? 'Save Changes' : 'Publish Dish'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 z-[150] backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-[slideUp_0.3s_ease-out]">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Delete Dish?</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Are you sure you want to delete <span className="font-bold text-[#111827]">{itemToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed bottom-8 right-8 z-[200] bg-white border-l-4 shadow-2xl rounded-lg p-4 flex items-center gap-3 animate-[slideIn_0.3s_ease-out_forwards] ${toastType === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <div className={`p-2 rounded-full ${toastType === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {toastType === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <p className="font-bold text-[#111827] text-sm pr-4">{toastMessage}</p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
