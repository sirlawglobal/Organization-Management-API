const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoute');
const orgRoutes = require('./routes/orgRoutes');
const userRoutes = require('./routes/userRoutes');

const User = require('./models/User');
const Organisation = require('./models/Organisation');

const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// // Routes
// app.use('/auth', authRoutes);
// app.use('/api/organisations', orgRoutes);
// app.use('/api/users', userRoutes);

app.use('/auth', authRoutes);
app.use('/api/organisations', authMiddleware, orgRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Initialize tables
async function initializeDatabase() {
  try {
    await User.createUserTable();
    await Organisation.createOrgTable();
    await Organisation.createUserOrgTable();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1); // Exit process on failure
  }
}

initializeDatabase().then(() => {

  if (process.env.NODE_ENV !== 'test') {

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  }


}).catch(err => console.error('Database initialization error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  res.status(500).json({ message: 'Internal Server Error1' });
});

module.exports = app;
