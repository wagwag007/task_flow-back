const { tratarErroPrisma } = require('./prismaErros');

function criarErro(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    console.error(erro);
    const resultado = tratarErroPrisma(erro, req.method);
    res.status(resultado.status).json({ erro: resultado.mensagem });
}

module.exports = criarErro;