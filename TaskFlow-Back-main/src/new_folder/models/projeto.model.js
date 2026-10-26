let projetos = [];

module.exports = {
    listar: () => projetos,
    buscarPorId: (id) => projetos.find(p => p.id === Number(id)),
    criar: (projeto) => {
        const novoProjeto = { id: Date.now(), ...projeto };
        projetos.push(novoProjeto);
        return novoProjeto;
    },
    atualizar: (id, projetoAtualizado) => {
        const indice = projetos.findIndex(p => p.id === Number(id));
        if (indice === -1) return null;

        projetos[indice] = { ...projetos[indice], ...projetoAtualizado, id: Number(id) };
        return projetos[indice];
    },
    deletar: (id) => {
        const indice = projetos.findIndex(p => p.id === Number(id));
        if (indice === -1) return null;

        const [removido] = projetos.splice(indice, 1);
        return removido;
    }
};