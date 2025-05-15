const TempCode = require('../models/TempCode');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.linkToParent = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    const tempCode = await TempCode.findOne({ code, used: false });
    if (!tempCode) {
      return next(new AppError('كود الربط غير صالح أو منتهي الصلاحية', 400));
    }
    
    const parent = await User.findById(tempCode.parentId);
    if (!parent) {
      return next(new AppError('الأب المرتبط بهذا الكود غير موجود', 404));
    }
    
    // Update child
    const child = await User.findByIdAndUpdate(
      req.user.id,
      { parentId: parent._id },
      { new: true }
    );
    
    // Update parent
    await User.findByIdAndUpdate(
      parent._id,
      { $addToSet: { children: child._id } },
      { new: true }
    );
    
    // Mark code as used
    await TempCode.findByIdAndUpdate(tempCode._id, { used: true });
    
    res.status(200).json({
      status: 'success',
      message: 'تم الربط بنجاح',
      data: {
        parentId: parent._id,
        parentName: parent.username
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const child = await User.findById(req.user.id)
      .populate('parentId', 'username _id');
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: child._id,
          username: child.username,
          parent: child.parentId || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};