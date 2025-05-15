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



// const app = require('./app');
// const express = require('express');
// const PORT = process.env.PORT || 3000;
// app.get('/api/test', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: '✅ تم إصلاح المسار بنجاح',
//     timestamp: new Date().toISOString()
//   });
// });


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Rejection:', err);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err);
// });



// require('dotenv').config();
// const app = require('./app');
// const PORT = process.env.PORT || 3000;

// // Test Route
// app.get('/api/test', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'تم إصلاح المسار بنجاح',
//     timestamp: new Date().toISOString()
//   });
// });

// app.listen(PORT, () => {
//   console.log(`الخادم يعمل على المنفذ ${PORT}`);
// });



require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;

// Test endpoint
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '✅ Server is fully operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set'
  });
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});