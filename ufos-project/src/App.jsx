import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  where 
} from 'firebase/firestore';
import { 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  LogOut,
  User,
  Store,
  Bell,
  Settings,
  AlertCircle,
  Utensils
} from 'lucide-react';

/* ==================================================================================
   SECTION 1: CONFIGURATION & INITIALIZATION
   (Locally: Move to 'firebaseConfig.js')
   ================================================================================== */

let app, auth, db;
let configMissing = false;

// 1. Try to get config from the Canvas environment
if (typeof __firebase_config !== 'undefined') {
  const firebaseConfig = JSON.parse(__firebase_config);
  app = initializeApp(firebaseConfig);
} 
// 2. Local fallback
else {
  const localConfig = {
    // TODO: PASTE YOUR FIREBASE CONFIG HERE
    apiKey: "AIzaSyBQ5hhdyHxk6ItmlByUzNoAnYyvXB4yZh0", 
    authDomain: "ufos-99a2b.firebaseapp.com",
    projectId: "ufos-99a2b",
    storageBucket: "ufos-99a2b.firebasestorage.app",
    messagingSenderId: "191101779822",
    appId: "1:191101779822:web:26e3647a2f3e17647f4b7f",
    measurementId: "G-XG4ZSCBCE1"
  };

  if (!localConfig.apiKey || localConfig.apiKey === "YOUR_API_KEY") {
    configMissing = true;
  } else {
    app = initializeApp(localConfig);
  }
}

if (app) {
  auth = getAuth(app);
  db = getFirestore(app);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ufos-v1';

/* ==================================================================================
   SECTION 2: DATA & CONSTANTS
   (Locally: Move to 'constants.js')
   ================================================================================== */

const VENDORS = [
  { id: 'v_tapal', name: 'Tapal Cafeteria', cuisine: 'Desi & Meals', icon: '🍛', theme: '#ea580c' },
  { id: 'v_cafe2go', name: 'Cafe-2-Go', cuisine: 'Sandwiches & Coffee', icon: '☕', theme: '#15803d' },
  { id: 'v_sync', name: 'Sync', cuisine: 'Fast Food', icon: '🍔', theme: '#b91c1c' },
  { id: 'v_grito', name: 'Grito', cuisine: 'Wraps & Rolls', icon: '🌯', theme: '#ca8a04' },
  { id: 'v_sky', name: 'Sky Dhaaba', cuisine: 'Tea & Snacks', icon: '☕', theme: '#1d4ed8' },
  { id: 'v_rahim', name: 'Rahim Bhai Fries', cuisine: 'Fries & Chaat', icon: '🍟', theme: '#a16207' },
];

const MOCK_MENU = {
  'v_tapal': [
    { id: 't1', name: 'Chicken Biryani', price: 350, category: 'Main' },
    { id: 't2', name: 'Daal Chawal', price: 200, category: 'Main' },
    { id: 't3', name: 'Samosa', price: 50, category: 'Snacks' },
  ],
  'v_cafe2go': [
    { id: 'c1', name: 'Iced Latte', price: 450, category: 'Drinks' },
    { id: 'c2', name: 'Club Sandwich', price: 500, category: 'Food' },
    { id: 'c3', name: 'Brownie', price: 250, category: 'Dessert' },
  ],
  'v_sync': [
    { id: 's1', name: 'Zinger Burger', price: 550, category: 'Burger' },
    { id: 's2', name: 'Chicken Piece', price: 250, category: 'Fried Chicken' },
  ],
  'v_grito': [
    { id: 'g1', name: 'Chicken Chatni Roll', price: 220, category: 'Rolls' },
    { id: 'g2', name: 'Mayo Garlic Roll', price: 240, category: 'Rolls' },
  ],
  'v_sky': [
    { id: 'sk1', name: 'Doodh Patti', price: 80, category: 'Tea' },
    { id: 'sk2', name: 'Paratha', price: 100, category: 'Breakfast' },
  ],
  'v_rahim': [
    { id: 'r1', name: 'Masala Fries', price: 150, category: 'Fries' },
    { id: 'r2', name: 'Mayo Fries', price: 200, category: 'Fries' },
  ],
};

/* ==================================================================================
   SECTION 3: STYLES (Standard CSS)
   (Locally: Move to 'App.css' and import it)
   ================================================================================== */

const Styles = () => (
  <style>{`
    :root {
      --primary: #5b21b6; /* Purple 900 */
      --primary-light: #7c3aed; /* Purple 600 */
      --bg-color: #f9fafb;
      --white: #ffffff;
      --text-main: #111827;
      --text-light: #6b7280;
      --border: #e5e7eb;
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    * { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }

    /* Layout */
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
    }

    /* Header */
    .header {
      background-color: var(--white);
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      letter-spacing: -0.025em;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-btn {
      background: none;
      border: none;
      color: var(--text-light);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .nav-btn:hover { color: var(--primary); background-color: #f3f4f6; }
    .nav-btn.active { color: var(--primary); font-weight: 600; background-color: #ede9fe; }

    .badge {
      background-color: #ef4444;
      color: white;
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      font-weight: bold;
    }

    /* --- NEW LOGIN SCREEN (Split View) --- */
    .login-wrapper {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4rem;
      position: relative;
      overflow: hidden;
    }

    .login-left::after {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .login-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4rem;
      background-color: var(--white);
    }

    .login-hero-text h1 { font-size: 3.5rem; margin-bottom: 1rem; line-height: 1.1; }
    .login-hero-text p { font-size: 1.25rem; opacity: 0.9; max-width: 500px; }

    .login-card {
      width: 100%;
      max-width: 420px;
    }

    .login-card h2 { font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-main); }
    .login-card p { color: var(--text-light); margin-bottom: 2.5rem; }

    .login-btn-lg {
      width: 100%;
      padding: 1.25rem;
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(91, 33, 182, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .login-btn-lg:hover { transform: translateY(-2px); box-shadow: 0 6px 8px -1px rgba(91, 33, 182, 0.4); }

    .vendor-grid-sm {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 2rem;
    }

    .vendor-btn-sm {
      padding: 1rem;
      background-color: #f3f4f6;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-main);
      transition: all 0.2s;
    }
    .vendor-btn-sm:hover { background-color: #e5e7eb; border-color: #d1d5db; }

    /* Cards & Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .card {
      background: var(--white);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: all 0.2s;
      border: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-light);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .card-icon {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background-color: #f3f4f6;
    }

    /* Menu & Cart */
    .split-view {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    @media (max-width: 900px) {
      .split-view { grid-template-columns: 1fr; }
      .login-left { display: none; }
    }

    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: var(--white);
      margin-bottom: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }

    .btn {
      padding: 0.5rem 1.25rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-add { background: #ede9fe; color: var(--primary); }
    .btn-add:hover { background: #ddd6fe; }

    .btn-primary { 
      background: var(--primary); 
      color: white; 
      width: 100%; 
      padding: 1rem;
      font-size: 1rem;
      border-radius: 0.75rem;
    }
    .btn-primary:hover { background: #4c1d95; }

    .cart-summary {
      background: var(--white);
      padding: 2rem;
      border-radius: 1rem;
      position: sticky;
      top: 6rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
    }

    /* Orders */
    .order-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .order-header {
      background: #f9fafb;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .order-body { padding: 1.5rem; }

    .status-badge {
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-pending { background: #fef3c7; color: #b45309; }
    .status-accepted { background: #dbeafe; color: #1e40af; }
    .status-ready { background: #d1fae5; color: #065f46; }
    .status-completed { background: #f3f4f6; color: #4b5563; }

    /* Dashboard Stats */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .stat-card {
      background: var(--white);
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `}</style>
);

/* ==================================================================================
   SECTION 4: COMPONENTS
   (Locally: Move to 'components/Header.jsx', 'components/Card.jsx', etc.)
   ================================================================================== */

const ConfigErrorScreen = () => (
  <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px'}}>
    <div style={{color: '#dc2626', marginBottom: '20px'}}>
      <Settings size={48} />
    </div>
    <h2>Firebase Configuration Required</h2>
    <p>Please update the localConfig object in App.jsx with your Firebase keys.</p>
  </div>
);

const Header = ({ title, user, cartCount, setView, view, logout, role }) => (
  <header className="header">
    <div className="header-content">
      <div className="logo" onClick={() => setView('vendors')}>
        <div style={{background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex'}}>
          <ShoppingBag size={20} />
        </div>
        <span>UFOS</span>
      </div>
      <nav className="nav-links">
        {role === 'student' && (
          <>
            <button className={`nav-btn ${view === 'vendors' ? 'active' : ''}`} onClick={() => setView('vendors')}>
              <Store size={18} /> Vendors
            </button>
            <button className={`nav-btn ${view === 'cart' ? 'active' : ''}`} onClick={() => setView('cart')}>
              <ShoppingBag size={18} /> Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            <button className={`nav-btn ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>
              <Clock size={18} /> Orders
            </button>
          </>
        )}
        <button className="nav-btn" onClick={logout}>
          <LogOut size={18} /> <span style={{display: 'none', md: {display: 'inline'}}}>Logout</span>
        </button>
      </nav>
    </div>
  </header>
);

/* ==================================================================================
   SECTION 5: VIEWS (PAGES)
   (Locally: Move to 'pages/Login.jsx', 'pages/StudentDashboard.jsx', etc.)
   ================================================================================== */

// --- LOGIN PAGE (Split View for Desktop) ---
const LoginScreen = ({ onLogin }) => (
  <div className="login-wrapper">
    {/* Left Panel: Hero / Brand */}
    <div className="login-left">
      <div style={{marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '1rem'}}>
        <div style={{background: 'white', color: '#5b21b6', padding: '12px', borderRadius: '12px', display: 'flex'}}>
          <Utensils size={32} />
        </div>
        <span style={{fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em'}}>UFOS</span>
      </div>
      <div className="login-hero-text">
        <h1>Skip the Queue,<br/>Savor the Food.</h1>
        <p>The unified ordering platform for Habib University. Pre-order your meals from campus cafes and pick them up instantly between classes.</p>
      </div>
    </div>

    {/* Right Panel: Login Form */}
    <div className="login-right">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please select your portal to continue.</p>

        <button className="login-btn-lg" onClick={() => onLogin('student', null)}>
          <User size={24} />
          Login as Student
        </button>

        <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6'}}>
          <p style={{fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem'}}>Vendor Demo Access</p>
          <div className="vendor-grid-sm">
            {VENDORS.slice(0, 4).map(vendor => (
              <button key={vendor.id} className="vendor-btn-sm" onClick={() => onLogin('vendor', vendor.id)}>
                {vendor.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- STUDENT DASHBOARD ---
const StudentApp = ({ user, logout }) => {
  const [view, setView] = useState('vendors');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pickupTime, setPickupTime] = useState('11:30'); 

  useEffect(() => {
    if (!user || !db) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      where('customerId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setActiveOrders(orders);
    });
    return () => unsubscribe();
  }, [user]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, vendorId: selectedVendor.id, vendorName: selectedVendor.name }];
    });
  };

  const removeFromCart = (itemId) => setCart(prev => prev.filter(i => i.id !== itemId));
  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    const ordersByVendor = {};
    cart.forEach(item => {
      if (!ordersByVendor[item.vendorId]) {
        ordersByVendor[item.vendorId] = { items: [], total: 0, vendorName: item.vendorName };
      }
      ordersByVendor[item.vendorId].items.push(item);
      ordersByVendor[item.vendorId].total += item.price * item.quantity;
    });

    const batchPromises = Object.keys(ordersByVendor).map(async (vId) => {
      const orderData = {
        customerId: user.uid,
        customerName: 'Student ' + user.uid.slice(0, 4),
        vendorId: vId,
        vendorName: ordersByVendor[vId].vendorName,
        items: ordersByVendor[vId].items,
        total: ordersByVendor[vId].total,
        status: 'pending',
        pickupTime: pickupTime,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
    });

    await Promise.all(batchPromises);
    setCart([]);
    setView('orders');
  };

  return (
    <div className="app-container">
      <Header 
        title="Student Portal" 
        user={user} 
        cartCount={cart.reduce((a,b)=>a+b.quantity,0)} 
        setView={setView} 
        view={view}
        logout={logout}
        role="student"
      />

      <main className="container">
        {/* VIEW: VENDOR LIST */}
        {view === 'vendors' && (
          <div>
            <div style={{marginBottom: '2rem'}}>
              <h1 style={{fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem'}}>Hungry?</h1>
              <p style={{color: '#6b7280', fontSize: '1.1rem'}}>Order ahead from your favorite campus spots.</p>
            </div>
            
            <div className="grid">
              {VENDORS.map(vendor => (
                <div key={vendor.id} className="card" onClick={() => { setSelectedVendor(vendor); setView('menu'); }}>
                  <div className="card-header">
                    <div className="card-icon" style={{color: vendor.theme}}>{vendor.icon}</div>
                    <div>
                      <h3 style={{margin: 0, fontSize: '1.25rem'}}>{vendor.name}</h3>
                      <span style={{color: '#6b7280', fontSize: '0.9rem'}}>{vendor.cuisine}</span>
                    </div>
                  </div>
                  <div style={{marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
                    <span style={{color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center'}}>
                      View Menu <ArrowLeft size={16} style={{transform: 'rotate(180deg)', marginLeft: '4px'}}/>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MENU & CART */}
        {((view === 'menu' && selectedVendor) || view === 'cart') && (
          <div className="split-view">
            {/* Left: Menu */}
            <div>
              {selectedVendor && (
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                  <button onClick={() => setView('vendors')} style={{background:'white', border:'1px solid #e5e7eb', borderRadius: '50%', padding: '0.5rem', cursor:'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 style={{margin: 0, fontSize: '1.5rem'}}>{selectedVendor.name}</h2>
                    <span style={{color: '#6b7280'}}>Full Menu</span>
                  </div>
                </div>
              )}
              
              {view === 'menu' && selectedVendor ? (
                <div style={{display: 'grid', gap: '1rem'}}>
                  {(MOCK_MENU[selectedVendor.id] || []).map(item => (
                    <div key={item.id} className="menu-item">
                      <div>
                        <div style={{fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem'}}>{item.name}</div>
                        <div style={{color: 'var(--primary)', fontWeight: '600'}}>PKR {item.price}</div>
                      </div>
                      <button className="btn btn-add" onClick={() => addToCart(item)}>Add +</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{padding: '2rem', textAlign: 'center', color: '#888'}}>
                  Select a vendor to view their menu.
                </div>
              )}
            </div>

            {/* Right: Cart Summary */}
            <div>
              <div className="cart-summary">
                <h3 style={{marginTop: 0, fontSize: '1.25rem', marginBottom: '1.5rem'}}>Current Order</h3>
                {cart.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '2rem 0', color: '#9ca3af'}}>
                    <ShoppingBag size={48} style={{margin: '0 auto 1rem', opacity: 0.5}} />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <>
                    <div style={{marginBottom: '1.5rem'}}>
                      {cart.map((item, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem'}}>
                          <div style={{display: 'flex', gap: '0.75rem'}}>
                            <span style={{background: '#f3f4f6', padding: '0.1rem 0.5rem', borderRadius: '4px', height: 'fit-content', fontWeight: 'bold', fontSize: '0.8rem'}}>x{item.quantity}</span>
                            <span>{item.name}</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span style={{fontWeight: '600'}}>PKR {item.price * item.quantity}</span>
                            <XCircle size={16} style={{cursor: 'pointer', color: '#ef4444', opacity: 0.7}} onClick={() => removeFromCart(item.id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{borderTop: '1px solid #eee', paddingTop: '1.5rem', marginBottom: '1.5rem'}}>
                      <label style={{display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: '#374151'}}>Pickup Time</label>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {['11:30', '13:00', '15:15', '17:00'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setPickupTime(t)}
                            style={{
                              padding: '0.5rem 1rem', 
                              border: pickupTime === t ? '1px solid var(--primary)' : '1px solid #d1d5db', 
                              borderRadius: '0.5rem',
                              background: pickupTime === t ? '#ede9fe' : 'white',
                              color: pickupTime === t ? 'var(--primary)' : '#374151',
                              fontWeight: pickupTime === t ? '600' : '400',
                              cursor: 'pointer'
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                      <span style={{color: '#6b7280'}}>Total Amount</span>
                      <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#111827'}}>PKR {calculateTotal()}</span>
                    </div>
                    
                    <button className="btn btn-primary" onClick={placeOrder}>
                      Confirm & Pay
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ORDERS */}
        {view === 'orders' && (
          <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', fontSize: '1.75rem'}}>Your Orders</h2>
            {activeOrders.length === 0 ? (
              <div style={{textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb'}}>
                <Clock size={48} style={{color: '#d1d5db', margin: '0 auto 1rem'}} />
                <p style={{color: '#6b7280', fontSize: '1.1rem'}}>No active orders right now.</p>
                <button style={{marginTop: '1rem', color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => setView('vendors')}>
                  Start a new order
                </button>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <strong style={{fontSize: '1.1rem'}}>{order.vendorName}</strong>
                      <div style={{fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem'}}>Pickup: {order.pickupTime}</div>
                    </div>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-body">
                    {order.items.map((item, i) => (
                      <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem'}}>
                        <span><span style={{fontWeight: '600'}}>{item.quantity}x</span> {item.name}</span>
                        <span>PKR {item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div style={{borderTop: '1px solid #eee', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontSize: '0.9rem', color: '#6b7280'}}>Order ID: #{order.id.slice(-4)}</span>
                      <span style={{fontWeight: '800', fontSize: '1.1rem'}}>Total: PKR {order.total}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- VENDOR DASHBOARD ---
const VendorApp = ({ user, vendorId, logout }) => {
  const [orders, setOrders] = useState([]);
  const vendorInfo = VENDORS.find(v => v.id === vendorId) || { name: 'Unknown Vendor' };

  useEffect(() => {
    if (!vendorId || !db) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      where('vendorId', '==', vendorId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      ords.sort((a, b) => {
        const priority = { 'pending': 1, 'accepted': 2, 'ready': 3, 'completed': 4 };
        return (priority[a.status] - priority[b.status]) || (b.createdAt?.seconds - a.createdAt?.seconds);
      });
      setOrders(ords);
    });
    return () => unsubscribe();
  }, [vendorId]);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
  };

  const activeOrders = orders.filter(o => o.status !== 'completed');

  return (
    <div className="app-container">
      <Header title="Vendor Portal" user={user} logout={logout} role="vendor" />
      
      <main className="container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2 style={{margin: 0, fontSize: '1.75rem'}}>{vendorInfo.name} Dashboard</h2>
          <div style={{background: '#ecfdf5', color: '#047857', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', border: '1px solid #a7f3d0'}}>
            {activeOrders.length} Active Orders
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card" style={{borderColor: '#f59e0b', borderLeftWidth: '4px'}}>
            <div style={{color: '#6b7280', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em'}}>Pending</div>
            <div style={{fontSize: '2.5rem', fontWeight: '800', color: '#111827'}}>{orders.filter(o=>o.status==='pending').length}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#3b82f6', borderLeftWidth: '4px'}}>
            <div style={{color: '#6b7280', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em'}}>In Prep</div>
            <div style={{fontSize: '2.5rem', fontWeight: '800', color: '#111827'}}>{orders.filter(o=>o.status==='accepted').length}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#10b981', borderLeftWidth: '4px'}}>
            <div style={{color: '#6b7280', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em'}}>Ready</div>
            <div style={{fontSize: '2.5rem', fontWeight: '800', color: '#111827'}}>{orders.filter(o=>o.status==='ready').length}</div>
          </div>
        </div>

        <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem', color: '#374151'}}>Incoming Orders</h3>
        {activeOrders.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '1rem', color: '#9ca3af', border: '1px dashed #d1d5db'}}>
            No active orders. Good time for a break!
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem'}}>
            {activeOrders.map(order => (
              <div key={order.id} className="card" style={{borderLeft: order.status === 'pending' ? '4px solid #f59e0b' : '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6'}}>
                  <strong style={{fontSize: '1.1rem'}}>#{order.id.slice(-4)}</strong>
                  <span style={{color: '#6b7280', fontWeight: '500', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '4px'}}>{order.pickupTime}</span>
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{marginBottom: '0.5rem', fontSize: '1rem'}}>
                      <strong style={{color: 'var(--primary)'}}>{item.quantity}x</strong> {item.name}
                    </div>
                  ))}
                </div>
                <div style={{display: 'flex', gap: '0.75rem', marginTop: 'auto'}}>
                  {order.status === 'pending' && (
                    <button className="btn" style={{background: '#2563eb', color: 'white', flex: 1}} onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>
                  )}
                  {order.status === 'accepted' && (
                    <button className="btn" style={{background: '#f59e0b', color: 'white', flex: 1}} onClick={() => updateStatus(order.id, 'ready')}>Mark Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn" style={{background: '#10b981', color: 'white', flex: 1}} onClick={() => updateStatus(order.id, 'completed')}>Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

/* ==================================================================================
   SECTION 6: MAIN APP CONTAINER
   ================================================================================== */

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [vendorId, setVendorId] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (configMissing) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setAuthError(err.message);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = (selectedRole, selectedVendorId) => {
    setRole(selectedRole);
    if (selectedVendorId) setVendorId(selectedVendorId);
  };

  const handleLogout = () => {
    setRole(null);
    setVendorId(null);
  };

  if (configMissing) return <ConfigErrorScreen />;
  if (authError) return <div style={{padding: 50, color: 'red', textAlign: 'center'}}><h2>Auth Error</h2><p>{authError}</p></div>;
  if (!user) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'}}>Loading UFOS...</div>;

  return (
    <>
      <Styles />
      {!role ? (
        <LoginScreen onLogin={handleLogin} />
      ) : role === 'vendor' ? (
        <VendorApp user={user} vendorId={vendorId} logout={handleLogout} />
      ) : (
        <StudentApp user={user} logout={handleLogout} />
      )}
    </>
  );
}