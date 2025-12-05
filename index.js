require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Panggil koneksi Neon
const app = express();
const PORT = process.env.PORT || 3002; // Port 3002 untuk Vendor B

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
  res.json({ ok: true, service: "vendor-b-api" });
});

// === Vendor B API Route: Menggunakan CamelCase, Number, dan Boolean ===
app.get("/products", async (req, res, next) => {
  try {
    // Query menggunakan nama kolom snake_case dari DB
    const sql = `
      SELECT sku, product_name, price, is_available 
      FROM products_vendor_b 
      ORDER BY sku ASC
    `;
    const result = await db.query(sql);
    
    // Memformat data: Konversi nama key ke CamelCase, price ke Number, dan is_available ke Boolean
    const modernData = result.rows.map(row => ({
      sku: row.sku,
      
      // Mapping: product_name (DB) -> productName (JSON)
      productName: row.product_name,
      
      // Konversi harga (price) menjadi Number (Integer/Float) - WAJIB
      price: Number(row.price),
      
      // Mapping: is_available (DB 't'/'f') -> isAvailable (Boolean) - WAJIB
      isAvailable: row.is_available === true, 
    }));
    
    res.json(modernData); 
  } catch (err) {
    console.error("Error fetching data from Vendor B DB:", err.stack);
    next(err);
  }
});

// === FALLBACK & ERROR HANDLING ===
app.use((req, res) => {
  res.status(404).json({ error: "Rute tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error("[SERVER ERROR M2]", err.stack);
  res.status(500).json({ error: "Terjadi kesalahan pada server M2" });
});

app.listen(PORT, "0.0.0.0", () => {
console.log(`Server M2 aktif di http://localhost:${PORT}`);
});
