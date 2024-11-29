// controllers/newsletterController.js

const NewsletterService = require('../services/NewsletterService');

async function subscribe(req, res) {
  const { email } = req.body;

  try {
    const result = await NewsletterService.subscribe(email);
    res.status(201).json({ message: 'Succesfully Inscription' , result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function unsubscribe(req, res) {
  const { email } = req.body;

  try {
    const result = await NewsletterService.unsubscribe(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getAllSubscribers(req, res) {
    const filters = req.query;
    try {
      const subscribers = await NewsletterService.getAllSubscribers(filters);
      res.status(200).json(subscribers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
}

async function deleteSubscriber(req, res) {
    const { email } = req.body;
    try {
      await NewsletterService.deleteSubscriber(email);
      res.status(200).json({ message: 'Subscriber delete successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

module.exports = {
  subscribe, getAllSubscribers, deleteSubscriber,
  unsubscribe,
};
