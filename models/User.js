const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف'],
    maxlength: [30, 'اسم المستخدم يجب ألا يتجاوز 30 حرفاً'],
    validate: {
      validator: function(v) {
        return /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_]+$/.test(v);
      },
      message: 'اسم المستخدم يمكن أن يحتوي على أحرف عربية/إنجليزية وأرقام وشرطة سفلية (_) فقط'
    }
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    select: false,
    minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف']
  },
  role: {
    type: String,
    required: [true, 'الدور مطلوب'],
    enum: {
      values: ['parent', 'child'],
      message: 'الدور يجب أن يكون إما parent أو child'
    }
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // children: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }]
  // تأكد من أن تعريف children صحيح
children: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);