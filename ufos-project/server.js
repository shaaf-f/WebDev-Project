import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors()); // Allow React to talk to this server
app.use(bodyParser.json());

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

// --- 2. PLACE ORDER ---
app.post('/api/orders', (req, res) => {
  const { customerId, vendorId, vendorName, total, pickupTime } = req.body;
  
  const sql = 'INSERT INTO orders (customer_id, vendor_id, vendor_name, total, pickup_time) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [customerId, vendorId, vendorName, total, pickupTime], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order placed', orderId: result.insertId });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});