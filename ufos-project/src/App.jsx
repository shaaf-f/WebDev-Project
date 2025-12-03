import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { 
  ShoppingBag, Clock, XCircle, ArrowLeft, LogOut, User, Store, Utensils, Lock, AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const VENDORS = [
  { id: 'v_tapal', name: 'Tapal Cafeteria', cuisine: 'Normal Dining & Cuisine', icon: '🍛', logo: '/logos/tapal.svg', theme: '#b91c1c' },
  { id: 'v_cafe2go', name: 'Cafe-2-Go', cuisine: 'Sandwiches & Rolls', icon: '🌯', logo: '/logos/cafe2go.svg', theme: '#ca8a04' },
  { id: 'v_sync', name: 'Sync', cuisine: 'Coffee', icon: '☕', logo: '/logos/sync.svg', theme: '#0063f7ff' },
  { id: 'v_grito', name: 'Grito', cuisine: 'Smoothies & Food', icon: '🌯', logo: '/logos/grito.svg', theme: '#73ff00ff' },
  { id: 'v_sky', name: 'Sky Dhaaba', cuisine: 'Tea & Pakistani Breakfast', icon: '☕', logo: '/logos/sky.svg', theme: '#084600ff' },
  { id: 'v_rahim', name: 'Rahim Bhai Fries', cuisine: ":'(", icon: '🍟', logo: '/logos/rahim.svg', theme: '#e5ff00ff' },
];

const generateTimeSlots = () => {
  const times = [];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  times.push('01:00 (Testing)');
  
  times.push('08:30');
  
  let minutes = 9 * 60; 
  const end = 18 * 60 + 30;

  while (minutes <= end) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
    
    const [slotH, slotM] = timeStr.split(':').map(Number);
    const slotTotalMinutes = slotH * 60 + slotM;
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    if (slotTotalMinutes >= currentTotalMinutes + 15) {
      times.push(timeStr);
    }
    
    minutes += 15;
  }
  
  return times;
};

const TIME_SLOTS = generateTimeSlots();

const CartPage = ({ cart, removeFromCart, placeOrder, setView, pickupTime, setPickupTime }) => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const isBeforeOrderingTime = currentHours < 8; 
  const isAfterOrderingTime = currentHours >= 18 && (currentHours > 18 || currentMinutes > 30); 
  
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your Cart</h2>
        <p>Your cart is empty. Go add some items!</p>
        <button className="btn btn-secondary" onClick={() => setView('vendors')} style={{marginTop: '1rem'}}>Browse Vendors</button>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartByVendor = cart.reduce((acc, item) => {
    const vendor = VENDORS.find(v => v.id === item.vendor_id);
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(item);
    return acc;
  }, {});

  return (
    <div className="split-view">
      <div>
        <h2 className="page-title">Your Cart</h2>
        {Object.entries(cartByVendor).map(([vendorName, items]) => (
          <div key={vendorName} className="vendor-cart-section">
            <h3 className="vendor-cart-title">{vendorName}</h3>
            {items.map(item => (
              <div key={item.product_id} className="cart-item-row">
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name} (x{item.quantity})</span>
                  <span className="cart-item-price">PKR {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button onClick={() => removeFromCart(item)} className="btn-remove-item">
                  <XCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3 className="cart-title">Order Summary</h3>
        
        {isBeforeOrderingTime && (
          <div style={{background: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem'}}>
            Orders available only after 8:00 AM
          </div>
        )}
        
        {isAfterOrderingTime && (
          <div style={{background: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem'}}>
            Ordering time has ended (6:30 PM). Testing slot available.
          </div>
        )}
        
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
        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-value">PKR {total.toFixed(2)}</span>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={placeOrder}
          disabled={isBeforeOrderingTime && !pickupTime.includes('Testing')}
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};


   
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
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.2)'}}>
          <span style={{color: '#fff', fontSize: '0.95rem'}}>
            <User size={16} style={{display: 'inline', marginRight: '0.5rem'}} />
            Hello, {user.name}
          </span>
          <button className="nav-btn" onClick={logout}>
            <LogOut size={18} /> <span className="logout-text">Logout</span>
          </button>
        </div>
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
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Is the server running on port 3001?');
      } else {
        setError('Cannot connect to server at http://localhost:3001/api. Please ensure XAMPP and node server.js are running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Is the server running on port 3001?');
      } else {
        setError('Cannot connect to server at http://localhost:3001/api. Please ensure XAMPP and node server.js are running.');
      }
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
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isRegister ? 'Join UFOS as a student.' : 'Please login to continue.'}</p>

          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb'}}>
            <button 
              onClick={() => { setIsRegister(false); setError(''); setEmail(''); setPassword(''); setName(''); }}
              style={{
                padding: '0.75rem 1rem',
                background: !isRegister ? '#000' : 'transparent',
                color: !isRegister ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontWeight: !isRegister ? 'bold' : 'normal',
                borderBottom: !isRegister ? '2px solid #000' : 'none',
                marginBottom: '-1px'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsRegister(true); setError(''); setEmail(''); setPassword(''); setName(''); }}
              style={{
                padding: '0.75rem 1rem',
                background: isRegister ? '#000' : 'transparent',
                color: isRegister ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isRegister ? 'bold' : 'normal',
                borderBottom: isRegister ? '2px solid #000' : 'none',
                marginBottom: '-1px'
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            {isRegister && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}
                  required
                />
              </div>
            )}

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
              <Lock size={20} /> {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Login')}
            </button>
          </form>
          
          {!isRegister && (
            <div style={{marginTop: '2rem', fontSize: '0.85rem', color: '#666', textAlign: 'center'}}>
              Test Accounts:<br/>
              Student: <b>student@hu.edu.pk</b> / <b>123</b><br/>
              Vendor: <b>vendor@hu.edu.pk</b> / <b>123</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('vendors');
  const [vendorView, setVendorView] = useState('orders'); 
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[0]);
  const [menu, setMenu] = useState({});
  const [vendorEarnings, setVendorEarnings] = useState({ today: 0, month: 0 });
  const [orderItemsMap, setOrderItemsMap] = useState({});
  const [vendorProducts, setVendorProducts] = useState([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ product_id: '', name: '', price: '', category: '' });
  
  const VENDOR_ID_MAPPING = {
    'vendor@hu.edu.pk': 'v_tapal',
    'cafe2go@hu.edu.pk': 'v_cafe2go',
    'sync@hu.edu.pk': 'v_sync',
    'grito@hu.edu.pk': 'v_grito',
    'sky@hu.edu.pk': 'v_sky',
    'rahim@hu.edu.pk': 'v_rahim'
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('ufos_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'student') {
        fetchCart(parsedUser.id);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ufos_user', JSON.stringify(userData));
    if (userData.role === 'student') {
      fetchCart(userData.id);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ufos_user');
    setView('vendors');
    setCart([]);
    setVendorEarnings({ today: 0, month: 0 });
  };

  useEffect(() => {
    if (selectedVendor) {
      axios.get(`${API_URL}/products/${selectedVendor.id}`)
        .then(res => setMenu(prev => ({ ...prev, [selectedVendor.id]: res.data })))
        .catch(err => console.error('Failed to fetch menu:', err));
    }
  }, [selectedVendor]);

  const fetchCart = (userId) => {
    axios.get(`${API_URL}/cart/${userId}`)
      .then(async (res) => {
        const cartItems = res.data;
        if (cartItems.length === 0) {
          setCart([]);
          return;
        }
        
        const vendorId = cartItems[0].vendor_id;
        
        try {
          const enabledRes = await axios.get(`${API_URL}/products/${vendorId}`);
          const enabledProductIds = new Set(enabledRes.data.map(p => p.product_id));
          
          const validItems = cartItems.filter(item => enabledProductIds.has(item.product_id));
          
          if (validItems.length !== cartItems.length) {
            const removedIds = cartItems
              .filter(item => !enabledProductIds.has(item.product_id))
              .map(item => item.product_id);
            
            for (const productId of removedIds) {
              await axios.delete(`${API_URL}/cart/${userId}/${productId}`).catch(() => {});
            }
          }
          
          setCart(validItems);
        } catch (err) {
          console.error('Failed to validate cart:', err);
          setCart(cartItems);
        }
      })
      .catch(err => console.error('Failed to fetch cart:', err));
  };

  const addToCart = (item) => {
    if (!user) return;
    
    if (cart.length > 0) {
      const cartVendorId = cart[0].vendor_id;
      if (cartVendorId !== item.vendor_id) {
        const confirmClear = window.confirm(
          `Your cart contains items from ${VENDORS.find(v => v.id === cartVendorId)?.name}.\n\nClear cart and add item from ${VENDORS.find(v => v.id === item.vendor_id)?.name}?`
        );
        
        if (!confirmClear) return; 
        
        axios.delete(`${API_URL}/cart/${user.id}`)
          .then(() => {
            axios.post(`${API_URL}/cart/${user.id}`, { productId: item.product_id, quantity: 1 })
              .then(() => fetchCart(user.id))
              .catch(err => console.error('Failed to add to cart:', err));
          })
          .catch(err => console.error('Failed to clear cart:', err));
        return;
      }
    }
    
    axios.post(`${API_URL}/cart/${user.id}`, { productId: item.product_id, quantity: 1 })
      .then(() => fetchCart(user.id))
      .catch(err => console.error('Failed to add to cart:', err));
  };

  const removeFromCart = (item) => {
    if (!user) return;
    axios.delete(`${API_URL}/cart/${user.id}/${item.product_id}`)
      .then(() => fetchCart(user.id))
      .catch(err => console.error('Failed to remove from cart:', err));
  };


  const placeOrder = async () => {
    if (cart.length === 0 || !user) return;

    const firstItem = cart[0];
    const vendorId = firstItem.vendor_id;
    
    try {
      const res = await fetch(`${API_URL}/products/${vendorId}`);
      const enabledProducts = await res.json();
      const enabledProductIds = new Set(enabledProducts.map(p => p.product_id));
      
      setMenu(prev => ({ ...prev, [vendorId]: enabledProducts }));
      
      const validCartItems = cart.filter(item => enabledProductIds.has(item.product_id));
      
      if (validCartItems.length !== cart.length) {
        setCart(validCartItems);
        alert('Some items in your cart are no longer available. They have been removed.');
        if (validCartItems.length === 0) {
          return;
        }
      }
      
      const vendor = VENDORS.find(v => v.id === vendorId);
      const vendorName = vendor ? vendor.name : 'Unknown Vendor';
      const total = validCartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      const orderData = {
        customerId: user.id,
        customerName: user.name,
        vendorId: vendorId,
        vendorName: vendorName,
        total: total,
        pickupTime: pickupTime,
        items: validCartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (orderRes.ok) {
        await fetch(`${API_URL}/cart/${user.id}`, { method: 'DELETE' });
        
        alert("Order Placed Successfully!");
        setCart([]);
        setView('orders');
        fetchOrders();
      } else {
        const errorData = await orderRes.json();
        alert(errorData.error || "Failed to place order.");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    let url = `${API_URL}/orders?userId=${user.id}&role=${user.role}`;
    
    if (user.role === 'vendor') {
      const myVendorId = VENDOR_ID_MAPPING[user.email];
      url = `${API_URL}/orders?vendorId=${myVendorId}&role=vendor`;
      
      fetchVendorEarnings(myVendorId);
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setActiveOrders(data);
      
      data.forEach(order => {
        if (!orderItemsMap[order.id]) {
          fetchOrderItems(order.id);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVendorEarnings = async (vendorId) => {
    try {
      const res = await fetch(`${API_URL}/vendor/earnings/${vendorId}`);
      const data = await res.json();
      setVendorEarnings(data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/order-items/${orderId}`);
      const data = await res.json();
      setOrderItemsMap(prev => ({ ...prev, [orderId]: data }));
    } catch (err) {
      console.error('Failed to fetch order items:', err);
    }
  };

  const fetchVendorProducts = async (vendorId) => {
    try {
      const res = await fetch(`${API_URL}/vendor/products/${vendorId}`);
      const data = await res.json();
      setVendorProducts(data);
    } catch (err) {
      console.error('Failed to fetch vendor products:', err);
    }
  };

  const addProduct = async () => {
    if (!newProduct.product_id || !newProduct.name || !newProduct.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const myVendorId = VENDOR_ID_MAPPING[user.email];
      const res = await fetch(`${API_URL}/vendor/products/${myVendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (res.ok) {
        alert('Product added successfully!');
        setNewProduct({ product_id: '', name: '', price: '', category: '' });
        setShowAddProductForm(false);
        fetchVendorProducts(myVendorId);
        setMenu(prev => ({ ...prev, [myVendorId]: undefined }));
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const myVendorId = VENDOR_ID_MAPPING[user.email];
      const res = await fetch(`${API_URL}/vendor/products/${myVendorId}/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        fetchVendorProducts(myVendorId);
        setMenu(prev => ({ ...prev, [myVendorId]: undefined }));
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const myVendorId = VENDOR_ID_MAPPING[user.email];
      const res = await fetch(`${API_URL}/vendor/products/${myVendorId}/${productId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Product deleted');
        fetchVendorProducts(myVendorId);
        setMenu(prev => ({ ...prev, [myVendorId]: undefined }));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
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
        setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (user && user.role === 'vendor') {
          const myVendorId = VENDOR_ID_MAPPING[user.email];
          fetchVendorEarnings(myVendorId);
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    if (user && (view === 'orders' || user.role === 'vendor')) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [user, view]);

  useEffect(() => {
    if (user && user.role === 'student' && view === 'menu' && selectedVendor) {
      const interval = setInterval(() => {
        axios.get(`${API_URL}/products/${selectedVendor.id}`)
          .then(res => setMenu(prev => ({ ...prev, [selectedVendor.id]: res.data })))
          .catch(err => console.error('Failed to fetch menu:', err));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, view, selectedVendor]);

  // --- RENDER ---

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <Header user={user} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} setView={setView} view={view} logout={handleLogout} />
      
      <main className="container">
        {/* === VENDOR VIEW === */}
        {user.role === 'vendor' ? (
          <div>
            <div className="vendor-header-row">
              <h2 className="page-title" style={{marginBottom: 0}}>{VENDOR_ID_MAPPING[user.email] ? VENDORS.find(v => v.id === VENDOR_ID_MAPPING[user.email])?.name : 'Vendor'} Dashboard</h2>
              <div className="active-orders-badge">{activeOrders.filter(o => o.status !== 'completed').length} Active Orders</div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem'}}>
              <button 
                onClick={() => setVendorView('orders')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: vendorView === 'orders' ? '#000' : 'transparent',
                  color: vendorView === 'orders' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: vendorView === 'orders' ? 'bold' : 'normal',
                  fontSize: '1rem'
                }}
              >
                Orders
              </button>
              <button 
                onClick={() => {
                  setVendorView('products');
                  const myVendorId = VENDOR_ID_MAPPING[user.email];
                  fetchVendorProducts(myVendorId);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: vendorView === 'products' ? '#000' : 'transparent',
                  color: vendorView === 'products' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: vendorView === 'products' ? 'bold' : 'normal',
                  fontSize: '1rem'
                }}
              >
                Products
              </button>
            </div>

            {vendorView === 'orders' ? (
              <>
            <div className="dashboard-grid">
              <div className="stat-card" style={{borderColor: '#f59e0b'}}><div className="stat-label">Today Earnings</div><div className="stat-number">PKR {vendorEarnings.today}</div></div>
              <div className="stat-card" style={{borderColor: '#3b82f6'}}><div className="stat-label">Month Earnings</div><div className="stat-number">PKR {vendorEarnings.month}</div></div>
              <div className="stat-card" style={{borderColor: '#10b981'}}><div className="stat-label">Active Orders</div><div className="stat-number">{activeOrders.filter(o => ['pending', 'accepted', 'ready'].includes(o.status)).length}</div></div>
            </div>

            {/* Incoming Orders */}
            <h3 className="section-heading">Incoming Orders</h3>
            <div className="orders-grid">
              {activeOrders.filter(o => o.status === 'pending').map(order => (
                <div key={order.id} className="card" style={{borderLeft: '4px solid #f59e0b'}}>
                  <div className="order-card-compact-header">
                    <strong style={{fontSize: '1.1rem'}}>Order #{order.id}</strong>
                    <span className="pickup-tag">{order.pickup_time}</span>
                  </div>
                  <div className="mb-4">
                    <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>{order.customer_name}</div>
                    <div style={{color: '#666', fontSize: '0.9rem'}}>Total: PKR {order.total}</div>
                    {orderItemsMap[order.id] && orderItemsMap[order.id].length > 0 && (
                      <div style={{marginTop: '0.75rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.85rem'}}>
                        <strong style={{color: '#000'}}>Items:</strong>
                        {orderItemsMap[order.id].map(item => (
                          <div key={item.order_item_id} style={{color: '#555', marginTop: '0.25rem'}}>
                            • {item.product_name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-action bg-green" onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>
                    <button className="btn btn-action bg-red" onClick={() => updateStatus(order.id, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
              {activeOrders.filter(o => o.status === 'pending').length === 0 && (
                <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '2rem'}}>No incoming orders</p>
              )}
            </div>

            {/* In Progress Orders */}
            <h3 className="section-heading">In Progress</h3>
            <div className="orders-grid">
              {activeOrders.filter(o => o.status === 'accepted').map(order => (
                <div key={order.id} className="card" style={{borderLeft: '4px solid #3b82f6'}}>
                  <div className="order-card-compact-header">
                    <strong style={{fontSize: '1.1rem'}}>Order #{order.id}</strong>
                    <span className="pickup-tag">{order.pickup_time}</span>
                  </div>
                  <div className="mb-4">
                    <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>{order.customer_name}</div>
                    <div style={{color: '#666', fontSize: '0.9rem'}}>Total: PKR {order.total}</div>
                    {orderItemsMap[order.id] && orderItemsMap[order.id].length > 0 && (
                      <div style={{marginTop: '0.75rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.85rem'}}>
                        <strong style={{color: '#000'}}>Items:</strong>
                        {orderItemsMap[order.id].map(item => (
                          <div key={item.order_item_id} style={{color: '#555', marginTop: '0.25rem'}}>
                            • {item.product_name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-action bg-yellow" onClick={() => updateStatus(order.id, 'ready')}>Ready</button>
                  </div>
                </div>
              ))}
              {activeOrders.filter(o => o.status === 'accepted').length === 0 && (
                <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '2rem'}}>No orders in progress</p>
              )}
            </div>

            {/* Awaiting Pickup */}
            <h3 className="section-heading">Awaiting Pickup</h3>
            <div className="orders-grid">
              {activeOrders.filter(o => o.status === 'ready').map(order => (
                <div key={order.id} className="card" style={{borderLeft: '4px solid #10b981'}}>
                  <div className="order-card-compact-header">
                    <strong style={{fontSize: '1.1rem'}}>Order #{order.id}</strong>
                    <span className="pickup-tag">{order.pickup_time}</span>
                  </div>
                  <div className="mb-4">
                    <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>{order.customer_name}</div>
                    <div style={{color: '#666', fontSize: '0.9rem'}}>Total: PKR {order.total}</div>
                    {orderItemsMap[order.id] && orderItemsMap[order.id].length > 0 && (
                      <div style={{marginTop: '0.75rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.85rem'}}>
                        <strong style={{color: '#000'}}>Items:</strong>
                        {orderItemsMap[order.id].map(item => (
                          <div key={item.order_item_id} style={{color: '#555', marginTop: '0.25rem'}}>
                            • {item.product_name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-action bg-green" onClick={() => updateStatus(order.id, 'completed')}>Complete</button>
                  </div>
                </div>
              ))}
              {activeOrders.filter(o => o.status === 'ready').length === 0 && (
                <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '2rem'}}>No orders awaiting pickup</p>
              )}
            </div>

            {/* Order History */}
            <h3 className="section-heading">Order History</h3>
            <div className="orders-grid">
              {activeOrders.filter(o => o.status === 'completed').map(order => (
                <div key={order.id} className="card" style={{borderLeft: '4px solid #6b7280', opacity: 0.8}}>
                  <div className="order-card-compact-header">
                    <strong style={{fontSize: '1.1rem'}}>Order #{order.id}</strong>
                    <span className="pickup-tag">{order.pickup_time}</span>
                  </div>
                  <div className="mb-4">
                    <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>{order.customer_name}</div>
                    <div style={{color: '#666', fontSize: '0.9rem'}}>Total: PKR {order.total}</div>
                  </div>
                </div>
              ))}
              {activeOrders.filter(o => o.status === 'completed').length === 0 && (
                <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '2rem'}}>No completed orders yet</p>
              )}
            </div>
              </>
            ) : (
              <>
                <h3 className="section-heading">Product Management</h3>
                
                {showAddProductForm ? (
                  <div className="card" style={{marginBottom: '2rem'}}>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold'}}>Add New Product</h4>
                    <form onSubmit={(e) => { e.preventDefault(); addProduct(); }}>
                      <div style={{marginBottom: '1rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Product ID</label>
                        <input 
                          type="text" 
                          placeholder="Unique product ID (e.g., t_chai_100)" 
                          value={newProduct.product_id}
                          onChange={(e) => setNewProduct({...newProduct, product_id: e.target.value})}
                          style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box'}}
                          required
                        />
                      </div>
                      <div style={{marginBottom: '1rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Product Name</label>
                        <input 
                          type="text" 
                          placeholder="Product name" 
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box'}}
                          required
                        />
                      </div>
                      <div style={{marginBottom: '1rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Price (PKR)</label>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box'}}
                          required
                        />
                      </div>
                      <div style={{marginBottom: '1rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Category</label>
                        <input 
                          type="text" 
                          placeholder="Category" 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box'}}
                          required
                        />
                      </div>
                      <div style={{display: 'flex', gap: '1rem'}}>
                        <button type="submit" className="btn btn-primary" style={{flex: 1}}>Add Product</button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAddProductForm(false);
                            setNewProduct({ product_id: '', name: '', price: '', category: '' });
                          }}
                          style={{flex: 1, padding: '0.75rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowAddProductForm(true)}
                    style={{marginBottom: '2rem'}}
                  >
                    + Add Product
                  </button>
                )}
                
                <h4 style={{marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold'}}>Your Products</h4>
                {vendorProducts.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#999', padding: '2rem'}}>No products yet. Add one to get started.</p>
                ) : (
                  <div className="products-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
                    {vendorProducts.map(product => (
                      <div key={product.product_id} className="card" style={{display: 'flex', flexDirection: 'column'}}>
                        <div style={{marginBottom: '1rem'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem'}}>
                            <div>
                              <h5 style={{margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>{product.name}</h5>
                              <p style={{margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem'}}>{product.category}</p>
                            </div>
                            <span style={{
                              padding: '0.25rem 0.75rem', 
                              background: product.enabled ? '#d1fae5' : '#fee2e2', 
                              color: product.enabled ? '#065f46' : '#991b1b',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {product.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <p style={{margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#000'}}>PKR {product.price}</p>
                        </div>
                        <div className="action-buttons" style={{marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          <button 
                            className="btn btn-action" 
                            style={{flex: 1, fontSize: '0.9rem', padding: '0.5rem', background: product.enabled ? '#fef3c7' : '#d1fae5', color: '#000'}}
                            onClick={() => updateProduct(product.product_id, { enabled: product.enabled ? 0 : 1 })}
                          >
                            {product.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button 
                            className="btn btn-action bg-red" 
                            style={{flex: 1, fontSize: '0.9rem', padding: '0.5rem'}}
                            onClick={() => deleteProduct(product.product_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {view === 'vendors' && (
              <div>
                <div className="hero-section">
                   <h1 className="hero-title">Welcome, {user.name}!</h1>
                   <p className="hero-subtitle">Order ahead from your favorite campus spots.</p>
                </div>
                <div className="grid">
                  {VENDORS.map(v => (
                    <div key={v.id} className="card" onClick={() => { setSelectedVendor(v); setView('menu'); }}>
                       <div className="card-header">
                         <div className="card-icon" style={{color:v.theme}}>
                           {v.logo ? <img src={v.logo} alt={v.name} style={{width: '40px', height: '40px', objectFit: 'contain'}} /> : v.icon}
                         </div>
                         <h3>{v.name}</h3>
                       </div>
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
                     {(menu[selectedVendor.id] || []).map(item => (
                       <div key={item.product_id} className="menu-item">
                         <div>
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">PKR {item.price}</div>
                         </div>
                         <button className="btn btn-add" onClick={() => addToCart(item)}>Add</button>
                       </div>
                     ))}
                   </div>
                </div>
                <div>
                  <div className="cart-summary">
                     <h3 className="cart-title">Cart</h3>
                     {cart.length === 0 ? <p className="cart-empty-state">Empty</p> : (
                       <>
                        {cart.map((i) => (
                          <div key={i.product_id} className="cart-item-row">
                             <span>{i.name} (x{i.quantity})</span>
                             <span>PKR {(i.price * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="total-row" style={{marginTop:'1rem'}}>
                          <span className="total-label">Total</span>
                          <span className="total-value">PKR {cart.reduce((a,b)=>a+(b.price*b.quantity),0).toFixed(2)}</span>
                        </div>
                        <button className="btn btn-secondary" style={{width:'100%', marginTop:'1rem'}} onClick={() => setView('cart')}>
                          View Full Cart
                        </button>
                       </>
                     )}
                  </div>
                </div>
              </div>
            )}

            {view === 'cart' && (
              <CartPage 
                cart={cart} 
                removeFromCart={removeFromCart} 
                placeOrder={placeOrder} 
                setView={setView}
                pickupTime={pickupTime}
                setPickupTime={setPickupTime}
              />
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
                      {orderItemsMap[o.id] && orderItemsMap[o.id].length > 0 && (
                        <div style={{marginBottom: '0.75rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.9rem'}}>
                          <strong style={{color: '#000', display: 'block', marginBottom: '0.5rem'}}>Items:</strong>
                          {orderItemsMap[o.id].map(item => (
                            <div key={item.order_item_id} style={{color: '#555', marginBottom: '0.25rem'}}>
                              • {item.product_name} × {item.quantity} = PKR {(item.price * item.quantity).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
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