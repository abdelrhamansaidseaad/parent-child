const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}...`);
});

// معالجة الأخطاء غير الملتقطة
process.on('unhandledRejection', (err) => {
  console.error('حدث خطأ غير معالج:', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('حدث استثناء غير معالج:', err.name, err.message);
  server.close(() => process.exit(1));
});