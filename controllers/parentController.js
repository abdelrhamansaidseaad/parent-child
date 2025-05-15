const User = require('../models/User');

// باقي الكود...
const TempCode = require('../models/TempCode');
const AppError = require('../utils/appError');

// exports.generateCode = async (req, res, next) => {
//   try {
//     const newCode = await TempCode.create({ parentId: req.user.id });
    
//     res.status(200).json({
//       status: 'success',
//       data: {
//         code: newCode.code,
//         expiresAt: new Date(Date.now() + 3600000) // ساعة من الآن
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.generateCode = async (req, res, next) => {
  try {
    const newCode = await TempCode.create({ 
      parentId: req.user.id,
      expiresAt: new Date(Date.now() + 3600000) // ساعة من الآن
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        code: newCode.code,
        expiresAt: newCode.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// exports.getProfile = async (req, res, next) => {
//   try {
//     const parent = await User.findById(req.user.id)
//       .populate({
//         path: 'children',
//         select: 'username _id createdAt',
//         options: { sort: { createdAt: -1 } } // ترتيب حسب الأحدث
//       });

//     if (!parent) {
//       return next(new AppError('لم يتم العثور على بيانات الأب', 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: {
//           id: parent._id,
//           username: parent.username,
//           children: parent.children || []
//         }
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getProfile = async (req, res, next) => {
//   try {
//     // استرجاع بيانات الأب مع الأبناء المرتبطين
//     const parent = await User.findById(req.user.id)
//       .populate({
//         path: 'children',
//         select: 'username _id createdAt',
//         options: { sort: { createdAt: -1 } } // ترتيب حسب الأحدث
//       })
//       .lean(); // تحويل إلى object عادي

//     if (!parent) {
//       return next(new AppError('لم يتم العثور على بيانات الأب', 404));
//     }

//     // تحويل التواريخ إلى تنسيق مقروء
//     const formattedChildren = parent.children.map(child => ({
//       ...child,
//       createdAt: new Date(child.createdAt).toLocaleString()
//     }));

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: {
//           id: parent._id,
//           username: parent.username,
//           children: formattedChildren || [] // تأكد من عدم وجود قيم null
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching parent profile:', error);
//     next(new AppError('حدث خطأ في جلب بيانات الأب', 500));
//   }
// };
exports.getProfile = async (req, res, next) => {
  try {
    const parent = await User.findById(req.user.id)
      .populate({
        path: 'children',
        select: 'username _id createdAt',
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    if (!parent) {
      return next(new AppError('لم يتم العثور على بيانات الأب', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: parent._id,
          username: parent.username,
          children: parent.children || []
        }
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    next(new AppError('حدث خطأ في جلب بيانات الأب', 500));
  }
};