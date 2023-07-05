const axios = require('axios');
const qs = require('qs');
const { env } = require('../constant/index');
const crypto = require('crypto');

exports.sendSms = (smsContent) => {
  const data = qs.stringify({
    mobileno: smsContent.mobile,
    senderid: env.SMS_SENDER_ID,
    content: smsContent.content,
    smsservicetype: env.SMS_SERVICE_TYPE,
    username: env.SMS_USERNAME,
    password: env.SMS_PASSWORD,
    key: smsContent.key,
    templateid: env.SMS_TEMPLATE_ID
  });
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: env.SMS_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  };
  axios.request(config)
    .then((response) => {
      console.log('🚀 ~ file: sms.js:27 ~ .then ~ response:', JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log('🚀 ~ file: sms.js:31 ~ error:', error);
    });
};

exports.hashGenerator = (message) => {
  const sb = `${env.SMS_USERNAME}${env.SMS_SENDER_ID}${message}${env.SMS_KEY}`;
  const genkey = Buffer.from(sb, 'utf8');
  const sha1 = crypto.createHash('sha512');
  const sec_key = sha1.update(genkey).digest();

  const sb1 = sec_key.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  return sb1;
};
