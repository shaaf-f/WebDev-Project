import React, { useState, useEffect } from 'react';
import './App.css'; 
import { 
  ShoppingBag, Clock, XCircle, ArrowLeft, LogOut, User, Store, Utensils, Lock, AlertCircle
} from 'lucide-react';

/* ==================================================================================
   SECTION 1: CONSTANTS & DATA
   ================================================================================== */

const API_URL = 'http://localhost:3001/api';

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

const generateTimeSlots = () => {
  const times = [];
  let minutes = 8 * 60 + 30; // Start at 8:30 AM (in minutes)
  const end = 18 * 60 + 30;  // End at 6:30 PM

  while (minutes <= end) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    // Format: H:MM (pads minutes with 0 if needed, e.g. 8:05)
    times.push(`${h}:${m.toString().padStart(2, '0')}`);
    minutes += 15;
  }
  return times;
};

const TIME_SLOTS = generateTimeSlots();

/* ==================================================================================
   SECTION 4: COMPONENTS
   ================================================================================== */


   
const Header = ({ user, cartCount, setView, view, logout }) => (
  <header className="header">
    <div className="header-content">
      <div className="logo" onClick={() => setView('vendors')}>
        <div className="logo-icon"><ShoppingBag size={20} /></div>
        <span>UFOS</span>
      </div>
      <nav className="nav-links">
        {user.role === 'student' && (
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
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Is XAMPP and node server.js running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><Utensils size={32} /></div>
          <span className="login-brand-text">UFOS</span>
        </div>
        <div className="login-hero-text">
          <h1>Skip the Queue,<br/>Savor the Food.</h1>
          <p>The unified ordering platform. Login with your university credentials.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Please login to continue.</p>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@hu.edu.pk"
                style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}
                required
              />
            </div>
            
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}
                required
              />
            </div>

            {error && (
              <div style={{color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', background: '#fee2e2', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <AlertCircle size={16}/> {error}
              </div>
            )}

            <button type="submit" className="login-btn-lg" disabled={loading}>
              <Lock size={20} /> {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
          
          <div style={{marginTop: '2rem', fontSize: '0.85rem', color: '#666', textAlign: 'center'}}>
            Test Accounts:<br/>
            Student: <b>student@hu.edu.pk</b> / <b>123</b><br/>
            Vendor: <b>vendor@hu.edu.pk</b> / <b>123</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('vendors');
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[0]);
  
  // Hardcoded mapping for demo: If I login as vendor@hu.edu.pk, I own 'v_tapal'
  const VENDOR_ID_MAPPING = {
    'vendor@hu.edu.pk': 'v_tapal'
  };

  // Check Local Storage for persistent login
  useEffect(() => {
    const savedUser = localStorage.getItem('ufos_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ufos_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ufos_user');
    setView('vendors');
    setCart([]);
  };

  // --- ORDER LOGIC ---

  const placeOrder = async () => {
    if (cart.length === 0) return;

    // For this simple MySQL Demo, we only process the items for ONE vendor at a time from the cart
    // In a real app, you'd loop through vendors.
    const firstItem = cart[0];
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const orderData = {
      customerId: user.id,
      vendorId: firstItem.vendorId,
      vendorName: firstItem.vendorName,
      total: total,
      pickupTime: pickupTime
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Order Placed Successfully!");
        setCart([]);
        setView('orders');
        fetchOrders(); // Refresh orders
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    let url = `${API_URL}/orders?userId=${user.id}&role=${user.role}`;
    
    // If I am a vendor, I need to know MY vendor ID
    if (user.role === 'vendor') {
      const myVendorId = VENDOR_ID_MAPPING[user.email];
      url = `${API_URL}/orders?vendorId=${myVendorId}&role=vendor`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setActiveOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Optimistic UI Update
        setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Poll for updates every 3 seconds
  useEffect(() => {
    if (user && (view === 'orders' || user.role === 'vendor')) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [user, view]);

  // --- RENDER ---

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <Header user={user} cartCount={cart.reduce((a,b)=>a+b.quantity,0)} setView={setView} view={view} logout={handleLogout} />
      
      <main className="container">
        {/* === VENDOR VIEW === */}
        {user.role === 'vendor' ? (
          <div>
            <div className="vendor-header-row">
              <h2 className="page-title" style={{marginBottom: 0}}>Vendor Dashboard</h2>
              <div className="active-orders-badge">{activeOrders.filter(o => o.status !== 'completed').length} Active Orders</div>
            </div>

            <div className="dashboard-grid">
               <div className="stat-card" style={{borderColor: '#f59e0b'}}><div className="stat-label">Pending</div><div className="stat-number">{activeOrders.filter(o=>o.status==='pending').length}</div></div>
               <div className="stat-card" style={{borderColor: '#3b82f6'}}><div className="stat-label">In Prep</div><div className="stat-number">{activeOrders.filter(o=>o.status==='accepted').length}</div></div>
               <div className="stat-card" style={{borderColor: '#10b981'}}><div className="stat-label">Ready</div><div className="stat-number">{activeOrders.filter(o=>o.status==='ready').length}</div></div>
            </div>

            <h3 className="section-heading">Incoming Orders</h3>
            <div className="orders-grid">
              {activeOrders.filter(o => o.status !== 'completed').map(order => (
                <div key={order.id} className="card" style={{borderLeft: order.status === 'pending' ? '4px solid #f59e0b' : '1px solid #e5e7eb'}}>
                  <div className="order-card-compact-header">
                    <strong style={{fontSize: '1.1rem'}}>Order #{order.id}</strong>
                    <span className="pickup-tag">{order.pickup_time}</span>
                  </div>
                  <div className="mb-4">
                    <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Total: PKR {order.total}</div>
                    <div style={{color: '#666', fontSize: '0.9rem'}}>Customer ID: {order.customer_id}</div>
                  </div>
                  <div className="action-buttons">
                    {order.status === 'pending' && <button className="btn btn-action bg-blue" onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>}
                    {order.status === 'accepted' && <button className="btn btn-action bg-yellow" onClick={() => updateStatus(order.id, 'ready')}>Mark Ready</button>}
                    {order.status === 'ready' && <button className="btn btn-action bg-green" onClick={() => updateStatus(order.id, 'completed')}>Complete</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* === STUDENT VIEW === */
          <>
            {view === 'vendors' && (
              <div>
                <div className="hero-section">
                   <h1 className="hero-title">Hungry?</h1>
                   <p className="hero-subtitle">Order ahead from your favorite campus spots.</p>
                </div>
                <div className="grid">
                  {VENDORS.map(v => (
                    <div key={v.id} className="card" onClick={() => { setSelectedVendor(v); setView('menu'); }}>
                       <div className="card-header"><div className="card-icon" style={{color:v.theme}}>{v.icon}</div><h3>{v.name}</h3></div>
                       <div className="card-footer"><span className="view-menu-link">View Menu <ArrowLeft size={16} className="arrow-icon"/></span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'menu' && selectedVendor && (
              <div className="split-view">
                <div>
                   <div className="menu-header">
                     <button onClick={()=>setView('vendors')} className="back-btn"><ArrowLeft size={20}/></button>
                     <div><h2 className="menu-title">{selectedVendor.name}</h2></div>
                   </div>
                   <div className="menu-grid">
                     {(MOCK_MENU[selectedVendor.id] || []).map(item => (
                       <div key={item.id} className="menu-item">
                         <div>
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">PKR {item.price}</div>
                         </div>
                         <button className="btn btn-add" onClick={() => setCart([...cart, {...item, vendorId: selectedVendor.id, vendorName: selectedVendor.name, quantity: 1}])}>Add</button>
                       </div>
                     ))}
                   </div>
                </div>
                <div>
                  <div className="cart-summary">
                     <h3 className="cart-title">Cart</h3>
                     {cart.length === 0 ? <p className="cart-empty-state">Empty</p> : (
                       <>
                        {cart.map((i, idx) => (
                          <div key={idx} className="cart-item-row">
                             <span>{i.name}</span>
                             <span>{i.price}</span>
                          </div>
                        ))}
                        <div className="pickup-section">
                          <label className="input-label">Pickup Time</label>
                            <div className="time-selector">
                              {TIME_SLOTS.map(t => (
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
                        <div className="total-row"><span className="total-label">Total</span><span className="total-value">PKR {cart.reduce((a,b)=>a+b.price,0)}</span></div>
                        <button className="btn btn-primary" onClick={placeOrder}>Confirm Order</button>
                       </>
                     )}
                  </div>
                </div>
              </div>
            )}

            {view === 'orders' && (
              <div className="orders-wrapper">
                <h2 className="page-title">Your Orders</h2>
                {activeOrders.map(o => (
                  <div key={o.id} className="order-card">
                    <div className="order-header">
                      <div><strong className="order-vendor-name">{o.vendor_name}</strong><div className="order-pickup-info">Pickup: {o.pickup_time}</div></div>
                      <span className={`status-badge status-${o.status}`}>{o.status}</span>
                    </div>
                    <div className="order-body">
                       <div className="order-footer">
                         <span className="order-id">Order ID: #{o.id}</span>
                         <span className="order-total">Total: PKR {o.total}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}