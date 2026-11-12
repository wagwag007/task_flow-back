const { criarErro } = require('./erros');

const codigosPrisma = {
    P2002: { status: 409, mensagem: 'Já existe um registro com esses dados.' },
    P2003: { status: 400, mensagem: 'O registro relacionado não existe.' },
    P2025: { status: 404, mensagem: 'Registro não encontrado' },
};

function tratarErroPrisma(erro, metodo) {
    if (erro.code === 'P2003') {
        const mensagem = metodo === 'PUT'
            ? 'Um dos ids informados não existe'
            : metodo === 'DELETE'
                ? 'Não é possível excluir: existem registros ligados a este'
                : codigosPrisma.P2003.mensagem;

        return criarErro(400, mensagem);
    }

    const erroPrisma = codigosPrisma[erro.code];
    if (erroPrisma) {
        return criarErro(erroPrisma.status, erroPrisma.mensagem);
    }

    const status = Number(erro.statusCode || erro.status);
    const statusValido = Number.isInteger(status) && status >= 400 && status < 600
        ? status
        : 500;
    const mensagem = statusValido < 500 && typeof erro.message === 'string'
        ? erro.message
        : 'Erro interno do servidor';

    return criarErro(statusValido, mensagem);
}

module.exports = { tratarErroPrisma };
