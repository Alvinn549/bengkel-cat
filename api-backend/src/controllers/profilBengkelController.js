// const { validate: isUUID } = require("uuid");
const { ProfilBengkel, LayananBengkel } = require("../db/models");
const {
  profilBengkelValidationSchema,
} = require("../validator/profilBengkelValidator");
const {
  imageFileUpload,
  deleteFile,
} = require("../services/fileUploadServices");

async function getProfilBengkel(req, res) {
  try {
    const profilBengkel = await ProfilBengkel.findOne({
      include: {
        model: LayananBengkel,
        as: "layanan_bengkel",
        attributes: ["id", "nama_layanan"],
      },
    });
    return res.status(200).json(profilBengkel);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server errors", message: error.message });
  }
}

async function updateProfilBengkel(req, res) {
  try {
    const { nama, tentang_kami, kontak, alamat, lokasi } = req.body;

    // Validate profilBengkel input using a validation schema
    const { error: errorValidation } = profilBengkelValidationSchema.validate({
      nama,
      tentang_kami,
      alamat,
      kontak,
      lokasi,
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

    let { foto, foto_url } = profilBengkel;

    // Handle file upload if a new photo is provided
    if (req.files && req.files.foto) {
      try {
        // Retrieve the 'foto' file from the request
        const image = req.files.foto;
        const destination = "/resources/images/profil-bengkel/";

        // Use a function (imageFileUpload) to upload and get the file information
        const { fileName: newFileName, fileUrl: newFileUrl } =
          await imageFileUpload(req, image, destination);

        // If the new photo name is different, delete the old photo file
        // If the 'fileName' has changed, delete the old image (if it exists)
        if (foto !== newFileName) {
          if (profilBengkel.foto) {
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

    // Update the profilBengkel record with the new information
    await profilBengkel.update({
      nama,
      tentang_kami,
      kontak,
      alamat,
      lokasi,
      foto,
      foto_url,
    });

    return res.status(200).json({
      message: "profilBengkel berhasil diperbarui!",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: profilBengkelController.js:280 ~ updateprofilBengkel ~ error:",
      error,
    );

    return res
      .status(500)
      .json({ error: "Internal server error!", message: error.message });
  }
}

module.exports = {
  getProfilBengkel,
  updateProfilBengkel,
};
