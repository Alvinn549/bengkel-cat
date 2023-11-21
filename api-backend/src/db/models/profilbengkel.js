const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProfilBengkel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Has Many
      ProfilBengkel.hasMany(models.LayananBengkel, {
        foreignKey: {
          name: "profil_bengkel_id",
          allowNull: false,
        },
        as: "layanan_bengkel",
        onDelete: "CASCADE",
      });
    }
  }

  ProfilBengkel.init(
    {
      nama: DataTypes.STRING,
      tentang_kami: DataTypes.TEXT,
      kontak: DataTypes.STRING,
      alamat: DataTypes.TEXT,
      lokasi: DataTypes.TEXT,
      foto: DataTypes.STRING,
      foto_url: DataTypes.TEXT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ProfilBengkel",
    },
  );
  return ProfilBengkel;
};
