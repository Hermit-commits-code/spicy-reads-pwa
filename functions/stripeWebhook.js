// Example Firebase Function for Stripe webhook (Node.js)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_your_stripe_secret_key'); // Replace with your Stripe secret key

admin.initializeApp();

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      'whsec_your_webhook_secret',
    ); // Replace with your webhook secret
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId; // Attach userId in Stripe Checkout metadata
    if (userId) {
      await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .update({ premium: true });
      return res.status(200).send('Premium granted');
    }
  }
  res.status(400).send('Unhandled event type or missing userId');
});
