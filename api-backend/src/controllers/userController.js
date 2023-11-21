const { v4: uuidv4, validate: isUUID } = require("uuid");
const bcrypt = require("bcrypt");
const {
  User,
  Kendaraan,
  Perbaikan,
  ProgresPerbaikan,
  Transaksi,
  UserActivation,
} = require("../db/models");
const { userValidationSchema } = require("../validator/userValidator");
const {
  imageFileUpload,
  deleteFile,
} = require("../services/fileUploadServices");

// Get all users
async function getAllUser(req, res) {
  try {
    // Fetch all users, including their associated Kendaraan records
    const users = await User.findAll({
      include: [
        {
          model: UserActivation,
          as: "activation",
          attributes: ["id", "email", "code"],
        },
        {
          model: Kendaraan,
          as: "kendaraan",
          attributes: ["id", "no_plat", "merek"],
        },
        {
          model: Transaksi,
          as: "transaksi",
          attributes: ["id", "order_id", "gross_amount", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(users);
  } catch (error) {
    console.log("🚀 ~ file: userController.js:41 ~ getAllUser ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server errors", message: error.message });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // Validate the id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    // Find a user by ID, including related UserActivation and Kendaraan records
    const user = await User.findByPk(id, {
      include: [
        {
          model: UserActivation,
          as: "activation",
          attributes: ["id", "email", "code"],
        },
        {
          model: Kendaraan,
          as: "kendaraan",
          attributes: ["id", "no_plat", "merek"],
        },
        {
          model: Transaksi,
          as: "transaksi",
          attributes: ["id", "order_id", "gross_amount", "status"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(
      "🚀 ~ file: userController.js:86 ~ getUserById ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Function to create a new user
async function storeUser(req, res) {
  try {
    const { nama, no_telp, alamat, jenis_k, role, email, password } = req.body;
    let foto = null;
    let foto_url = null;

    // Validate user data using a validation schema
    const { error: errorValidation } = userValidationSchema.validate({
      nama,
      no_telp,
      alamat,
      jenis_k,
      role,
      email,
      password,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a user with the same email already exists in the database
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User dengan email ini sudah terdaftar!" });
    }

    // If the request contains a user photo, upload it to the server
    if (req.files && req.files.foto) {
      try {
        const image = req.files.foto;
        const destination = "/upload/images/user/";

        // Upload and get the foto information
        const { fileName, fileUrl } = await imageFileUpload(
          req,
          image,
          destination,
        );

        foto = fileName;
        foto_url = fileUrl;
      } catch (uploadError) {
        return res.status(400).json({
          message: "Error uploading the image!",
          error: uploadError.message,
        });
      }
    }

    // Generate a salt and hash the user's password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user in the database with the provided data
    const newUser = await User.create({
      id: uuidv4(),
      nama,
      no_telp,
      alamat,
      jenis_k,
      foto,
      foto_url,
      role,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User berhasil disimpan!",
      id: newUser.id,
    });
  } catch (error) {
    console.log("🚀 ~ file: userController.js:173 ~ storeUser ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Function to update a user's information
async function updateUser(req, res) {
  try {
    const { id } = req.params;

    // Validate the id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    // Find the user by their ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    const { nama, no_telp, alamat, jenis_k, role, email, password } = req.body;

    // Validate user input using a validation schema
    const { error: errorValidation } = userValidationSchema.validate({
      nama,
      no_telp,
      alamat,
      jenis_k,
      role,
      email,
      password,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if the email is already registered by excluding the current user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.id !== user.id) {
      return res
        .status(409)
        .json({ message: "User dengan email ini sudah terdaftar!" });
    }

    let { foto } = user;
    let { foto_url } = user;

    // Handle file upload if a new photo is provided (similar to storeUser)
    if (req.files && req.files.foto) {
      try {
        // Retrieve the 'foto' file from the request
        const image = req.files.foto;
        const destination = "/upload/images/user/";

        // Use a function (imageFileUpload) to upload and get the file information
        const { fileName: newFileName, fileUrl: newFileUrl } =
          await imageFileUpload(req, image, destination);

        // If the new photo name is different, delete the old photo file
        // If the 'fileName' has changed, delete the old image (if it exists)
        if (foto !== newFileName) {
          if (user.foto) {
            await deleteFile(destination, foto);
          }
        }

        foto = newFileName;
        foto_url = newFileUrl;
      } catch (uploadError) {
        return res.status(400).json({
          message: "Error uploading the image!",
          error: uploadError.message,
        });
      }
    }

    // Generate a salt and hash the user's password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user record with the new information
    await user.update({
      nama,
      no_telp,
      alamat,
      jenis_k,
      foto,
      foto_url,
      role,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "User berhasil diperbarui!",
      id: user.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: userController.js:280 ~ updateUser ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Function to delete a user and associated data
async function destroyUser(req, res) {
  try {
    const { id } = req.params;

    // Validate the id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    // Find the user by their ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // If the user has a photo, delete it
    if (user.foto) {
      const userImageDestination = "/upload/images/user/";
      const userImageFileName = user.foto;
      await deleteFile(userImageDestination, userImageFileName);
    }

    // Find all kendaraan IDs associated with the user
    const relatedKendaraan = await Kendaraan.findAll({
      where: { user_id: id },
    });

    for (const kendaraan of relatedKendaraan) {
      // Find all perbaikan records associated with the kendaraan
      const relatedPerbaikan = await Perbaikan.findAll({
        where: { kendaraan_id: kendaraan.id },
      });

      for (const perbaikan of relatedPerbaikan) {
        // Find all progres perbaikan records associated with the perbaikan
        const relatedProgresPerbaikan = await ProgresPerbaikan.findAll({
          where: { perbaikan_id: perbaikan.id },
        });

        // Find all progres perbaikan records associated with the transaksi
        const relatedTransaksi = await Transaksi.findAll({
          where: { perbaikan_id: perbaikan.id },
        });

        for (const progres of relatedProgresPerbaikan) {
          // Delete the progres perbaikan image, if it exists
          if (progres.foto) {
            const progresImageDestination = "/upload/images/progres-perbaikan/";
            const progresImageFileName = progres.foto;
            await deleteFile(progresImageDestination, progresImageFileName);
          }
          // Delete the progres perbaikan record
          await progres.destroy();
        }

        for (const transaksi of relatedTransaksi) {
          // Delete the transaksi record
          await transaksi.destroy();
        }

        // Delete the perbaikan image, if it exists
        if (perbaikan.foto) {
          const perbaikanImageDestination = "/upload/images/perbaikan/";
          const perbaikanImageFileName = perbaikan.foto;
          await deleteFile(perbaikanImageDestination, perbaikanImageFileName);
        }
        // Delete the perbaikan record
        await perbaikan.destroy();
      }

      // Delete the kendaraan image, if it exists
      if (kendaraan.foto) {
        const kendaraanImageDestination = "/upload/images/kendaraan/";
        const kendaraanImageFileName = kendaraan.foto;
        await deleteFile(kendaraanImageDestination, kendaraanImageFileName);
      }
      // Delete the kendaraan record
      await kendaraan.destroy();
    }

    // Delete any user activation records associated with the user
    await UserActivation.destroy({
      where: { user_id: id },
    });

    // Finally, delete the user record
    await user.destroy();

    return res.status(200).json({
      message: "User berhasil dihapus!",
      id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: userController.js:384 ~ destroyUser ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

module.exports = {
  getAllUser,
  getUserById,
  storeUser,
  updateUser,
  destroyUser,
};
