const Joi = require("joi");

const layananBengkelValidationSchema = Joi.object({
  nama_layanan: Joi.string().required(),
  deskripsi: Joi.string().required(),
});

module.exports = { layananBengkelValidationSchema };
