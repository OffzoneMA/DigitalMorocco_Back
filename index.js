const express = require("express");
const i18n = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const prometheus = require('./metrics/prometheus.js');
require("dotenv").config();

// Import des configurations
const { passport } = require("./config/passport-setup");
const swaggerOptions = require('./config/swagger_config');

// Import des services
const { checkSubscriptionStatus } = require("./services/MemberService");
const { autoCancelExpiredSubscriptions } = require("./services/SubscriptionService");

// Import des routes
const routes = {
  users: require("./routes/Userrouter"),
  verify: require("./routes/VerifyRouter"),
  members: require("./routes/MemberRouter"),
  partners: require("./routes/PartnerRouter"),
  investors: require("./routes/InvestorRouter"),
  admin: require("./routes/Adminrouter"),
  requests: require("./routes/Requestrouter"),
  subscriptions: require("./routes/SubscriptionRouter"),
  'subscription-plans': require("./routes/SubscriptionPlanRouter"),
  logs: require("./routes/UserLogRouter"),
  Sublogs: require("./routes/SubscriptionLogRouter"),
  events: require("./routes/EventRouter"),
  blogs: require("./routes/BlogRouter"),
  'users/otp': require("./routes/Otprouter"),
  projects: require("./routes/ProjectRouter"),
  files: require('./routes/FileRouter'),
  newsletter: require('./routes/NewsletterRouter'),
  documents: require('./routes/DocumentRouter'),
  'contact-requests': require('./routes/contactRequestRoutes'),
  'activity-history': require('./routes/ActivityHistoryRouter'),
  'payment-methods': require('./routes/PaymentMethodRouter'),
  employee: require('./routes/EmployeeRouter'),
  'legal-documents': require('./routes/LegalDocumentRouter'),
  search: require('./routes/SearchRouter'),
  billing: require('./routes/BillingRouter'),
  notifications: require('./routes/NotificationRouter'),
  sponsors: require('./routes/SponsorRouter')
};

class App {
    constructor() {
        this.app = express();
        this.specs = swaggerJsdoc(swaggerOptions);
        
        this.setupMiddlewares();
        this.setupI18n();
        this.setupMetrics(); 
        this.setupRoutes();
        this.setupSwagger();
    }

    setupMiddlewares() {

        // Ajouter le middleware Prometheus avant les autres middlewares
        this.app.use(prometheus.metricsMiddleware);

        // Configuration des middlewares de base
        this.app.use(cors());
        this.app.use(express.json({ limit: "100mb" }));
        this.app.use(express.static(path.join(__dirname, "images")));
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        
        // Configuration de la session
        this.app.use(session({
            secret: process.env.ACCESS_TOKEN_SECRET,
            resave: true,
            saveUninitialized: true,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 heures
            }
        }));

        // Initialisation de Passport
        this.app.use(passport.initialize());
        this.app.use(passport.session());

    }

    setupI18n() {
        i18n
            .use(Backend)
            .init({
                backend: {
                    loadPath: path.resolve("./locales/{{lng}}/{{ns}}.json")
                },
                fallbackLng: 'en',
                preload: ['en', 'fr'],
                detection: {
                    order: ['header', 'querystring', 'cookie'],
                    caches: ['cookie']
                },
                localePath: path.resolve("./locales")
            });

        this.app.use(i18nextMiddleware.handle(i18n));
        i18n.changeLanguage('fr');
    }

    setupMetrics() {
        // Endpoint pour les métriques Prometheus
        this.app.get('/metrics', prometheus.metricsEndpoint);
        
        // Mise à jour du compteur d'utilisateurs actifs lors des connexions
        this.app.use((req, res, next) => {
            if (req.session && req.session.passport && req.session.passport.user) {
                prometheus.activeUsersGauge.inc();
                req.on('end', () => {
                    prometheus.activeUsersGauge.dec();
                });
            }
            next();
        });
    }

    setupRoutes() {
      // Ajouter l'endpoint des métriques avant les autres routes
    //   this.app.get('/metrics', PrometheusService.metricsMiddleware());

      // Route de test i18n
      this.app.get('/', (req, res) => {
          const response = `Test i18n works! ${req.t('welcome_email.title')} ${req.t('welcome_email.title1')}`;
          res.status(200).send(response);
      });

      // Configuration des routes avec les noms originaux
      Object.entries(routes).forEach(([path, router]) => {
          this.app.use(`/${path}`, router);
      });
  }

    setupSwagger() {
        const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.specs, { customCssUrl: CSS_URL }));
    }

    async startServer() {
        const port = process.env.PORT || 5000;
        
        return new Promise((resolve) => {
            const server = this.app.listen(port, () => {
                console.log('🚀 Server is running on port:', port);
                console.log('Metrics are exposed at : ' , `${process.env.BACKEND_URL}/metrics`);
                
                // // Initialisation de Passport
                // this.app.use(passport.initialize());
                // this.app.use(passport.session());

                // Configuration des tâches planifiées
                this.setupScheduledTasks();
                
                resolve(server);
            });

            // Gestion gracieuse de l'arrêt
            this.setupGracefulShutdown(server);
        });
    }

    setupScheduledTasks() {
        const taskInterval = process.env.TASK_INTERVAL || 24 * 60 * 60 * 1000;
        
        const runTask = async (task, name) => {
            try {
                await task();
            } catch (error) {
                console.error(`❌ Error running ${name}:`, error);
            }
        };

        setInterval(() => runTask(checkSubscriptionStatus, 'subscription status check'), taskInterval);
        setInterval(() => runTask(autoCancelExpiredSubscriptions, 'auto cancel subscriptions'), taskInterval);
    }

    setupGracefulShutdown(server) {
        const shutdown = async (signal) => {
            console.log(`📥 Received ${signal} signal`);
            
            try {
                await mongoose.connection.close();
                console.log('📥 Closed MongoDB connection');
                
                server.close(() => {
                    console.log('📥 Closed HTTP server');
                    process.exit(0);
                });
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

// Configuration de MongoDB
mongoose.set('strictQuery', false);

const connectToDatabase = async (retryCount = 5, delay = 10000) => {
    try {
        console.log(`🟢 Attempting to connect to MongoDB... (${retryCount} retries left)`);
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 120000,
            serverSelectionTimeoutMS: 120000,
        });
        console.log('✅ Successfully connected to MongoDB');

        // Créer et démarrer l'application
        const app = new App();
        await app.startServer();

    } catch (error) {
        console.error('🔴 Error connecting to MongoDB:', error.message);
        if (retryCount > 0) {
            console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
            setTimeout(() => connectToDatabase(retryCount - 1, delay), delay);
        } else {
            console.error('❌ All retries failed. Exiting the application.');
            process.exit(1);
        }
    }
};

// Démarrage de l'application
connectToDatabase();

// module.exports = new App().app;