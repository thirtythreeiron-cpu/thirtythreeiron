// netlify/functions/create-checkout.js
// This function creates a Stripe Checkout session for the $50 founding member deposit

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: data.email,
      metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dob: data.dob,
        heard: data.heard,
        ecName: data.ecName,
        ecPhone: data.ecPhone,
        ecRelation: data.ecRelation,
        signature: data.signature,
        signatureDate: data.signatureDate,
        type: 'founding_member_deposit'
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Thirty-Three Iron — Founding Member Deposit',
              description: 'One-time non-refundable deposit applied to your first month\'s membership. Founding member rate: $40/mo for 6 months, then $45/mo locked for life.',
            },
            unit_amount: 5000, // $50.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${event.headers.origin || event.headers.referer.replace(/\/[^/]*$/, '')}/founding-member-agreement.html?payment=success`,
      cancel_url: `${event.headers.origin || event.headers.referer.replace(/\/[^/]*$/, '')}/founding-member-agreement.html?payment=cancelled`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
