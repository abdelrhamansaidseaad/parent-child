const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // تنظيف اسم المستخدم من المسافات الزائدة
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
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      }
    });

  } catch (error) {
    // معالجة أخطاء التحقق من الصحة بشكل خاص
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(el => el.message);
      return next(new AppError(messages.join('. '), 400));
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log('بيانات الدخول الواردة:', req.body); // سجل البيانات الواردة
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('بيانات ناقصة'); // سجل حالة البيانات الناقصة
      return next(new AppError('الرجاء إدخال اسم المستخدم وكلمة المرور', 400));
    }

    const user = await User.findOne({ username }).select('+password');
    console.log('المستخدم الذي تم العثور عليه:', user); // سجل بيانات المستخدم
    
    if (!user) {
      console.log('المستخدم غير موجود'); // سجل حالة عدم وجود مستخدم
      return next(new AppError('بيانات الاعتماد غير صحيحة', 401));
    }

    console.log('مقارنة كلمة المرور...'); // سجل بدء عملية المقارنة
    const isMatch = await user.comparePassword(password);
    console.log('نتيجة المقارنة:', isMatch); // سجل نتيجة المقارنة
    
    if (!isMatch) {
      return next(new AppError('بيانات الاعتماد غير صحيحة', 401));
    }

    const token = generateToken(user._id, user.role);
    console.log('تم إنشاء التوكن بنجاح'); // سجل نجاح إنشاء التوكن

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
    console.error('تفاصيل الخطأ:', error); // سجل تفاصيل الخطأ
    next(error);
  }
};