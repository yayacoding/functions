//https://developers.facebook.com/apps/390008660041292/whatsapp-business/wa-dev-console/?business_id=1020459109066146
const axios = require('axios');
const { env } = require('../constant');
const { htmlToPdfConvert, generateOtp } = require('./helper');
const fs = require('fs');
const path = require('path');

/**
 * @description function to integration whatsApp
 * @param {*  contact where to send } to
 * @param {* template name create on meta account} template
 * @param {* content to send on whatsApp } components
 */
const whatsappMsg = async (to, template, components) => {
  const data = JSON.stringify({
    'messaging_product': 'whatsapp',
    to,
    'type': 'template',
    'template': {
      'name': template,
      'language': {
        'code': 'en_US'
      },
      components
    }
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: env.WHATSAPP_URL,
    headers: {
      'Authorization': env.WHATSAPP_TOKEN,
      'Content-Type': 'application/json'
    },
    data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

/**
 * @description function to send whatsapp message
 * @param {* contact number} to
 * @param {* template that you were created} messageTemplate
 * @param {* template to create pdf } htmlTemplate
 * @returns
 */
const sendMessage = async (to, messageTemplate, htmlTemplate) => {
  try {
    // convert html to pdf
    const pdfDAta = await htmlToPdfConvert(htmlTemplate);

    // generate random file name
    const randomName = generateOtp(10);
    const detail = Buffer.from(pdfDAta, 'utf8');

    // write file into a folder
    fs.writeFileSync(`./app/uploads/${randomName}.pdf`, detail);
    const link = path.join(__dirname, `../../uploads/${randomName}.pdf`).split('/app/')[1];

    // content to to sent on whatsapp
    const component = [{
      'type': 'header',
      'parameters': [
        {
          'type': 'document',
          'document': {
            link: env.BASE_URL + `/${link}`
          }
        }]
    }];

    to.forEach(async element => {
      whatsappMsg(element, messageTemplate, component);
    });
    return true;
  } catch (error) {
    console.log('🚀 ~ file: pickup.js:379 ~ sendSms ~ error:', error);
    return false;
  }
};

module.exports = {
  whatsappMsg,
  sendMessage
};
