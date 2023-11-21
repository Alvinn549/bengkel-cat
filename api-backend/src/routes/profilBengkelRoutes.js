const express = require("express");
const {
  getProfilBengkel,
  updateProfilBengkel,
} = require("../controllers/profilBengkelController");

const router = express.Router();

router.get("/", getProfilBengkel); // ? Get all profil bengkel -> "GET" -> /profil bengkel

router.put("/", updateProfilBengkel); // ? Update profil bengkel-> "PUT"-> /profil bengkel

module.exports = router;
