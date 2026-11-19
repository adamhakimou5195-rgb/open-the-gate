require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');
const { seedDatabase } = require('./db/seed_questions');

const sessionsRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static media (audio files, public resources)
app.use('/public', express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Open The Gate - English Placement API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Fallback SPA routing for any non-API route
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('API Backend Open The Gate opérationnelle.');
    }
  });
});

async function startServer() {
  try {
    console.log('🔄 Initialisation de la base de données SQLite...');
    await initDB();
    await seedDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 SERVEUR OPEN THE GATE DÉMARRÉ SUR LE PORT ${PORT}`);
      console.log(`💻 Accès Local (PC)    : http://localhost:${PORT}`);
      console.log(`📱 Accès Réseau/Mobile : http://192.168.100.40:${PORT}`);
      console.log(`📡 URL API Health     : http://localhost:${PORT}/api/health`);
      console.log(`👨‍💼 Admin par défaut   : admin@openthegate.com / AdminGate2026!`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
