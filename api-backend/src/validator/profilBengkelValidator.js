const Joi = require("joi");

const profilBengkelValidationSchema = Joi.object({
  nama: Joi.string().required(),
  tentang_kami: Joi.string().required(),
  alamat: Joi.string().required(),
  kontak: Joi.string().required(),
  lokasi: Joi.string().required(),
});

module.exports = { profilBengkelValidationSchema };
