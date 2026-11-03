const prisma = require('../database/db');

const prioridadeIds = { alta: 1, media: 2, baixa: 3 };
const prioridades = Object.fromEntries(
    Object.entries(prioridadeIds).map(([nome, id]) => [id, nome])
);
const colunasBanco = { afazer: 'todo', andamento: 'doing', concluido: 'done' };
const colunasApi = { todo: 'afazer', doing: 'andamento', done: 'concluido' };
const relacionamentos = {
    usuarios: { select: { nome: true } },
    projetos: { select: { nome: true } },
};

function mapearTarefa(tarefa) {
    return {
        id: tarefa.id,
        titulo: tarefa.texto,
        coluna: colunasApi[tarefa.coluna.toLowerCase()] || tarefa.coluna.toLowerCase(),
        ordem: tarefa.ordem,
        projetoId: tarefa.projeto_id,
        usuarioId: tarefa.usuario_id,
        prioridadeId: tarefa.idprioridade,
        criadoEm: tarefa.criado_em,
        usuarioNome: tarefa.usuarios?.nome,
        projetoNome: tarefa.projetos?.nome,
        prioridade: prioridades[tarefa.idprioridade] || null,
    };
}

function mapearColunaParaBanco(coluna) {
    return coluna === undefined ? undefined : colunasBanco[coluna] || coluna;
}

function buscarPrioridadeId(prioridade = 'media') {
    const id = prioridadeIds[String(prioridade).toLowerCase()];
    if (!id) throw new Error('Prioridade inválida');
    return id;
}

async function listar(usuarioId) {
    const tarefas = await prisma.tarefas.findMany({
        where: usuarioId === undefined || usuarioId === null
            ? undefined
            : { usuario_id: Number(usuarioId) },
        include: relacionamentos,
        orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
    return tarefas.map(mapearTarefa);
}

async function listarPorProjeto(projetoId) {
    const tarefas = await prisma.tarefas.findMany({
        where: { projeto_id: Number(projetoId) },
        include: relacionamentos,
        orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
    return tarefas.map(mapearTarefa);
}

async function buscarPorId(id, usuarioId) {
    const tarefa = await prisma.tarefas.findFirst({
        where: { id: Number(id), usuario_id: Number(usuarioId) },
        include: relacionamentos,
    });
    return tarefa ? mapearTarefa(tarefa) : null;
}

async function rankingUsuarios() {
    const ranking = await prisma.tarefas.groupBy({
        by: ['usuario_id'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });
    const usuarios = await prisma.usuarios.findMany({
        where: { id: { in: ranking.map(item => item.usuario_id) } },
        select: { id: true, nome: true },
    });
    const nomes = new Map(usuarios.map(usuario => [usuario.id, usuario.nome]));

    return ranking.map(item => ({
        usuarioId: item.usuario_id,
        nome: nomes.get(item.usuario_id) || null,
        totalTarefas: item._count.id,
    }));
}

async function adicionar({ titulo, coluna, ordem, projetoId, usuarioId, prioridade }) {
    let projetoTarefaId = projetoId;

    if (projetoTarefaId === undefined || projetoTarefaId === null) {
        const projeto = await prisma.projetos.findFirst({
            where: { usuario_id: Number(usuarioId) },
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        if (!projeto) {
            const erro = new Error('Não há projeto cadastrado para associar à tarefa');
            erro.statusCode = 400;
            throw erro;
        }
        projetoTarefaId = projeto.id;
    }

    const tarefa = await prisma.tarefas.create({
        data: {
            texto: titulo,
            coluna: mapearColunaParaBanco(coluna) || 'todo',
            ordem: ordem ?? 0,
            projeto_id: Number(projetoTarefaId),
            usuario_id: Number(usuarioId),
            idprioridade: buscarPrioridadeId(prioridade),
        },
        include: relacionamentos,
    });
    return mapearTarefa(tarefa);
}

async function atualizar(id, usuarioId, { titulo, coluna, ordem, projetoId, prioridade }) {
    const data = {};
    if (titulo !== undefined) data.texto = titulo;
    if (coluna !== undefined) data.coluna = mapearColunaParaBanco(coluna);
    if (ordem !== undefined) data.ordem = ordem;
    if (projetoId !== undefined) data.projeto_id = Number(projetoId);
    if (prioridade !== undefined) data.idprioridade = buscarPrioridadeId(prioridade);
    if (Object.keys(data).length === 0) return buscarPorId(id, usuarioId);

    const resultado = await prisma.tarefas.updateMany({
        where: { id: Number(id), usuario_id: Number(usuarioId) },
        data,
    });
    if (resultado.count === 0) return null;
    return buscarPorId(id, usuarioId);
}

async function remover(id, usuarioId) {
    const resultado = await prisma.tarefas.deleteMany({
        where: { id: Number(id), usuario_id: Number(usuarioId) },
    });
    return resultado.count ? { id: Number(id) } : null;
}

module.exports = {
    listar,
    listarPorProjeto,
    buscarPorId,
    adicionar,
    atualizar,
    remover,
    rankingUsuarios,
};
