const { v4: uuidv4, validate: isUUID } = require("uuid");
const {
  User,
  Kendaraan,
  Perbaikan,
  ProgresPerbaikan,
  Transaksi,
} = require("../db/models");
const {
  kendaraanValidationSchema,
} = require("../validator/kendaraanValidator");
const {
  imageFileUpload,
  deleteFile,
} = require("../services/fileUploadServices");

// Get all kendaraans
async function getAllKendaraan(req, res) {
  try {
    // Get all kendaraans include pemilik, perbaikan
    const kendaraans = await Kendaraan.findAll({
      include: [
        {
          model: User,
          as: "pemilik",
          attributes: ["id", "nama", "no_telp", "alamat", "role"],
        },
        {
          model: Perbaikan,
          as: "perbaikan",
          attributes: ["id", "keterangan", "foto_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(kendaraans);
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:39 ~ getAllKendaraan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Get kendaraan by ID
async function getKendaraanById(req, res) {
  try {
    const { id } = req.params;

    // Validate the id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid kendaraan ID format!" });
    }

    // Fetch a kendaraan by its ID, including related data like pemilik and perbaikan
    const kendaraan = await Kendaraan.findByPk(id, {
      include: [
        {
          model: User,
          as: "pemilik",
          attributes: ["id", "nama", "no_telp", "alamat", "role"],
        },
        {
          model: Perbaikan,
          as: "perbaikan",
          attributes: ["id", "keterangan", "foto_url"],
        },
      ],
    });

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    return res.status(200).json(kendaraan);
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:78 ~ getKendaraanById ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Get kendaraan by pemilik
async function getKendaraanByOwner(req, res) {
  try {
    const { id: user_id } = req.params;

    // Validate the user_id as a UUID
    if (!isUUID(user_id, 4)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    // Find all kendaraan
    const kendaraan = await Kendaraan.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: User,
          as: "pemilik",
          attributes: ["id", "nama", "no_telp", "alamat", "role"],
        },
        {
          model: Perbaikan,
          as: "perbaikan",
          attributes: ["id", "keterangan", "foto_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    return res.status(200).json(kendaraan);
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:121 ~ getKendaraanByOwner ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Create new kendaraan
async function storeKendaraan(req, res) {
  try {
    const { user_id, no_plat, merek } = req.body;
    let foto;
    let foto_url;

    // Validate the incoming data using kendaraanValidationSchema
    const { error: errorValidation } = kendaraanValidationSchema.validate({
      user_id,
      no_plat,
      merek,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a kendaraan with the same no_plat already exists
    const existingKendaraan = await Kendaraan.findOne({ where: { no_plat } });

    if (existingKendaraan) {
      return res
        .status(409)
        .json({ message: "Kendaraan dengan No Plat ini sudah terdaftar!" });
    }

    // Check if the request includes a file named 'foto'
    if (!req.files || !req.files.foto) {
      return res
        .status(400)
        .json({ message: "Foto kendaraan tidak boleh kosong!" });
    }

    try {
      const image = req.files.foto;
      const destination = "/upload/images/kendaraan/";

      // Upload the image and get file details (fileName and fileUrl)
      const { fileName, fileUrl } = await imageFileUpload(
        req,
        image,
        destination,
      );

      foto = fileName;
      foto_url = fileUrl;
    } catch (uploadError) {
      console.log(
        "🚀 ~ file: kendaraanController.js:177 ~ storeKendaraan ~ uploadError:",
        uploadError,
      );

      return res.status(400).json({
        message: "Error uploading the image!",
        error: uploadError.message,
      });
    }

    // Create a new kendaraan in the database with the uploaded image details
    const newKendaraaan = await Kendaraan.create({
      id: uuidv4(),
      user_id,
      no_plat,
      merek,
      foto,
      foto_url,
    });

    return res.status(201).json({
      message: "Kendaraan berhasil disimpan!",
      id: newKendaraaan.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:209 ~ storeKendaraan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Update kendaraan
async function updateKendaraan(req, res) {
  try {
    const { id } = req.params;

    // Validate the kendaraan_id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid kendaraan ID format!" });
    }

    // Find the kendaraan by ID
    const kendaraan = await Kendaraan.findByPk(id);

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    const { user_id, no_plat, merek } = req.body;

    // Validate the incoming data using kendaraanValidationSchema
    const { error: errorValidation } = kendaraanValidationSchema.validate({
      user_id,
      no_plat,
      merek,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a kendaraan with the same no_plat already exists
    const existingKendaraan = await Kendaraan.findOne({ where: { no_plat } });

    if (existingKendaraan && existingKendaraan.id !== kendaraan.id) {
      return res
        .status(409)
        .json({ message: "Kendaraan dengan No Plat ini sudah terdaftar!" });
    }

    let { foto } = kendaraan;
    let { foto_url } = kendaraan;

    // Check if the request includes a file named 'foto'
    if (req.files && req.files.foto) {
      try {
        const image = req.files.foto;
        const destination = "/upload/images/kendaraan/";

        // Upload the new image and get file details (fileName and fileUrl)
        const { fileName: newFileName, fileUrl: newFileUrl } =
          await imageFileUpload(req, image, destination);

        // If the new image is different from the previous one, delete the old image
        if (foto !== newFileName) {
          if (kendaraan.foto) {
            await deleteFile(destination, foto);
          }
        }

        foto = newFileName;
        foto_url = newFileUrl;
      } catch (uploadError) {
        console.log(
          "🚀 ~ file: kendaraanController.js:282 ~ updateKendaraan ~ uploadError:",
          uploadError,
        );

        return res.status(400).json({
          message: "Error uploading the image!",
          error: uploadError.message,
        });
      }
    }

    // Update the kendaraan's details in the database
    await kendaraan.update({
      user_id,
      no_plat,
      merek,
      foto,
      foto_url,
    });

    return res
      .status(200)
      .json({ message: "Kendaraan berhasil diperbarui!", id: kendaraan.id });
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:307 ~ updateKendaraan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Delete kendaraan
async function destroyKendaraan(req, res) {
  try {
    const { id } = req.params;

    // Validate the kendaraan_id as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid kendaraan ID format!" });
    }

    // Find the kendaraan by its ID
    const kendaraan = await Kendaraan.findByPk(id);

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    // Delete the kendaraan image file
    if (kendaraan.foto) {
      const destination = "/upload/images/kendaraan/";
      const fileName = kendaraan.foto;
      await deleteFile(destination, fileName);
    }

    const relatedPerbaikan = await Perbaikan.findAll({
      where: { kendaraan_id: id },
    });

    for (const perbaikan of relatedPerbaikan) {
      // Find all progres perbaikan records associated with the perbaikan
      const relatedProgresPerbaikan = await ProgresPerbaikan.findAll({
        where: { perbaikan_id: perbaikan.id },
      });

      // Find all progres perbaikan records associated with the perbaikan
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

    // Finally, delete the kendaraan itself
    await kendaraan.destroy();

    return res.status(200).json({
      message: "Kendaraan berhasil dihapus!",
      id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: kendaraanController.js:390 ~ destroyKendaraan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

module.exports = {
  getAllKendaraan,
  getKendaraanById,
  getKendaraanByOwner,
  storeKendaraan,
  updateKendaraan,
  destroyKendaraan,
};
