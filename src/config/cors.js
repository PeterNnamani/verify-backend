const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]  // Your deployed frontend URL
    : ['http://localhost:5173'],  // Local frontend URL
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
};

module.exports = corsConfig;
