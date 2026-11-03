const prisma = require('../database/db');

const camposPublicos = {
    id: true,
    nome: true,
    email: true,
};

module.exports = {
    listar: () => prisma.usuarios.findMany({
        select: camposPublicos,
        orderBy: { id: 'asc' },
    }),

    buscarPorId: (id) => prisma.usuarios.findUnique({
        where: { id: Number(id) },
        select: camposPublicos,
    }),

    buscarPorEmail: (email) => prisma.usuarios.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    }),

    criar: ({ nome, email, senha_hash }) => prisma.usuarios.create({
        data: { nome, email, senha_hash },
        select: camposPublicos,
    }),

    atualizar: (id, dados) => Object.keys(dados).length === 0
        ? prisma.usuarios.findUnique({
            where: { id: Number(id) },
            select: camposPublicos,
        })
        : prisma.usuarios.update({
            where: { id: Number(id) },
            data: dados,
            select: camposPublicos,
        }),

    deletar: (id) => prisma.usuarios.delete({
        where: { id: Number(id) },
        select: camposPublicos,
    }),
};
