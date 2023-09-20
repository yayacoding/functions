
const schedule = require('node-schedule');
schedule.scheduleJob(reminder_notification_time, async () => {
      smsService.sendSms(smsContent, '1007869639411835399');
    });
