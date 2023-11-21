const pushNotificationService = require("../services/oneSignalServices");

// Create new notification
async function createNotification(req, res, next) {
  try {
    const result = await pushNotificationService.createNotification();
    return res.status(200).json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return next(error);
  }
}

module.exports = {
  createNotification,
};
