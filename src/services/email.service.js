const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const { emailMessage } = require('../messages');
const { env } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.email.user,
    pass: env.email.password,
  },
});

const sendEmail = async ({ templatePath, templateData, subject, to }) => {
  try {
    const templateFilePath = path.join(__dirname, templatePath);
    const html = await ejs.renderFile(templateFilePath, templateData);

    const mailOptions = {
      from: env.email.from,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, emailMessage().SEND_EMAIL_FAILURE);
  }
};

module.exports = {
  sendEmail,
};
