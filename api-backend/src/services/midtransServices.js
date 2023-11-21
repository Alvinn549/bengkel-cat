const midtransClient = require("midtrans-client");
const { APP_CONFIG } = require("../config/midtransConfig");
const { Transaksi } = require("../db/models");

async function processTransaction(
  order_id,
  gross_amount,
  tipe_bank,
  nama,
  no_telp,
  email,
  alamat,
) {
  const full_name = nama.split(" ");
  const firstName = full_name[0];
  const lastName = full_name[full_name.length - 1];

  const parameter = {
    payment_type: "bank_transfer",
    transaction_details: {
      order_id,
      gross_amount,
    },
    bank_transfer: {
      bank: tipe_bank,
    },
    customer_details: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: no_telp,
      billing_address: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: no_telp,
        address: alamat,
      },
    },
  };

  const core = new midtransClient.CoreApi(APP_CONFIG);

  try {
    const chargeResponse = await core.charge(parameter);
    console.log(
      `Charge success! Charge Response: ${JSON.stringify(chargeResponse)}`,
    );

    return chargeResponse;
  } catch (error) {
    console.log("🚀 ~ file: midtransController.js:52 ~ error:", error);

    throw error;
  }
}

async function midtransCallback(req, res) {
  try {
    const apiClient = new midtransClient.CoreApi(APP_CONFIG);
    const statusResponse = await apiClient.transaction.notification(req.body);

    const id = statusResponse.transaction_id;
    const transaksi = await Transaksi.findByPk(id);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`,
    );

    if (transactionStatus === "capture" && fraudStatus === "accept") {
      await transaksi.update({
        status: "success",
      });
    } else if (
      transactionStatus === "settlement" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire" ||
      transactionStatus === "pending"
    ) {
      await transaksi.update({
        status: transactionStatus === "pending" ? "pending" : "failure",
      });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(
      "🚀 ~ file: midtransController.js:136 ~ midtransCallback ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}
module.exports = {
  processTransaction,
  midtransCallback,
};
