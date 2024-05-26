const i18n = require('i18next');
const path = require('path');
const Backend = require('i18next-node-fs-backend');
const middleware = require('i18next-express-middleware');

i18n
  .use(Backend)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'fr'],
    backend: {
      loadPath: path.join(__dirname, 'locales', '{{lng}}', 'translation.json'),
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie'],
    },
  });

module.exports = i18n;
