function criarErro(status, mensagem, detalhes) {
    return { status, mensagem, detalhes };
}

module.exports = { criarErro };
