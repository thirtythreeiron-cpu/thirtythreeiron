const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, name } = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 8000, // $80.00 in cents
      currency: 'usd',
      description: 'Thirty-Three Iron — Founding Member (First + Last Month)',
      receipt_email: email,
      metadata: {
        member_name: name,
        member_email: email,
        type: 'founding_member_deposit'
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };

  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
