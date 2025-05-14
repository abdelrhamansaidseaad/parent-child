// التحقق من دور المستخدم
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد'
      });
    }
    next();
  };
};

// التحقق من أن المستخدم أب
exports.isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'هذه الخدمة متاحة فقط للآباء'
    });
  }
  next();
};

// التحقق من أن المستخدم ابن
exports.isChild = (req, res, next) => {
  if (req.user.role !== 'child') {
    return res.status(403).json({
      success: false,
      message: 'هذه الخدمة متاحة فقط للأبناء'
    });
  }
  next();
};