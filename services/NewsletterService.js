// services/newsletterService.js

const NewsLetterSubscriber = require('../models/NewsLetterSubscriber');

async function isSubscribe (email) {
  const subscription = await NewsLetterSubscriber.findOne({ email });
    return subscription !== null;
}

async function subscribe(email) {
  const subscription = await NewsLetterSubscriber.findOne({ email });
  if(subscription) {
    return { alreadySubscribed: true, subscriber: subscription };
  }
  const subscriber = new NewsLetterSubscriber({ email });
  return await subscriber.save();
}

async function unsubscribe(email) {
    try {
      const subscriber = await NewsLetterSubscriber.findOne({ email });
      if (subscriber) {
        subscriber.subscribed = false;
        subscriber.unsubscriptionDate = new Date();
        await subscriber.save();
        return { message: 'Successfully Unsubscribe' ,  subscriber };
      } else {
        throw new Error('User not subscribe to the newsletter');
      }
    } catch (err) {
      throw new Error('Error during process: ' + err.message);
    }
}

async function getAllSubscribers(filters = {}) {
    try {
      const query = {};
  
      if (filters.subscribed !== undefined) {
        query.subscribed = filters.subscribed === 'true';
      }
  
      if (filters.startDate) {
        query.subscriptionDate = { $gte: new Date(filters.startDate) };
      }
  
      if (filters.endDate) {
        query.subscriptionDate = query.subscriptionDate || {};
        query.subscriptionDate.$lte = new Date(filters.endDate);
      }
  
      return await NewsLetterSubscriber.find(query);
    } catch (error) {
      throw new Error('Error getting list of subscribers.');
    }
  }

async function deleteSubscriber(email) {
try {
    await NewsLetterSubscriber.findOneAndDelete({ email });
} catch (error) {
    throw new Error('Erreur lors de la suppression de l\'abonné.');
}
}
  

module.exports = {
  subscribe,getAllSubscribers, isSubscribe,
  unsubscribe, deleteSubscriber
};
