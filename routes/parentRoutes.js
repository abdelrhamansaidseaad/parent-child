const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, isParent } = require('../middlewares/auth');

// تطبيق middleware المصادقة على جميع مسارات الأب
router.use(authenticate, isParent);

// مسار إنشاء كود الربط
router.post('/generate-code', parentController.generateCode);

// مسار الحصول على الملف الشخصي
router.get('/profile', parentController.getProfile);

module.exports = router;