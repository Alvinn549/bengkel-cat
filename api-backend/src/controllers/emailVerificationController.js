const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { User, UserActivation } = require("../db/models");
const { sendVerificationEmail } = require("../services/emailServices");

async function verifyEmail(req, res) {
  try {
    const { email, code: verificationCode } = req.body;

    // Find the user with the provided email, including UserActivation model
    const user = await User.findOne({
      where: { email },
      include: {
        model: UserActivation,
        as: "activation",
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isActive) {
      return res.json({ message: "Email already verified" });
    }

    const match = await bcrypt.compare(verificationCode, user.activation.code);

    if (!match) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const { expireAt } = user.activation;

    // Check if the verification code has expired
    if (expireAt && expireAt < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification code has expired!" });
    }

    // Mark the user as active and delete the activation record
    user.isActive = true;
    await user.save();
    await user.activation.destroy();

    return res.json({ message: "Email verified" });
  } catch (error) {
    console.log(
      "🚀 ~ file: emailVerificationController.js:49 ~ verifyEmail ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    // Find the user with the provided email, including UserActivation model
    const user = await User.findOne({
      where: { email },
      include: {
        model: UserActivation,
        as: "activation",
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isActive) {
      return res.json({ message: "Email already verified" });
    }

    // Expiration time (30 minutes from now)
    const expireAt = new Date(new Date().getTime() + 30 * 60 * 1000);

    // Generate a new verification code and salt for hashing
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const salt = await bcrypt.genSalt(10);

    try {
      // Send a new verification email
      await sendVerificationEmail(email, verificationCode, expireAt);

      user.activation.code = await bcrypt.hash(verificationCode, salt);
      user.activation.expireAt = expireAt;

      await user.activation.save();
    } catch (errorResendVerification) {
      console.log(
        "🚀 ~ file: emailVerificationController.js:97 ~ resendVerificationEmail ~ errorSendVerification:",
        errorResendVerification,
      );
    }

    return res.status(201).json({
      message: "Kode Berhasil di kirim!",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: emailVerificationController.js:157 ~ resendVerificationEmail ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
};
