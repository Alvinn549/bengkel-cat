const express = require("express");
const { midtransCallback } = require("../services/midtransServices");

const router = express.Router();

router.post("/callback", midtransCallback); // ? Get all kendaraan -> "GET" -> /api/kendaraan

module.exports = router;
