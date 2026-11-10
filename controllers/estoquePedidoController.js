const supabase = require("../config/database");

// Criar Produto no Estoque (POST) - Protegido
exports.criarProduto = async (req, res) => {
  const {
    codigo_sku,
    nome_produto,
    quantidade_disponivel,
    localizacao_corredor,
  } = req.body;

  if (!codigo_sku || !nome_produto) {
    return res.status(400).json({
      status: "erro",
      mensagem: "Código SKU e nome do produto são obrigatórios.",
    });
  }

  const { data, error } = await supabase
    .from("tb_produtos_estoque")
    .insert([
      {
        codigo_sku: codigo_sku.trim(),
        nome_produto: nome_produto.trim(),
        quantidade_disponivel: quantidade_disponivel || 0,
        localizacao_corredor,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ status: "erro", mensagem: error.message });
  }

  return res.status(201).json({ status: "sucesso", dados: data });
};

// Consultar Produto por SKU (GET) - Protegido
exports.obterProdutoPorSku = async (req, res) => {
  const { sku } = req.params;

  const { data, error } = await supabase
    .from("tb_produtos_estoque")
    .select("*")
    .eq("codigo_sku", sku)
    .single();

  if (error || !data) {
    return res
      .status(404)
      .json({ status: "erro", mensagem: "Produto não encontrado no estoque." });
  }

  return res.status(200).json({ status: "sucesso", dados: data });
};

// Criar Pedido com Validação e Baixa no Estoque (POST) - Protegido
exports.criarPedido = async (req, res) => {
  const { codigo_sku, quantidade, valor_total } = req.body;

  // Obtém o id do cliente a partir do token decodificado pelo authMiddleware
  const cliente_id = req.usuario.id;

  if (!codigo_sku || !quantidade || !valor_total) {
    return res.status(400).json({
      status: "erro",
      mensagem:
        "Dados incompletos: codigo_sku, quantidade e valor_total são obrigatórios.",
    });
  }

  try {
    const { data: produto, error: errEstoque } = await supabase
      .from("tb_produtos_estoque")
      .select("quantidade_disponivel")
      .eq("codigo_sku", codigo_sku)
      .single();

    if (errEstoque || !produto) {
      return res.status(404).json({
        status: "erro",
        mensagem: "Produto não encontrado no estoque.",
      });
    }

    if (produto.quantidade_disponivel < quantidade) {
      return res.status(400).json({
        status: "erro",
        mensagem: "Quantidade em estoque insuficiente para este pedido.",
      });
    }

    const { data: pedido, error: errPedido } = await supabase
      .from("tb_pedidos")
      .insert([
        {
          cliente_id,
          codigo_sku,
          quantidade,
          valor_total,
          status: "aprovado",
        },
      ])
      .select()
      .single();

    if (errPedido) {
      return res
        .status(400)
        .json({ status: "erro", mensagem: errPedido.message });
    }

    const novaQtd = produto.quantidade_disponivel - quantidade;
    await supabase
      .from("tb_produtos_estoque")
      .update({ quantidade_disponivel: novaQtd, atualizado_em: new Date() })
      .eq("codigo_sku", codigo_sku);

    return res.status(201).json({
      status: "sucesso",
      mensagem: "Pedido criado e estoque atualizado com sucesso!",
      dados: pedido,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "erro", mensagem: "Erro interno ao processar pedido." });
  }
};
