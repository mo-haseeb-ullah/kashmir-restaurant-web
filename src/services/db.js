// This is a Local Storage mock database that perfectly simulates Firebase Firestore

const ORDERS_KEY = 'kashmir_orders';
const MENU_KEY = 'kashmir_menu';
const USERS_KEY = 'kashmir_users';

// --- AUTH API ---

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const getUsers = () => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = async (name, phone, password) => {
  const users = getUsers();
  if (users.find(u => u.phone === phone)) {
    throw new Error('Phone number already registered!');
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    name,
    phone,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  saveUsers([...users, newUser]);
  
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const loginUser = async (phone, password) => {
  const users = getUsers();
  const user = users.find(u => u.phone === phone);
  
  if (!user) {
    throw new Error('User not found!');
  }
  
  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    throw new Error('Invalid password!');
  }
  
  const { password: _, ...safeUser } = user;
  return safeUser;
};

// --- ORDERS API ---

const getOrders = () => {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOrders = (orders) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('db_updated'));
};

export const addOrder = (orderData) => {
  const newOrder = {
    ...orderData,
    id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    status: 'New',
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString() // 45 mins from now
  };
  const orders = getOrders();
  saveOrders([newOrder, ...orders]);
  return newOrder;
};

export const getUserActiveOrder = (userId) => {
  if (!userId) return null;
  const orders = getOrders();
  return orders.find(o => o.userId === userId && o.status !== 'Delivered' && o.status !== 'Cancelled') || null;
};

export const getUserOrders = (userId) => {
  if (!userId) return [];
  const orders = getOrders();
  return orders.filter(o => o.userId === userId);
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  saveOrders(updated);
};

export const listenToOrders = (callback) => {
  callback(getOrders());
  const handleUpdate = () => callback(getOrders());
  window.addEventListener('db_updated', handleUpdate);
  return () => window.removeEventListener('db_updated', handleUpdate);
};

// --- MENU API ---

const KARAHI_VARIANTS = [
  { label: 'Half (0.5 kg)', priceMultiplier: 0.5 },
  { label: 'Full (1 kg)', priceMultiplier: 1 },
  { label: '1.5 kg', priceMultiplier: 1.5 },
  { label: '2 kg', priceMultiplier: 2 }
];

const defaultMenu = [
  // MEGA DEAL
  { id: 1, name: "Mega Deal", category: "🌟 Mega Deals", price: "5500", image: "https://images.unsplash.com/photo-1555126634-ae2306716a49?w=600&q=80", desc: "1kg Chicken Karahi, 1kg Chicken Biryani, Half kg Beef Karahi, 2 Chicken Kebabs, 2 Reshmi Kebabs, 2 Tikka Boti, 2 Malai Boti, Roti for 6, 6 Raita, 2 Salad, 2.25ltr Drink." },

  // BREAKFAST
  { id: 2, name: "Chicken Chana (مرغ چنے)", category: "🍳 Breakfast (صبح کا ناشته)", price: "250", image: "https://images.unsplash.com/photo-1626786015525-4fc1da939768?w=600&q=80", desc: "Delicious Lahori style chicken chickpeas." },
  { id: 3, name: "Omelette (آملیٹ)", category: "🍳 Breakfast (صبح کا ناشته)", price: "100", image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&q=80", desc: "Spicy and fluffy traditional omelette." },
  { id: 4, name: "Paratha (پراٹھا)", category: "🍳 Breakfast (صبح کا ناشته)", price: "60", image: "https://images.unsplash.com/photo-1626082895617-2c6afda2c046?w=600&q=80", desc: "Crispy, flaky, butter-fried flatbread." },
  { id: 5, name: "Tea (چائے)", category: "🍳 Breakfast (صبح کا ناشته)", price: "70", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80", desc: "Strong and aromatic mixed tea." },

  // SWEET CORNER
  { id: 6, name: "Doohd Jalebi (دودھ جلیبی)", category: "🍮 Kashmir Sweet Corner", price: "70", image: "https://images.unsplash.com/photo-1589131649988-d61cc72c3d52?w=600&q=80", desc: "Warm milk with sweet crispy jalebi." },
  { id: 7, name: "Gajar Halwa (گاجر حلوہ)", category: "🍮 Kashmir Sweet Corner", price: "120", image: "https://images.unsplash.com/photo-1589133469853-294d1b8168bf?w=600&q=80", desc: "Traditional sweet carrot dessert." },
  { id: 8, name: "Kheer (کھیر)", category: "🍮 Kashmir Sweet Corner", price: "90", image: "https://images.unsplash.com/photo-1563805042-7684c8e9e533?w=600&q=80", desc: "Rich and creamy rice pudding." },
  { id: 9, name: "Samosa (سموسے)", category: "🍮 Kashmir Sweet Corner", price: "50", image: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bb4?w=600&q=80", desc: "Crispy pastry filled with spicy potatoes." },
  { id: 10, name: "Jalebi (جلیبی)", category: "🍮 Kashmir Sweet Corner", price: "70", image: "https://images.unsplash.com/photo-1589131649988-d61cc72c3d52?w=600&q=80", desc: "Sweet, deep-fried crispy spirals." },
  { id: 11, name: "Pakoray (پکوڑے)", category: "🍮 Kashmir Sweet Corner", price: "150", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80", desc: "Crispy besan fritters mixed with vegetables." },

  // OTHERS
  { id: 12, name: "Cold Drink (کولڈ ڈرنک)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80", desc: "Chilled beverage options.", variants: [{label: 'Regular', priceMultiplier: 1}, {label: 'Half Liter', priceMultiplier: 1.5}, {label: '1 Liter', priceMultiplier: 2.2}, {label: '1.5 Liter', priceMultiplier: 2.5}] },
  { id: 13, name: "Mineral Water (منرل واٹر)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80", desc: "Purified water.", variants: [{label: 'Regular', priceMultiplier: 1}, {label: '1.5 Liter', priceMultiplier: 1.7}] },
  { id: 14, name: "Russian Salad (رشین سلاد)", category: "🥤 Others", price: "650", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", desc: "Creamy salad with fruits and vegetables." },
  { id: 15, name: "Salad (سلاد)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80", desc: "Fresh seasonal vegetables." },
  { id: 16, name: "Raita (رائته)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1626201314643-d9d1502dc87e?w=600&q=80", desc: "Mint and cumin yogurt dip." },

  // KARAHI SPECIALS
  { id: 17, name: "Desi Murgh Karahi (دیسی مرغ کڑاہی)", category: "🥘 Karahi Specials", price: "2200", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80", desc: "Authentic free-range chicken cooked in traditional spices.", variants: KARAHI_VARIANTS },
  { id: 18, name: "Kashmir Special Chicken Karahi (کشمیر سپیشل چکن کڑاہی)", category: "🥘 Karahi Specials", price: "1800", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80", desc: "Our signature chicken karahi with a secret spice blend.", variants: KARAHI_VARIANTS },
  { id: 19, name: "Chicken Karahi (چکن کڑاہی)", category: "🥘 Karahi Specials", price: "1500", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80", desc: "Classic chicken karahi in rich tomato gravy.", variants: KARAHI_VARIANTS },
  { id: 20, name: "Chicken Namkeen Karahi (چکن نمکین کڑاہی)", category: "🥘 Karahi Specials", price: "1600", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80", desc: "Peshawari style salted chicken karahi.", variants: KARAHI_VARIANTS },
  { id: 21, name: "Chicken White Karahi (چکن وائٹ کڑاہی)", category: "🥘 Karahi Specials", price: "1700", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80", desc: "Creamy and mild white chicken karahi.", variants: KARAHI_VARIANTS },
  { id: 22, name: "Chicken Handi Boneless (چکن بون لیس ہانڈی)", category: "🥘 Karahi Specials", price: "1800", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80", desc: "Boneless chicken cooked in a traditional clay pot.", variants: KARAHI_VARIANTS },
  { id: 23, name: "Chicken Achari Handi (چکن اچاری ہانڈی)", category: "🥘 Karahi Specials", price: "1900", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80", desc: "Boneless chicken in a tangy pickle-flavored gravy.", variants: KARAHI_VARIANTS },
  { id: 24, name: "Chicken Achari Karahi (چکن اچاری کڑاہی)", category: "🥘 Karahi Specials", price: "1800", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80", desc: "Chicken karahi infused with traditional achaar spices.", variants: KARAHI_VARIANTS },
  { id: 25, name: "Mutton Karahi (مٹن کڑاہی)", category: "🥘 Karahi Specials", price: "2800", image: "https://images.unsplash.com/photo-1544025162-8360d84c6e93?w=600&q=80", desc: "Tender mutton cooked in traditional desi ghee.", variants: KARAHI_VARIANTS },
  { id: 26, name: "Mutton Namkeen Karahi (مٹن نمکین کڑاہی)", category: "🥘 Karahi Specials", price: "2900", image: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bb4?w=600&q=80", desc: "Salted Peshawari style mutton karahi.", variants: KARAHI_VARIANTS },
  { id: 27, name: "Mutton White Karahi (مٹن وائٹ کڑاہی)", category: "🥘 Karahi Specials", price: "3000", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80", desc: "Creamy and rich white mutton karahi.", variants: KARAHI_VARIANTS },
  { id: 28, name: "Beef Karahi (بیف کڑاہی)", category: "🥘 Karahi Specials", price: "2000", image: "https://images.unsplash.com/photo-1544025162-8360d84c6e93?w=600&q=80", desc: "Spicy and tender beef karahi.", variants: KARAHI_VARIANTS },
  { id: 29, name: "Beef Karahi Boneless (بیف کڑاہی بون لیس)", category: "🥘 Karahi Specials", price: "2200", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80", desc: "Boneless beef chunks in rich karahi masala.", variants: KARAHI_VARIANTS },
  { id: 30, name: "Beef White Karahi Boneless (بیف وائٹ کڑاہی بون لیس)", category: "🥘 Karahi Specials", price: "2400", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80", desc: "Creamy boneless beef white karahi.", variants: KARAHI_VARIANTS },
];

const getMenu = () => {
  const version = localStorage.getItem('menu_version_v4');
  let data = localStorage.getItem(MENU_KEY);
  
  if (!data || !version) {
    localStorage.setItem(MENU_KEY, JSON.stringify(defaultMenu));
    localStorage.setItem('menu_version_v4', 'true');
    // Dispatch event so Home/Admin instantly re-render if they are already mounted
    setTimeout(() => window.dispatchEvent(new Event('menu_updated')), 100);
    return defaultMenu;
  }
  return JSON.parse(data);
};

const saveMenu = (menu) => {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  window.dispatchEvent(new Event('menu_updated'));
};

export const addMenuItem = (itemData) => {
  const newMenu = {
    ...itemData,
    id: Date.now() // Unique ID
  };
  const menu = getMenu();
  saveMenu([...menu, newMenu]);
};

export const updateMenuItem = (id, updatedData) => {
  const menu = getMenu();
  const updatedMenu = menu.map(item => item.id === id ? { ...item, ...updatedData } : item);
  saveMenu(updatedMenu);
};

export const deleteMenuItem = (id) => {
  const menu = getMenu();
  const updatedMenu = menu.filter(item => item.id !== id);
  saveMenu(updatedMenu);
};

export const listenToMenu = (callback) => {
  callback(getMenu());
  const handleUpdate = () => callback(getMenu());
  window.addEventListener('menu_updated', handleUpdate);
  return () => window.removeEventListener('menu_updated', handleUpdate);
};
