const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "erro", mensagem: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res
      .status(401)
      .json({ status: "erro", mensagem: "Formato de token inválido" });
  }

  try {
    // Valida o token usando a mesma segredo usada no login (jsonwebtoken)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sua_chave_secreta_aqui",
    );

    // Injeta tanto req.usuario quanto req.user para evitar incompatibilidade
    req.usuario = decoded;
    req.user = decoded;

    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "erro", mensagem: "Token inválido ou expirado" });
  }
};

module.exports = authMiddleware;
