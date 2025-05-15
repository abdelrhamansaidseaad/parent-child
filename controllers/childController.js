const TempCode = require('../models/TempCode');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.linkToParent = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // البحث عن الكود والتأكد من صلاحيته
    const tempCode = await TempCode.findOne({ code, used: false });
    if (!tempCode) {
      return next(new AppError('كود الربط غير صالح أو منتهي الصلاحية', 400));
    }
    
    // التحقق من وجود الأب
    const parent = await User.findById(tempCode.parentId);
    if (!parent) {
      return next(new AppError('الأب المرتبط بهذا الكود غير موجود', 404));
    }
    
    // تحديث بيانات الابن
    req.user.parentId = parent._id;
    await req.user.save();
    
    // تحديث بيانات الأب
    parent.children.push(req.user._id);
    await parent.save();
    
    // تعليم الكود كمستخدم
    tempCode.used = true;
    await tempCode.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        parentId: parent._id
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await req.user.populate('parentId', 'username _id');
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          parentId: user.parentId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};