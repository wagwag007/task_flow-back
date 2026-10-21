//
function corsMiddleware(req, res, next) {
    const origensPermitidas = (process.env.CORS_ORIGIN || '*')
        .split(',')
        .map(origem => origem.trim())
        .filter(Boolean);
    const origemRequisicao = req.headers.origin;

    if (origensPermitidas.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origemRequisicao && origensPermitidas.includes(origemRequisicao)) {
        res.setHeader('Access-Control-Allow-Origin', origemRequisicao);
        res.vary('Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}

module.exports = corsMiddleware;