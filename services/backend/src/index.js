const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const investmentRoutes = require('./routes/investments');
const transactionRoutes = require('./routes/transactions');
const taxDocumentRoutes = require('./routes/taxDocuments');
const financialDocumentRoutes = require('./routes/financialDocuments');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8080'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files
const uploadsDir = path.resolve(__dirname, '../uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Swagger UI (API docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
connectDB().then(() => console.log('MongoDB connected')).catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tax-documents', taxDocumentRoutes);
app.use('/api/financial-documents', financialDocumentRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
