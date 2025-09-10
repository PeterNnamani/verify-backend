const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://verify-frontend-wine.vercel.app', 'https://verify-backend.onrender.com']  // Your deployed frontend URL
    : ['http://localhost:5173'],  // Local frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: true,
  optionsSuccessStatus: 204
};

module.exports = corsConfig;
