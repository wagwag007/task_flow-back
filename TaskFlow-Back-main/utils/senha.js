const { promisify } = require('node:util');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');

const derivarChave = promisify(scrypt);

async function gerarHash(senha) {
    const salt = randomBytes(16).toString('hex');
    const hash = await derivarChave(senha, salt, 64);
    return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function verificarHash(senha, senhaHash) {
    const [algoritmo, salt, hashHex] = String(senhaHash).split('$');
    if (algoritmo !== 'scrypt' || !salt || !/^[a-f\d]{128}$/i.test(hashHex || '')) {
        return false;
    }

    const hashEsperado = Buffer.from(hashHex, 'hex');
    const hashRecebido = await derivarChave(senha, salt, hashEsperado.length);
    return timingSafeEqual(hashEsperado, hashRecebido);
}

module.exports = { gerarHash, verificarHash };
