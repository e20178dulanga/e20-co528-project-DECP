require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5003;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Events Service running on http://localhost:${PORT}`);
  });
});
