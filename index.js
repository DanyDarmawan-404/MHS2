require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Koneksi Neon

const app = express();
const PORT = process.env.PORT || 3002;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
  res.json({ ok: true, service: "vendor-b-api" });
});

// === ROUTE /products ===
app.get("/distro", async (req, res, next) => {
  try {
    // SQL bersih tanpa karakter aneh
    const sql = `
      SELECT sku, product_name, price, is_available
      FROM products_vendor_b
      ORDER BY sku ASC
    `;

    const result = await db.query(sql);

    const modernData = result.rows.map(row => ({
      sku: row.sku,
      productName: row.product_name,
      price: Number(row.price),
      isAvailable: row.is_available === true
    }));

    res.json(modernData);
  } catch (err) {
    console.error("Error fetching data from Vendor B DB:", err);
    next(err);
  }
});

// === FALLBACK & ERROR HANDLING ===
app.use((req, res) => {
  res.status(404).json({ error: "Rute tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error("[SERVER ERROR M2]", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server M2" });
});

// === START SERVER ===
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server M2 aktif di http://localhost:${PORT}`);
});
