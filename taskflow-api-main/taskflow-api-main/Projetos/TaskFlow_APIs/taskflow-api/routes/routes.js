const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');
const autenticar = require('../middlewares/autenticar');

router.get('/', autenticar, tarefasController.listarTodas);
router.get('/:id', autenticar, tarefasController.buscarPorId);
router.post('/', autenticar, tarefasController.criar);
router.put('/:id', autenticar, tarefasController.atualizar);
router.delete('/:id', autenticar, tarefasController.deletar);

module.exports = router;