const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://verify-frontend-wine.vercel.app', 'https://verify-backend.onrender.com']  // Your deployed frontend URL
    : ['http://localhost:5173'],  // Local frontend URL
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
};

module.exports = corsConfig;
