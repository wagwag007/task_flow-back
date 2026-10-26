const pool = require('../database/db');

const camposTarefa = `
  t.id,
  t.texto AS titulo,
  CASE lower(t.coluna)
    WHEN 'todo' THEN 'afazer'
    WHEN 'doing' THEN 'andamento'
    WHEN 'done' THEN 'concluido'
    ELSE lower(t.coluna)
  END AS coluna,
  t.ordem,
  t.projeto_id AS "projetoId",
  t.usuario_id AS "usuarioId",
  t.idprioridade AS "prioridadeId",
  t.criado_em AS "criadoEm",
  u.nome AS "usuarioNome",
  pr.nome AS "projetoNome",
  CASE t.idprioridade
    WHEN 1 THEN 'alta'
    WHEN 2 THEN 'media'
    WHEN 3 THEN 'baixa'
    ELSE NULL
  END AS prioridade`;

function mapearColunaParaBanco(coluna) {
  const colunasBanco = { afazer: 'todo', andamento: 'doing', concluido: 'done' };
  return coluna === undefined ? undefined : colunasBanco[coluna] || coluna;
}

function buscarPrioridadeId(prioridade) {
  const idsPrioridade = { alta: 1, media: 2, baixa: 3 };
  const id = idsPrioridade[String(prioridade || 'media').toLowerCase()];
  if (!id) throw new Error('Prioridade inválida');
  return id;
}

async function listar(usuarioId) {
  const filtroUsuario = usuarioId === undefined || usuarioId === null
    ? ''
    : 'WHERE t.usuario_id = $1';
  const parametros = usuarioId === undefined || usuarioId === null ? [] : [usuarioId];
  const { rows } = await pool.query(`
    SELECT ${camposTarefa}
    FROM tarefas t
    LEFT JOIN usuarios u ON u.id = t.usuario_id
    LEFT JOIN projetos pr ON pr.id = t.projeto_id
    ${filtroUsuario}
    ORDER BY t.ordem, t.id
  `, parametros);

  return rows;
}

async function listarPorProjeto(projetoId) {
  const { rows } = await pool.query(`
    SELECT ${camposTarefa}
    FROM tarefas t
    LEFT JOIN usuarios u ON u.id = t.usuario_id
    LEFT JOIN projetos pr ON pr.id = t.projeto_id
    WHERE t.projeto_id = $1
    ORDER BY t.ordem, t.id
  `, [projetoId]);

  return rows;
}

async function buscarPorId(id, usuarioId) {
  const { rows } = await pool.query(`
    SELECT ${camposTarefa}
    FROM tarefas t
    LEFT JOIN usuarios u ON u.id = t.usuario_id
    LEFT JOIN projetos pr ON pr.id = t.projeto_id
    WHERE t.id = $1 AND t.usuario_id = $2
  `, [id, usuarioId]);

  return rows[0] || null;
}

async function rankingUsuarios() {
  const { rows } = await pool.query(`
    SELECT t.usuario_id AS "usuarioId", u.nome, COUNT(*)::int AS "totalTarefas"
    FROM tarefas t
    LEFT JOIN usuarios u ON u.id = t.usuario_id
    GROUP BY t.usuario_id, u.nome
    ORDER BY "totalTarefas" DESC
  `);

  return rows;
}

async function adicionar({ titulo, coluna, ordem, projetoId, usuarioId, prioridade }) {
  const prioridadeId = buscarPrioridadeId(prioridade);
  let projetoTarefaId = projetoId;

  if (projetoTarefaId === undefined || projetoTarefaId === null) {
    const { rows: projetos } = await pool.query(
      'SELECT id FROM projetos WHERE usuario_id = $1 ORDER BY id LIMIT 1',
      [usuarioId]
    );
    if (!projetos[0]) {
      const erro = new Error('Não há projeto cadastrado para associar à tarefa');
      erro.statusCode = 400;
      throw erro;
    }
    projetoTarefaId = projetos[0].id;
  }

  const { rows } = await pool.query(`
    INSERT INTO tarefas (texto, coluna, ordem, projeto_id, usuario_id, idprioridade)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [titulo, mapearColunaParaBanco(coluna) || 'todo', ordem || 0, projetoTarefaId, usuarioId, prioridadeId]);

  return await buscarPorId(rows[0].id, usuarioId);
}

async function atualizar(id, usuarioId, { titulo, coluna, ordem, projetoId, prioridade }) {
  let prioridadeId = null;
  if (prioridade) {
    prioridadeId = buscarPrioridadeId(prioridade);
  }

  const { rows } = await pool.query(`
    UPDATE tarefas
    SET texto = COALESCE($1, texto),
        coluna = COALESCE($2, coluna),
        ordem = COALESCE($3, ordem),
        projeto_id = COALESCE($4, projeto_id),
        idprioridade = COALESCE($5, idprioridade)
    WHERE id = $6 AND usuario_id = $7
    RETURNING id
  `, [titulo, mapearColunaParaBanco(coluna), ordem, projetoId, prioridadeId, id, usuarioId]);

  if (rows.length === 0) return null;

  return await buscarPorId(id, usuarioId);
}

async function remover(id, usuarioId) {
  const { rows } = await pool.query(`
    DELETE FROM tarefas
    WHERE id = $1 AND usuario_id = $2
    RETURNING id
  `, [id, usuarioId]);

  return rows[0] || null;
}

module.exports = {
  listar,
  listarPorProjeto,
  buscarPorId,
  adicionar,
  atualizar,
  remover,
  rankingUsuarios
};