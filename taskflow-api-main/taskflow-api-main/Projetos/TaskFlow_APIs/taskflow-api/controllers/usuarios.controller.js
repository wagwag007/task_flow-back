const Usuario = require('../models/usuario.model');
exports.listarTodos = (req, res) => {
    try {
        const usuarios = Usuario.listar();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: error.message });
    }
};

exports.buscarPorId = (req, res) => {
    try {
        const { id } = req.params;
        const usuario = Usuario.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: error.message });
    }
};
exports.criar = (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
        }

        const novoUsuario = Usuario.criar({ nome, email, senha });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: novoUsuario });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: error.message });
    }
};

exports.atualizar = (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        const usuarioExistente = Usuario.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        const usuarioAtualizado = Usuario.atualizar(id, { nome, email, senha });
        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: error.message });
    }
};
exports.deletar = (req, res) => {
    try {
        const { id } = req.params;

        const usuarioExistente = Usuario.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        Usuario.deletar(id);
        res.status(200).json({ mensagem: 'Usuário removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar usuário', detalhes: error.message });
    }
};