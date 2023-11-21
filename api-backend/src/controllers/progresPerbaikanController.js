const { validate: isUUID } = require("uuid");
const { ProgresPerbaikan, Perbaikan } = require("../db/models");
const {
  progresPerbaikanValidationSchema,
} = require("../validator/progresPerbaikanValidator");
const {
  imageFileUpload,
  deleteFile,
} = require("../services/fileUploadServices");

// Get all progres perbaikans
async function getAllProgresPerbaikan(req, res) {
  try {
    // Retrieve a list of progres perbaikans
    const progresPerbaikans = await ProgresPerbaikan.findAll({
      include: {
        model: Perbaikan,
        as: "perbaikan",
        attributes: ["id", "keterangan", "foto_url"],
      },
      limit: 100,
    });

    return res.status(200).json(progresPerbaikans);
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:23 ~ getAllProgresPerbaikan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Get progres perbaikan by ID
async function getProgresPerbaikanById(req, res) {
  try {
    const { id } = req.params;

    // Check if 'id' is a valid integer
    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ message: "Invalid ID format. ID must be an integer." });
    }

    // Find the progres perbaikan by its primary key (ID)
    const progresPerbaikan = await ProgresPerbaikan.findByPk(id, {
      include: {
        model: Perbaikan,
        as: "perbaikan",
        attributes: ["id", "keterangan", "foto_url"],
      },
    });

    if (!progresPerbaikan) {
      return res
        .status(404)
        .json({ message: "Progres Perbaikan tidak ditemukan!" });
    }

    return res.status(200).json(progresPerbaikan);
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:63 ~ getProgresPerbaikanById ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Get progres perbaikan by Perbaikan ID
async function getProgresPerbaikanByPerbaikan(req, res) {
  try {
    const { id: perbaikan_id } = req.params;

    // Validate the perbaikan_id as a UUID
    if (!isUUID(perbaikan_id, 4)) {
      return res.status(400).json({ message: "Invalid perbaikan ID format!" });
    }

    // Find all progres perbaikan associated with the specified Perbaikan ID
    const progresPerbaikan = await ProgresPerbaikan.findAll({
      where: { perbaikan_id },
      include: {
        model: Perbaikan,
        as: "perbaikan",
        attributes: ["id", "keterangan", "foto_url"],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!progresPerbaikan) {
      return res
        .status(404)
        .json({ message: "Progres Perbaikan tidak ditemukan!" });
    }

    return res.status(200).json(progresPerbaikan);
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:103 ~ getProgresPerbaikanByPerbaikan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

// Create new progres perbaikan
async function storeProgresPerbaikan(req, res) {
  try {
    const { perbaikan_id, keterangan } = req.body;
    let foto;
    let foto_url;

    // Validate the request body using the progres perbaikan validation schema
    const { error: errorValidation } =
      progresPerbaikanValidationSchema.validate({
        perbaikan_id,
        keterangan,
      });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    // Check if the request contains a 'foto' file
    if (!req.files || !req.files.foto) {
      return res
        .status(400)
        .json({ message: "Foto progres perbaikan tidak boleh kosong!" });
    }

    try {
      const image = req.files.foto;
      const destination = "/upload/images/progres-perbaikan/";

      // Upload the image and get the generated 'fileName' and 'fileUrl'
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

    // Create a new ProgresPerbaikan record in the database with the provided data
    const newProgresPerbaikan = await ProgresPerbaikan.create({
      perbaikan_id,
      keterangan,
      foto,
      foto_url,
    });

    return res.status(201).json({
      message: "Progres perbaikan berhasil disimpan!",
      id: newProgresPerbaikan.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:173 ~ storeProgresPerbaikan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Update progres perbaikan
async function updateProgresPerbaikan(req, res) {
  try {
    const { id } = req.params;

    // Check if 'id' is a valid integer
    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ message: "Invalid ID format. ID must be an integer." });
    }

    // Find the ProgresPerbaikan record by its ID
    const progresPerbaikan = await ProgresPerbaikan.findByPk(id);

    if (!progresPerbaikan) {
      return res
        .status(404)
        .json({ message: "Progres perbaikan tidak ditemukan!" });
    }

    const { perbaikan_id, keterangan } = req.body;

    // Validate the request body using the progres perbaikan validation schema
    const { error: errorValidation } =
      progresPerbaikanValidationSchema.validate({
        perbaikan_id,
        keterangan,
      });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    let { foto } = progresPerbaikan;
    let { foto_url } = progresPerbaikan;

    // Check if the request contains a 'foto' file
    if (req.files && req.files.foto) {
      try {
        // Retrieve the 'foto' file from the request
        const image = req.files.foto;
        const destination = "/upload/images/progres-perbaikan/";

        // Upload the image and get the generated 'fileName' and 'fileUrl'
        const { fileName: newFileName, fileUrl: newFileUrl } =
          await imageFileUpload(req, image, destination);

        // If the 'fileName' has changed, delete the old image (if it exists)
        if (foto !== newFileName) {
          if (progresPerbaikan.foto) {
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

    // Update the ProgresPerbaikan record with the provided data
    await progresPerbaikan.update({
      perbaikan_id,
      keterangan,
      foto,
      foto_url,
    });

    return res.status(200).json({
      message: "Progres perbaikan berhasil diperbarui!",
      id: progresPerbaikan.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:263 ~ updateProgresPerbaikan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

// Delete progres perbaikan
async function destroyProgresPerbaikan(req, res) {
  try {
    const { id } = req.params;

    // Check if 'id' is a valid integer
    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ message: "Invalid ID format. ID must be an integer." });
    }

    // Find the ProgresPerbaikan record by its ID
    const progresPerbaikan = await ProgresPerbaikan.findByPk(id);

    if (!progresPerbaikan) {
      return res
        .status(404)
        .json({ message: "Progres perbaikan tidak ditemukan!" });
    }

    // Check if the ProgresPerbaikan record has a 'foto' associated with it
    if (progresPerbaikan.foto) {
      // Define the destination folder for the associated image
      const destination = "/upload/images/progres-perbaikan/";
      const fileName = progresPerbaikan.foto;

      // Delete the associated image file from the server
      await deleteFile(destination, fileName);
    }

    // Delete the ProgresPerbaikan record from the database
    await progresPerbaikan.destroy();

    return res.status(200).json({
      message: "Progres perbaikan berhasil dihapus!",
      id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: progresPerbaikanController.js:311 ~ destroyProgresPerbaikan ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}

module.exports = {
  getAllProgresPerbaikan,
  getProgresPerbaikanById,
  getProgresPerbaikanByPerbaikan,
  storeProgresPerbaikan,
  updateProgresPerbaikan,
  destroyProgresPerbaikan,
};
