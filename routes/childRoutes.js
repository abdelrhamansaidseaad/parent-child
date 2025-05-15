const express = require('express');
const router = express.Router();
const { authenticate, isChild } = require('../middlewares/auth');
const childController = require('../controllers/childController');

router.use(authenticate, isChild);

router.post('/link-parent', childController.linkToParent);
router.get('/profile', childController.getProfile);

module.exports = router;