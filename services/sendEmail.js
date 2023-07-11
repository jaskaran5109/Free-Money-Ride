const { createTransport } = require("nodemailer");

exports.sendEmail = async (to, subject, text) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL, // Sender's email address
      pass: process.env.APP_PASSWORD, // App password for authentication
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "Jaskaran <js1462@srmist.edu.in>", // Sender's name and email address
    to: to, // Recipient's email address
    subject: subject, // Email subject
    text: text, // Email body
  }; // Configuring the email options

  await transporter.sendMail(mailOptions); // Sending the email
};
