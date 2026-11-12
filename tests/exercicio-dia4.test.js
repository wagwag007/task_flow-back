const validar = require('../TaskFlow-Back-main/src/new_folder/middlewares/validar');
const tratarErros = require('../TaskFlow-Back-main/src/new_folder/middlewares/tratarErros');
const schemas = require('../TaskFlow-Back-main/src/new_folder/middlewares/schemas');
const { criarErro } = require('../TaskFlow-Back-main/utils/erros');
const spyOn = jest.spyOn;

function criarRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(dados) {
      this.body = dados;
      return this;
    },
  };
}

function pegarErro(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
}

describe('Exercício Dia 4 - Validação e Tratamento de Erros', () => {
  test('1. validar(schemas.usuario) com e-mail "ana@" retorna 400, detalhe de e-mail e não chama next', () => {
    const req = {
      body: { nome: 'Ana Silva', email: 'ana@', senha: 'senhaSegura123' },
    };
    const res = criarRes();
    const next = jest.fn();

    validar(schemas.usuario)(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.detalhes).toHaveLength(1);
    expect(res.body.detalhes[0]).toMatch(/e-?mail/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('2. validar(schemas.usuario) com nome "Al" e senha "123" retorna dois detalhes de tamanho mínimo na ordem', () => {
    const req = {
      body: { nome: 'Al', email: 'al@email.com', senha: '123' },
    };
    const res = criarRes();
    const next = jest.fn();

    validar(schemas.usuario)(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.detalhes).toHaveLength(2);
    expect(res.body.detalhes).toEqual([
      "O campo 'nome' deve ter ao menos 3 caracteres",
      "O campo 'senha' deve ter ao menos 6 caracteres",
    ]);
    expect(next).not.toHaveBeenCalled();
  });

  test('3. validar(schemas.projeto) com descricao de 201 caracteres retorna detalhe de tamanho máximo', () => {
    const req = {
      body: {
        nome: 'Projeto Teste',
        descricao: 'a'.repeat(201),
      },
    };
    const res = criarRes();
    const next = jest.fn();

    validar(schemas.projeto)(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.detalhes).toHaveLength(1);
    expect(res.body.detalhes[0]).toMatch(/descri|máximo|200/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('4. tratarErros com criarErro(400) chama res.status 1 vez com 400 e envia detalhes no json', () => {
    const detalhes = ['Campo obrigatório'];
    const erro = criarErro(400, 'Dados inválidos', detalhes);
    const req = { method: 'POST' };
    const res = criarRes();
    const next = jest.fn();
    const spyStatus = spyOn(res, 'status');

    expect(pegarErro(() => tratarErros(erro, req, res, next))).toBeUndefined();
    expect(spyStatus).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledWith(400);
    expect(res.body.detalhes).toEqual(detalhes);
  });

  test('5. tratarErros com erro Prisma P2025 (PUT) retorna 404 com "Registro não encontrado"', () => {
    const erroPrisma = { code: 'P2025' };
    const req = { method: 'PUT' };
    const res = criarRes();
    const next = jest.fn();
    const consoleError = spyOn(console, 'error').mockImplementation(() => {});

    tratarErros(erroPrisma, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body.mensagem || res.body.erro).toBe('Registro não encontrado');
    consoleError.mockRestore();
  });
});
