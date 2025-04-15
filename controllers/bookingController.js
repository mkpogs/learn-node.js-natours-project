import Stripe from "stripe";
import Tour from "./../models/tourModel.js";
import Booking from "./../models/bookingModel.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";


// Validate if the Stripe Secret Key is defined in the environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe Secret Key is not defined! Check your dotenv config.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {

    // 1. Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // Check if the tour exists
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    // 2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items:[
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://natours.dev/img/tours/${tour.imageCover}`],
                    }
                },
                quantity: 1 
            }
        ]
    });

    // 3. Create checkout session as response
    res.status(200).json({
        status: 'success',
        session
    });
});


export const createBookingCheckout = catchAsync(async(req, res, next) => {
    // This is temporary, because it's not secure
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});