const mongoose = require('mongoose');
const shortid = require('shortid');

const tempCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    default: () => shortid.generate(), // استخدام دالة لضمان توليد كود جديد لكل مستند
    unique: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // ينتهي بعد ساعة (3600 ثانية)
  }
});

module.exports = mongoose.model('TempCode', tempCodeSchema);