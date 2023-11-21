const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, code, expireTime) {
  const expireTimeString = expireTime.toLocaleString();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    from: process.env.SMTP_USERNAME,
  });

  const mailOptions = {
    from: "e.bengkel.mail@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `
      <div style="display: flex; justify-content: center; align-items: center;">
        <div style="background-color: #F8F9FA; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #007BFF;">Welcome to Our App!</h1>
          <p>Thank you for registering an account with us.</p>
        <div style="background-color: #FFFFFF; padding: 10px; border-radius: 5px; margin-bottom: 10px; display: inline-block; width: 200px;">
          <h2 style="color: #DC3545;">${code}</h2>
        </div>
          <p>To complete your registration, please enter the above verification code.</p>
          <p>Code will expire in 30 minutes</p>
          <p style="margin-top: 10px;">Please note that the verification code will expire on <strong>${expireTimeString}</strong>.</p>
        </div>
      </div>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return true;
  } catch (errorSendVerification) {
    console.log(
      "🚀 ~ file: emailServices.js:41 ~ sendVerificationEmail ~ sendVerificationError:",
      errorSendVerification,
    );

    return false;
  }
}

module.exports = {
  sendVerificationEmail,
};
