
const mail = require('nodemailer');

const { env } = require('../constant/environment');


exports.sendMail = async (email, sendData, subject, textTemplate) => {
  try {
    const transporter = mail.createTransport({
      service: env.SMTP_SERVICE,
      host: env.SMTP_HOST,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      },
      logger: false, // log to console
      debug: true // include SMTP traffic in the logs
    });
    const mainOptions = {
      from: env.SMTP_USER,
      to: email,
      subject,
      html: sendData
    };
    transporter.sendMail(mainOptions, (err, info) => {
      if (err) {
        console.log(err);
      }
      console.log(info);
    });
  } catch (error) {
    console.log('---Email Error--', error);
    return false;
  }
};


exports.mailTemplate = (name, email, password, role, endPoint) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
     <h4> Welcome to attendance management system. <br> please find your cradential here</h4>
     <b>Name:</b>${name}<br>
     <b>Role:</b>${role}<br>
     <b>Email:</b>${email}<br>
     <b>Password:</b>${password}<br>
     <b>Link:</b><a href='${env.BASE_URL}/${endPoint}'></a>
  </body>
  </html>`;
  return html;
};
