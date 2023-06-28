const moment = require('moment');
// convert local time to another timezone
exports.convertLocalToTimezone = (localDt, timezone, localDtFormat = null) => {
  return moment(localDt, localDtFormat).tz(timezone).format('YYYY-MM-DD hh:mm:ss A');
};

exports.convertLocalToUTC = (dt, dtFormat) => {
  return moment(dt, dtFormat).utc().format('YYYY-MM-DD hh:mm:ss A');
};

exports.convertUTCToTimezone = (utcDt, utcDtFormat, timezone) => {
  return moment.utc(utcDt, utcDtFormat).tz(timezone).format('YYYY-MM-DD hh:mm:ss A');
};
