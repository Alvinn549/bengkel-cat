//*pagination

try {
  const page = parseInt(req.query.page) || 1; // Current page number
  const pageSize = parseInt(req.query.pageSize) || 10; // Number of items per page

  const perbaikans = await Perbaikan.findAndCountAll({
    include: {
      model: Kendaraan,
      as: "kendaraan",
      attributes: ["id", "no_plat", "merek"],
    },
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const totalPages = Math.ceil(perbaikans.count / pageSize);

  return res.status(200).json({
    page,
    pageSize,
    totalItems: perbaikans.count,
    totalPages,
    perbaikans: perbaikans.rows,
  });
} catch (error) {
  console.log("🚀 ~ file: catatan.js:28 ~ error:", error);

  return res
    .status(500)
    .json({ error: "Internal server error", message: error.message });
}

// Get all kendaraans
async function getAllKendaraan(req, res) {
  try {
    // Fetch all kendaraans including their pemilik (owner)
    const kendaraans = await Kendaraan.findAll({
      include: {
        model: User,
        as: "pemilik",
        attributes: ["id", "nama", "noTelp", "alamat"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(kendaraans);
  } catch (error) {
    console.log("🚀 ~ file: catatan.js:50 ~ getAllKendaraan ~ error:", error);

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
          attributes: ["id", "nama", "noTelp", "alamat", "role"],
        },
        {
          model: Perbaikan,
          as: "perbaikan",
          attributes: ["id"],
        },
      ],
    });

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    return res.status(200).json(kendaraan);
  } catch (error) {
    console.log("🚀 ~ file: catatan.js:89 ~ getKendaraanById ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Get kendaraan by pemilik
async function getKendaraanByOwner(req, res) {
  try {
    const { id: userId } = req.params;

    // Validate the userId as a UUID
    if (!isUUID(userId, 4)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    const kendaraan = await Kendaraan.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    return res.status(200).json(kendaraan);
  } catch (error) {
    console.log(
      "🚀 ~ file: catatan.js:119 ~ getKendaraanByOwner ~ error:",
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
    const { userId, noPlat, merek } = req.body;
    let foto;
    let fotoUrl;

    // Validate the incoming data using kendaraanValidationSchema
    const { error: errorValidation } = kendaraanValidationSchema.validate({
      userId,
      noPlat,
      merek,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a kendaraan with the same noPlat already exists
    const existingKendaraan = await Kendaraan.findOne({ where: { noPlat } });

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
      fotoUrl = fileUrl;
    } catch (uploadError) {
      return res.status(400).json({
        message: "Error uploading the image!",
        error: uploadError.message,
      });
    }

    // Create a new kendaraan in the database with the uploaded image details
    const newKendaraaan = await Kendaraan.create({
      id: uuidv4(),
      userId,
      noPlat,
      merek,
      foto,
      fotoUrl,
    });

    return res.status(201).json({
      message: "Kendaraan berhasil disimpan!",
      id: newKendaraaan.id,
    });
  } catch (error) {
    console.log("🚀 ~ file: catatan.js:199 ~ storeKendaraan ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Update kendaraan
async function updateKendaraan(req, res) {
  try {
    const { id } = req.params;

    // Validate the kendaraanId as a UUID
    if (!isUUID(id, 4)) {
      return res.status(400).json({ message: "Invalid kendaraan ID format!" });
    }

    // Find the kendaraan by ID
    const kendaraan = await Kendaraan.findByPk(id);

    if (!kendaraan) {
      return res.status(404).json({ message: "Kendaraan tidak ditemukan!" });
    }

    const { userId, noPlat, merek } = req.body;

    // Validate the incoming data using kendaraanValidationSchema
    const { error: errorValidation } = kendaraanValidationSchema.validate({
      userId,
      noPlat,
      merek,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if a kendaraan with the same noPlat already exists
    const existingKendaraan = await Kendaraan.findOne({ where: { noPlat } });

    if (existingKendaraan && existingKendaraan.id !== kendaraan.id) {
      return res
        .status(409)
        .json({ message: "Kendaraan dengan No Plat ini sudah terdaftar!" });
    }

    let { foto } = kendaraan;
    let { fotoUrl } = kendaraan;
    let destination;

    // Check if the request includes a file named 'foto'
    if (req.files && req.files.foto) {
      try {
        const image = req.files.foto;
        destination = "/upload/images/kendaraan/";

        // Upload the new image and get file details (fileName and fileUrl)
        const { newFileName, newFileUrl } = await imageFileUpload(
          req,
          image,
          destination,
        );

        // If the new image is different from the previous one, delete the old image
        if (foto !== newFileName) {
          if (kendaraan.foto) {
            await deleteFile(destination, foto);
          }
        }

        foto = newFileName;
        fotoUrl = newFileUrl;
      } catch (uploadError) {
        return res.status(400).json({
          message: "Error uploading the image!",
          error: uploadError.message,
        });
      }
    }

    // Update the kendaraan's details in the database
    await kendaraan.update({
      userId,
      noPlat,
      merek,
      foto,
      fotoUrl,
    });

    return res
      .status(200)
      .json({ message: "Kendaraan berhasil diperbarui!", id: kendaraan.id });
  } catch (error) {
    console.log("🚀 ~ file: catatan.js:293 ~ updateKendaraan ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Delete kendaraan
async function destroyKendaraan(req, res) {
  try {
    const { id } = req.params;

    // Validate the kendaraanId as a UUID
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
      where: { kendaraanId: id },
    });

    for (const perbaikan of relatedPerbaikan) {
      // Find all progres perbaikan records associated with the perbaikan
      const relatedProgresPerbaikan = await ProgresPerbaikan.findAll({
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
    console.log("🚀 ~ file: catatan.js:363 ~ destroyKendaraan ~ error:", error);

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}
