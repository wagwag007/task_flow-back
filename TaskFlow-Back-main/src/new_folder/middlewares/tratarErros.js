const { tratarErroPrisma } = require('../../../utils/prismaErros');

function tratarErros(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    if (erro && typeof erro.status === 'number' && typeof erro.mensagem === 'string') {
        return res.status(erro.status).json({
            mensagem: erro.mensagem,
            detalhes: erro.detalhes,
        });
    }

    console.error(erro);
    const resultado = tratarErroPrisma(erro, req.method);
    res.status(resultado.status).json({ erro: resultado.mensagem });
}

module.exports = tratarErros;
