require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorHandler = require('./middlewares/errorHandler');

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const childRoutes = require('./routes/childRoutes');

// تهيئة التطبيق
const app = express();

// Middlewares الأمان
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Middlewares الأساسية
app.use(cors({
  origin: [
    'http://localhost:3000',
    `https://${process.env.VERCEL_URL}`,
    'https://*.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// مسارات API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/child', childRoutes);

// مسار الواجهة الأمامية
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// مسار غير معروف
app.all('*', (req, res, next) => {
  next(new AppError(`لا يمكن العثور على ${req.originalUrl} على هذا الخادم`, 404));
});

// معالجة الأخطاء
app.use(errorHandler);

module.exports = app;