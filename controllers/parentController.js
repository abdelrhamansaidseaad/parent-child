const TempCode = require('../models/TempCode');
const User = require('../models/User');
const AppError = require('../utils/appError');
const shortid = require('shortid');

exports.generateCode = async (req, res, next) => {
  try {
    // تأكد من أن المستخدم أب
    if (req.user.role !== 'parent') {
      return next(new AppError('غير مصرح لك بهذه العملية', 403));
    }

    const newCode = new TempCode({
      parentId: req.user.id,
      code: shortid.generate() // توليد كود فريد
    });

    await newCode.save();

    res.status(201).json({
      status: 'success',
      data: {
        code: newCode.code,
        expiresAt: new Date(Date.now() + 3600000) // صلاحية ساعة
      }
    });

  } catch (error) {
    console.error('فشل إنشاء الكود:', error);
    next(new AppError('فشل إنشاء كود الربط', 500));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    // تعطيل الـ caching لهذا الطلب
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const user = await User.findById(req.user.id)
      .populate('children', 'username createdAt');
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          children: user.children,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
};