// check if the id is a valid positive integer
const projetoModel = require('../models/projeto.model');
const tarefaModel = require('../models/tarefa.models');

const idValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const projetosController = {
    async listar(req, res) {
        res.json(await projetoModel.listar());
    },

    async buscarPorId(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const projeto = await projetoModel.buscarPorId(Number(req.params.id));
        if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
        res.json(projeto);
    },

    async criar(req, res) {
        const { nome, descricao, usuarioId } = req.body;
        if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100) {
            return res.status(400).json({ erro: 'Nome obrigatório e deve ter até 100 caracteres' });
        }
        if (!idValido(String(usuarioId ?? ''))) {
            return res.status(400).json({ erro: 'usuarioId deve ser um número inteiro positivo' });
        }
        if (descricao !== undefined && (typeof descricao !== 'string' || descricao.length > 200)) {
            return res.status(400).json({ erro: 'Descrição deve ter até 200 caracteres' });
        }
        const projeto = await projetoModel.criar({
            nome: nome.trim(),
            descricao: descricao === undefined ? '' : descricao,
            usuarioId: Number(usuarioId),
        });
        res.status(201).json(projeto);
    },

    async atualizar(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const id = Number(req.params.id);
        if (!await projetoModel.buscarPorId(id)) return res.status(404).json({ erro: 'Projeto não encontrado' });
        const { nome, descricao } = req.body;
        if (nome !== undefined && (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100)) {
            return res.status(400).json({ erro: 'Nome inválido: informe até 100 caracteres' });
        }
        if (descricao !== undefined && (typeof descricao !== 'string' || descricao.length > 200)) {
            return res.status(400).json({ erro: 'Descrição deve ter até 200 caracteres' });
        }
        const projeto = await projetoModel.atualizar(id, {
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(descricao !== undefined && { descricao }),
        });
        res.json(projeto);
    },

    async remover(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const id = Number(req.params.id);
        const projeto = await projetoModel.buscarPorId(id);
        if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
        if ((await tarefaModel.listarPorProjeto(id)).length > 0) {
            return res.status(400).json({ erro: 'Projeto possui tarefas associadas. Remova as tarefas antes.' });
        }
        res.json({ mensagem: 'Projeto removido', projeto: await projetoModel.deletar(id) });
    },

    async resumo(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const id = Number(req.params.id);
        const projeto = await projetoModel.buscarPorId(id);
        if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
        const tarefas = await tarefaModel.listarPorProjeto(id);
        res.json({
            projeto,
            totalTarefas: tarefas.length,
            porColuna: {
                afazer: tarefas.filter(tarefa => tarefa.coluna === 'afazer').length,
                andamento: tarefas.filter(tarefa => tarefa.coluna === 'andamento').length,
                concluido: tarefas.filter(tarefa => tarefa.coluna === 'concluido').length,
            },
        });
    },
};

module.exports = projetosController;