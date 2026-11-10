const express = require("express");
const clienteController = require("../controllers/clienteController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Rotas públicas de autenticação
router.post("/auth/cadastro", clienteController.cadastrarCliente);
router.post("/auth/login", clienteController.login);

// Rotas protegidas de gerenciamento de clientes
router.get("/clientes/:id", auth, clienteController.obterClientePorId);
router.put("/clientes/:id", auth, clienteController.atualizarCliente);
router.delete("/clientes/:id", auth, clienteController.deletarCliente);

module.exports = router;
