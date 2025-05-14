const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.error('حدث خطأ غير معالج:', err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('حدث استثناء غير معالج:', err.name, err.message);
  process.exit(1);
});