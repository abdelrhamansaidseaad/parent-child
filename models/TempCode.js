const mongoose = require('mongoose');
const shortid = require('shortid');

const tempCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    default: shortid.generate,
    unique: true,
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // expires after 1 hour
  },
  used: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('TempCode', tempCodeSchema);