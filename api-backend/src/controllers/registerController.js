const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { User, UserActivation } = require("../db/models");
const { registerValidationSchema } = require("../validator/registerValidator");
const { sendVerificationEmail } = require("./emailVerificationController");

// Define a function to register a new user
async function registerUser(req, res) {
  try {
    const {
      nama,
      no_telp,
      alamat,
      jenis_k,
      email,
      password,
      confirm_password,
    } = req.body;

    // Validate the request body using a validation schema
    const { error: errorValidation } = registerValidationSchema.validate({
      nama,
      no_telp,
      alamat,
      jenis_k,
      email,
      password,
      confirm_password,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email yang anda masukkan sudah terdaftar!" });
    }

    // Expiration time (30 minutes from now)
    const expireAt = new Date(new Date().getTime() + 30 * 60 * 1000);

    // Generate a salt and hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a random verification code and hash it
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const hashedVerificationCode = await bcrypt.hash(verificationCode, salt);

    // Create a new user and UserActivation record in a transaction
    const newUser = await User.sequelize.transaction(async (t) => {
      const createdUser = await User.create(
        {
          id: uuidv4(),
          nama,
          no_telp,
          alamat,
          jenis_k,
          role: "pelanggan",
          email,
          password: hashedPassword,
          isActive: false,
        },
        { transaction: t },
      );

      await UserActivation.create(
        {
          user_id: createdUser.id,
          email: createdUser.email,
          code: hashedVerificationCode,
          expireAt,
        },
        { transaction: t },
      );

      return createdUser;
    });

    // Send a verification email with the verification code
    await sendVerificationEmail(newUser.email, verificationCode, expireAt);

    return res.status(201).json({
      message: "Register berhasil!",
      id: newUser.id,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

module.exports = {
  registerUser,
};
