const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const { verificarHash } = require('../../../utils/senha');

const idBancoValido = (id) => Number.isSafeInteger(id) && id > 0 && id <= 2147483647;

const authController = {
  async login(req, res) {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario || !idBancoValido(usuario.id) || !await verificarHash(senha, usuario.senha_hash)) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const segredoJwt = process.env.JWT_SECRET || 'taskflow-local-secret';

    try {
      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome },
        segredoJwt,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
      );

      return res.json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao gerar token de autenticação', detalhes: error.message });
    }
  }
};

module.exports = authController;