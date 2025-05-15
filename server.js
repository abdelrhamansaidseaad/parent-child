const express = require('express');
const path = require('path');
const app = require('./app');

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// جميع المسارات الأخرى تخدم index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});