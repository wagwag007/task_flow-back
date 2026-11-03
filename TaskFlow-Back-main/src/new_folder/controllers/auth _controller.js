const fs = require('node:fs/promises');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const { gerarHash, verificarHash } = require('../../../utils/senha');

const idBancoValido = (id) => Number.isSafeInteger(id) && id > 0 && id <= 2147483647;
const arquivoUsuariosLegados = path.join(__dirname, '..', 'data', 'usuarios.json');

async function buscarUsuarioLegado(email, senha) {
  let conteudo;
  try {
    conteudo = await fs.readFile(arquivoUsuariosLegados, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }

  const usuariosLegados = JSON.parse(conteudo);
  if (!Array.isArray(usuariosLegados)) {
    throw new Error('O arquivo de usuários antigos tem um formato inválido');
  }

  return usuariosLegados.find((usuario) =>
    typeof usuario.email === 'string' &&
    usuario.email.trim().toLowerCase() === email &&
    typeof usuario.senha === 'string' &&
    usuario.senha === senha
  ) || null;
}

const authController = {
  async login(req, res) {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    let usuario = await usuarioModel.buscarPorEmail(email);
    if (usuario && !await verificarHash(senha, usuario.senha_hash)) {
      if (usuario.senha_hash !== senha) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      usuario = await usuarioModel.atualizar(usuario.id, {
        senha_hash: await gerarHash(senha),
      });
    } else if (!usuario) {
      const usuarioLegado = await buscarUsuarioLegado(email, senha);
      if (!usuarioLegado) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      usuario = await usuarioModel.criar({
        nome: usuarioLegado.nome,
        email: usuarioLegado.email.trim().toLowerCase(),
        senha_hash: await gerarHash(senha),
      });
    }

    if (!idBancoValido(usuario.id)) {
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