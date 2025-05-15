require('dotenv').config();
const app = require('./app');

// التصدير لاستخدامه مع Vercel
module.exports = app;

// التشغيل المحلي فقط أثناء التطوير
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
  });
}