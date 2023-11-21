/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker/locale/id_ID");
const { ProfilBengkel } = require("../models");

module.exports = {
  async up(queryInterface) {
    const profil_begkel = await ProfilBengkel.findOne({ attributes: ["id"] });
    const fakeLayananBengkels = Array.from({ length: 10 }).map(() => ({
      profil_bengkel_id: profil_begkel.id,
      nama_layanan: faker.lorem.words(),
      deskripsi: faker.lorem.paragraphs(),
      foto: `${faker.vehicle.vehicle().replace(/\s/g, "")}.jpg`,
      foto_url: faker.image.urlLoremFlickr({ category: "transport" }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("LayananBengkels", fakeLayananBengkels, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("LayananBengkels", null, {});
  },
};
