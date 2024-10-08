// controllers/NotificationController.js
const NotificationService = require('../services/NotificationService');

const createNotification = async (req, res) => {
    try {
        const { userId, message, senderId, reference, referenceName } = req.body;
        const notification = await NotificationService.createNotification(userId, message, senderId, reference, referenceName);
        return res.status(201).json(notification);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await NotificationService.getNotificationsByUserId(userId);
        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const updatedNotification = await NotificationService.markAsRead(notificationId);
        return res.status(200).json(updatedNotification);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await NotificationService.deleteNotification(notificationId);
        return res.status(204).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getNotificationsWithUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await NotificationService.getNotificationsWithUnreadCount(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({ message: 'Invalid notification IDs provided' });
        }

        const result = await NotificationService.markNotificationsAsRead(notificationIds);

        return res.status(200).json({
            message: `${result.nModified} notifications marked as read.`,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNotification,
    getNotificationsByUserId, markNotificationsAsRead ,
    markNotificationAsRead, getNotificationsWithUnreadCount , 
    deleteNotification,
};
