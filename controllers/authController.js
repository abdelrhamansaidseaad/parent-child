const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new AppError('اسم المستخدم موجود بالفعل', 400));
    }

    const newUser = await User.create({
      username,
      password,
      role
    });

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
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('الرجاء إدخال اسم المستخدم وكلمة المرور', 400));
    }

    const user = await User.findOne({ username }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('بيانات الاعتماد غير صحيحة', 401));
    }

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