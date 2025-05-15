const TempCode = require('../models/TempCode');
const AppError = require('../utils/appError');

exports.generateCode = async (req, res, next) => {
  try {
    const newCode = await TempCode.create({ parentId: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: {
        code: newCode.code
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await req.user.populate('children', 'username _id');
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          children: user.children
        }
      }
    });
  } catch (error) {
    next(error);
  }
};