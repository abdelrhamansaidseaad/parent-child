// const app = require('./app');
// const PORT = process.env.PORT || 3000;

// const server = app.listen(PORT, () => {
//   console.log(`الخادم يعمل على المنفذ ${PORT}...`);
// });

// process.on('unhandledRejection', (err) => {
//   console.error('حدث خطأ غير معالج:', err.name, err.message);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', (err) => {
//   console.error('حدث استثناء غير معالج:', err.name, err.message);
//   server.close(() => process.exit(1));
// });
const app = require('./app');
const express = require('express');
const PORT = process.env.PORT || 3000;
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '✅ تم إصلاح المسار بنجاح',
    timestamp: new Date().toISOString()
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});