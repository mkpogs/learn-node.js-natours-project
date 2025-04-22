import cors from 'cors';

const corsOptions = {
    origin: ['http://127.0.0.1:8000', 'http://localhost:8000'],
    credentials: true // if you're using cookies or Authorization headers
}

const corsMiddleware = cors(corsOptions);
const corsPreflight = cors(corsOptions); // For OPTIONS requests

export { corsMiddleware, corsPreflight };