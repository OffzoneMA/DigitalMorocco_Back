const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();

// Options de configuration Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API',
    },
  },
  // Chemin vers les fichiers de définition des routes
  apis: ['./routes/*.js'],
};

// Générer les spécifications Swagger
const specs = swaggerJsdoc(swaggerOptions);

// Utiliser Swagger UI pour afficher la documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
