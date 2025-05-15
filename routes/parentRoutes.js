const express = require('express');
const router = express.Router();
const { authenticate, isParent } = require('../middlewares/auth');
const parentController = require('../controllers/parentController');

router.use(authenticate, isParent);

router.post('/generate-code', parentController.generateCode);
router.get('/profile', parentController.getProfile);

module.exports = router;