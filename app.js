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

// Middleware للتحقق من الطلبات
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
  origin: true,
  credentials: true
}));
// { limit: '10kb' } بداخل الاقواس
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// مسار اختباري للتأكد من عمل الخادم
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '✅ الخادم يعمل بشكل صحيح',
    timestamp: new Date().toISOString()
  });
});

// مسارات API
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/parent', parentRoutes);
// app.use('/api/v1/child', childRoutes);
// مسارات التطبيق
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/parent', require('./routes/parentRoutes'));
app.use('/api/v1/child', require('./routes/childRoutes'));


// مسار غير معروف
app.all('*', (req, res, next) => {
  next(new AppError(`لا يمكن العثور على ${req.originalUrl} على هذا الخادم`, 404));
});

// معالجة الأخطاء
app.use(errorHandler);

module.exports = app;