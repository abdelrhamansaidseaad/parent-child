const TempCode = require('../models/TempCode');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.linkToParent = async (req, res, next) => {
  try {
    const { code } = req.body;

    // 1. البحث عن الكود
    const tempCode = await TempCode.findOne({ 
      code,
      used: { $ne: true } // تأكد أن الكود لم يُستخدم
    });

    if (!tempCode) {
      return next(new AppError('كود الربط غير صالح أو منتهي الصلاحية', 400));
    }

    // 2. التحقق من وجود الأب
    const parent = await User.findById(tempCode.parentId);
    if (!parent) {
      return next(new AppError('الأب غير موجود', 404));
    }

    // 3. تحديث بيانات الابن
    const child = await User.findById(req.user.id);
    child.parentId = parent._id;
    await child.save();

    // 4. تحديث بيانات الأب
    parent.children.push(child._id);
    await parent.save();

    // 5. تعليم الكود كمستعمل
    tempCode.used = true;
    await tempCode.save();

    res.status(200).json({
      status: 'success',
      message: 'تم الربط بنجاح',
      parent: {
        id: parent._id,
        username: parent.username
      }
    });

  } catch (error) {
    console.error('فشل عملية الربط:', error);
    next(new AppError('فشل عملية الربط', 500));
  }
};
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('parentId');
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};