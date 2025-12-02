import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Middleware - Order matters!
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// --- DATABASE CONNECTION (XAMPP CONFIG) ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Default XAMPP user
  password: '',      // Default XAMPP password is empty
  database: 'ufos_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
    console.log('   (Make sure XAMPP MySQL is running and you created the "ufos_db" database)');
    return;
  }
  console.log('✅ Connected to XAMPP MySQL Database');
});

// --- TEST ENDPOINT (Remove after verification) ---
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Server is working!' });
// });

// app.post('/api/test', (req, res) => {
//   res.json({ message: 'POST test working!', received: req.body });
// });

// --- 1. LOGIN ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      const user = results[0];
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// --- 1B. REGISTER (STUDENT ONLY) ---
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  // Check if email already exists
  const checkSql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(checkSql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Register new student
    const insertSql = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
    
    db.query(insertSql, [email, password, name, 'student'], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      res.json({
        message: 'Registration successful',
        id: result.insertId,
        email: email,
        name: name,
        role: 'student'
      });
    });
  });
});

// --- 2. PLACE ORDER ---
app.post('/api/orders', (req, res) => {
  const { customerId, customerName, vendorId, vendorName, total, pickupTime, items } = req.body;
  
  // Validate all products are still enabled
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const productIds = items.map(item => item.product_id);
  const placeholders = productIds.map(() => '?').join(',');
  const validationSql = `SELECT product_id FROM products WHERE vendor_id = ? AND product_id IN (${placeholders}) AND enabled = 1`;
  
  db.query(validationSql, [vendorId, ...productIds], (err, validProducts) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Check if all products are valid
    if (validProducts.length !== items.length) {
      return res.status(400).json({ error: 'Some products are no longer available. Please refresh and try again.' });
    }
    
    const sql = 'INSERT INTO orders (customer_id, customer_name, vendor_id, vendor_name, total, pickup_time) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [customerId, customerName, vendorId, vendorName, total, pickupTime], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const orderId = result.insertId;
      
      // Save order items
      if (items && items.length > 0) {
        items.forEach(item => {
          const itemSql = 'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)';
          db.query(itemSql, [orderId, item.product_id, item.name, item.quantity, item.price], (err) => {
            if (err) console.error('Error saving order item:', err.message);
          });
        });
      }
      
      res.json({ message: 'Order placed', orderId: orderId });
    });
  });
});

// --- 3. GET ORDERS ---
app.get('/api/orders', (req, res) => {
  const { userId, role, vendorId } = req.query;
  let sql = 'SELECT * FROM orders';
  
  // If student, only show their orders
  if (role === 'student') {
    // Note: db.escape() is a method on the connection object to prevent SQL injection
    sql += ` WHERE customer_id = ${db.escape(userId)}`;
  } 
  // If vendor, only show orders for their shop
  else if (vendorId) {
    sql += ` WHERE vendor_id = ${db.escape(vendorId)}`;
  }
  
  sql += ' ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 4. UPDATE STATUS (For Vendor) ---
app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

// --- 5. GET PRODUCTS BY VENDOR ---
app.get('/api/products/:vendorId', (req, res) => {
    const { vendorId } = req.params;
    const { includeDisabled } = req.query;
    
    let sql = 'SELECT * FROM products WHERE vendor_id = ?';
    
    // Only show enabled products by default (for students)
    if (!includeDisabled) {
      sql += ' AND enabled = 1';
    }
    
    sql += ' ORDER BY created_at DESC';

    db.query(sql, [vendorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 5B. GET ALL PRODUCTS FOR VENDOR (including disabled) ---
app.get('/api/vendor/products/:vendorId', (req, res) => {
    const { vendorId } = req.params;
    const sql = 'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC';

    db.query(sql, [vendorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 5C. ADD PRODUCT ---
app.post('/api/vendor/products/:vendorId', (req, res) => {
    const { vendorId } = req.params;
    const { product_id, name, price, category } = req.body;
    
    if (!product_id || !name || !price) {
        return res.status(400).json({ error: 'product_id, name, and price are required' });
    }
    
    const sql = 'INSERT INTO products (product_id, vendor_id, name, price, category, enabled) VALUES (?, ?, ?, ?, ?, 1)';
    
    db.query(sql, [product_id, vendorId, name, price, category], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product added', product_id: product_id });
    });
});

// --- 5D. UPDATE PRODUCT ---
app.patch('/api/vendor/products/:vendorId/:productId', (req, res) => {
    const { vendorId, productId } = req.params;
    const { name, price, category, enabled } = req.body;
    
    let sql = 'UPDATE products SET ';
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (enabled !== undefined) { updates.push('enabled = ?'); values.push(enabled); }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    sql += updates.join(', ') + ' WHERE product_id = ? AND vendor_id = ?';
    values.push(productId, vendorId);
    
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated' });
    });
});

// --- 5E. DELETE PRODUCT ---
app.delete('/api/vendor/products/:vendorId/:productId', (req, res) => {
    const { vendorId, productId } = req.params;
    const sql = 'DELETE FROM products WHERE product_id = ? AND vendor_id = ?';
    
    db.query(sql, [productId, vendorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

// --- 6. GET CART ITEMS ---
app.get('/api/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT p.product_id, p.name, p.price, ci.quantity, p.vendor_id
        FROM cart_items ci
        JOIN user_carts uc ON ci.cart_id = uc.cart_id
        JOIN products p ON ci.product_id = p.product_id
        WHERE uc.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 7. ADD TO CART ---
app.post('/api/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // First, get or create a cart for the user
    const getCartSql = 'SELECT cart_id FROM user_carts WHERE user_id = ?';
    db.query(getCartSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let cartId;
        if (results.length > 0) {
            cartId = results[0].cart_id;
            addItemToCart(cartId, productId, quantity, res);
        } else {
            const createCartSql = 'INSERT INTO user_carts (user_id) VALUES (?)';
            db.query(createCartSql, [userId], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                cartId = result.insertId;
                addItemToCart(cartId, productId, quantity, res);
            });
        }
    });
});

function addItemToCart(cartId, productId, quantity, res) {
    const checkItemSql = 'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?';
    db.query(checkItemSql, [cartId, productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // Update quantity
            const updateSql = 'UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?';
            db.query(updateSql, [quantity, results[0].cart_item_id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Item quantity updated in cart' });
            });
        } else {
            // Insert new item
            const insertSql = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(insertSql, [cartId, productId, quantity], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Item added to cart' });
            });
        }
    });
}

// --- 8. REMOVE FROM CART ---
app.delete('/api/cart/:userId/:productId', (req, res) => {
    const { userId, productId } = req.params;

    const getCartSql = 'SELECT cart_id FROM user_carts WHERE user_id = ?';
    db.query(getCartSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Cart not found' });

        const cartId = results[0].cart_id;
        const deleteSql = 'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?';
        db.query(deleteSql, [cartId, productId], (err) => {
            if (err) return res.satus(500).json({ error: err.message });
            res.json({ message: 'Item removed from cart' });
        });
    });
});

// --- 9. GET VENDOR EARNINGS ---
app.get('/api/vendor/earnings/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  
  // Get today's date in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  // Earnings for today
  const todayEarnings = `
    SELECT SUM(total) as earnings FROM orders 
    WHERE vendor_id = ? AND status = 'completed' AND DATE(created_at) = ?
  `;
  
  // Earnings for this month
  const monthEarnings = `
    SELECT SUM(total) as earnings FROM orders 
    WHERE vendor_id = ? AND status = 'completed' AND YEAR(created_at) = YEAR(CURDATE()) 
    AND MONTH(created_at) = MONTH(CURDATE())
  `;
  
  db.query(todayEarnings, [vendorId, todayString], (err, todayResults) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.query(monthEarnings, [vendorId], (err, monthResults) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        today: todayResults[0].earnings || 0,
        month: monthResults[0].earnings || 0
      });
    });
  });
});

// --- 10. GET USER ORDER HISTORY ---
app.get('/api/user/history/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = 'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC';
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 11. GET ORDER ITEMS ---
app.get('/api/order-items/:orderId', (req, res) => {
  const { orderId } = req.params;
  const sql = 'SELECT * FROM order_items WHERE order_id = ?';
  
  db.query(sql, [orderId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 12. CLEAR CART ---
app.delete('/api/cart/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Get the cart_id first
  const getCartSql = 'SELECT cart_id FROM user_carts WHERE user_id = ?';
  db.query(getCartSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.json({ message: 'Cart already empty' });
    }
    
    const cartId = results[0].cart_id;
    
    // Delete all items from cart
    const clearSql = 'DELETE FROM cart_items WHERE cart_id = ?';
    db.query(clearSql, [cartId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cart cleared successfully' });
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});