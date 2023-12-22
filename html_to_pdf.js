const ejs = require('ejs');
const pdfConverter = require('html-pdf');

//function to convert html to pdf file and save into local system
module.exports.htmlToPdfConvert = async (htmlName, ejsData) => {
  console.log('file: pdfConverter.js:135 / htmlToPdfConvert / ejsData:', ejsData);
  let data2 = { ...ejsData }; // bank statement
  if (Array.isArray(ejsData)) { // for others
    data2 = ejsData;
  }

  try {
    const data = await new Promise(function (resolve, reject) {
      const appRoot = __filename.split('/utils');
      ejs.renderFile(`${appRoot[0]}/views/${htmlName}.ejs`, { data: data2 }, (err, data) => {
        if (err) {
          reject(err);
          console.log('error in getting template path', err);
          return false;
        }
        const Options = { format: 'A4', height: '15in', width: '20in' };
        pdfConverter.create(data,
          {
            ...Options
          }).toBuffer(async function (err, buffer) {
          console.log('🚀 ~ file: helper.js:180 ~ ejs.renderFile ~ buffer:', buffer);
          if (err) {
            console.log('error in converting template to pdf', err);
            return false;
          }
          resolve(buffer);
        });
      });
    }).then(buffer =>{
      //convert buffer to utf8
      const detail = Buffer.from(buffer, 'utf8');
      //save data to local folder
      fs.writeFileSync(`./app/uploads/name.pdf`, detail);
    });;
    return data;
  } catch (err) {
    console.log('file: pdfConverter.js:155 / exports.htmlToPdfConvert= / err : catch = ', err);
    return false;
  }
};

//function to convert html file to pdf and upload file into s3
const htmlToPdfConvert = async (req, res, htmlName, ejsData, dbTrans, index) => {
    console.log("file: pdfConverter.js:135 / htmlToPdfConvert / ejsData:", ejsData)
    let data2 = {...ejsData, index}       // bank statement
    if(Array.isArray(ejsData)){           // for others
        data2 = ejsData;
    }
    
    try {

        let s3_url;
        await new Promise(function (resolve, reject) {

        ejs.renderFile(path.join(__dirname, '../views/pdfTemplates', `${htmlName}.ejs`), { data: data2 }, (err, data) => {
                if (err) {
                    reject();
                    console.log("error in getting template path", err);
                    return response.error(req, res, { msgCode: "Error in rendering ejs" }, httpStatus.BAD_REQUEST, dbTrans);
                }
                const Options = {format: PDF_DIMENSION[htmlName].format, height: PDF_DIMENSION[htmlName].height , width: PDF_DIMENSION[htmlName].width}
                pdfConverter.create(data, 
                    {
                    ...Options,
                    childProcessOptions: {
                      env: {
                        OPENSSL_CONF: '/dev/null',
                      },
                    }
                }).toBuffer(async function (err, buffer) {
                    if (err) {
                        console.log("error in converting tamplate to pdf", err);
                        return response.error(req, res, { msgCode: "error in converting template to pdf" }, httpStatus.BAD_REQUEST, dbTrans);
                    }
                resolve(buffer)
                })
            });
        }).then(async(buffer) => {
            const uploadedFileLocation = await uploadObject({ mimetype: 'application/pdf', originalname: htmlName, buffer });
            s3_url =  uploadedFileLocation
        })
        return { s3_url: s3_url };
    } catch (err) {
        console.log("file: pdfConverter.js:155 / exports.htmlToPdfConvert= / err : catch = ", err)
        return response.error(req, res, { msgCode: "error in converting template to pdf" }, httpStatus.INTERNAL_SERVER_ERROR, dbTrans)
    }
}



/****************************************************Pupeetear*****************************************************/

const puppeteer = require('puppeteer');
const HandlBars = require('handlebars');
const fs = require('fs');
const path = require('path');
module.exports.htmlToPdfConvert = async (htmlName, ejsData) => {
  try {
    // path to read the file
    const appRoot = __filename.split('/utils');
    let htmlContent;

    ejs.renderFile(`${appRoot[0]}/views/${htmlName}.ejs`, { data: ejsData }, (err, data) => {
      if (err) {
        console.log('error in getting template path', err);
        return false;
      }
      htmlContent = data;
    });

    const browser = await puppeteer.launch({
      // executablePath: '/usr/bin/chromium-browser',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const buffer = await page.pdf({
      format: 'A4',
      height: '15in',
      width: '20in'
    });

    await browser.close();
    return buffer;
  } catch (err) {
    return err;
  }
};


