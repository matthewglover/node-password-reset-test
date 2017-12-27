const defaultNodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');

class Mailer {

  constructor(nodemailer = defaultNodemailer) {
    if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('Missing environment variable: AWS_ACCESS_KEY_ID');
    if (!process.env.AWS_SECRET_ACCESS_KEY_ID) throw new Error('Missing environment variable: AWS_SECRET_ACCESS_KEY_ID');
    this.nodemailer = nodemailer;
  }

  sendMail(mailOptions) {
    return this.transport.sendMail(mailOptions);
  }

  get transport() {
    return this.nodemailer.createTransport(ses({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID
    }));
  }
}

module.exports = Mailer;
