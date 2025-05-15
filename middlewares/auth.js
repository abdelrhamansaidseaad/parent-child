const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.authenticate = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('الرجاء تسجيل الدخول للوصول إلى هذا المورد', 401));
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('المستخدم المرتبط بهذا التوكن لم يعد موجوداً', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

exports.isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return next(new AppError('غير مصرح لك بالوصول إلى هذا المورد', 403));
  }
  next();
};

exports.isChild = (req, res, next) => {
  if (req.user.role !== 'child') {
    return next(new AppError('غير مصرح لك بالوصول إلى هذا المورد', 403));
  }
  next();
};