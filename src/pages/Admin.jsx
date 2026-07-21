import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Search, Bell, Clock, CheckCircle2, ChevronRight, CookingPot, ArrowLeft, LayoutDashboard, UtensilsCrossed, Plus, Edit2, Trash2, X, Image as ImageIcon, AlertCircle, ShoppingBag, MapPin, Settings, LogOut, FileText, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { listenToOrders, updateOrderStatus, listenToMenu, addMenuItem, updateMenuItem, deleteMenuItem, getAdminPasswordHash, hashPassword, updateAdminPasswordHash, defaultMenu } from '../services/db';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const session = localStorage.getItem('adminSession');
    if (session && (Date.now() - parseInt(session)) < 3600000) {
      return true; // Valid for 1 hour
    }
    return false;
  });
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
  
  // Reports State
  const [reportTimeframe, setReportTimeframe] = useState('Today');
  
  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Error state for login
  // Error state for login
  const [loginError, setLoginError] = useState('');

  // Loading States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Settings State
  const [adminPasswordHash, setAdminPasswordHash] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    getAdminPasswordHash().then(hash => setAdminPasswordHash(hash));
  }, []);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!password) {
      setLoginError('Please enter a password.');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const inputHash = await hashPassword(password);
      
      if (inputHash === adminPasswordHash) {
        setIsLoggedIn(true);
        localStorage.setItem('adminSession', Date.now().toString());
      } else {
        setLoginError('Incorrect password! Access denied.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Authentication failed. Please check connection.');
    } finally {
      setIsLoggingIn(false);
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
    
    setIsSavingMenu(true);
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
    } finally {
      setIsSavingMenu(false);
    }
  };

  const generatePDFReport = () => {
    let filteredForReport = orders;
    const now = new Date();
    
    if (reportTimeframe === 'Today') {
      filteredForReport = orders.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());
    } else if (reportTimeframe === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      filteredForReport = orders.filter(o => new Date(o.timestamp) >= sevenDaysAgo);
    } else if (reportTimeframe === 'This Month') {
      filteredForReport = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return orderDate.getMonth() === new Date().getMonth() && orderDate.getFullYear() === new Date().getFullYear();
      });
    }

    const totalRevenue = filteredForReport.reduce((sum, order) => sum + order.total, 0);

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Kashmir Restaurant - Sales Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Timeframe: ${reportTimeframe}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
    
    // Summary
    doc.setFontSize(14);
    doc.text(`Total Orders: ${filteredForReport.length}`, 14, 48);
    doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 14, 56);

    // Table
    const tableColumn = ["Order ID", "Date", "Customer", "Type", "Status", "Amount"];
    const tableRows = [];

    filteredForReport.forEach(order => {
      const orderData = [
        `#${order.orderId || order.id.substring(0,6)}`,
        new Date(order.timestamp).toLocaleDateString(),
        order.customer?.name || "N/A",
        order.orderType || "N/A",
        order.status,
        `Rs. ${order.total}`
      ];
      tableRows.push(orderData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [212, 175, 55], textColor: [17, 24, 39] }
    });

    doc.save(`Kashmir_Sales_Report_${reportTimeframe.replace(/ /g, '_')}.pdf`);
    showToast("Report Generated Successfully!");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const oldHash = await hashPassword(oldPassword);
      if (oldHash !== adminPasswordHash) {
        showToast("Current password is incorrect.", "error");
        return;
      }
      const newHash = await hashPassword(newPassword);
      await updateAdminPasswordHash(newHash);
      setAdminPasswordHash(newHash);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast("Password updated successfully!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRestoreEnglish = async () => {
    setIsSavingMenu(true);
    let count = 0;
    try {
      for (const item of menuItems) {
        // Find original English item in defaultMenu
        const originalItem = defaultMenu.find(d => d.id.toString() === item.id.toString() || d.name === item.name);
        
        if (originalItem && originalItem.desc) {
          await updateMenuItem(item.id, { desc: originalItem.desc });
          count++;
        }
      }
      showToast(`Successfully restored English descriptions for ${count} items!`);
    } catch(err) {
      console.error(err);
      showToast("Failed to restore English descriptions.", "error");
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMenuItem(itemToDelete.id);
      showToast(`"${itemToDelete.name}" was removed from the menu.`);
    } catch (err) {
      console.error("Delete menu item error:", err);
      showToast("Failed to delete item. Please try again later.", "error");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      console.error('Status update error', e);
      showToast('Failed to update status.', 'error');
    } finally {
      setUpdatingOrderId(null);
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
              disabled={isLoggingIn}
              className={`w-full ${isLoggingIn ? 'bg-[#c5a02e] cursor-not-allowed opacity-80' : 'bg-[#D4AF37] hover:bg-[#c5a02e] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'} text-[#111827] font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(212,175,55,0.3)] uppercase tracking-[0.2em] flex justify-center items-center gap-3`}
            >
              {isLoggingIn ? <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div> : 'Unlock Access'}
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
          <button 
            onClick={() => setAdminSection('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold tracking-widest uppercase text-xs ${adminSection === 'reports' ? 'bg-[#D4AF37] text-[#111827]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <FileText size={18} /> Reports
          </button>
          <button 
            onClick={() => setAdminSection('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold tracking-widest uppercase text-xs ${adminSection === 'settings' ? 'bg-[#D4AF37] text-[#111827]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('adminSession'); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-red-600 text-white transition font-bold tracking-widest uppercase text-xs">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
          <h2 className="text-lg md:text-2xl font-black font-serif text-[#111827] truncate pr-2">
            {adminSection === 'orders' ? 'Live Orders' : adminSection === 'menu' ? 'Menu CMS' : adminSection === 'reports' ? 'Sales Reports' : 'Settings'}
          </h2>
          <Link to="/" target="_blank" className="text-[10px] md:text-sm font-bold text-gray-500 hover:text-[#D4AF37] transition flex items-center gap-1 border border-gray-200 px-2 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap">
            View Site <ChevronRight size={14}/>
          </Link>
        </header>

        {/* Mobile Top Navigation */}
        <div className="md:hidden bg-[#111827] grid grid-cols-5 p-2 shadow-md gap-1">
          <button onClick={() => setAdminSection('orders')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${adminSection === 'orders' ? 'text-[#D4AF37] bg-white/5' : 'text-gray-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={16} />
            <span className="text-[8px] mt-1 uppercase tracking-widest font-bold">Orders</span>
          </button>
          <button onClick={() => setAdminSection('menu')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${adminSection === 'menu' ? 'text-[#D4AF37] bg-white/5' : 'text-gray-400 hover:bg-white/5'}`}>
            <UtensilsCrossed size={16} />
            <span className="text-[8px] mt-1 uppercase tracking-widest font-bold">Menu</span>
          </button>
          <button onClick={() => setAdminSection('reports')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${adminSection === 'reports' ? 'text-[#D4AF37] bg-white/5' : 'text-gray-400 hover:bg-white/5'}`}>
            <FileText size={16} />
            <span className="text-[8px] mt-1 uppercase tracking-widest font-bold">Reports</span>
          </button>
          <button onClick={() => setAdminSection('settings')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${adminSection === 'settings' ? 'text-[#D4AF37] bg-white/5' : 'text-gray-400 hover:bg-white/5'}`}>
            <Settings size={16} />
            <span className="text-[8px] mt-1 uppercase tracking-widest font-bold">Settings</span>
          </button>
          <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('adminSession'); }} className="flex flex-col items-center justify-center p-2 rounded-lg text-red-400 hover:bg-red-500/10">
            <LogOut size={16} />
            <span className="text-[8px] mt-1 uppercase tracking-widest font-bold">Logout</span>
          </button>
        </div>

        <div className="p-0 md:p-8 bg-gray-50 md:bg-transparent min-h-screen md:min-h-0">
          
          {/* SECTION: LIVE ORDERS */}
          {adminSection === 'orders' && (
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8 px-3 md:px-0 mt-3 md:mt-0">
                <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <h3 className="text-xl md:text-3xl font-black text-[#111827] font-serif">{orders.length}</h3>
                  </div>
                  <div className="bg-gray-100 p-2 md:p-3 rounded-full text-gray-600 hidden sm:block"><CheckCircle2 size={20}/></div>
                </div>
                <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] md:text-xs font-bold text-red-400 uppercase tracking-widest mb-1">New Orders</p>
                    <h3 className="text-xl md:text-3xl font-black text-red-600 font-serif">{orders.filter(o=>o.status==='New').length}</h3>
                  </div>
                  <div className="bg-red-100 p-2 md:p-3 rounded-full text-red-600 animate-pulse hidden sm:block"><Bell size={20}/></div>
                </div>
                <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] md:text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Preparing</p>
                    <h3 className="text-xl md:text-3xl font-black text-orange-600 font-serif">{orders.filter(o=>o.status==='Preparing').length}</h3>
                  </div>
                  <div className="bg-orange-100 p-2 md:p-3 rounded-full text-orange-600 hidden sm:block"><CookingPot size={20}/></div>
                </div>
                <div className="bg-[#111827] text-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl flex flex-col justify-center">
                   <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
                   <h3 className="text-xl md:text-3xl font-black text-[#D4AF37] font-serif">
                     Rs.{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                   </h3>
                </div>
              </div>

              {/* Orders Kanban/List */}
              <div className="bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-sm border-y md:border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar">
                  {['New', 'Preparing', 'Delivered'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveOrderTab(tab)}
                      className={`flex-1 py-3 md:py-4 px-1 min-w-[90px] text-[10px] md:text-sm font-bold uppercase tracking-widest transition border-b-2 ${
                        activeOrderTab === tab ? 'border-[#D4AF37] text-[#111827] bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab} ({orders.filter(o => o.status === tab).length})
                    </button>
                  ))}
                </div>

                <div className="p-2 md:p-6 bg-gray-50/50 min-h-[300px] md:min-h-[500px]">
                  {filteredOrders.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <ChefHat size={48} className="mb-4 text-gray-200" />
                      <p className="text-sm md:text-lg font-serif">No {activeOrderTab} orders.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-2 border-b border-gray-100 bg-gray-50 gap-1">
                            <div>
                              <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order</span>
                              <h4 className="font-bold text-[#111827] text-xs md:text-sm font-serif">#{order.orderId || order.id}</h4>
                            </div>
                            <div className="text-left xl:text-right flex xl:block justify-between items-center w-full xl:w-auto">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>{order.status}</span>
                              <p className="text-[8px] md:text-[10px] text-gray-400 mt-0 xl:mt-1 flex items-center gap-1"><Clock size={8}/> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>

                          <div className="p-2 md:p-3 flex flex-col gap-2 flex-1">
                            <div className="space-y-1">
                              <div className="flex justify-between"><p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</p><p className="font-bold text-[10px] md:text-xs text-[#111827] truncate w-16 md:w-32 text-right">{order.customer.name}</p></div>
                              <div className="flex justify-between"><p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</p><p className="font-bold text-[10px] md:text-xs text-[#111827] truncate w-16 md:w-32 text-right">{order.customer.phone}</p></div>
                              
                              {order.orderType === 'Delivery' && (
                                <div className="flex justify-between"><p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Loc</p><p className="text-[9px] md:text-[10px] text-gray-600 truncate w-16 md:w-32 text-right" title={order.customer.address}>{order.customer.address}</p></div>
                              )}
                              {order.orderType === 'Takeaway' && (
                                <div className="flex justify-between"><p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Type</p><p className="font-bold text-[9px] md:text-[10px] text-[#D4AF37] uppercase">Pick-up</p></div>
                              )}
                            </div>

                            <div className="border-t border-gray-100 pt-2 flex-1">
                              <div className="space-y-1 max-h-24 overflow-y-auto hide-scrollbar">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-[9px] md:text-xs">
                                    <span className="text-gray-800 truncate pr-1"><span className="text-[#D4AF37] font-bold">{item.quantity}x</span> {item.name}</span>
                                    <span className="text-gray-600 font-bold whitespace-nowrap">Rs.{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center mt-auto">
                              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                              <span className="text-xs md:text-sm font-black text-[#111827] font-serif">Rs.{order.total}</span>
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                            {order.status === 'New' && (
                              <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')} className={`bg-orange-500 hover:bg-orange-600 text-white px-2 md:px-3 py-1.5 rounded-md text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-1 w-full justify-center ${updatingOrderId === order.id ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {updatingOrderId === order.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CookingPot size={12}/>}
                                Start
                              </button>
                            )}
                            {order.status === 'Preparing' && (
                              <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className={`bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1.5 rounded-md text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-1 w-full justify-center ${updatingOrderId === order.id ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {updatingOrderId === order.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 size={12}/>}
                                Delivered
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
            <div className="bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-sm border-y md:border border-gray-100 p-4 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-serif text-[#111827]">Restaurant Menu</h3>
                  <p className="text-gray-500 text-[10px] md:text-sm mt-1">Changes made here instantly update the live website.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={handleRestoreEnglish}
                    disabled={isSavingMenu}
                    className="bg-gray-800 hover:bg-[#D4AF37] hover:text-[#111827] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm transition flex items-center gap-2 shadow-lg flex-1 md:flex-auto justify-center disabled:opacity-50"
                  >
                    Restore English
                  </button>
                  <button 
                    onClick={openAddModal}
                    className="bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm transition flex items-center gap-2 shadow-lg flex-1 md:flex-auto justify-center"
                  >
                    <Plus size={16} /> Add Dish
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile Card View */}
              <div className="md:hidden grid grid-cols-2 gap-2">
                {menuItems.map(item => (
                  <div key={item.id} className="border border-gray-100 rounded-lg bg-gray-50 overflow-hidden flex flex-col shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-24 object-cover shrink-0" />
                    <div className="p-2 flex-1 flex flex-col">
                      <h4 className="font-bold text-[10px] text-[#111827] leading-tight line-clamp-2 min-h-[28px]">{item.name}</h4>
                      <p className="text-[8px] text-gray-500 truncate mt-1 uppercase tracking-wider">{item.category}</p>
                      <p className="font-black text-[#D4AF37] text-xs mt-1">Rs. {item.price}</p>
                      
                      <div className="flex gap-1 mt-3 pt-2 border-t border-gray-200">
                        <button onClick={() => openEditModal(item)} className="flex-1 flex justify-center bg-blue-100 text-blue-600 p-1.5 rounded-md hover:bg-blue-200 transition">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="flex-1 flex justify-center bg-red-100 text-red-600 p-1.5 rounded-md hover:bg-red-200 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: REPORTS */}
          {adminSection === 'reports' && (
            <div className="max-w-4xl mx-auto bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-sm border-y md:border border-gray-100 p-4 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-serif text-[#111827]">Sales Reports</h3>
                  <p className="text-gray-500 text-[10px] md:text-sm mt-1">Generate professional PDF sales reports for your business.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Select Timeframe</label>
                  <select 
                    value={reportTimeframe}
                    onChange={(e) => setReportTimeframe(e.target.value)}
                    className="w-full md:w-1/2 border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-[#D4AF37] outline-none font-bold text-[#111827] transition text-sm max-w-full"
                  >
                    <option value="Today">Today</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <h3 className="text-xl md:text-3xl font-black text-[#111827] font-serif">
                      {
                        (reportTimeframe === 'Today' ? orders.filter(o => new Date(o.timestamp).toDateString() === new Date().toDateString()) :
                        reportTimeframe === 'Last 7 Days' ? orders.filter(o => new Date(o.timestamp) >= new Date(new Date().setDate(new Date().getDate() - 7))) :
                        reportTimeframe === 'This Month' ? orders.filter(o => {
                          const d = new Date(o.timestamp); const n = new Date(); return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
                        }) : orders).length
                      }
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-xl md:text-3xl font-black text-[#D4AF37] font-serif">
                      Rs. {
                        (reportTimeframe === 'Today' ? orders.filter(o => new Date(o.timestamp).toDateString() === new Date().toDateString()) :
                        reportTimeframe === 'Last 7 Days' ? orders.filter(o => new Date(o.timestamp) >= new Date(new Date().setDate(new Date().getDate() - 7))) :
                        reportTimeframe === 'This Month' ? orders.filter(o => {
                          const d = new Date(o.timestamp); const n = new Date(); return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
                        }) : orders).reduce((sum, order) => sum + order.total, 0).toLocaleString()
                      }
                    </h3>
                  </div>
                </div>

                <button 
                  onClick={generatePDFReport}
                  className="w-full bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition flex items-center justify-center gap-3 shadow-xl text-[10px] md:text-sm"
                >
                  <Download size={18} /> Generate PDF Report
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SETTINGS */}
          {adminSection === 'settings' && (
            <div className="max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-black font-serif text-[#111827] mb-6">Change Master Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Current Password</label>
                  <input 
                    type="password" required
                    value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">New Password</label>
                  <input 
                    type="password" required
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input 
                    type="password" required
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-[#D4AF37] outline-none transition"
                  />
                </div>
                <button type="submit" disabled={isChangingPassword} className={`w-full ${isChangingPassword ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white'} font-bold py-4 rounded-xl transition uppercase tracking-widest shadow-xl flex justify-center items-center gap-3`}>
                  {isChangingPassword ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : null}
                  {isChangingPassword ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
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
                  disabled={isSavingMenu}
                  className={`bg-[#111827] hover:bg-[#D4AF37] hover:text-[#111827] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 text-sm ${isSavingMenu ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSavingMenu ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (editingItem ? <CheckCircle2 size={18}/> : <Plus size={18}/>)}
                  {isSavingMenu ? 'Saving...' : (editingItem ? 'Save Changes' : 'Publish Dish')}
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
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg text-sm flex justify-center items-center gap-2 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {isDeleting ? 'Deleting...' : 'Delete'}
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
