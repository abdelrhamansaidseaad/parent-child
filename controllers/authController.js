const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // تنظيف اسم المستخدم
    const cleanedUsername = username.trim();

    // التحقق من عدم وجود مستخدم بنفس الاسم
    const existingUser = await User.findOne({ username: cleanedUsername });
    if (existingUser) {
      return next(new AppError('اسم المستخدم موجود بالفعل', 400));
    }

    // إنشاء مستخدم جديد
    const newUser = await User.create({
      username: cleanedUsername,
      password,
      role
    });

    // إنشاء توكن
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(el => el.message);
      return next(new AppError(messages.join('. '), 400));
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!username || !password) {
      return next(new AppError('الرجاء إدخال اسم المستخدم وكلمة المرور', 400));
    }

    // البحث عن المستخدم مع تضمين كلمة المرور
    const user = await User.findOne({ username }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('بيانات الاعتماد غير صحيحة', 401));
    }

    // إنشاء التوكن
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};