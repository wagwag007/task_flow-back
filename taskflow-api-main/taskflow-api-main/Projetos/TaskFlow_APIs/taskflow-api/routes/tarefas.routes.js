const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');
const autenticar = require('../middlewares/autenticar');

router.use(autenticar);

router.get('/', tarefasController.listarTodas);
router.post('/', validar(schemas.tarefa), tarefasController.criar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/estatisticas/resumo', tarefasController.estatisticasResumo);
router.get('/:id', tarefasController.buscarPorId);
router.put('/:id', validar(schemas.tarefa), tarefasController.atualizar);
router.delete('/:id', tarefasController.deletar);

module.exports = router;