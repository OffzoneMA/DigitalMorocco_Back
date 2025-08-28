const getRawBody = require('raw-body');

const rawBodyMiddleware = async (req, res, next) => {
  try {
    // Vérifie que ce middleware ne s'exécute qu'une seule fois
    if (req.rawBody) return next();

    // Ne pas utiliser req.setEncoding() ici ❌
    const raw = await getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: 'utf-8' // ici l'encodage est passé à la lib, pas directement au stream
    });

    req.rawBody = raw;
    next();
  } catch (err) {
    console.error('Erreur rawBodyMiddleware:', err);
    res.status(500).send('Erreur de lecture du corps brut.');
  }
};

module.exports = rawBodyMiddleware;

