const path = require("path");
const fs = require("fs");

const rootPath = path.resolve(__dirname, "../../public"); // Root directory for file operations

async function imageFileUpload(req, image, destination) {
  const ext = path.extname(image.name);
  const fileSize = image.data.length;

  const fileName = `${Date.now()}-${image.name.replace(/\s/g, "")}`;
  const fileUrl = `${req.protocol}://${req.get(
    "host",
  )}${destination}${fileName}`;

  const allowedTypes = [".png", ".jpeg", ".jpg"];

  if (!allowedTypes.includes(ext.toLowerCase())) {
    throw new Error("Invalid image format!");
  }

  if (fileSize > 5000000) {
    throw new Error("Image size must be less than 5MB!");
  }

  await image.mv(`${rootPath}${destination}${fileName}`);

  return { fileName, fileUrl };
}

async function deleteFile(destination, fileName) {
  try {
    const file = `${rootPath}${destination}${fileName}`;

    // Check if the file exists and delete it
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  imageFileUpload,
  deleteFile,
};
