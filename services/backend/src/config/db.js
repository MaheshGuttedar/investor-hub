const mongoose = require('mongoose');

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error('MONGODB_URI is not defined');

  // On some Windows setups 'localhost' resolves to IPv6 ::1 while local MongoDB
  // may be listening only on 127.0.0.1. Normalize 'localhost' to 127.0.0.1 for
  // a more reliable local development experience while still honoring other URIs.
  const uri = rawUri.includes('localhost') ? rawUri.replace('localhost', '127.0.0.1') : rawUri;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
};

module.exports = { connectDB };
