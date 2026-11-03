const prisma = require('../database/db');

module.exports = {
    listar: () => prisma.projetos.findMany({
        orderBy: { id: 'asc' },
    }),

    buscarPorId: (id) => prisma.projetos.findUnique({
        where: { id: Number(id) },
    }),

    criar: ({ nome, descricao, usuarioId }) => prisma.projetos.create({
        data: {
            nome,
            descricao,
            usuarios: { connect: { id: Number(usuarioId) } },
        },
    }),

    atualizar: (id, dados) => Object.keys(dados).length === 0
        ? prisma.projetos.findUnique({ where: { id: Number(id) } })
        : prisma.projetos.update({
            where: { id: Number(id) },
            data: dados,
        }),

    deletar: (id) => prisma.projetos.delete({
        where: { id: Number(id) },
    }),
};
