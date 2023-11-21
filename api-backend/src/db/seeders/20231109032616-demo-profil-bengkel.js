/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker/locale/id_ID");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "ProfilBengkels",
      [
        {
          id: faker.string.uuid(),
          nama: "Bengkel Cat Wijayanto",
          tentang_kami: faker.lorem.paragraphs(5),
          kontak: faker.phone.number(),
          alamat:
            "Jl. AR Hakim No.25, Krajan IV, Semanten, Kec. Pacitan, Kabupaten Pacitan, Jawa Timur 63518",
          lokasi:
            '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1044.1236523739274!2d111.11250049850925!3d-8.170849320716753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e796164c4ede193%3A0x41d54b74544750be!2sBengkel%20Cat%20Wijayanto!5e0!3m2!1sen!2sid!4v1699501093662!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
          foto: `${faker.person.firstName()}.jpg`,
          foto_url: faker.image.urlLoremFlickr({ category: "people" }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ProfilBengkels", null, {});
  },
};
