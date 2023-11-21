const express = require("express");
const {
  getAllLayananBengkel,
  getLayananBengkelById,
  storeLayananBengkel,
  updateLayananBengkel,
  destroyLayananBengkel,
} = require("../controllers/layananBengkelController");

const router = express.Router();

router.get("/", getAllLayananBengkel); // ? Get all LayananBengkel -> "GET" -> /api/LayananBengkel

router.post("/", storeLayananBengkel); // ? Create LayananBengkel -> "POST" -> /api/LayananBengkel

router.get("/:id", getLayananBengkelById); // ? Get LayananBengkel by Id -> "GET" -> /api/LayananBengkel/:id

router.put("/:id", updateLayananBengkel); // ? Update LayananBengkel-> "PUT"-> /api/LayananBengkel/:id

router.delete("/:id", destroyLayananBengkel); // ? Delete LayananBengkel -> "DELETE" -> /api/LayananBengkel/:id

module.exports = router;
