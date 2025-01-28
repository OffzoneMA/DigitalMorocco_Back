const client = require('prom-client');

// Création du registre
const register = new client.Registry();

// Configuration des labels par défaut
register.setDefaultLabels({
    app: 'investment-platform',
    environment: process.env.NODE_ENV || 'development'
});

// Activation des métriques par défaut de Node.js avec plus de détails
client.collectDefaultMetrics({
    register,
    prefix: 'app_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Buckets plus précis pour GC
});


const httpRateHistogram = new client.Histogram({
    name: 'http_requests_rate_per_second',
    help: 'Taux de requêtes HTTP par seconde, calculé avec un histogramme',
    labelNames: ['method', 'endpoint', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5] // Intervalles de buckets (secondes)
});

register.registerMetric(httpRateHistogram);

const metricsMiddlewareWithRate = (req, res, next) => {
    const end = httpRateHistogram.startTimer();
    res.on('finish', () => {
        const labels = {
            method: req.method,
            endpoint: req.route ? req.route.path : req.path,
            status: res.statusCode
        };
        end(labels); // Enregistre la durée pour calculer le taux
    });
    next();
};

// Métriques HTTP améliorées
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes HTTP',
    labelNames: ['method', 'endpoint', 'status', 'user_type']
});
register.registerMetric(httpRequestCounter);

const responseTimeSummary = new client.Summary({
    name: 'http_response_time_summary',
    help: 'Temps de réponse HTTP résumé avec des quantiles',
    labelNames: ['method', 'endpoint', 'status'],
    percentiles: [0.5, 0.9, 0.99] // Les quantiles (50%, 90%, 99%)
});

register.registerMetric(responseTimeSummary);

const metricsMiddlewareWithSummary = (req, res, next) => {
    const end = responseTimeSummary.startTimer();
    res.on('finish', () => {
        const labels = {
            method: req.method,
            endpoint: req.route ? req.route.path : req.path,
            status: res.statusCode
        };
        end(labels); // Enregistre la durée pour les calculs de quantiles
    });
    next();
};

const responseTimeHistogram = new client.Histogram({
    name: 'http_response_time_seconds',
    help: 'Distribution des temps de réponse HTTP en secondes',
    labelNames: ['method', 'endpoint', 'status', 'user_type'],
    buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10]
});
register.registerMetric(responseTimeHistogram);

// Métriques utilisateurs améliorées
const activeUsersGauge = new client.Gauge({
    name: 'active_users',
    help: 'Nombre d\'utilisateurs actuellement connectés',
    labelNames: ['user_type', 'connection_type'] // member, partner, investor, admin + web, mobile
});
register.registerMetric(activeUsersGauge);

const userSessionsCounter = new client.Counter({
    name: 'user_sessions_total',
    help: 'Nombre total de sessions utilisateurs',
    labelNames: ['user_type', 'auth_method', 'status'] // status: success, failed
});
register.registerMetric(userSessionsCounter);

// Métriques business
const subscriptionMetrics = new client.Counter({
    name: 'subscription_events_total',
    help: 'Événements liés aux abonnements',
    labelNames: ['event_type', 'plan_type', 'status'] // created, renewed, cancelled, expired
});
register.registerMetric(subscriptionMetrics);

const projectMetrics = new client.Counter({
    name: 'project_events_total',
    help: 'Événements liés aux projets',
    labelNames: ['event_type', 'project_type', 'status'] // created, updated, deleted
});
register.registerMetric(projectMetrics);

// Métriques MongoDB
const mongoDbOperations = new client.Histogram({
    name: 'mongodb_operation_duration_seconds',
    help: 'Durée des opérations MongoDB',
    labelNames: ['operation', 'collection'],
    buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 2]
});
register.registerMetric(mongoDbOperations);

// Métriques des erreurs
const errorCounter = new client.Counter({
    name: 'application_errors_total',
    help: 'Nombre total d\'erreurs par type',
    labelNames: ['error_type', 'error_code', 'endpoint']
});
register.registerMetric(errorCounter);

// Métriques de cache
const cacheMetrics = new client.Histogram({
    name: 'cache_operations_duration_seconds',
    help: 'Durée des opérations de cache',
    labelNames: ['operation', 'status'], // hit, miss
    buckets: [0.001, 0.005, 0.015, 0.05, 0.1]
});
register.registerMetric(cacheMetrics);

// Middleware amélioré pour tracker les requêtes
const metricsMiddleware = (req, res, next) => {
    const end = responseTimeHistogram.startTimer();
    
    // Déterminer le type d'utilisateur
    const getUserType = (req) => {
        if (!req.user) return 'anonymous';
        return req.user.role || 'unknown';
    };

    // Déterminer le type de connexion
    const getConnectionType = (req) => {
        const userAgent = req.get('user-agent') || '';
        return userAgent.includes('Mobile') ? 'mobile' : 'web';
    };

    res.on('finish', () => {
        const userType = getUserType(req);
        const connectionType = getConnectionType(req);
        const labels = {
            method: req.method,
            endpoint: req.route ? req.route.path : req.path,
            status: res.statusCode,
            user_type: userType
        };

        // Incrémenter le compteur de requêtes
        httpRequestCounter.inc(labels);
        
        // Enregistrer le temps de réponse
        end(labels);

        // Gérer les erreurs
        if (res.statusCode >= 400) {
            errorCounter.inc({
                error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
                error_code: res.statusCode,
                endpoint: req.route ? req.route.path : req.path
            });
        }

        // Mettre à jour les utilisateurs actifs si authentifié
        if (req.user) {
            activeUsersGauge.inc({
                user_type: userType,
                connection_type: connectionType
            });
        }
    });

    next();
};

// Helper pour les métriques MongoDB
const trackMongoOperation = (operation, collection, duration) => {
    mongoDbOperations.observe({
        operation,
        collection
    }, duration);
};

// Helper pour les métriques de cache
const trackCacheOperation = (operation, status, duration) => {
    cacheMetrics.observe({
        operation,
        status
    }, duration);
};

// Helper pour les métriques business
const trackSubscriptionEvent = (eventType, planType, status) => {
    subscriptionMetrics.inc({
        event_type: eventType,
        plan_type: planType,
        status: status
    });
};

const trackProjectEvent = (eventType, projectType, status) => {
    projectMetrics.inc({
        event_type: eventType,
        project_type: projectType,
        status: status
    });
};

// Endpoint inchangé
const metricsEndpoint = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error('Erreur lors de la génération des métriques:', error);
        res.status(500).end();
    }
};

module.exports = {
    register,
    httpRequestCounter,
    responseTimeHistogram,
    activeUsersGauge,
    userSessionsCounter,
    subscriptionMetrics,
    projectMetrics,
    mongoDbOperations,
    errorCounter,
    cacheMetrics,
    metricsMiddleware,
    metricsEndpoint,
    trackMongoOperation,
    trackCacheOperation,
    trackSubscriptionEvent,
    trackProjectEvent
};