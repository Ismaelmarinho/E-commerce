const supabase = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Cadastrar Cliente (Nome alinhado com a rota: cadastrarCliente)
exports.cadastrarCliente = async (req, res) => {
  const { nome, email, cpf, senha } = req.body;

  if (!nome || !email || !cpf || !senha) {
    return res
      .status(400)
      .json({
        status: "erro",
        mensagem:
          "Campos obrigatórios ausentes: nome, email, cpf e senha são necessários.",
      });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const { data, error } = await supabase
      .from("tb_clientes")
      .insert([
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          cpf: cpf.trim(),
          senha_hash: senhaHash,
        },
      ])
      .select("id, nome, email, cpf, criado_em")
      .single();

    if (error) {
      return res.status(400).json({ status: "erro", mensagem: error.message });
    }
    return res.status(201).json({ status: "sucesso", dados: data });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "erro", mensagem: "Erro interno ao cadastrar cliente." });
  }
};

// Login / Autenticação
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ status: "erro", mensagem: "Email e senha são obrigatórios." });
  }

  try {
    const { data: cliente, error } = await supabase
      .from("tb_clientes")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !cliente) {
      return res
        .status(401)
        .json({ status: "erro", mensagem: "Credenciais inválidas." });
    }

    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaValida) {
      return res
        .status(401)
        .json({ status: "erro", mensagem: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );
    return res.status(200).json({ status: "sucesso", token });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "erro", mensagem: "Erro ao realizar login." });
  }
};

// Obter Cliente por ID (Nome alinhado com a rota: obterClientePorId)
exports.obterClientePorId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tb_clientes") // Corrigido erro de digitação ('tb_clintes')
    .select("id, nome, email, cpf, criado_em")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res
      .status(404)
      .json({ status: "erro", mensagem: "Cliente não encontrado." });
  }
  return res.status(200).json({ status: "sucesso", dados: data });
};

// Atualizar Cliente
exports.atualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome && !email) {
    return res
      .status(400)
      .json({
        status: "erro",
        mensagem: "Forneça ao menos um campo para atualização.",
      });
  }

  const { data, error } = await supabase
    .from("tb_clientes")
    .update({ nome, email })
    .eq("id", id)
    .select("id, nome, email, cpf")
    .single();

  if (error) {
    return res.status(400).json({ status: "erro", mensagem: error.message });
  }
  return res.status(200).json({ status: "sucesso", dados: data });
};

// Deletar Cliente
exports.deletarCliente = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("tb_clientes").delete().eq("id", id);

  if (error) {
    return res.status(400).json({ status: "erro", mensagem: error.message });
  }

  return res
    .status(200)
    .json({ status: "sucesso", mensagem: "Cliente removido com sucesso." });
};
