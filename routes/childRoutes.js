const express = require('express');
const router = express.Router();
const { authenticate, isChild } = require('../middlewares/auth');
const childController = require('../controllers/childController');

// تطبيق middleware على جميع مسارات هذا الراوتر
router.use(authenticate);
router.use(isChild);

// تعريف المسارات
router.post('/link-parent', childController.linkToParent);
router.get('/profile', childController.getProfile);

module.exports = router;