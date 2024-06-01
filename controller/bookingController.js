const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Bookings = require('../models/bookingModel');
const Tours = require('../models/tourModel');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
        const { tourId } = req.params;
        const user = await Users.findById(req.user.id);
        const cart = user.cart.filter(item => item.tour._id.toString() === tourId);
        console.log(cart)
        const tour = await Tours.findById(cart[0].tour);
        // Get the booked Tour

        // Create the Checkout Session
        const product = await stripe.products.create({
            name: tour.name,
            description: tour.description,
            images: [tour.imageCover],
          });
          
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: tour.price * 100,
            currency: 'usd',
          });

        const session  = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/api/v2/bookings/checkout/success`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/v2/bookings/checkout/cancel`,
            customer_email: user.email,
            client_reference_id: tourId,
            line_items: [
                {
                    price: price.id,
                    quantity: cart[0].quantity,
                }
            ],
            mode: 'payment',
        })
        // Send the Session to the Client

        res.status(200).json({
            status:'success',
            data: {
                session,
            }
        })
})
