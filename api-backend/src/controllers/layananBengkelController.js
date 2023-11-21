const { LayananBengkel, ProfilBengkel } = require("../db/models");
const {
  layananBengkelValidationSchema,
} = require("../validator/layananBengkelValidator");
const {
  imageFileUpload,
  deleteFile,
} = require("../services/fileUploadServices");

async function getAllLayananBengkel(req, res) {
  try {
    const layananBengkels = await LayananBengkel.findAll({
      include: {
        model: ProfilBengkel,
        as: "profil_begkel",
      },
    });

    return res.status(200).json(layananBengkels);
  } catch (error) {
    console.log(
      "🚀 ~ file: layananBengkelController.js:4 ~ getAllLayananBengkel ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server errors", message: error.message });
  }
}

async function getLayananBengkelById(req, res) {
  return res.status(200).json({ message: "getLayananBengkelById" });
}

async function storeLayananBengkel(req, res) {
  try {
    const { nama_layanan, deskripsi } = req.body;
    let foto;
    let foto_url;

    const { error: errorValidation } = layananBengkelValidationSchema.validate({
      nama_layanan,
      deskripsi,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    const profilBengkel = await ProfilBengkel.findOne();

    if (!profilBengkel) {
      return res
        .status(404)
        .json({ message: "Data profil bengkel tidak ditemukan!" });
    }

    // Check if the request includes a file named 'foto'
    if (!req.files || !req.files.foto) {
      return res
        .status(400)
        .json({ message: "Foto layananBengkel tidak boleh kosong!" });
    }

    try {
      const image = req.files.foto;
      const destination = "/resources/images/layanan-bengkel/";

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
        "🚀 ~ file: layananBengkelController.js:177 ~ storelayananBengkel ~ uploadError:",
        uploadError,
      );

      return res.status(400).json({
        message: "Error uploading the image!",
        error: uploadError.message,
      });
    }

    const newLayananBengkel = await LayananBengkel.create({
      profil_bengkel_id: profilBengkel.id,
      nama_layanan,
      deskripsi,
      foto,
      foto_url,
    });

    return res.status(201).json({
      message: "Layanan bengkel berhasil disimpan!",
      id: newLayananBengkel.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: layananBengkelController.js:33 ~ storeLayananBengkel ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server errors", message: error.message });
  }
}

async function updateLayananBengkel(req, res) {
  try {
    const { id } = req.params;

    const layananBengkel = await LayananBengkel.findByPk(id);

    if (!layananBengkel) {
      return res
        .status(404)
        .json({ message: "Layanan benglkel tidak ditemukan!" });
    }

    const { nama_layanan, deskripsi } = req.body;
    let { foto, foto_url } = layananBengkel;

    const { error: errorValidation } = layananBengkelValidationSchema.validate({
      nama_layanan,
      deskripsi,
    });

    if (errorValidation) {
      const errorMessage = errorValidation.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    if (req.files && req.files.foto) {
      try {
        const image = req.files.foto;
        const destination = "/resources/images/layanan-bengkel/";

        // Upload the new image and get file details (fileName and fileUrl)
        const { fileName: newFileName, fileUrl: newFileUrl } =
          await imageFileUpload(req, image, destination);

        // If the new image is different from the previous one, delete the old image
        if (foto !== newFileName) {
          if (layananBengkel.foto) {
            await deleteFile(destination, foto);
          }
        }

        foto = newFileName;
        foto_url = newFileUrl;
      } catch (uploadError) {
        console.log(
          "🚀 ~ file: layananBengkelController.js:282 ~ updatelayananBengkel ~ uploadError:",
          uploadError,
        );

        return res.status(400).json({
          message: "Error uploading the image!",
          error: uploadError.message,
        });
      }
    }

    await layananBengkel.update({
      nama_layanan,
      deskripsi,
      foto,
      foto_url,
    });

    return res.status(200).json({
      message: "Kendaraan berhasil diperbarui!",
      id: layananBengkel.id,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: layananBengkelController.js:120 ~ updateLayananBengkel ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

async function destroyLayananBengkel(req, res) {
  try {
    const { id } = req.params;

    const layananBengkel = await LayananBengkel.findByPk(id);

    if (!layananBengkel) {
      return res
        .status(404)
        .json({ message: "Layanan benglkel tidak ditemukan!" });
    }

    if (layananBengkel.foto) {
      const destination = "/resources/images/layanan-bengkel/";
      const fileName = layananBengkel.foto;
      await deleteFile(destination, fileName);
    }

    await layananBengkel.destroy();

    return res.status(200).json({
      message: "Layanan bengkel berhasil dihapus!",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: layananBengkelController.js:199 ~ destroyLayananBengkel ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}
module.exports = {
  getAllLayananBengkel,
  getLayananBengkelById,
  storeLayananBengkel,
  updateLayananBengkel,
  destroyLayananBengkel,
};
