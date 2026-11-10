const express = require("express");
const estoquePedidoController = require("../controllers/estoquePedidoController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Rotas protegidas de produtos/estoque
router.post("/estoque", auth, estoquePedidoController.criarProduto);
router.get("/estoque/:sku", auth, estoquePedidoController.obterProdutoPorSku);

// Rota protegida de pedidos
router.post("/pedidos", auth, estoquePedidoController.criarPedido);

module.exports = router;
