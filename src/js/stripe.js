import axios from "axios";
import Stripe from "stripe";
import { showAlert } from "./alert.js";

const stripe = new Stripe('pk_test_51RDby5QFJ3T0vH8tB4m6kPUsohl42QRXgFAZEPP1pTbrFXM7CXWMyyTRJB4MzFdZdRLuHtyo7gUaN6Kd4vgSMrvd00epP5Kpm3');

export const bookTour = async tourId => {
    try{
        // 1. Get checkout session from API
        const session = await axios(
            `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
        );
        
        // 2. Create checkout form + charge credit card
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // });
        window.location.replace(session.data.session.url);
    } catch(err) {
        console.log(err);
        showAlert('error', err);
    }
}