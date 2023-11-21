/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProfilBengkels", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      nama: {
        type: Sequelize.STRING,
      },
      tentang_kami: {
        type: Sequelize.TEXT,
      },
      kontak: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
      lokasi: {
        type: Sequelize.TEXT,
      },
      foto: {
        type: Sequelize.STRING,
      },
      foto_url: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("ProfilBengkels");
  },
};
