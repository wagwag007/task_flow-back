function criarErro(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    console.error(erro);

    const status = Number(erro.statusCode || erro.status);
    const statusCode = Number.isInteger(status) && status >= 400 && status < 600
        ? status
        : 500;
    const mensagem = statusCode < 500 && typeof erro.message === 'string'
        ? erro.message
        : 'Erro interno do servidor';

    res.status(statusCode).json({ erro: mensagem });
}

module.exports = criarErro;