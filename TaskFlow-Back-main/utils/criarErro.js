function criarErro(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    console.error(erro);

    const codigosPrisma = {
        P2002: { statusCode: 409, message: 'Já existe um registro com esses dados.' },
        P2003: { statusCode: 400, message: 'O registro relacionado não existe.' },
        P2025: { statusCode: 404, message: 'Registro não encontrado.' },
    };
    const erroPrisma = codigosPrisma[erro.code];
    const status = Number(erroPrisma?.statusCode || erro.statusCode || erro.status);
    const statusCode = Number.isInteger(status) && status >= 400 && status < 600
        ? status
        : 500;
    const mensagem = erroPrisma?.message || (
        statusCode < 500 && typeof erro.message === 'string'
            ? erro.message
            : 'Erro interno do servidor'
    );

    res.status(statusCode).json({ erro: mensagem });
}

module.exports = criarErro;