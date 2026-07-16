import { db } from './firebase';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, where, runTransaction } from 'firebase/firestore';

// --- AUTH API ---

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const registerUser = async (name, phone, password) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('phone', '==', phone));
  const snap = await getDocs(q);
  if (!snap.empty) throw new Error('Phone number already registered!');
  
  const hashedPassword = await hashPassword(password);
  const newUser = {
    name, phone, password: hashedPassword, createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(usersRef, newUser);
  return { id: docRef.id, name, phone, createdAt: newUser.createdAt };
};

export const loginUser = async (phone, password) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('phone', '==', phone));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('User not found!');
  
  const userDoc = snap.docs[0];
  const user = userDoc.data();
  
  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) throw new Error('Invalid password!');
  
  return { id: userDoc.id, name: user.name, phone: user.phone, createdAt: user.createdAt };
};

// --- ORDERS API ---

export const addOrder = async (orderData) => {
  const counterRef = doc(db, 'metadata', 'orderCounter');
  let newOrderNumber = 1;
  
  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { count: 1 });
        newOrderNumber = 1;
      } else {
        newOrderNumber = counterDoc.data().count + 1;
        transaction.update(counterRef, { count: newOrderNumber });
      }
    });
  } catch(e) {
    console.error("Counter transaction failed", e);
    newOrderNumber = Math.floor(Math.random() * 1000000);
  }

  const newOrder = {
    ...orderData,
    orderId: newOrderNumber,
    timestamp: new Date().toISOString(),
    status: 'New',
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString()
  };
  const docRef = await addDoc(collection(db, 'orders'), newOrder);
  return { ...newOrder, id: docRef.id };
};

export const getUserActiveOrder = async (userId) => {
  if (!userId) return null;
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // Sort by newest first
  orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled') || null;
};

export const getUserOrders = async (userId) => {
  if (!userId) return [];
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return orders;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status: newStatus });
};

export const listenToOrders = (callback) => {
  const q = query(collection(db, 'orders')); // Can add orderBy if needed
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    callback(orders);
  });
  return unsubscribe;
};

// --- MENU API ---

const KARAHI_VARIANTS = [
  { label: 'Half (0.5 kg)', priceMultiplier: 0.5 },
  { label: 'Full (1 kg)', priceMultiplier: 1 },
  { label: '1.5 kg', priceMultiplier: 1.5 },
  { label: '2 kg', priceMultiplier: 2 }
];

const defaultMenu = [
  { id: 1, name: "Mega Deal", category: "🌟 Mega Deals", price: "5500", image: "https://images.unsplash.com/photo-1555126634-ae2306716a49?w=600&q=80", desc: "1kg Chicken Karahi, 1kg Chicken Biryani, Half kg Beef Karahi, 2 Chicken Kebabs, 2 Reshmi Kebabs, 2 Tikka Boti, 2 Malai Boti, Roti for 6, 6 Raita, 2 Salad, 2.25ltr Drink." },
  { id: 2, name: "Chicken Chana (مرغ چنے)", category: "🍳 Breakfast (صبح کا ناشته)", price: "250", image: "https://images.unsplash.com/photo-1626786015525-4fc1da939768?w=600&q=80", desc: "Delicious Lahori style chicken chickpeas." },
  { id: 3, name: "Omelette (آملیٹ)", category: "🍳 Breakfast (صبح کا ناشته)", price: "100", image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&q=80", desc: "Spicy and fluffy traditional omelette." },
  { id: 4, name: "Paratha (پراٹھا)", category: "🍳 Breakfast (صبح کا ناشته)", price: "60", image: "https://images.unsplash.com/photo-1626082895617-2c6afda2c046?w=600&q=80", desc: "Crispy, flaky, butter-fried flatbread." },
  { id: 5, name: "Tea (چائے)", category: "🍳 Breakfast (صبح کا ناشته)", price: "70", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80", desc: "Strong and aromatic mixed tea." },
  { id: 6, name: "Doohd Jalebi (دودھ جلیبی)", category: "🍮 Kashmir Sweet Corner", price: "70", image: "https://images.unsplash.com/photo-1589131649988-d61cc72c3d52?w=600&q=80", desc: "Warm milk with sweet crispy jalebi." },
  { id: 7, name: "Gajar Halwa (گاجر حلوہ)", category: "🍮 Kashmir Sweet Corner", price: "120", image: "https://images.unsplash.com/photo-1589133469853-294d1b8168bf?w=600&q=80", desc: "Traditional sweet carrot dessert." },
  { id: 8, name: "Kheer (کھیر)", category: "🍮 Kashmir Sweet Corner", price: "90", image: "https://images.unsplash.com/photo-1563805042-7684c8e9e533?w=600&q=80", desc: "Rich and creamy rice pudding." },
  { id: 9, name: "Samosa (سموسے)", category: "🍮 Kashmir Sweet Corner", price: "50", image: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bb4?w=600&q=80", desc: "Crispy pastry filled with spicy potatoes." },
  { id: 10, name: "Jalebi (جلیبی)", category: "🍮 Kashmir Sweet Corner", price: "70", image: "https://images.unsplash.com/photo-1589131649988-d61cc72c3d52?w=600&q=80", desc: "Sweet, deep-fried crispy spirals." },
  { id: 11, name: "Pakoray (پکوڑے)", category: "🍮 Kashmir Sweet Corner", price: "150", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80", desc: "Crispy besan fritters mixed with vegetables." },
  { id: 12, name: "Cold Drink (کولڈ ڈرنک)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80", desc: "Chilled beverage options.", variants: [{label: 'Regular', priceMultiplier: 1}, {label: 'Half Liter', priceMultiplier: 1.5}, {label: '1 Liter', priceMultiplier: 2.2}, {label: '1.5 Liter', priceMultiplier: 2.5}] },
  { id: 13, name: "Mineral Water (منرل واٹر)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80", desc: "Purified water.", variants: [{label: 'Regular', priceMultiplier: 1}, {label: '1.5 Liter', priceMultiplier: 1.7}] },
  { id: 14, name: "Russian Salad (رشین سلاد)", category: "🥤 Others", price: "650", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", desc: "Creamy salad with fruits and vegetables." },
  { id: 15, name: "Salad (سلاد)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80", desc: "Fresh seasonal vegetables." },
  { id: 16, name: "Raita (رائته)", category: "🥤 Others", price: "70", image: "https://images.unsplash.com/photo-1626201314643-d9d1502dc87e?w=600&q=80", desc: "Mint and cumin yogurt dip." },
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
  { id: 30, name: "Beef White Karahi Boneless (بیف وائٹ کڑاہی بون لیس)", category: "🥘 Karahi Specials", price: "2400", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80", desc: "Creamy boneless beef white karahi.", variants: KARAHI_VARIANTS }
];

export const addMenuItem = async (itemData) => {
  const newMenu = { ...itemData, sortId: Date.now() };
  await addDoc(collection(db, 'menu'), newMenu);
};

export const updateMenuItem = async (id, updatedData) => {
  const itemRef = doc(db, 'menu', id);
  await updateDoc(itemRef, updatedData);
};

export const deleteMenuItem = async (id) => {
  const itemRef = doc(db, 'menu', id);
  await deleteDoc(itemRef);
};

export const listenToMenu = (callback) => {
  // FAST CACHE LOAD: Instantly show cached menu while Firebase connects
  const cached = localStorage.getItem('kashmir_menu_cache');
  if (cached) {
    try { callback(JSON.parse(cached)); } catch(e) {}
  } else {
    callback(defaultMenu);
  }

  const q = query(collection(db, 'menu'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // Seed default menu to Firestore if empty
      defaultMenu.forEach(item => {
        setDoc(doc(db, 'menu', item.id.toString()), item);
      });
      callback(defaultMenu);
    } else {
      const menu = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      // Sort by id or sortId to keep menu consistent
      menu.sort((a, b) => {
        const aVal = parseInt(a.id) || a.sortId || 0;
        const bVal = parseInt(b.id) || b.sortId || 0;
        return aVal - bVal;
      });
      
      // Update Cache
      localStorage.setItem('kashmir_menu_cache', JSON.stringify(menu));
      callback(menu);
    }
  });
  return unsubscribe;
};
