const criarErroMiddleware = require('../TaskFlow-Back-main/utils/criarErro');

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}

describe('middleware de erros do Prisma', () => {
    test('P2002 responde com status 409 e mensagem de conflito', () => {
        const resposta = criarResposta();
        const erro = { code: 'P2002' };
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        criarErroMiddleware(erro, { method: 'POST' }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(409);
        expect(resposta.json).toHaveBeenCalledWith({
            erro: 'Já existe um registro com esses dados.',
        });
        consoleError.mockRestore();
    });

    test('P2003 em POST mantém a mensagem genérica de relação inexistente', () => {
        const resposta = criarResposta();
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        criarErroMiddleware({ code: 'P2003' }, { method: 'POST' }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
        expect(resposta.json).toHaveBeenCalledWith({
            erro: 'O registro relacionado não existe.',
        });
        consoleError.mockRestore();
    });

    test('erro genérico responde com status 500 e mensagem segura', () => {
        const resposta = criarResposta();
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        criarErroMiddleware(new Error('falha interna'), { method: 'GET' }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(500);
        expect(resposta.json).toHaveBeenCalledWith({ erro: 'Erro interno do servidor' });
        consoleError.mockRestore();
    });

    test('encaminha erros quando os headers já foram enviados', () => {
        const resposta = { headersSent: true };
        const next = jest.fn();
        const erro = new Error('já enviado');

        criarErroMiddleware(erro, { method: 'GET' }, resposta, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});