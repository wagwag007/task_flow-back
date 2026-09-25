const fs = require('fs');
const path = require('path');

const diretorioDados = path.join(__dirname, '..', 'data');
const arquivoDados = path.join(diretorioDados, 'usuarios.json');
const usuariosPadrao = [
    {
        id: 1,
        nome: 'Marciedson',
        email: 'admin@admin.com',
        senha: '123456'
    }
];

function carregarUsuarios() {
    fs.mkdirSync(diretorioDados, { recursive: true });

    if (!fs.existsSync(arquivoDados)) {
        fs.writeFileSync(arquivoDados, JSON.stringify(usuariosPadrao, null, 2), 'utf8');
        return [...usuariosPadrao];
    }

    const conteudo = fs.readFileSync(arquivoDados, 'utf8');
    return conteudo.trim() ? JSON.parse(conteudo) : [];
}

function salvarUsuarios() {
    fs.writeFileSync(arquivoDados, JSON.stringify(usuarios, null, 2), 'utf8');
}

let usuarios = carregarUsuarios();

function buscarPorEmail(email) {
    return usuarios.find(u => u.email === email);
}

module.exports = {
    listar: () => usuarios,
    buscarPorId: (id) => usuarios.find(u => u.id === Number(id)),
    buscarPorEmail: (email) => usuarios.find(u => u.email === email),
    criar: (usuario) => {
        const novoUsuario = { id: Date.now(), ...usuario };
        usuarios.push(novoUsuario);
        salvarUsuarios();
        return novoUsuario;
    },
    atualizar: (id, usuarioAtualizado) => {
        const indice = usuarios.findIndex(u => u.id === Number(id));
        if (indice === -1) return null;

        usuarios[indice] = { ...usuarios[indice], ...usuarioAtualizado, id: Number(id) };
    salvarUsuarios();
        return usuarios[indice];
    },
    deletar: (id) => {
        const indice = usuarios.findIndex(u => u.id === Number(id));
        if (indice === -1) return null;

        const [removido] = usuarios.splice(indice, 1);
    salvarUsuarios();
        return removido;
    }
};

module.exports.buscarPorEmail = buscarPorEmail;