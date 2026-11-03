const usuarioModel = require('../models/usuario.model');
const tarefaModel = require('../models/tarefa.models');
const { gerarHash } = require('../../../utils/senha');

const idValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const usuariosController = {
    async listar(req, res) {
        res.json(await usuarioModel.listar());
    },

    async buscarPorId(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const usuario = await usuarioModel.buscarPorId(Number(req.params.id));
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json(usuario);
    },

    async criar(req, res) {
        const { nome, email, senha } = req.body;
        if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || senha.length < 6) {
            return res.status(400).json({ erro: 'Nome, email e senha (mínimo 6 caracteres) são obrigatórios' });
        }
        const emailNormalizado = email.trim().toLowerCase();
        if (await usuarioModel.buscarPorEmail(emailNormalizado)) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }

        const novoUsuario = await usuarioModel.criar({
            nome: nome.trim(),
            email: emailNormalizado,
            senha_hash: await gerarHash(senha),
        });
        res.status(201).json(novoUsuario);
    },

    async atualizar(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const id = Number(req.params.id);
        if (!await usuarioModel.buscarPorId(id)) return res.status(404).json({ erro: 'Usuário não encontrado' });

        const { nome, email } = req.body;
        if (nome !== undefined && (typeof nome !== 'string' || !nome.trim())) {
            return res.status(400).json({ erro: 'Nome inválido' });
        }
        if (email !== undefined && (typeof email !== 'string' || !email.trim())) {
            return res.status(400).json({ erro: 'Email inválido' });
        }
        const emailNormalizado = email === undefined ? undefined : email.trim().toLowerCase();
        const usuarioComEmail = emailNormalizado
            ? await usuarioModel.buscarPorEmail(emailNormalizado)
            : null;
        if (usuarioComEmail && usuarioComEmail.id !== id) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }

        const usuario = await usuarioModel.atualizar(id, {
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(emailNormalizado !== undefined && { email: emailNormalizado }),
        });
        res.json(usuario);
    },

    async remover(req, res) {
        if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
        const id = Number(req.params.id);
        const usuario = await usuarioModel.buscarPorId(id);
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
        if ((await tarefaModel.listar(id)).length > 0) {
            return res.status(400).json({ erro: 'Usuário possui tarefas. Remova as tarefas antes de deletar o usuário.' });
        }

        const usuarioRemovido = await usuarioModel.deletar(id);
        res.json({ mensagem: 'Usuário removido', usuario: usuarioRemovido });
    },
};

module.exports = usuariosController;