// services/NotificationService.js
const Notification = require('../models/Notification');

const createNotification = async (userId, message, message2 , senderId, reference, referenceName , referenceName2) => {
    try {
        const notification = new Notification({
            userId,
            message,
            message2,
            sender: senderId,
            reference,
            referenceName,
            referenceName2
        });

        await notification.save();
        return notification;
    } catch (error) {
        throw new Error(`Error creating notification: ${error.message}`);
    }
};

const getNotificationsByUserId = async (userId) => {
    try {
        return await Notification.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Error fetching notifications: ${error.message}`);
    }
};

const markAsRead = async (notificationId) => {
    return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};

const deleteNotification = async (notificationId) => {
    return await Notification.findByIdAndDelete(notificationId);
};

const getNotificationsWithUnreadCount = async (userId) => {
    try {
        // Récupération des 30 derniers jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Récupérer toutes les notifications de l'utilisateur
        const notifications = await Notification.find({ 
            userId, 
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 });

        // Compter les notifications non lues dans les 30 derniers jours
        const unreadCount = await Notification.countDocuments({ 
            userId, 
            read: false, 
            createdAt: { $gte: thirtyDaysAgo }
        });

        return {
            notifications,
            unreadCount,
        };
    } catch (error) {
        throw new Error(`Error fetching notifications: ${error.message}`);
    }
};


const markNotificationsAsRead = async (notificationIds) => {
    try {
        // Mettre à jour toutes les notifications pour les marquer comme lues
        const result = await Notification.updateMany(
            { _id: { $in: notificationIds } }, 
            { $set: { read: true } },           
            { multi: true }                     
        );

        return result;
    } catch (error) {
        throw new Error(`Error marking notifications as read: ${error.message}`);
    }
};

module.exports = {
    createNotification,
    getNotificationsByUserId, getNotificationsWithUnreadCount , 
    markAsRead, markNotificationsAsRead  , 
    deleteNotification,
};
