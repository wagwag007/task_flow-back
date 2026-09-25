const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const authController = {
  login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    if (usuario.senha !== senha) {
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
        usuario: { id: usuario.id, nome: usuario.nome }
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao gerar token de autenticação', detalhes: error.message });
    }
  }
};

module.exports = authController;