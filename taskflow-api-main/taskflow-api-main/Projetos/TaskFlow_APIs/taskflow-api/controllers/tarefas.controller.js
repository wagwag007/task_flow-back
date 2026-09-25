const Tarefa = require('../models/tarefas.model');

exports.listarTodas = (req, res) => {
    try {
        const tarefas = Tarefa.listar(req.usuario.id);
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefas', detalhes: error.message });
    }
};

exports.buscarPorId = (req, res) => {
    try {
        const { id } = req.params;
        const tarefa = Tarefa.buscarPorId(id, req.usuario.id);

        if (!tarefa) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        res.status(200).json(tarefa);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tarefa', detalhes: error.message });
    }
};

exports.criar = (req, res) => {
    try {
        const { titulo, descricao } = req.body;
        const projetoIdBody = req.body.projetoId ?? req.body.projeto_id ?? null;
        const projetoId = projetoIdBody === null || projetoIdBody === undefined || projetoIdBody === ''
            ? null
            : Number(projetoIdBody);

        const usuarioId = req.usuario.id;

        if (!titulo) {
            return res.status(400).json({ erro: 'O título da tarefa é obrigatório' });
        }

        const novaTarefa = Tarefa.criar({
            titulo,
            descricao: descricao || '',
            status: 'pendente',
            projetoId,
            usuarioId: usuarioId === null || usuarioId === undefined || usuarioId === ''
                ? null
                : Number(usuarioId)
        });

        res.status(201).json({ mensagem: 'Tarefa criada com sucesso!', tarefa: novaTarefa });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar tarefa', detalhes: error.message });
    }
};

exports.atualizar = (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, status, projetoId } = req.body;

        const tarefaExistente = Tarefa.buscarPorId(id, req.usuario.id);
        if (!tarefaExistente) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        const tarefaAtualizada = Tarefa.atualizar(id, { titulo, descricao, status, projetoId, usuarioId: req.usuario.id });
        res.status(200).json({ mensagem: 'Tarefa atualizada com sucesso!', tarefa: tarefaAtualizada });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar tarefa', detalhes: error.message });
    }
};

exports.deletar = (req, res) => {
    try {
        const { id } = req.params;

        const tarefaExistente = Tarefa.buscarPorId(id, req.usuario.id);
        if (!tarefaExistente) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        Tarefa.deletar(id, req.usuario.id);
        res.status(200).json({ mensagem: 'Tarefa removida com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar tarefa', detalhes: error.message });
    }
};

exports.estatisticas = (req, res) => {
    try {
        const tarefas = Tarefa.listar(req.usuario.id);
        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.status === 'concluida').length;
        const pendentes = tarefas.filter(t => t.status === 'pendente').length;

        res.status(200).json({ total, concluidas, pendentes });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar estatísticas', detalhes: error.message });
    }
};

exports.estatisticasResumo = (req, res) => {
    try {
        const tarefas = Tarefa.listar(req.usuario.id);
        const resumo = {
            total: tarefas.length,
            concluidas: tarefas.filter(t => t.status === 'concluida').length,
            pendentes: tarefas.filter(t => t.status === 'pendente').length,
            emAndamento: tarefas.filter(t => t.status === 'em andamento').length
        };

        res.status(200).json({ resumo });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar resumo de estatísticas', detalhes: error.message });
    }
};