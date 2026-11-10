const express = require("express");
require("dotenv").config();

// Importação das rotas separadas
const clienteRoutes = require("./rotas/clienteRoutes");
const estoqueRoutes = require("./rotas/estoqueRoutes");

const app = express();
app.use(express.json());

// Registro das rotas na aplicação
app.use(clienteRoutes);
app.use(estoqueRoutes);

const porta = process.env.PORTA || 3010;

app.listen(porta, () => {
  console.log(`Servidor em execução: http://localhost:${porta}`);
});
