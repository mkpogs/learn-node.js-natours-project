import helmet from "helmet";

const helmetCSP = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          "https://js.stripe.com"
        ],
        scriptSrcElem: [
          "'self'",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://js.stripe.com"
        ],
        workerSrc: [
          "'self'",
          'blob:'
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com'
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],
        connectSrc: [
          "'self'",
          'http://localhost:8000',   // your API
          'http://127.0.0.1:8000',
          "ws://localhost:*",   // Parcel's hot reload WebSocket
          'ws://127.0.0.1:*',
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],

        frameSrc: [
          "'self'",
          "https://js.stripe.com"
        ],
        childSrc: ["'self'"],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"]
      }
});

export default helmetCSP;
// This code sets up a Content Security Policy (CSP) using the Helmet middleware for an Express.js application.