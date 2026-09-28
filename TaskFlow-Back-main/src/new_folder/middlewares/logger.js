function temporizador(req, res, next) {
    const inicio = Date.now();
    const metedo = req.method;
    const url = req.url;
    res.on('finish', () => {
        const duracao = Date.now() - inicio;
        console.log(`${metedo} ${url} ${duracao}ms`);
    });
    next();
}

module.exports = temporizador;