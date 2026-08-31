// Usage (Windows CMD):
// set MONGO_URI="mongodb+srv://user:pass@..." && node test-db-connection.js
// Or copy .env.example to .env.local and set the variable in your shell.

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not provided. Set it as an environment variable before running the script.');
    process.exit(1);
  }
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(2);
  }
})();
