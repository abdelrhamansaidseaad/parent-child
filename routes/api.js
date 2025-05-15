const express = require('express');
const router = express.Router();

// Test Endpoint
router.get('/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'تم إعداد المسار بنجاح'
  });
});

module.exports = router;