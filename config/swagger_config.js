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
    
    apis: ['./routes/*.js'],
};
