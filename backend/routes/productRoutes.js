const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// In-memory resilient fallback dataset loaded from seeds
let fallbackProducts = [];
try {
  const seedPath = path.join(__dirname, '../seeds/products.json');
  if (fs.existsSync(seedPath)) {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    fallbackProducts = raw.map((p, idx) => ({
      _id: p._id || `grail-${idx + 1}-${Date.now().toString().slice(-6)}`,
      ...p,
    }));
  }
} catch (e) {
  console.error('Fallback products load error:', e.message);
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// Get all products
router.get('/', async (req, res) => {
  if (isDbConnected()) {
    try {
      const products = await Product.find();
      if (products && products.length > 0) {
        return res.json(products);
      }
    } catch (err) {
      console.warn('DB query failed, serving resilient in-memory catalogue:', err.message);
    }
  }
  // If DB is offline, connecting, or empty, return in-memory catalogue
  res.json(fallbackProducts);
});

// Add a new product
router.post('/', async (req, res) => {
  if (isDbConnected()) {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      return res.status(201).json(newProduct);
    } catch (err) {
      console.warn('DB save failed, adding to in-memory store:', err.message);
    }
  }
  const mockProduct = {
    _id: `custom-grail-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  fallbackProducts.unshift(mockProduct);
  res.status(201).json(mockProduct);
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  if (isDbConnected()) {
    try {
      const product = await Product.findById(req.params.id);
      if (product) return res.json(product);
    } catch (err) {
      console.warn('DB single query failed, searching fallback:', err.message);
    }
  }
  const found = fallbackProducts.find((p) => String(p._id) === String(req.params.id));
  if (found) return res.json(found);
  res.status(404).json({ error: 'Product not found' });
});

// Update a product
router.put('/:id', async (req, res) => {
  if (isDbConnected()) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updatedProduct) return res.json(updatedProduct);
    } catch (err) {
      console.warn('DB update failed, updating in-memory store:', err.message);
    }
  }
  const idx = fallbackProducts.findIndex((p) => String(p._id) === String(req.params.id));
  if (idx !== -1) {
    fallbackProducts[idx] = { ...fallbackProducts[idx], ...req.body };
    return res.json(fallbackProducts[idx]);
  }
  res.status(404).json({ error: 'Product not found' });
});

// Delete a product
router.delete('/:id', async (req, res) => {
  if (isDbConnected()) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (deletedProduct) return res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.warn('DB delete failed, deleting from in-memory store:', err.message);
    }
  }
  const prevLen = fallbackProducts.length;
  fallbackProducts = fallbackProducts.filter((p) => String(p._id) !== String(req.params.id));
  if (fallbackProducts.length < prevLen) {
    return res.json({ message: 'Product deleted successfully' });
  }
  res.status(404).json({ error: 'Product not found' });
});

module.exports = router;