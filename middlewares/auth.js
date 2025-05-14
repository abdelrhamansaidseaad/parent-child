const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
  try {
    // 1) التحقق من وجود التوكن
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('الرجاء تسجيل الدخول للوصول إلى هذا المورد', 401));
    }

    // 2) التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) التحقق من وجود المستخدم
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('المستخدم المرتبط بهذا التوكن لم يعد موجوداً', 401));
    }

    // 4) إضافة المستخدم إلى الطلب
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

exports.isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return next(new AppError('هذه الخدمة متاحة فقط للآباء', 403));
  }
  next();
};

exports.isChild = (req, res, next) => {
  if (req.user.role !== 'child') {
    return next(new AppError('هذه الخدمة متاحة فقط للأبناء', 403));
  }
  next();
};