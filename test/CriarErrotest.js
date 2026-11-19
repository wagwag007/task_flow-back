const { criarErro } = require('../TaskFlow-Back-main/utils/erros');

describe('criarErro', () => {
    test('retorna status e mensagem sem detalhes por padrão', () => {
        expect(criarErro(500, 'Erro interno no servidor')).toEqual({
            status: 500,
            mensagem: 'Erro interno no servidor',
            detalhes: undefined,
        });
    });

    test('preserva detalhes fornecidos', () => {
        expect(criarErro(400, 'Entrada inválida', { campo: 'nome' }).detalhes).toEqual({
            campo: 'nome',
        });
    });

    test('preserva o status informado', () => {
        expect(criarErro(404, 'Não encontrado').status).toBe(404);
    });

    test('preserva a mensagem informada', () => {
        expect(criarErro(409, 'Conflito').mensagem).toBe('Conflito');
    });
});