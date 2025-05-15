const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `قيمة غير صالحة ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.username;
  const message = `اسم المستخدم '${value}' موجود بالفعل. الرجاء استخدام اسم آخر`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `بيانات غير صالحة: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('توكن غير صالح. الرجاء تسجيل الدخول مرة أخرى', 401);

const handleJWTExpiredError = () => new AppError('انتهت صلاحية التوكن. الرجاء تسجيل الدخول مرة أخرى', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'حدث خطأ ما! الرجاء المحاولة لاحقاً'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};