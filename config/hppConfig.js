import hpp from "hpp";

const hppMiddleware = hpp({
    whitelist: [
        'duration',
        'maxGroupSize',
        'difficulty',
        'ratingsAverage',
        'ratingsQuantity',
        'price',
        'sort'
    ]
});

export default hppMiddleware;