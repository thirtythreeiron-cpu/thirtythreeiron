// Netlify Function: create-checkout-session
// Path: netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Thirty-Three Iron - Founding Member',
              description: 'Lifetime founding member rate locked at $45/month',
              images: ['https://thirtythreeiron.com/logo.png'], // Optional: add your logo URL
            },
            unit_amount: 8000, // $80.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin || 'https://thirtythreeiron.com'}/founding-member-form.html?success=true`,
      cancel_url: `${event.headers.origin || 'https://thirtythreeiron.com'}/founding-member-form.html?canceled=true`,
      customer_email: data.memberEmail,
      metadata: {
        memberName: data.memberName,
        memberPhone: data.memberPhone,
        memberAddress: data.memberAddress,
        memberCity: data.memberCity,
        memberSignature: data.memberSignature,
        agreementDate: data.agreementDate,
        signatureDate: data.signatureDate,
        timestamp: data.timestamp
      },
      // Enable email receipt
      payment_intent_data: {
        receipt_email: data.memberEmail,
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: session.id })
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
