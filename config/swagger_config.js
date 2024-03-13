/**
 * swagger_config.js
 */
module.exports = {
    swaggerDefinition: {
        openapi: '3.0.3',
        info: {
            title: 'API Documentation',
            version: '1.0.11',
            description: 'Documentation for your API',
        },
        components: {
            securitySchemes: {
              jwtToken: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
              },
            },
          },
        },
    
    apis: ['./routes/*.js'],
};
