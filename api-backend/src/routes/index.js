const express = require("express");
const { registerUser } = require("../controllers/registerController");
const { login, logout } = require("../controllers/authenticationController");
const { refreshToken } = require("../controllers/refreshTokenController");
const { isLogin } = require("../middleware/isLogin");
const { isAdmin } = require("../middleware/isAdmin");
const {
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/emailVerificationController");
const userRoutes = require("./userRoutes");
const kendaraanRoutes = require("./kendaraanRoutes");
const perbaikanRoutes = require("./perbaikanRoutes");
const progresPerbaikanRoutes = require("./progresPerbaikanRoutes");
const transaksiRoutes = require("./transaksiRoutes");
const midtransRoutes = require("./midtransRoutes");
const pushNotificationRoutes = require("./pushNotificationRoutes");
const profilBengkelRoutes = require("./profilBengkelRoutes");
const layananBengkelRoutes = require("./layananBengkelRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  res.send(`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <h1>Sheeesshh !</h1>
    </div>
  `);
});

router.get("/api", (req, res) => {
  res.send(`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <h1>Welcome to API !</h1>
    </div>
  `);
});

router.post("/api/register", registerUser);
router.post("/api/login", login);
router.delete("/api/logout", logout);
router.get("/api/refresh-token", refreshToken);
router.post("/api/verify-email", verifyEmail);
router.post("/api/resend-verification-email", resendVerificationEmail);

// ? /api/user
router.use("/api/user", isLogin, isAdmin, userRoutes);

// ? /api/kendaraan
router.use("/api/kendaraan", isLogin, isAdmin, kendaraanRoutes);

// ? /api/perbaikan
router.use("/api/perbaikan", isLogin, isAdmin, perbaikanRoutes);

// ? /api/transaksi
router.use("/api/transaksi", isLogin, isAdmin, transaksiRoutes);

// ? /api/midtrans
router.use("/api/midtrans", midtransRoutes);

// ? /api/progres-perbaikan
router.use("/api/progres-perbaikan", isLogin, isAdmin, progresPerbaikanRoutes);

// ? /api/send-notification
router.use("/api/send-notification", pushNotificationRoutes);

// ? /profil-bengkel
router.use("/profil-bengkel", profilBengkelRoutes);
// ? /api/profil-bengkel
router.use("/api/update-profil-bengkel", isLogin, isAdmin, profilBengkelRoutes);

// ? /layanan-bengkel
router.use("/layanan-bengkel", layananBengkelRoutes);
// ? /api/layanan-bengkel
router.use("/api/layanan-bengkel", isLogin, isAdmin, layananBengkelRoutes);

module.exports = router;
