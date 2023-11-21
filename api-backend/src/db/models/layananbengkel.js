const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LayananBengkel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs To
      LayananBengkel.belongsTo(models.ProfilBengkel, {
        foreignKey: {
          name: "profil_bengkel_id",
          allowNull: false,
        },
        as: "profil_begkel",
        onDelete: "CASCADE",
      });
    }
  }

  LayananBengkel.init(
    {
      profil_bengkel_id: DataTypes.UUID,
      nama_layanan: DataTypes.STRING,
      deskripsi: DataTypes.TEXT,
      foto: DataTypes.STRING,
      foto_url: DataTypes.TEXT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "LayananBengkel",
    },
  );
  return LayananBengkel;
};
