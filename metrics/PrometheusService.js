const promClient = require('prom-client');

class UserConnectionMetricsService {
    constructor() {
        this.register = new promClient.Registry();
        this.initializeMetrics();
    }

    initializeMetrics() {
        // Connexions actives
        this.connectionMetrics = {
            activeConnections: new promClient.Gauge({
                name: 'user_connections_active',
                help: 'Nombre de connexions utilisateur actives',
                labelNames: ['user_type', 'device_type', 'subscription_level', 'connection_type'],
                registers: [this.register]
            }),

            // Tentatives de connexion
            connectionAttempts: new promClient.Counter({
                name: 'user_connection_attempts_total',
                help: 'Nombre total de tentatives de connexion',
                labelNames: ['status', 'auth_method', 'user_type', 'device_type'],
                registers: [this.register]
            }),

            // Durée des sessions
            sessionDuration: new promClient.Histogram({
                name: 'user_session_duration_seconds',
                help: 'Durée des sessions utilisateur',
                labelNames: ['user_type', 'subscription_level'],
                buckets: [300, 900, 1800, 3600, 7200, 14400, 28800], // 5m, 15m, 30m, 1h, 2h, 4h, 8h
                registers: [this.register]
            }),

            // Échecs de connexion
            connectionFailures: new promClient.Counter({
                name: 'user_connection_failures_total',
                help: 'Nombre total d\'échecs de connexion',
                labelNames: ['reason', 'user_type', 'auth_method'],
                registers: [this.register]
            }),

            // Sessions concurrentes
            concurrentSessions: new promClient.Gauge({
                name: 'user_concurrent_sessions',
                help: 'Nombre de sessions concurrentes par utilisateur',
                labelNames: ['user_type', 'subscription_level'],
                registers: [this.register]
            }),

            // Déconnexions
            disconnections: new promClient.Counter({
                name: 'user_disconnections_total',
                help: 'Nombre total de déconnexions',
                labelNames: ['reason', 'user_type', 'session_duration_range'],
                registers: [this.register]
            }),

            // Activité par session
            sessionActivity: new promClient.Counter({
                name: 'user_session_activity_total',
                help: 'Activité durant les sessions',
                labelNames: ['activity_type', 'user_type', 'subscription_level'],
                registers: [this.register]
            }),

            // Temps entre les sessions
            timeBetweenSessions: new promClient.Histogram({
                name: 'time_between_sessions_seconds',
                help: 'Temps écoulé entre les sessions d\'un utilisateur',
                labelNames: ['user_type'],
                buckets: [3600, 7200, 14400, 28800, 86400, 172800], // 1h, 2h, 4h, 8h, 24h, 48h
                registers: [this.register]
            })
        };

        // Map pour stocker les timestamps de session
        this.sessionTimestamps = new Map();
    }

    trackConnectionAttempt(data) {
        const { status, authMethod, userType, deviceType } = data;
        
        this.connectionMetrics.connectionAttempts.inc({
            status,
            auth_method: authMethod,
            user_type: userType,
            device_type: deviceType
        });

        if (status === 'failure') {
            this.connectionMetrics.connectionFailures.inc({
                reason: data.reason || 'unknown',
                user_type: userType,
                auth_method: authMethod
            });
        }
    }

    trackSessionStart(data) {
        const { userId, userType, deviceType, subscriptionLevel, connectionType } = data;
        
        // Incrémenter les connexions actives
        this.connectionMetrics.activeConnections.inc({
            user_type: userType,
            device_type: deviceType,
            subscription_level: subscriptionLevel,
            connection_type: connectionType
        });

        // Mettre à jour les sessions concurrentes
        this.connectionMetrics.concurrentSessions.inc({
            user_type: userType,
            subscription_level: subscriptionLevel
        });

        // Enregistrer le timestamp de début
        this.sessionTimestamps.set(userId, {
            startTime: Date.now(),
            userType,
            subscriptionLevel
        });

        // Calculer le temps entre les sessions
        const lastSession = this.sessionTimestamps.get(`last_${userId}`);
        if (lastSession) {
            const timeBetween = (Date.now() - lastSession.endTime) / 1000;
            this.connectionMetrics.timeBetweenSessions.observe(
                { user_type: userType },
                timeBetween
            );
        }
    }

    trackSessionEnd(data) {
        const { userId, userType, deviceType, subscriptionLevel, reason } = data;
        const sessionStart = this.sessionTimestamps.get(userId);

        if (sessionStart) {
            // Calculer la durée de session
            const duration = (Date.now() - sessionStart.startTime) / 1000;
            
            // Déterminer la plage de durée
            const durationRange = this.getSessionDurationRange(duration);

            // Enregistrer la déconnexion
            this.connectionMetrics.disconnections.inc({
                reason: reason || 'normal',
                user_type: userType,
                session_duration_range: durationRange
            });

            // Enregistrer la durée de session
            this.connectionMetrics.sessionDuration.observe(
                {
                    user_type: userType,
                    subscription_level: subscriptionLevel
                },
                duration
            );

            // Décrémenter les compteurs actifs
            this.connectionMetrics.activeConnections.dec({
                user_type: userType,
                device_type: deviceType,
                subscription_level: subscriptionLevel
            });

            this.connectionMetrics.concurrentSessions.dec({
                user_type: userType,
                subscription_level: subscriptionLevel
            });

            // Sauvegarder le timestamp de fin pour le calcul du temps entre sessions
            this.sessionTimestamps.set(`last_${userId}`, {
                endTime: Date.now(),
                userType
            });

            // Nettoyage
            this.sessionTimestamps.delete(userId);
        }
    }

    trackSessionActivity(data) {
        const { activityType, userType, subscriptionLevel } = data;
        
        this.connectionMetrics.sessionActivity.inc({
            activity_type: activityType,
            user_type: userType,
            subscription_level: subscriptionLevel
        });
    }

    getSessionDurationRange(duration) {
        if (duration < 300) return '0-5m';
        if (duration < 900) return '5-15m';
        if (duration < 1800) return '15-30m';
        if (duration < 3600) return '30-60m';
        if (duration < 7200) return '1-2h';
        if (duration < 14400) return '2-4h';
        return '4h+';
    }

    // Nettoyage périodique des données
    startCleanupInterval(intervalMs = 3600000) { // 1 heure par défaut
        setInterval(() => {
            const now = Date.now();
            
            for (const [key, data] of this.sessionTimestamps.entries()) {
                // Nettoyer les sessions de plus de 24h
                if (now - data.startTime > 86400000 || 
                    (key.startsWith('last_') && now - data.endTime > 172800000)) {
                    this.sessionTimestamps.delete(key);
                }
            }
        }, intervalMs);
    }

    async getMetrics() {
        return await this.register.metrics();
    }
}

module.exports = new UserConnectionMetricsService();