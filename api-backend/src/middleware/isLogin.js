const jwt = require("jsonwebtoken");

const isLogin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return res.status(403).json({ message: "Forbidden" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.email = decoded.email;
      next();
    });
  } catch (error) {
    console.log("🚀 ~ file: isLogin.js:20 ~ isLogin ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = {
  isLogin,
};
