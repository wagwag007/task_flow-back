const express = require('express');
const router = express.Router();
const projetosController = require('../controllers/projetos.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

router.get('/', projetosController.listarTodos);
router.get('/:id', projetosController.buscarPorId);
router.post('/', validar(schemas.projeto), projetosController.criar);
router.put('/:id', validar(schemas.projeto), projetosController.atualizar);
router.delete('/:id', projetosController.deletar);

module.exports = router;