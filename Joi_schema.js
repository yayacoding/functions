const Joi = require('joi');
const { env } = require('../constant/index');

const login = Joi.object({
  mobile: Joi.string().trim().length(10).pattern(/^[0-9]+$/).required()
});

const verifyOtp = Joi.object({
  otp: Joi.string().trim().length(env.OTP_DIGIT * 1).message(`Otp should be of ${env.OTP_DIGIT} digits`).required(),
  device_token: Joi.string().trim().required(),
  device_id: Joi.string().trim().required(),
  device_type: Joi.string().trim().required()
});

const forResetPassword = Joi.object({
  new_password: Joi.string().trim().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  ).message(
    'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
  ).min(8).max(20).required()
});

const changePassword = Joi.object({
  old_password: Joi.string().trim().required(),
  new_password: Joi.string().trim().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  ).message(
    'Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
  ).min(8).max(20).required(),
  logout: Joi.boolean()

});

const forgot = Joi.object({
  email: Joi.string().trim().email().lowercase().options({ convert: true })
});

const admin_login = Joi.object({
  email: Joi.string().trim().email().lowercase().options({ convert: true }).required(),
  password: Joi.string().trim().required(),
  device_id: Joi.string().trim().required(),
  device_type: Joi.string().trim().required(),
  device_token: Joi.string().trim().required()
});

const department_login = Joi.object({
  email: Joi.string().trim().email().lowercase().options({ convert: true }).required(),
  password: Joi.string().trim().required(),
  device_id: Joi.string().trim().required(),
  device_type: Joi.string().trim().required(),
  device_token: Joi.string().trim().required()
});

module.exports = {
  login,
  verifyOtp,
  forResetPassword,
  changePassword,
  forgot,
  admin_login,
  department_login
};
