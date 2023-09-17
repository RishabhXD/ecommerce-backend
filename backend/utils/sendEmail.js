const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.RESET_SERVICE,
    host: process.env.RESET_HOST,
    port: process.env.RESET_PORT,
    secure: false,
    auth: {
      user: process.env.RESET_EMAIL,
      pass: process.env.RESET_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.RESET_EMAIL,
    to: options.email,
    subject: options.subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
      </head>
      <body>
          <p>Click here to reset your password:</p>
          <a href="${options.resetLink}">Reset Password</a>
          <p>If not requested, kindly ignore.</p>
      </body>
      </html>
    `,
    // text: options.message,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(info);
};

module.exports = sendEmail;
