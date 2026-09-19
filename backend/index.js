const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('./models/Product');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solemarket';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully to:', MONGODB_URI.includes('@') ? 'MongoDB Atlas Cloud' : 'Local MongoDB');
    // Auto-seed if database is empty
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        const seedPath = path.join(__dirname, 'seeds', 'products.json');
        if (fs.existsSync(seedPath)) {
          const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
          if (Array.isArray(seedData) && seedData.length > 0) {
            console.log('Catalog empty. Auto-seeding initial sneaker grails...');
            await Product.insertMany(seedData);
            console.log(`Auto-seeded ${seedData.length} products successfully!`);
          }
        }
      }
    } catch (seedErr) {
      console.error('Seed verification note:', seedErr.message);
    }
  })
  .catch((err) => console.log('MongoDB connection warning:', err.message));

// API Routes
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend static build in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('SoleMarket API is running! Build frontend to serve web app.');
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});