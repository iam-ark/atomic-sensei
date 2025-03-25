require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const integratedRoutes = require('./routes/integratedRoutes'); // New route for integrated functionality

const app = express();

// ✅ Connect to Database
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/', roadmapRoutes);
app.use('/', integratedRoutes); // Mount integrated routes at the root

// ✅ Default Route
app.get('/', (req, res) => {
    res.send('Atomic Sensei API is running...');
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
