import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import './App.css';
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
    // apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
    // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    // appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };  

  if (!localConfig.apiKey) {
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
   ================================================================================== */

const VENDORS = [
  { id: 'v_tapal', name: 'Tapal Cafeteria', cuisine: 'Normal Dining & Cuisine', icon: '🍛', theme: '#b91c1c' },
  { id: 'v_cafe2go', name: 'Cafe-2-Go', cuisine: 'Sandwiches & Rolls', icon: '🌯', theme: '#ca8a04' },
  { id: 'v_sync', name: 'Sync', cuisine: 'Coffee', icon: '☕', theme: '#0063f7ff' },
  { id: 'v_grito', name: 'Grito', cuisine: 'Smoothies & Food', icon: '🌯', theme: '#73ff00ff' },
  { id: 'v_sky', name: 'Sky Dhaaba', cuisine: 'Tea & Pakistani Breakfast', icon: '☕', theme: '#084600ff' },
  { id: 'v_rahim', name: 'Rahim Bhai Fries', cuisine: ":'(", icon: '🍟', theme: '#e5ff00ff' },
];

const MOCK_MENU = {
  'v_tapal': [
    { id: 't1', name: 'Mutton Biryani', price: 350, category: 'Main' },
    { id: 't2', name: 'Chicken Karahi', price: 250, category: 'Main' },
    { id: 't3', name: 'Naan', price: 30, category: 'Bread' },
  ],
  'v_cafe2go': [
    { id: 'c1', name: 'Chicken Nuggets & Fries', price: 400, category: 'Continental' },
    { id: 'c2', name: 'Club Sandwich', price: 500, category: 'Sandwiches' },
    { id: 'c3', name: 'Brownie', price: 250, category: 'Dessert' },
    { id: 'c4', name: 'Cola Next', price: 100, category: 'Drinks' }
  ],
  'v_sync': [
    { id: 's1', name: 'Latte', price: 550, category: 'Iced Coffee' },
    { id: 's2', name: 'Caramel Latte', price: 500, category: 'Hot Coffee' },
  ],
  'v_grito': [
    { id: 'g1', name: 'Vanilla Shake', price: 400, category: 'Drinks' },
    { id: 'g2', name: 'Hot Shots', price: 350, category: 'Food' },
  ],
  'v_sky': [
    { id: 'sk1', name: 'Chai', price: 120, category: 'Tea' },
    { id: 'sk2', name: 'Aloo Paratha', price: 300, category: 'Breakfast' },
  ],
  'v_rahim': [
    { id: 'r1', name: 'Large Masala Fries', price: 130, category: 'Fries' },
    { id: 'r2', name: 'Medium Ketchup Fries', price: 70, category: 'Fries' },
  ],
};

/* ==================================================================================
   SECTION 4: COMPONENTS
   ================================================================================== */

const ConfigErrorScreen = () => (
  <div className="full-screen-center">
    <div className="error-icon">
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
        <div className="logo-icon">
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
          <LogOut size={18} /> <span className="logout-text">Logout</span>
        </button>
      </nav>
    </div>
  </header>
);

/* ==================================================================================
   SECTION 5: VIEWS (PAGES)
   ================================================================================== */

// --- LOGIN PAGE (Split View for Desktop) ---
const LoginScreen = ({ onLogin }) => (
  <div className="login-wrapper">
    {/* Left Panel: Hero / Brand */}
    <div className="login-left">
      <div className="login-brand">
        <div className="login-brand-icon">
          <Utensils size={32} />
        </div>
        <span className="login-brand-text">UFOS</span>
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

        <div className="vendor-access-section">
          <p className="vendor-access-title">Vendor Demo Access</p>
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
    // 1. Safety Check: Is the cart empty?
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // 2. Safety Check: Is the database connected?
    if (!db) {
        alert("Database not connected! Check your .env keys and restart the server.");
        console.error("Database Object is undefined.");
        return;
    }
    
    // Group items by vendor (Existing logic)
    const ordersByVendor = {};
    cart.forEach(item => {
      if (!ordersByVendor[item.vendorId]) {
        ordersByVendor[item.vendorId] = { items: [], total: 0, vendorName: item.vendorName };
      }
      ordersByVendor[item.vendorId].items.push(item);
      ordersByVendor[item.vendorId].total += item.price * item.quantity;
    });

    try {
        // 3. Attempt to send to Firebase
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
          
          console.log("Sending Order:", orderData); // Debug log
          
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
        });
    
        await Promise.all(batchPromises);
        
        // 4. Success!
        alert("Order Placed Successfully!");
        setCart([]);
        setView('orders');

    } catch (error) {
        // 5. Catch and Display Errors
        console.error("Error placing order:", error);
        alert("Error: " + error.message);
    }
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
            <div className="hero-section">
              <h1 className="hero-title">Hungry?</h1>
              <p className="hero-subtitle">Order ahead from your favorite campus spots.</p>
            </div>
            
            <div className="grid">
              {VENDORS.map(vendor => (
                <div key={vendor.id} className="card" onClick={() => { setSelectedVendor(vendor); setView('menu'); }}>
                  <div className="card-header">
                    <div className="card-icon" style={{color: vendor.theme}}>{vendor.icon}</div>
                    <div>
                      <h3 className="card-title">{vendor.name}</h3>
                      <span className="card-sub">{vendor.cuisine}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="view-menu-link">
                      View Menu <ArrowLeft size={16} className="arrow-icon"/>
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
                <div className="menu-header">
                  <button onClick={() => setView('vendors')} className="back-btn">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="menu-title">{selectedVendor.name}</h2>
                    <span style={{color: '#6b7280'}}>Full Menu</span>
                  </div>
                </div>
              )}
              
              {view === 'menu' && selectedVendor ? (
                <div className="menu-grid">
                  {(MOCK_MENU[selectedVendor.id] || []).map(item => (
                    <div key={item.id} className="menu-item">
                      <div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">PKR {item.price}</div>
                      </div>
                      <button className="btn btn-add" onClick={() => addToCart(item)}>Add +</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-menu">
                  Select a vendor to view their menu.
                </div>
              )}
            </div>

            {/* Right: Cart Summary */}
            <div>
              <div className="cart-summary">
                <h3 className="cart-title">Current Order</h3>
                {cart.length === 0 ? (
                  <div className="cart-empty-state">
                    <ShoppingBag size={48} className="cart-empty-icon" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item, idx) => (
                        <div key={idx} className="cart-item-row">
                          <div className="cart-item-info">
                            <span className="qty-tag">x{item.quantity}</span>
                            <span>{item.name}</span>
                          </div>
                          <div className="cart-item-actions">
                            <span className="item-total">PKR {item.price * item.quantity}</span>
                            <XCircle size={16} className="remove-btn" onClick={() => removeFromCart(item.id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pickup-section">
                      <label className="input-label">Pickup Time</label>
                      <div className="time-selector">
                        {['11:30', '13:00', '15:15', '17:00'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setPickupTime(t)}
                            className={`time-btn ${pickupTime === t ? 'active' : ''}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="total-row">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">PKR {calculateTotal()}</span>
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
          <div className="orders-wrapper">
            <h2 className="page-title">Your Orders</h2>
            {activeOrders.length === 0 ? (
              <div className="orders-empty-state">
                <Clock size={48} style={{color: '#d1d5db', margin: '0 auto 1rem'}} />
                <p style={{color: '#6b7280', fontSize: '1.1rem'}}>No active orders right now.</p>
                <button className="btn-outline" onClick={() => setView('vendors')}>
                  Start a new order
                </button>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <strong className="order-vendor-name">{order.vendorName}</strong>
                      <div className="order-pickup-info">Pickup: {order.pickupTime}</div>
                    </div>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-body">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex-between mb-2" style={{fontSize: '0.95rem'}}>
                        <span><span style={{fontWeight: '600'}}>{item.quantity}x</span> {item.name}</span>
                        <span>PKR {item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="order-footer">
                      <span className="order-id">Order ID: #{order.id.slice(-4)}</span>
                      <span className="order-total">Total: PKR {order.total}</span>
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
        <div className="vendor-header-row">
          <h2 className="page-title" style={{marginBottom: 0}}>{vendorInfo.name} Dashboard</h2>
          <div className="active-orders-badge">
            {activeOrders.length} Active Orders
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card" style={{borderColor: '#f59e0b'}}>
            <div className="stat-label">Pending</div>
            <div className="stat-number">{orders.filter(o=>o.status==='pending').length}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#3b82f6'}}>
            <div className="stat-label">In Prep</div>
            <div className="stat-number">{orders.filter(o=>o.status==='accepted').length}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#10b981'}}>
            <div className="stat-label">Ready</div>
            <div className="stat-number">{orders.filter(o=>o.status==='ready').length}</div>
          </div>
        </div>

        <h3 className="section-heading">Incoming Orders</h3>
        {activeOrders.length === 0 ? (
          <div className="vendor-empty-state">
            No active orders. Good time for a break!
          </div>
        ) : (
          <div className="orders-grid">
            {activeOrders.map(order => (
              <div key={order.id} className="card" style={{borderLeft: order.status === 'pending' ? '4px solid #f59e0b' : '1px solid #e5e7eb'}}>
                <div className="order-card-compact-header">
                  <strong style={{fontSize: '1.1rem'}}>#{order.id.slice(-4)}</strong>
                  <span className="pickup-tag">{order.pickupTime}</span>
                </div>
                <div className="mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="item-row">
                      <strong className="item-qty">{item.quantity}x</strong> {item.name}
                    </div>
                  ))}
                </div>
                <div className="action-buttons">
                  {order.status === 'pending' && (
                    <button className="btn btn-action bg-blue" onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>
                  )}
                  {order.status === 'accepted' && (
                    <button className="btn btn-action bg-yellow" onClick={() => updateStatus(order.id, 'ready')}>Mark Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-action bg-green" onClick={() => updateStatus(order.id, 'completed')}>Complete</button>
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
  if (authError) return <div className="auth-error-box"><h2>Auth Error</h2><p>{authError}</p></div>;
  if (!user) return <div className="full-screen-center">Loading UFOS...</div>;

  return (
    <>
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