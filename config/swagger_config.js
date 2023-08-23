/**
 * swagger_config.js
 */
module.exports = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentation for your API',
        },
    },
    // Spécifiez le chemin correct vers vos fichiers de définition de routes
    apis: ['./routes/*.js'],
};
