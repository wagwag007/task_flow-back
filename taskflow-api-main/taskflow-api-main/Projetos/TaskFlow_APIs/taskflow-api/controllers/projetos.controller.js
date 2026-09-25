const Projeto = require('../models/projeto.model');
exports.listarTodos = (req, res) => {
    try {
        const projetos = Projeto.listar();
        res.status(200).json(projetos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar projetos', detalhes: error.message });
    }
};

exports.buscarPorId = (req, res) => {
    try {
        const { id } = req.params;
        const projeto = Projeto.buscarPorId(id);

        if (!projeto) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }

        res.status(200).json(projeto);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar projeto', detalhes: error.message });
    }
};

exports.criar = (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: 'O campo nome é obrigatório' });
        }

        const novoProjeto = Projeto.criar({ nome, descricao });
        res.status(201).json({ mensagem: 'Projeto criado com sucesso!', projeto: novoProjeto });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar projeto', detalhes: error.message });
    }
};

exports.atualizar = (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        const projetoExistente = Projeto.buscarPorId(id);
        if (!projetoExistente) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }

        const projetoAtualizado = Projeto.atualizar(id, { nome, descricao });
        res.status(200).json({ mensagem: 'Projeto atualizado com sucesso!', projeto: projetoAtualizado });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar projeto', detalhes: error.message });
    }
};
exports.deletar = (req, res) => {
    try {
        const { id } = req.params;

        const projetoExistente = Projeto.buscarPorId(id);
        if (!projetoExistente) {
            return res.status(404).json({ erro: 'Projeto não encontrado' });
        }

        Projeto.deletar(id);
        res.status(200).json({ mensagem: 'Projeto removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar projeto', detalhes: error.message });
    }
};