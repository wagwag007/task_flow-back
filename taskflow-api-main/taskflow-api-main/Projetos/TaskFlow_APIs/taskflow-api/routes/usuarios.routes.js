const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

router.get('/', usuariosController.listarTodos);
router.post('/', validar(schemas.usuario), usuariosController.criar);
router.put('/:id', validar(schemas.usuario), usuariosController.atualizar);
router.delete('/:id', usuariosController.deletar);
router.get('/:id', usuariosController.buscarPorId);

module.exports = router;