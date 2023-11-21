/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LayananBengkels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profil_bengkel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ProfilBengkels",
          key: "id",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
      },
      nama_layanan: {
        type: Sequelize.TEXT,
      },
      deskripsi: {
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
    await queryInterface.dropTable("LayananBengkels");
  },
};
