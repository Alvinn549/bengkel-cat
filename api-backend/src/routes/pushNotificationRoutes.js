const express = require("express");
const {
  createNotification,
} = require("../controllers/pushNotificationController");

const router = express.Router();

router.get("/", createNotification); // ? Get kendaraan by Id -> "GET" -> /api/send-notification/:id

module.exports = router;
