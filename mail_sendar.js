const mail = require('nodemailer');
exports.sendMail = (email, endPoint, forgetToken, subject, templateUrl) => {
  try {
    const TRANSPORTER = mail.createTransport({
      service: ENV.SMTP_SERVICE,
      host: ENV.SMTP_HOST,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS
      },
      logger: false, // log to console
      debug: true // include SMTP traffic in the logs
    });

    const appRoot = __filename.split('/utils');
    const resetUrl = ENV.BASE_URL + '/' + endPoint + '/' + forgetToken;
    const imgUrl = ENV.FRONTEND_URL;

    ejs.renderFile(`${appRoot[0]}/views/${templateUrl}`, { email, resetUrl, imgUrl }, (error, dataTemplate) => {
      if (error) {
        console.log('🚀  file: helper.js:27  ejs.renderFile ~ error:', error);
      } else {
        const mainOptions = {
          from: ENV.SMTP_USER,
          to: email,
          subject,
          html: dataTemplate
        };
        TRANSPORTER.sendMail(mainOptions, (error, info) => {
          if (error) {
            console.log('🚀  file: helper.js:37  TRANSPORTER.sendMail ~ error:', error);
          }
          console.log('🚀  file: helper.js:36  TRANSPORTER.sendMail ~ info:', info);
        });
      }
    });
  } catch (error) {
    console.log('🚀  file: helper.js:44  error:', error);
    return false;
  }
};
