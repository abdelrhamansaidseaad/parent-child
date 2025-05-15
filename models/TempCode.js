const mongoose = require('mongoose');
const shortid = require('shortid');

const tempCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    default: () => shortid.generate(),
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
    expires: 3600
  }
});

tempCodeSchema.pre('save', async function(next) {
  try {
    const parent = await mongoose.model('User').findById(this.parentId);
    if (!parent || parent.role !== 'parent') {
      throw new Error('Parent user not found or invalid role');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('TempCode', tempCodeSchema);