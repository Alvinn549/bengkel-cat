// const https = require("https");
const axios = require("axios");
const oneSignalConfig = require("../config/oneSignalConfig");

async function createNotification() {
  const options = {
    method: "POST",
    url: "https://onesignal.com/api/v1/notifications",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${oneSignalConfig.API_KEY}`,
      "content-type": "application/json",
    },
    data: {
      app_id: oneSignalConfig.APP_ID,
      included_segments: ["All"],
      small_icon: "ic_notification_icon",
      contents: {
        en: "TEsttt Lurrr",
        es: "Spanish Message",
      },
      name: "TESSSTTTTT",
      data: {
        PushTitle: "Cat Bengkel",
      },
    },
  };

  try {
    const response = await axios.request(options);
    console.log(
      "🚀 ~ file: oneSignalServices.js:32 ~ .then ~ response:",
      response,
    );
    return response.data;
  } catch (error) {
    console.log(
      "🚀 ~ file: oneSignalServices.js:40 ~ createNotification ~ error:",
      error,
    );
  }
}

module.exports = {
  createNotification,
};
