//
function corsMiddleware(req, res, next) {
    const origem = process.env.CORS_ORIGIN || '*';
    const cors = require('cors');

    app.use(cors({
        origin:'http://localhost:5176',
        credentials: true
    }));

    res.setHeader('Access-Control-Allow-Origin', origem);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}

module.exports = corsMiddleware;