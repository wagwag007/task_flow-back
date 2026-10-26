const tarefaModel = require('../models/tarefa.models');

const prioridadesValidas = ['alta', 'media', 'baixa'];
const colunasValidas = ['afazer', 'andamento', 'concluido'];

const idValido = (valor) =>
	/^\d+$/.test(String(valor)) &&
	Number.isSafeInteger(Number(valor)) &&
	Number(valor) > 0 &&
	Number(valor) <= 2147483647;
const obterUsuarioId = (req) => req.usuario?.id ?? req.query?.usuarioId ?? req.body?.usuarioId;
const usuarioIdValido = (req) => idValido(String(obterUsuarioId(req) ?? ''));
const criarErroNaoEncontrado = () => {
	const erro = new Error('Tarefa não encontrada');
	erro.statusCode = 404;
	return erro;
};

const validarDados = ({ texto, prioridade, coluna }, exigirTexto = false) => {
	if (exigirTexto && (typeof texto !== 'string' || !texto.trim())) return 'Texto obrigatório';
	if (texto !== undefined && (typeof texto !== 'string' || !texto.trim())) return 'Texto inválido';
	if (prioridade !== undefined && !prioridadesValidas.includes(prioridade)) return 'Prioridade inválida. Use: alta, media ou baixa';
	if (coluna !== undefined && !colunasValidas.includes(coluna)) return 'Coluna inválida. Use: afazer, andamento ou concluido';
	return null;
};

const validarOrdem = (ordem) => ordem === undefined ||
	(Number.isInteger(ordem) && ordem >= 0);

const tarefasController = {
	async listar(req, res) {
		const { coluna, prioridade, usuarioId } = req.query;
		if (coluna && !colunasValidas.includes(coluna)) return res.status(400).json({ erro: 'Coluna inválida' });
		if (prioridade && !prioridadesValidas.includes(prioridade)) return res.status(400).json({ erro: 'Prioridade inválida' });
		if (usuarioId !== undefined && !idValido(usuarioId)) {
			return res.status(400).json({ erro: 'usuarioId deve ser um número inteiro positivo' });
		}
		if (usuarioId !== undefined && Number(usuarioId) !== Number(req.usuario.id)) {
			return res.status(403).json({ erro: 'Não é permitido consultar as tarefas de outro usuário por esse filtro' });
		}

		let resultado = await tarefaModel.listar(usuarioId === undefined
			? undefined
			: Number(usuarioId));
		if (coluna) resultado = resultado.filter(tarefa => tarefa.coluna === coluna);
		if (prioridade) resultado = resultado.filter(tarefa => tarefa.prioridade === prioridade);
		res.json(resultado);
	},

	async buscarPorId(req, res) {
		if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		const tarefa = await tarefaModel.buscarPorId(Number(req.params.id), Number(obterUsuarioId(req)));
		if (!tarefa) throw criarErroNaoEncontrado();
		res.json(tarefa);
	},

	async criar(req, res) {
		const texto = req.body.texto ?? req.body.titulo;
		const erro = validarDados({ ...req.body, texto }, true);
		if (erro) return res.status(400).json({ erro });
		if (!validarOrdem(req.body.ordem)) return res.status(400).json({ erro: 'Ordem deve ser um número inteiro não negativo' });
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		if (req.body.projetoId !== undefined && !idValido(String(req.body.projetoId))) {
			return res.status(400).json({ erro: 'projetoId deve ser um número positivo' });
		}
		const usuarioId = Number(obterUsuarioId(req));
		if (req.body.coluna === 'andamento' &&
			(await tarefaModel.listar(usuarioId)).filter(tarefa => tarefa.coluna === 'andamento').length >= 2) {
			return res.status(400).json({ erro: 'Limite de 2 tarefas em andamento por usuário atingido' });
		}

		const novaTarefa = await tarefaModel.adicionar({
			titulo: texto.trim(),
			prioridade: req.body.prioridade,
			coluna: req.body.coluna,
			ordem: req.body.ordem,
			usuarioId,
			projetoId: req.body.projetoId === undefined ? undefined : Number(req.body.projetoId),
		});
		res.status(201).json(novaTarefa);
	},

	async atualizar(req, res) {
		if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		const id = Number(req.params.id);
		const usuarioId = Number(obterUsuarioId(req));
		const atual = await tarefaModel.buscarPorId(id, usuarioId);
		if (!atual) throw criarErroNaoEncontrado();
		const texto = req.body.texto ?? req.body.titulo;
		const erro = validarDados({ ...req.body, texto });
		if (erro) return res.status(400).json({ erro });
		if (!validarOrdem(req.body.ordem)) return res.status(400).json({ erro: 'Ordem deve ser um número inteiro não negativo' });
		if (req.body.projetoId !== undefined && !idValido(String(req.body.projetoId))) {
			return res.status(400).json({ erro: 'projetoId deve ser um número positivo' });
		}
		if (req.body.usuarioId !== undefined && Number(req.body.usuarioId) !== usuarioId) {
			return res.status(400).json({ erro: 'Não é possível alterar o usuário da tarefa' });
		}
		if (req.body.coluna === 'andamento' && atual.coluna !== 'andamento' &&
			(await tarefaModel.listar(usuarioId)).filter(tarefa => tarefa.coluna === 'andamento' && tarefa.id !== id).length >= 2) {
			return res.status(400).json({ erro: 'Limite de 2 tarefas em andamento por usuário atingido' });
		}
		const dados = {};
		for (const campo of ['texto', 'prioridade', 'coluna', 'projetoId']) {
			if (campo !== 'texto' && req.body[campo] !== undefined) dados[campo] = req.body[campo];
		}
		if (texto !== undefined) {
			dados.texto = texto.trim();
			dados.titulo = texto.trim();
		}
		if (dados.projetoId !== undefined) dados.projetoId = Number(dados.projetoId);

		const tarefa = await tarefaModel.atualizar(id, usuarioId, {
			titulo: dados.titulo,
			coluna: dados.coluna,
			ordem: req.body.ordem,
			projetoId: dados.projetoId,
			prioridade: dados.prioridade,
		});
		if (!tarefa) throw criarErroNaoEncontrado();
		res.json(tarefa);
	},

	async remover(req, res) {
		if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		const id = Number(req.params.id);
		const usuarioId = Number(obterUsuarioId(req));
		const tarefa = await tarefaModel.buscarPorId(id, usuarioId);
		if (!tarefa) throw criarErroNaoEncontrado();
		const tarefaRemovida = await tarefaModel.remover(id, usuarioId);
		if (!tarefaRemovida) throw criarErroNaoEncontrado();
		res.json({ mensagem: 'Tarefa removida', tarefa });
	},

	async estatisticas(req, res) {
		const { coluna } = req.query;
		if (coluna && !colunasValidas.includes(coluna)) return res.status(400).json({ erro: 'Coluna inválida' });
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		const tarefas = await tarefaModel.listar(Number(obterUsuarioId(req)));
		const base = coluna ? tarefas.filter(tarefa => tarefa.coluna === coluna) : tarefas;
		const porColuna = {
			afazer: base.filter(tarefa => tarefa.coluna === 'afazer').length,
			andamento: base.filter(tarefa => tarefa.coluna === 'andamento').length,
			concluido: base.filter(tarefa => tarefa.coluna === 'concluido').length,
		};
		const porPrioridade = {
			alta: base.filter(tarefa => tarefa.prioridade === 'alta').length,
			media: base.filter(tarefa => tarefa.prioridade === 'media').length,
			baixa: base.filter(tarefa => tarefa.prioridade === 'baixa').length,
		};
		const rankingUsuarios = await tarefaModel.rankingUsuarios();
		res.json({ coluna: coluna || 'todas', total: base.length, porColuna, porPrioridade, rankingUsuarios });
	},

	async resumo(req, res) {
		if (!usuarioIdValido(req)) return res.status(400).json({ erro: 'usuarioId obrigatório e deve ser um número positivo' });
		const tarefas = await tarefaModel.listar(Number(obterUsuarioId(req)));
		const concluido = tarefas.filter(tarefa => tarefa.coluna === 'concluido').length;
		const andamento = tarefas.filter(tarefa => tarefa.coluna === 'andamento').length;
		const afazer = tarefas.filter(tarefa => tarefa.coluna === 'afazer').length;
		res.json({
			resumo: `Você tem ${tarefas.length} tarefas. ${concluido} concluídas, ${andamento} em andamento e ${afazer} a fazer.`,
		});
	},
};

module.exports = tarefasController;